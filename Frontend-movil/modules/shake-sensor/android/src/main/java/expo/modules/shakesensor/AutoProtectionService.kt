package expo.modules.shakesensor

import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Automatic protection while she is on the way: it starts by itself when she leaves a frequent place
 * (GeofenceReceiver) and sends a signal of life with her position every 2 minutes. The server alerts her
 * contacts if those signals stop (phone off, taken away, no battery).
 *
 * When she stays still for 20 min somewhere:
 *  - in a normal place she is asked, silently, "¿Llegaste bien?" (at 20 and 35 min). "Sí, llegué bien" ends
 *    the protection; without an answer, at 45 min her contacts are told with her last location;
 *  - inside a risk zone she is asked "¿Todo bien?" and, without an answer in 5 minutes, her contacts are alerted.
 * Moving again restarts the count. It also ends when she arrives at another frequent place, after 4 hours
 * (server) or when she taps "Detener".
 *
 * Nobody else can stop it: the answers need the phone unlocked (Android 12+) and, if she has a cancel PIN,
 * "Detener" opens the app to ask for it. Her duress PIN looks like a normal stop but alerts her contacts.
 */
class AutoProtectionService : Service() {
  private var thread: HandlerThread? = null
  private var worker: Handler? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var locationListener: LocationListener? = null

  private var tripId = 0L
  private var startLatitude = Double.NaN
  private var startLongitude = Double.NaN
  private var lastFix: Location? = null
  // Where she has been standing and since when (to know she arrived somewhere)
  private var anchor: Location? = null
  private var anchorAt = 0L
  private var askedAt = 0L
  private var arrivalAsks = 0
  private var arrivalAskedAt = 0L
  private var riskZones: List<TripService.RiskZone> = emptyList()
  private val zoneNoticeAt = mutableMapOf<String, Long>()

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> start(intent)
      ACTION_OK -> worker?.post { imOk() }
      ACTION_STOP, ACTION_ARRIVED, ACTION_ARRIVED_OK -> worker?.post { finish() } ?: shutDown()
      ACTION_DURESS -> worker?.post { duress() } ?: shutDown()
      ACTION_REFRESH -> worker?.post { updateNotice() }
      ACTION_DISABLED -> shutDown()
      else -> if (worker == null) shutDown()
    }
    return START_REDELIVER_INTENT
  }

  private fun start(intent: Intent) {
    if (worker != null) return
    if (!AutoProtection.isEnabled(this) || !goForeground()) return shutDown()
    startLatitude = intent.getDoubleExtra(EXTRA_LATITUDE, Double.NaN)
    startLongitude = intent.getDoubleExtra(EXTRA_LONGITUDE, Double.NaN)
    riskZones = parseZones(AutoProtection.riskZonesJson(this))
    status = Status(running = true)
    val t = HandlerThread("AlertaMujerAuto").apply { start() }
    thread = t
    worker = Handler(t.looper)
    acquireWakeLock()
    listenLocation(t)
    worker?.post(tick)
  }

  private val tick = object : Runnable {
    override fun run() {
      if (tripId == 0L) startOnServer() else sendHeartbeat()
      checkStillness()
      if (worker != null) worker?.postDelayed(this, HEARTBEAT_MS)
    }
  }

  // ── Server ─────────────────────────────────────────────────────────────────────────

  /** Without connection it is tried again on the next tick (the phone keeps watching meanwhile). */
  private fun startOnServer() {
    val body = JSONObject()
    val where = lastFix
    val lat = where?.latitude ?: startLatitude
    val lng = where?.longitude ?: startLongitude
    if (!lat.isNaN() && !lng.isNaN()) body.put("latitude", round(lat, 6)).put("longitude", round(lng, 6))
    val response = post("/api/public/auto-protection/start", body) ?: return
    when {
      response.first == 403 -> return disabledOnServer()
      response.first !in 200..299 -> return
    }
    val trip = runCatching { JSONObject(response.second) }.getOrNull() ?: return
    // She already has a trip she started herself: that one watches over her
    if (trip.optString("mode") != "auto" || trip.optString("status") != "active") return shutDown()
    tripId = trip.optLong("id")
    status = status.copy(tripId = tripId)
    updateNotice()
  }

  private fun sendHeartbeat() {
    val point = JSONObject().put("recordedAt", utcNow()).put("lowBattery", lowBattery())
    lastFix?.takeIf { System.currentTimeMillis() - it.time < FRESH_FIX_MS }?.let {
      point.put("latitude", round(it.latitude, 6))
      point.put("longitude", round(it.longitude, 6))
      point.put("accuracy", round(it.accuracy.toDouble(), 2))
    }
    val response = post("/api/public/auto-protection/$tripId/heartbeat", point) ?: return
    when {
      response.first == 403 -> disabledOnServer()
      response.first in 200..299 -> {
        status = status.copy(lastSentAt = System.currentTimeMillis())
        val tripStatus = runCatching { JSONObject(response.second).optString("status") }.getOrDefault("active")
        // Ended by the server (4 h window), replaced by a trip she started, or it already alerted
        if (tripStatus != "active") shutDown() else updateNotice()
      }
    }
  }

  /** She arrived at a frequent place, answered "Sí, llegué bien" or stopped it. */
  private fun finish() {
    if (tripId != 0L) post("/api/public/auto-protection/$tripId/end", JSONObject())
    shutDown()
  }

  /** Duress PIN: on her phone it looks stopped, but the server alerts her contacts silently. */
  private fun duress() {
    if (tripId != 0L) post("/api/public/auto-protection/$tripId/duress", JSONObject())
    // Without connection her signal of life stops anyway, so the server alerts by lost signal
    shutDown()
  }

  /** Her key no longer works (she turned it off on another screen or deleted her account). */
  private fun disabledOnServer() {
    AutoProtection.disable(this)
    shutDown()
  }

  // ── Stillness and "¿Todo bien?" ────────────────────────────────────────────────────

  private fun checkStillness() {
    val now = System.currentTimeMillis()
    // Asked and not answered in time: her contacts are alerted
    if (askedAt > 0 && now - askedAt >= ANSWER_MS) {
      askedAt = 0L
      if (tripId != 0L) {
        val response = post("/api/public/auto-protection/$tripId/no-answer", JSONObject())
        if (response != null && response.first in 200..299) {
          cancelNotice(CHECK_ID)
          showNotice("Avisamos a tus contactos", "No respondiste si estabas bien. Abre la app para verlo o terminar la alerta.")
          return shutDown()
        }
      }
      // Without connection: if her signal does not reach the server, the server alerts anyway
      return
    }
    if (askedAt > 0 || anchor == null || now - anchorAt < STILL_MS) return
    val here = lastFix ?: return
    if (zoneAt(here) != null) {
      askedAt = now
      askIfOk(zoneAt(here)!!.name)
    } else {
      askIfArrived(now)
    }
  }

  /**
   * Still in a normal place: "¿Llegaste bien?" at 20 and 35 min (silent, so it does not give her away)
   * and, without an answer, her contacts are told at 45 min.
   */
  private fun askIfArrived(now: Long) {
    when {
      arrivalAsks == 0 -> {
        arrivalAsks = 1
        arrivalAskedAt = now
        askArrived()
      }
      arrivalAsks == 1 && now - arrivalAskedAt >= SECOND_ASK_MS -> {
        arrivalAsks = 2
        arrivalAskedAt = now
        askArrived()
      }
      arrivalAsks == 2 && now - arrivalAskedAt >= NOTIFY_AFTER_MS && tripId != 0L -> {
        val response = post("/api/public/auto-protection/$tripId/unconfirmed", JSONObject())
        if (response != null && response.first in 200..299) {
          cancelNotice(ARRIVED_ID)
          showNotice("Avisamos a tus contactos", "No confirmaste que llegaste bien. Abre la app para verlo o terminar la alerta.")
          shutDown()
        }
        // Without connection it is tried again on the next tick; if her signal stops, the server alerts
      }
    }
  }

  private fun imOk() {
    cancelNotice(CHECK_ID)
    askedAt = 0L
    // She is fine where she is: asked again only after another while
    anchorAt = System.currentTimeMillis()
  }

  private fun askIfOk(zone: String) {
    val text = "Llevas un rato quieta en $zone, una zona de riesgo. Si no respondes en 5 minutos avisamos a tus contactos."
    val notice = Notification.Builder(this, ALERTS_CHANNEL)
      .setContentTitle("¿Todo bien?")
      .setContentText(text)
      .setStyle(Notification.BigTextStyle().bigText(text))
      .setSmallIcon(applicationInfo.icon)
      .setAutoCancel(false)
      .setContentIntent(openApp())
      .addAction(secureAction("Estoy bien", serviceIntent(ACTION_OK, 1)))
      .addAction(Notification.Action.Builder(null, "Abrir la app", openApp()).build())
      .build()
    notifications().notify(CHECK_ID, notice)
  }

  private fun askArrived() {
    val discreet = DiscreetMode.isOn(this)
    val title = if (discreet) DiscreetMode.TITLE else "¿Llegaste bien?"
    val text = if (discreet) DiscreetMode.TEXT
      else "Toca \"Sí, llegué bien\" para terminar la protección."
    val notice = Notification.Builder(this, QUIET_CHANNEL)
      .setContentTitle(title)
      .setContentText(text)
      .setStyle(Notification.BigTextStyle().bigText(text))
      .setSmallIcon(applicationInfo.icon)
      .setAutoCancel(false)
      .setContentIntent(openApp())
      .addAction(secureAction("Sí, llegué bien", serviceIntent(ACTION_ARRIVED_OK, 4)))
      .build()
    notifications().notify(ARRIVED_ID, notice)
  }

  // ── Location and risk zones ────────────────────────────────────────────────────────

  @SuppressLint("MissingPermission")
  private fun listenLocation(t: HandlerThread) {
    if (!hasLocationPermission()) return
    val manager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
    val listener = object : LocationListener {
      override fun onLocationChanged(location: Location) = onFix(location)
      override fun onProviderEnabled(provider: String) {}
      override fun onProviderDisabled(provider: String) {}
      @Deprecated("Deprecated in Java")
      override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
    }
    locationListener = listener
    for (provider in listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)) {
      try {
        if (!manager.isProviderEnabled(provider)) continue
        manager.requestLocationUpdates(provider, LOCATION_INTERVAL_MS, 0f, listener, t.looper)
      } catch (e: Exception) {
        Log.w(TAG, "No location from $provider", e)
      }
    }
  }

  private fun onFix(location: Location) {
    val current = lastFix
    if (current != null && location.time - current.time < 2 * 60_000 && location.accuracy > current.accuracy + 30) return
    lastFix = location
    if (location.accuracy > MAX_ACCURACY_M) return
    val still = anchor
    if (still == null || location.distanceTo(still) > MOVED_M) {
      anchor = location
      anchorAt = System.currentTimeMillis()
      // Moving again: the questions no longer apply and the count starts over
      if (arrivalAsks > 0) cancelNotice(ARRIVED_ID)
      arrivalAsks = 0
      if (askedAt > 0) imOk()
    }
    zoneAt(location)?.let { announceZone(it, location) }
  }

  private fun parseZones(json: String): List<TripService.RiskZone> =
    runCatching {
      val list = JSONArray(json)
      (0 until list.length()).map { i ->
        val z = list.getJSONObject(i)
        TripService.RiskZone(z.optString("name"), z.getDouble("latitude"), z.getDouble("longitude"), z.getDouble("radius"))
      }
    }.getOrDefault(emptyList())

  private fun zoneAt(location: Location): TripService.RiskZone? {
    val result = FloatArray(1)
    return riskZones.firstOrNull {
      Location.distanceBetween(location.latitude, location.longitude, it.latitude, it.longitude, result)
      result[0] <= it.radius
    }
  }

  /** Entering a risk zone she is told, at most once per zone every 30 min. */
  private fun announceZone(zone: TripService.RiskZone, location: Location) {
    val now = System.currentTimeMillis()
    if (now - (zoneNoticeAt[zone.name] ?: 0L) < ZONE_NOTICE_MS) return
    zoneNoticeAt[zone.name] = now
    val discreet = DiscreetMode.isOn(this)
    val title = if (discreet) DiscreetMode.TITLE else "Estás en una zona de riesgo"
    val text = if (discreet) DiscreetMode.TEXT
      else "${zone.name}. Mantén el celular contigo: si tu señal se corta aquí, avisamos a tus contactos a los 5 minutos."
    notifications().notify(
      ZONE_ID,
      Notification.Builder(this, ALERTS_CHANNEL)
        .setContentTitle(title)
        .setContentText(text)
        .setStyle(Notification.BigTextStyle().bigText(text))
        .setSmallIcon(applicationInfo.icon)
        .setAutoCancel(true)
        .setContentIntent(openApp())
        .build(),
    )
  }

  private fun lowBattery(): Boolean {
    val battery = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    val level = battery.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    return level in 1 until LOW_BATTERY_PERCENT
  }

  // ── HTTP ───────────────────────────────────────────────────────────────────────────

  /** POST with the phone's own key; null if there was no connection. */
  private fun post(path: String, body: JSONObject): Pair<Int, String>? {
    val baseUrl = AutoProtection.baseUrl(this)
    val key = AutoProtection.key(this)
    if (baseUrl.isEmpty() || key.isEmpty()) return null
    var connection: HttpURLConnection? = null
    return try {
      connection = (URL(baseUrl + path).openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = TIMEOUT_MS
        readTimeout = TIMEOUT_MS
        doOutput = true
        setRequestProperty("Content-Type", "application/json")
        setRequestProperty("X-Protection-Key", key)
      }
      connection.outputStream.use { it.write(body.toString().toByteArray()) }
      val code = connection.responseCode
      val text = (if (code < 400) connection.inputStream else connection.errorStream)
        ?.bufferedReader()?.use { it.readText() }.orEmpty()
      code to text
    } catch (e: IOException) {
      null
    } finally {
      connection?.disconnect()
    }
  }

  // ── Notifications ──────────────────────────────────────────────────────────────────

  private fun goForeground(): Boolean {
    createChannels()
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        startForeground(SERVICE_ID, serviceNotice(), ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
      } else {
        startForeground(SERVICE_ID, serviceNotice())
      }
      true
    } catch (e: Exception) {
      Log.w(TAG, "Could not start the automatic protection", e)
      false
    }
  }

  private fun serviceNotice(): Notification {
    val discreet = DiscreetMode.isOn(this)
    val text = if (discreet) DiscreetMode.TEXT
      else "Saliste de uno de tus lugares frecuentes. Si tu celular deja de enviar señal, avisamos a tus contactos."
    return Notification.Builder(this, SERVICE_CHANNEL)
      .setContentTitle(if (discreet) DiscreetMode.TITLE else "Protección automática activa")
      .setContentText(text)
      .setStyle(Notification.BigTextStyle().bigText(text))
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setContentIntent(openApp())
      .addAction(stopAction())
      .build()
  }

  private fun updateNotice() {
    if (worker != null) notifications().notify(SERVICE_ID, serviceNotice())
  }

  private fun showNotice(title: String, text: String) {
    notifications().notify(
      RESULT_ID,
      Notification.Builder(this, ALERTS_CHANNEL)
        .setContentTitle(title)
        .setContentText(text)
        .setStyle(Notification.BigTextStyle().bigText(text))
        .setSmallIcon(applicationInfo.icon)
        .setAutoCancel(true)
        .setContentIntent(openApp())
        .build(),
    )
  }

  private fun cancelNotice(id: Int) = notifications().cancel(id)

  private fun notifications() = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  private fun createChannels() {
    val manager = notifications()
    if (manager.getNotificationChannel(SERVICE_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(SERVICE_CHANNEL, "Protección automática", NotificationManager.IMPORTANCE_LOW).apply {
          description = "Aviso fijo mientras la protección automática te acompaña"
        },
      )
    }
    if (manager.getNotificationChannel(ALERTS_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(ALERTS_CHANNEL, "Avisos de la protección automática", NotificationManager.IMPORTANCE_HIGH).apply {
          description = "¿Todo bien? y zonas de riesgo mientras vas de camino"
        },
      )
    }
    if (manager.getNotificationChannel(QUIET_CHANNEL) == null) {
      // Without sound or vibration: a question must never give her away
      manager.createNotificationChannel(
        NotificationChannel(QUIET_CHANNEL, "Preguntas de la protección automática", NotificationManager.IMPORTANCE_DEFAULT).apply {
          description = "¿Llegaste bien?, en silencio"
          setSound(null, null)
          enableVibration(false)
        },
      )
    }
  }

  private fun openApp(): PendingIntent? =
    packageManager.getLaunchIntentForPackage(packageName)?.let {
      PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

  private fun serviceIntent(action: String, code: Int): PendingIntent =
    PendingIntent.getService(
      this, 100 + code, Intent(this, AutoProtectionService::class.java).setAction(action),
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

  /** A button that, with the phone locked, first asks for its PIN, pattern or fingerprint (Android 12+). */
  private fun secureAction(title: String, intent: PendingIntent): Notification.Action =
    Notification.Action.Builder(null, title, intent).apply {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) setAuthenticationRequired(true)
    }.build()

  /** "Detener": with a cancel PIN it opens the app to ask for it (her duress PIN also works there). */
  private fun stopAction(): Notification.Action {
    if (!AutoProtection.pinRequired(this)) return secureAction("Detener", serviceIntent(ACTION_STOP, 2))
    val askPin = Intent(Intent.ACTION_VIEW, Uri.parse(STOP_LINK)).setPackage(packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    val open = PendingIntent.getActivity(this, 105, askPin, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    return Notification.Action.Builder(null, "Detener", open).build()
  }

  // ── Life cycle ─────────────────────────────────────────────────────────────────────

  private fun shutDown() {
    val oldWorker = worker
    worker = null
    oldWorker?.removeCallbacksAndMessages(null)
    locationListener?.let { (getSystemService(Context.LOCATION_SERVICE) as LocationManager).removeUpdates(it) }
    locationListener = null
    thread?.quitSafely()
    thread = null
    releaseWakeLock()
    cancelNotice(CHECK_ID)
    cancelNotice(ARRIVED_ID)
    tripId = 0L
    anchor = null
    askedAt = 0L
    arrivalAsks = 0
    arrivalAskedAt = 0L
    status = Status()
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  override fun onDestroy() {
    if (worker != null) shutDown()
    super.onDestroy()
  }

  private fun acquireWakeLock() {
    if (wakeLock?.isHeld == true) return
    val power = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AlertaMujer:proteccion").apply {
      setReferenceCounted(false)
      acquire(MAX_RUN_MS)
    }
  }

  private fun releaseWakeLock() {
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  private fun hasLocationPermission() =
    checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
      checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

  data class Status(val running: Boolean = false, val tripId: Long = 0L, val lastSentAt: Long = 0L)

  companion object {
    private const val TAG = "AutoProtection"
    private const val SERVICE_CHANNEL = "proteccion_automatica"
    private const val ALERTS_CHANNEL = "proteccion_automatica_avisos"
    private const val QUIET_CHANNEL = "proteccion_automatica_preguntas"
    private const val SERVICE_ID = 7511
    private const val CHECK_ID = 7512
    private const val RESULT_ID = 7513
    private const val ZONE_ID = 7514
    private const val ARRIVED_ID = 7515
    private const val HEARTBEAT_MS = 2 * 60_000L
    private const val LOCATION_INTERVAL_MS = 30_000L
    private const val FRESH_FIX_MS = 5 * 60_000L
    private const val TIMEOUT_MS = 15_000
    private const val MAX_ACCURACY_M = 80f
    /** Moving less than this counts as standing in the same place. */
    private const val MOVED_M = 120f
    private const val STILL_MS = 20 * 60_000L
    private const val ANSWER_MS = 5 * 60_000L
    private const val ZONE_NOTICE_MS = 30 * 60_000L
    /** "¿Llegaste bien?": first at STILL_MS (20 min), again 15 min later, contacts told 10 min after that. */
    private const val SECOND_ASK_MS = 15 * 60_000L
    private const val NOTIFY_AFTER_MS = 10 * 60_000L
    private const val LOW_BATTERY_PERCENT = 10
    // The server ends it after 4 h; the wake lock never outlives that by much
    private const val MAX_RUN_MS = 5 * 60 * 60_000L

    const val ACTION_START = "alertamujer.auto.START"
    const val ACTION_STOP = "alertamujer.auto.STOP"
    const val ACTION_ARRIVED = "alertamujer.auto.ARRIVED"
    const val ACTION_OK = "alertamujer.auto.OK"
    const val ACTION_ARRIVED_OK = "alertamujer.auto.ARRIVED_OK"
    const val ACTION_DISABLED = "alertamujer.auto.DISABLED"
    const val ACTION_DURESS = "alertamujer.auto.DURESS"
    const val ACTION_REFRESH = "alertamujer.auto.REFRESH"
    /** Opened by "Detener" when she has a cancel PIN (handled by the app). */
    const val STOP_LINK = "alertamujer://auto-protection/stop"
    const val EXTRA_LATITUDE = "latitude"
    const val EXTRA_LONGITUDE = "longitude"

    @Volatile
    var status = Status()
      private set

    private fun utcNow(): String =
      SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        .format(Date())

    private fun round(value: Double, decimals: Int): Double {
      var factor = 1.0
      repeat(decimals) { factor *= 10 }
      return Math.round(value * factor) / factor
    }
  }
}
