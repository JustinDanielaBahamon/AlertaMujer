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
 * "Avísame si no llego": while the trip is active this foreground service (type location) sends a
 * signal of life with the GPS position to the server every 2 minutes, also with the screen off and
 * without the app on screen. If the server stops receiving them it alerts her contacts before the
 * arrival time. It is native (not JS timers) because Android pauses the app's JS timers in the
 * background.
 *
 * Without internet the signals are queued on the phone and uploaded when the connection comes back
 * (the server adds them to her route). It also watches the distance to the destination: near it,
 * it asks "¿Ya llegaste?"; if she moves away or stops advancing, it asks whether everything is OK
 * (only to her, the contacts are not notified).
 */
class TripService : Service() {
  private var thread: HandlerThread? = null
  private var worker: Handler? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var locationListener: LocationListener? = null

  private var tripId = 0L
  private var baseUrl = ""
  private var token = ""
  private var destination = ""
  private var destLatitude = Double.NaN
  private var destLongitude = Double.NaN
  private var arrivalMs = 0L

  private var lastFix: Location? = null
  private var startDistance = Double.NaN
  // Closest she got to the destination and when (to know whether she is advancing)
  private var bestDistance = Double.NaN
  private var bestDistanceAt = 0L
  private var arrivalAskedAt = 0L
  private var checkAskedAt = 0L
  private var riskZones: List<RiskZone> = emptyList()
  // When each zone was last announced (not repeated every fix)
  private val zoneNoticeAt = mutableMapOf<String, Long>()

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> start(intent)
      ACTION_TOKEN -> intent.getStringExtra(EXTRA_TOKEN)?.let { token = it }
      ACTION_ARRIVED -> worker?.post { confirmArrival() }
      ACTION_NOT_YET -> cancelNotice(ARRIVAL_ID)
      ACTION_OK -> cancelNotice(CHECK_ID)
      ACTION_STOP -> shutDown()
      // Restarted by Android without its data: nothing to do
      else -> if (tripId == 0L) shutDown()
    }
    return START_REDELIVER_INTENT
  }

  private fun start(intent: Intent) {
    val newTrip = intent.getLongExtra(EXTRA_TRIP_ID, 0L)
    if (newTrip == 0L) return shutDown()
    val sameTrip = newTrip == tripId
    tripId = newTrip
    baseUrl = intent.getStringExtra(EXTRA_BASE_URL).orEmpty().trimEnd('/')
    token = intent.getStringExtra(EXTRA_TOKEN).orEmpty()
    destination = intent.getStringExtra(EXTRA_DESTINATION).orEmpty()
    destLatitude = intent.getDoubleExtra(EXTRA_DEST_LATITUDE, Double.NaN)
    destLongitude = intent.getDoubleExtra(EXTRA_DEST_LONGITUDE, Double.NaN)
    arrivalMs = intent.getLongExtra(EXTRA_ARRIVAL_MS, 0L)
    riskZones = parseZones(intent.getStringExtra(EXTRA_RISK_ZONES))
    if (!goForeground()) return
    if (sameTrip && worker != null) {
      // Only the arrival time or the session changed (extension, renewed token)
      updateNotice()
      return
    }
    resetProgress()
    status = Status(running = true, tripId = tripId)
    val t = HandlerThread("AlertaMujerTrip").apply { start() }
    thread = t
    worker = Handler(t.looper)
    acquireWakeLock()
    listenLocation(t)
    // First signal right away, then every interval
    worker?.post(tick)
  }

  private val tick = object : Runnable {
    override fun run() {
      sendHeartbeat()
      if (tripId != 0L) worker?.postDelayed(this, HEARTBEAT_MS)
    }
  }

  private fun resetProgress() {
    lastFix = null
    startDistance = Double.NaN
    bestDistance = Double.NaN
    bestDistanceAt = 0L
    arrivalAskedAt = 0L
    checkAskedAt = 0L
    zoneNoticeAt.clear()
  }

  // ── Location ───────────────────────────────────────────────────────────────────────

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
    // The GPS works without internet; the network gives a quick position indoors
    for (provider in listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)) {
      try {
        if (!manager.isProviderEnabled(provider)) continue
        manager.getLastKnownLocation(provider)?.let { if (isBetter(it)) lastFix = it }
        manager.requestLocationUpdates(provider, LOCATION_INTERVAL_MS, 0f, listener, t.looper)
      } catch (e: Exception) {
        Log.w(TAG, "No location from $provider", e)
      }
    }
  }

  /** A newer fix wins unless it is much less precise than a recent one. */
  private fun isBetter(candidate: Location): Boolean {
    val current = lastFix ?: return true
    val newer = candidate.time - current.time
    if (newer > 2 * 60_000) return true
    if (newer < -2 * 60_000) return false
    return candidate.accuracy <= current.accuracy + 30
  }

  private fun onFix(location: Location) {
    if (!isBetter(location)) return
    lastFix = location
    status = status.copy(lastFixAt = location.time)
    checkRiskZones(location)
    checkProgress(location)
  }

  // ── Risk zones ─────────────────────────────────────────────────────────────────────

  private fun parseZones(json: String?): List<RiskZone> =
    runCatching {
      val list = JSONArray(json ?: "[]")
      (0 until list.length()).map { i ->
        val z = list.getJSONObject(i)
        RiskZone(z.optString("name"), z.getDouble("latitude"), z.getDouble("longitude"), z.getDouble("radius"))
      }
    }.getOrDefault(emptyList())

  /** Inside or close to a risk zone she is told (once per zone every 30 min). */
  private fun checkRiskZones(location: Location) {
    if (riskZones.isEmpty() || location.accuracy > MAX_ACCURACY_M) return
    val now = System.currentTimeMillis()
    val result = FloatArray(1)
    for (zone in riskZones) {
      Location.distanceBetween(location.latitude, location.longitude, zone.latitude, zone.longitude, result)
      val distance = result[0].toDouble()
      val inside = distance <= zone.radius
      if (!inside && distance > zone.radius + NEAR_ZONE_M) continue
      // Entering after having been warned that she was close does deserve a new notice
      val key = (if (inside) "in:" else "near:") + zone.name
      if (now - (zoneNoticeAt[key] ?: 0L) < ZONE_NOTICE_MS) return
      zoneNoticeAt[key] = now
      val title = if (inside) "Estás en una zona de riesgo" else "Te acercas a una zona de riesgo"
      val text = zone.name + ". Mantén el celular contigo: si tu señal se corta aquí, avisamos a tus contactos a los 5 minutos."
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
      return
    }
  }

  // ── Arrival and "¿Todo bien?" ─────────────────────────────────────────────────────

  private fun checkProgress(location: Location) {
    if (destLatitude.isNaN() || destLongitude.isNaN()) return
    if (location.accuracy > MAX_ACCURACY_M) return
    val result = FloatArray(1)
    Location.distanceBetween(location.latitude, location.longitude, destLatitude, destLongitude, result)
    val distance = result[0].toDouble()
    val now = System.currentTimeMillis()
    if (startDistance.isNaN()) startDistance = distance
    if (bestDistance.isNaN() || distance < bestDistance - PROGRESS_STEP_M) {
      bestDistance = distance
      bestDistanceAt = now
    }

    if (distance <= ARRIVAL_RADIUS_M) {
      if (now - arrivalAskedAt > ASK_AGAIN_MS) {
        arrivalAskedAt = now
        askIfArrived()
      }
      return
    }
    if (now - checkAskedAt < ASK_AGAIN_MS) return
    val movingAway = distance > maxOf(startDistance * 1.5, startDistance + MOVING_AWAY_M)
    val stuck = distance > STUCK_MIN_DISTANCE_M && now - bestDistanceAt > STUCK_MS
    if (movingAway || stuck) {
      checkAskedAt = now
      // Not to be asked again right away for the same stop
      bestDistanceAt = now
      askIfOk(movingAway)
    }
  }

  private fun askIfArrived() {
    val notice = Notification.Builder(this, ALERTS_CHANNEL)
      .setContentTitle("¿Ya llegaste a $destination?")
      .setContentText("Estás a menos de 100 m. Confirma para que tus contactos no reciban aviso.")
      .setStyle(Notification.BigTextStyle().bigText("Estás a menos de 100 m. Confirma para que tus contactos no reciban aviso."))
      .setSmallIcon(applicationInfo.icon)
      .setAutoCancel(true)
      .setContentIntent(openApp())
      .addAction(Notification.Action.Builder(null, "Sí, llegué", serviceIntent(ACTION_ARRIVED, 1)).build())
      .addAction(Notification.Action.Builder(null, "Todavía no", serviceIntent(ACTION_NOT_YET, 2)).build())
      .build()
    notifications().notify(ARRIVAL_ID, notice)
  }

  private fun askIfOk(movingAway: Boolean) {
    val text = if (movingAway) {
      "Parece que te estás alejando de $destination. Si necesitas ayuda, abre la app."
    } else {
      "Hace 15 minutos no avanzas hacia $destination. Si necesitas ayuda, abre la app."
    }
    val notice = Notification.Builder(this, ALERTS_CHANNEL)
      .setContentTitle("¿Todo bien?")
      .setContentText(text)
      .setStyle(Notification.BigTextStyle().bigText(text))
      .setSmallIcon(applicationInfo.icon)
      .setAutoCancel(true)
      .setContentIntent(openApp())
      .addAction(Notification.Action.Builder(null, "Estoy bien", serviceIntent(ACTION_OK, 3)).build())
      .addAction(Notification.Action.Builder(null, "Abrir la app", openApp()).build())
      .build()
    notifications().notify(CHECK_ID, notice)
  }

  private fun confirmArrival() {
    cancelNotice(ARRIVAL_ID)
    val response = post("/api/safe-trips/$tripId/arrived", JSONObject())
    if (response != null && response.first in 200..299) {
      tripEndedListener?.invoke("arrived")
      showNotice("Llegaste a $destination", "Tus contactos no recibirán aviso. ¡Qué bueno que llegaste!")
      shutDown()
    } else {
      showNotice("No se pudo confirmar tu llegada", "Abre la app y toca \"Ya llegué\" antes de la hora de llegada.")
    }
  }

  // ── Signal of life ─────────────────────────────────────────────────────────────────

  private fun sendHeartbeat() {
    if (tripId == 0L) return
    val point = JSONObject().put("recordedAt", utcNow())
    lastFix?.takeIf { System.currentTimeMillis() - it.time < FRESH_FIX_MS }?.let {
      point.put("latitude", round(it.latitude, 6))
      point.put("longitude", round(it.longitude, 6))
      point.put("accuracy", round(it.accuracy.toDouble(), 2))
    }
    val response = post("/api/safe-trips/$tripId/heartbeat", point)
    when {
      response == null || response.first >= 500 -> queue(point)
      response.first == 401 -> {
        // The session token expired: the app renews it if it is open; meanwhile it is queued
        queue(point)
        authExpiredListener?.invoke()
      }
      response.first in 200..299 -> {
        status = status.copy(lastSentAt = System.currentTimeMillis())
        flushQueue()
        val tripStatus = runCatching { JSONObject(response.second).optString("status") }.getOrDefault("active")
        if (tripStatus != "active") return endedElsewhere(tripStatus)
      }
      // 400/403/404: the trip ended or is not hers
      else -> return endedElsewhere("ended")
    }
    updateNotice()
  }

  private fun endedElsewhere(tripStatus: String) {
    tripEndedListener?.invoke(tripStatus)
    shutDown()
  }

  private fun queue(point: JSONObject) {
    val prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val list = runCatching { JSONArray(prefs.getString(queueKey(), "[]")) }.getOrDefault(JSONArray())
    list.put(point)
    while (list.length() > MAX_QUEUED) list.remove(0)
    prefs.edit().putString(queueKey(), list.toString()).apply()
    status = status.copy(queued = list.length())
  }

  private fun flushQueue() {
    val prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val list = runCatching { JSONArray(prefs.getString(queueKey(), "[]")) }.getOrDefault(JSONArray())
    if (list.length() == 0) return
    val pending = JSONArray()
    for (i in 0 until list.length()) {
      val point = list.getJSONObject(i)
      val response = post("/api/safe-trips/$tripId/heartbeat", point)
      // Offline again: the rest stays for the next time. A 4xx is not retried.
      if (response == null || response.first >= 500) pending.put(point)
    }
    prefs.edit().putString(queueKey(), pending.toString()).apply()
    status = status.copy(queued = pending.length())
  }

  private fun queueKey() = "queue_$tripId"

  /** POST with the session; null if there was no connection. */
  private fun post(path: String, body: JSONObject): Pair<Int, String>? {
    if (baseUrl.isEmpty()) return null
    var connection: HttpURLConnection? = null
    return try {
      connection = (URL(baseUrl + path).openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = TIMEOUT_MS
        readTimeout = TIMEOUT_MS
        doOutput = true
        setRequestProperty("Content-Type", "application/json")
        if (token.isNotEmpty()) setRequestProperty("Authorization", "Bearer $token")
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
      // Without the location permission, or started from the background on Android 14
      Log.w(TAG, "Could not start the trip service", e)
      status = Status(running = false, tripId = tripId, error = e.message ?: "No se pudo iniciar")
      tripId = 0L
      stopSelf()
      false
    }
  }

  private fun serviceNotice(): Notification {
    val arrival = if (arrivalMs > 0) SimpleDateFormat("h:mm a", Locale("es", "CO")).format(Date(arrivalMs)) else ""
    val signal = when {
      status.queued > 0 -> "Sin internet: tu ubicación se guarda y se enviará al volver la conexión."
      // The time already ends in "p. m.": no extra period
      status.lastSentAt > 0 -> "Última señal enviada a las " +
        SimpleDateFormat("h:mm a", Locale("es", "CO")).format(Date(status.lastSentAt))
      else -> "Enviando tu ubicación cada 2 minutos."
    }
    val text = "Si no confirmas que llegaste antes de las $arrival, tus contactos reciben aviso. $signal"
    return Notification.Builder(this, SERVICE_CHANNEL)
      .setContentTitle("Rumbo a $destination")
      .setContentText(text)
      .setStyle(Notification.BigTextStyle().bigText(text))
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setContentIntent(openApp())
      .addAction(Notification.Action.Builder(null, "Ya llegué", serviceIntent(ACTION_ARRIVED, 4)).build())
      .build()
  }

  private fun updateNotice() {
    if (tripId != 0L) notifications().notify(SERVICE_ID, serviceNotice())
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
        NotificationChannel(SERVICE_CHANNEL, "Trayecto en curso", NotificationManager.IMPORTANCE_LOW).apply {
          description = "Aviso fijo mientras \"Avísame si no llego\" está activo"
        },
      )
    }
    if (manager.getNotificationChannel(ALERTS_CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(ALERTS_CHANNEL, "Avisos del trayecto", NotificationManager.IMPORTANCE_HIGH).apply {
          description = "¿Ya llegaste? y ¿Todo bien? durante un trayecto"
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
      this, code, Intent(this, TripService::class.java).setAction(action),
      PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

  // ── Life cycle ─────────────────────────────────────────────────────────────────────

  private fun shutDown() {
    val oldWorker = worker
    worker = null
    oldWorker?.removeCallbacksAndMessages(null)
    locationListener?.let {
      (getSystemService(Context.LOCATION_SERVICE) as LocationManager).removeUpdates(it)
    }
    locationListener = null
    thread?.quitSafely()
    thread = null
    releaseWakeLock()
    tripId = 0L
    status = Status()
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  override fun onDestroy() {
    if (tripId != 0L) shutDown()
    super.onDestroy()
  }

  private fun acquireWakeLock() {
    if (wakeLock?.isHeld == true) return
    val power = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AlertaMujer:trayecto").apply {
      setReferenceCounted(false)
      acquire(MAX_TRIP_MS)
    }
  }

  private fun releaseWakeLock() {
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  private fun hasLocationPermission() =
    checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
      checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

  data class RiskZone(val name: String, val latitude: Double, val longitude: Double, val radius: Double)

  /** What the app shows on the trip screen. */
  data class Status(
    val running: Boolean = false,
    val tripId: Long = 0L,
    val lastSentAt: Long = 0L,
    val lastFixAt: Long = 0L,
    val queued: Int = 0,
    val error: String? = null,
  )

  companion object {
    private const val TAG = "TripService"
    private const val SERVICE_CHANNEL = "trayecto_activo"
    private const val ALERTS_CHANNEL = "trayecto_avisos"
    private const val PREFS = "alertamujer_trip"
    private const val SERVICE_ID = 7401
    private const val ARRIVAL_ID = 7402
    private const val CHECK_ID = 7403
    private const val RESULT_ID = 7404
    private const val ZONE_ID = 7405
    private const val NEAR_ZONE_M = 300.0
    private const val ZONE_NOTICE_MS = 30 * 60_000L
    private const val HEARTBEAT_MS = 2 * 60_000L
    private const val LOCATION_INTERVAL_MS = 30_000L
    // A position older than this is not sent as the current one
    private const val FRESH_FIX_MS = 5 * 60_000L
    private const val TIMEOUT_MS = 15_000
    private const val MAX_QUEUED = 180
    private const val MAX_TRIP_MS = 7 * 60 * 60_000L
    private const val MAX_ACCURACY_M = 80f
    private const val ARRIVAL_RADIUS_M = 100.0
    private const val PROGRESS_STEP_M = 100.0
    private const val MOVING_AWAY_M = 700.0
    private const val STUCK_MIN_DISTANCE_M = 200.0
    private const val STUCK_MS = 15 * 60_000L
    private const val ASK_AGAIN_MS = 15 * 60_000L

    const val ACTION_START = "alertamujer.trip.START"
    const val ACTION_TOKEN = "alertamujer.trip.TOKEN"
    const val ACTION_STOP = "alertamujer.trip.STOP"
    const val ACTION_ARRIVED = "alertamujer.trip.ARRIVED"
    const val ACTION_NOT_YET = "alertamujer.trip.NOT_YET"
    const val ACTION_OK = "alertamujer.trip.OK"
    const val EXTRA_TRIP_ID = "tripId"
    const val EXTRA_BASE_URL = "baseUrl"
    const val EXTRA_TOKEN = "token"
    const val EXTRA_DESTINATION = "destination"
    const val EXTRA_DEST_LATITUDE = "destLatitude"
    const val EXTRA_DEST_LONGITUDE = "destLongitude"
    const val EXTRA_ARRIVAL_MS = "arrivalMs"
    const val EXTRA_RISK_ZONES = "riskZones"

    /** Notify the JS module (when the app is alive). */
    var authExpiredListener: (() -> Unit)? = null
    var tripEndedListener: ((String) -> Unit)? = null

    @Volatile
    var status = Status()
      private set

    // The backend stores LocalDateTime in UTC without a zone
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
