package expo.modules.shakesensor

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Accelerometer for "shake the phone" that keeps reading with the app minimized or the screen off.
 * expo-sensors stops reading as soon as the app goes to the background, even while the "Active
 * protection" service is running; this module does not depend on the app screen and keeps the CPU
 * awake (partial wake lock) while protection is on.
 */
class ShakeSensorModule : Module() {
  private val mainHandler = Handler(Looper.getMainLooper())
  private var listener: SensorEventListener? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var screenReceiver: BroadcastReceiver? = null

  private val androidContext: Context
    get() = requireNotNull(appContext.reactContext) { "No Android context" }

  private val sensors: SensorManager
    get() = androidContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  override fun definition() = ModuleDefinition {
    Name("ShakeSensor")
    Events("onReading", "onAudioChunk", "onRecordingError", "onScreenChange", "onTripAuthExpired", "onTripEnded")

    OnCreate {
      AudioRecorderService.chunkListener = { file, durationMs ->
        sendEvent("onAudioChunk", mapOf("uri" to Uri.fromFile(file).toString(), "durationMs" to durationMs.toDouble()))
      }
      AudioRecorderService.errorListener = { message -> sendEvent("onRecordingError", mapOf("message" to message)) }
      TripService.authExpiredListener = { sendEvent("onTripAuthExpired", emptyMap<String, Any>()) }
      TripService.tripEndedListener = { status -> sendEvent("onTripEnded", mapOf("status" to status)) }
    }

    Function("available") {
      sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null
    }

    // Readings in g (like expo-sensors) for the JS detector
    Function("start") { intervalMs: Int ->
      startSensor(intervalMs)
    }

    Function("stop") {
      stopSensor()
    }

    // Power button: the app does not receive the key, but it does get every screen on/off change
    // (also with the phone locked). Each press is a screen change.
    Function("startPowerButton") {
      startPowerButton()
    }

    Function("stopPowerButton") {
      stopPowerButton()
    }

    // Wait with an Android timer: JS timers may not advance with the screen off
    AsyncFunction("wait") { ms: Int, promise: Promise ->
      mainHandler.postDelayed({ promise.resolve(null) }, ms.toLong())
    }

    Function("ignoresBatteryOptimization") {
      val power = androidContext.getSystemService(Context.POWER_SERVICE) as PowerManager
      power.isIgnoringBatteryOptimizations(androidContext.packageName)
    }

    // Opens the system dialog "Let the app always run in the background?". If the app already has
    // the permission the dialog does not show (the button seemed to do nothing): the app's page in
    // Settings opens instead, where Samsung and other brands have "Battery → Unrestricted".
    Function("requestIgnoreBatteryOptimization") {
      val power = androidContext.getSystemService(Context.POWER_SERVICE) as PowerManager
      @SuppressLint("BatteryLife")
      val dialog = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        .setData(Uri.parse("package:" + androidContext.packageName))
      val opened = !power.isIgnoringBatteryOptimizations(androidContext.packageName) && openIntent(dialog)
      if (!opened) openAppDetails()
      opened
    }

    // ── Protection health ("Permissions and protection" screen) ─────────────────────────────

    Function("manufacturer") {
      Build.MANUFACTURER ?: ""
    }

    // Why the app was closed since sinceMs (Android 11+): Android records it even if the user does
    // not notice. Importance 125 = protection (foreground service) was running.
    Function("exitReasons") { sinceMs: Double ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return@Function emptyList<Map<String, Any>>()
      val activity = androidContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      activity.getHistoricalProcessExitReasons(androidContext.packageName, 0, 20)
        .filter { it.timestamp > sinceMs.toLong() }
        .map {
          mapOf(
            "timestamp" to it.timestamp.toDouble(),
            "reason" to it.reason,
            "importance" to it.importance,
            "description" to (it.description ?: ""),
          )
        }
    }

    // Android 14: a contact's emergency alarm needs the full-screen permission
    Function("canUseFullScreen") {
      if (Build.VERSION.SDK_INT < 34) return@Function true
      val notifications = androidContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      notifications.canUseFullScreenIntent()
    }

    Function("requestFullScreen") {
      if (Build.VERSION.SDK_INT >= 34) {
        openIntent(Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:" + androidContext.packageName)))
      }
    }

    // "Auto start" is not an Android setting but each brand's: its screen opens if it exists
    Function("hasAutoStartSetting") {
      autoStartScreen() != null
    }

    // true if the brand's auto-start screen opened; false if the app's page in Settings opened
    // instead. Each screen is tried: some exist but cannot be opened from another app (that is why
    // the button did nothing on Samsung).
    Function("openAutoStart") {
      val opened = AUTO_START_SCREENS
        .map { Intent().setComponent(ComponentName(it.first, it.second)) }
        .any { intent -> canOpen(intent) && openIntent(intent) }
      if (!opened) openAppDetails()
      opened
    }

    // ── Evidence recording during an alert ──────────────────────────────────────────────────

    // Starts the microphone service (it must be called with the app open). record=false leaves it
    // ready without using the microphone, while the camera records video with audio.
    Function("startAudioRecording") { secondsPerChunk: Int, record: Boolean ->
      val permission = androidContext.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO)
      if (permission != android.content.pm.PackageManager.PERMISSION_GRANTED) return@Function false
      val intent = Intent(androidContext, AudioRecorderService::class.java)
        .setAction(AudioRecorderService.ACTION_START)
        .putExtra(AudioRecorderService.EXTRA_SECONDS, secondsPerChunk)
        .putExtra(AudioRecorderService.EXTRA_RECORD, record)
      try {
        androidContext.startForegroundService(intent)
        true
      } catch (e: Exception) {
        false
      }
    }

    Function("pauseAudioRecording") { sendToRecorder(AudioRecorderService.ACTION_PAUSE) }
    Function("resumeAudioRecording") { sendToRecorder(AudioRecorderService.ACTION_RESUME) }
    Function("stopAudioRecording") { sendToRecorder(AudioRecorderService.ACTION_STOP) }

    Function("isAudioRecording") { AudioRecorderService.active }

    // Audio chunks that were not uploaded (e.g. the app was closed in the middle of the alert)
    Function("pendingAudios") {
      val inProgress = AudioRecorderService.currentPath
      AudioRecorderService.audioFolder(androidContext).listFiles().orEmpty()
        .filter { it.isFile && it.length() > 0 && it.absolutePath != inProgress }
        .sortedBy { it.lastModified() }
        .map { Uri.fromFile(it).toString() }
    }

    // Deletes an already uploaded evidence file (only inside the app cache)
    Function("deleteFile") { uri: String ->
      val path = Uri.parse(uri).path ?: return@Function false
      val file = java.io.File(path).canonicalFile
      if (!file.path.startsWith(androidContext.cacheDir.canonicalPath)) return@Function false
      file.delete()
    }

    // ── "Avísame si no llego" ───────────────────────────────────────────────────────────────

    // Starts (or updates) the trip service; it must be called with the app open. false if the
    // location permission is missing.
    Function("startTrip") { options: Map<String, Any?> ->
      val context = androidContext
      val fine = context.checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION)
      val coarse = context.checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION)
      if (fine != android.content.pm.PackageManager.PERMISSION_GRANTED &&
        coarse != android.content.pm.PackageManager.PERMISSION_GRANTED
      ) return@Function false
      val intent = Intent(context, TripService::class.java)
        .setAction(TripService.ACTION_START)
        .putExtra(TripService.EXTRA_TRIP_ID, (options["tripId"] as? Number)?.toLong() ?: 0L)
        .putExtra(TripService.EXTRA_BASE_URL, options["baseUrl"] as? String ?: "")
        .putExtra(TripService.EXTRA_TOKEN, options["token"] as? String ?: "")
        .putExtra(TripService.EXTRA_DESTINATION, options["destination"] as? String ?: "")
        .putExtra(TripService.EXTRA_DEST_LATITUDE, (options["destLatitude"] as? Number)?.toDouble() ?: Double.NaN)
        .putExtra(TripService.EXTRA_DEST_LONGITUDE, (options["destLongitude"] as? Number)?.toDouble() ?: Double.NaN)
        .putExtra(TripService.EXTRA_ARRIVAL_MS, (options["arrivalMs"] as? Number)?.toLong() ?: 0L)
        .putExtra(TripService.EXTRA_RISK_ZONES, options["riskZones"] as? String ?: "[]")
      try {
        context.startForegroundService(intent)
        true
      } catch (e: Exception) {
        false
      }
    }

    Function("updateTripToken") { token: String ->
      if (TripService.status.running) {
        androidContext.startService(
          Intent(androidContext, TripService::class.java).setAction(TripService.ACTION_TOKEN).putExtra(TripService.EXTRA_TOKEN, token),
        )
      }
      Unit
    }

    Function("stopTrip") {
      if (TripService.status.running) {
        androidContext.startService(Intent(androidContext, TripService::class.java).setAction(TripService.ACTION_STOP))
      }
      Unit
    }

    Function("tripStatus") {
      val s = TripService.status
      mapOf(
        "running" to s.running,
        "tripId" to s.tripId.toDouble(),
        "lastSentAt" to s.lastSentAt.toDouble(),
        "lastFixAt" to s.lastFixAt.toDouble(),
        "queued" to s.queued,
        "error" to s.error,
      )
    }

    OnDestroy {
      stopSensor()
      stopPowerButton()
      AudioRecorderService.chunkListener = null
      AudioRecorderService.errorListener = null
      TripService.authExpiredListener = null
      TripService.tripEndedListener = null
    }
  }

  private fun startPowerButton() {
    stopPowerButton()
    val audio = androidContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    val receiver = object : BroadcastReceiver() {
      override fun onReceive(ctx: Context, intent: Intent) {
        // During a call the proximity sensor turns the screen on and off when the phone gets close
        // to the face: those are not presses
        val inCall = audio.mode == AudioManager.MODE_IN_CALL || audio.mode == AudioManager.MODE_IN_COMMUNICATION
        if (inCall) return
        sendEvent("onScreenChange", mapOf("screenOn" to (intent.action == Intent.ACTION_SCREEN_ON)))
      }
    }
    val filter = IntentFilter().apply {
      addAction(Intent.ACTION_SCREEN_ON)
      addAction(Intent.ACTION_SCREEN_OFF)
    }
    // These are system broadcasts: they arrive even if the receiver is not exported
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      androidContext.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      androidContext.registerReceiver(receiver, filter)
    }
    screenReceiver = receiver
  }

  private fun stopPowerButton() {
    screenReceiver?.let {
      try {
        androidContext.unregisterReceiver(it)
      } catch (e: IllegalArgumentException) {
        // already removed
      }
    }
    screenReceiver = null
  }

  private fun sendToRecorder(action: String) {
    if (!AudioRecorderService.active) return
    androidContext.startService(Intent(androidContext, AudioRecorderService::class.java).setAction(action))
  }

  // false if Android did not let it open (it does not exist, is not exported or the brand blocks it)
  private fun openIntent(intent: Intent): Boolean =
    try {
      androidContext.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      true
    } catch (e: Exception) {
      false
    }

  private fun openAppDetails(): Boolean =
    openIntent(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + androidContext.packageName)))

  private fun autoStartScreen(): ComponentName? =
    AUTO_START_SCREENS
      .map { ComponentName(it.first, it.second) }
      .firstOrNull { canOpen(Intent().setComponent(it)) }

  private fun canOpen(intent: Intent): Boolean {
    val activity = androidContext.packageManager.resolveActivity(intent, 0)?.activityInfo ?: return false
    return activity.exported
  }

  private fun startSensor(intervalMs: Int): Boolean {
    stopSensor()
    val accelerometer = sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) ?: return false
    val newListener = object : SensorEventListener {
      override fun onSensorChanged(event: SensorEvent) {
        val g = SensorManager.GRAVITY_EARTH
        sendEvent(
          "onReading",
          mapOf(
            "x" to event.values[0] / g,
            "y" to event.values[1] / g,
            "z" to event.values[2] / g,
          ),
        )
      }

      override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) = Unit
    }
    sensors.registerListener(newListener, accelerometer, intervalMs * 1000, mainHandler)
    listener = newListener

    val power = androidContext.getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AlertaMujer:proteccion").apply {
      setReferenceCounted(false)
      acquire()
    }
    return true
  }

  private fun stopSensor() {
    listener?.let { sensors.unregisterListener(it) }
    listener = null
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  companion object {
    // Each brand's "auto start" / "protected apps" screens (the brands that kill apps)
    private val AUTO_START_SCREENS = listOf(
      // Infinix, Tecno, itel (Transsion: Phone Master)
      "com.transsion.phonemaster" to "com.cyin.himgr.autostart.AutoStartActivity",
      // Xiaomi, Redmi, POCO
      "com.miui.securitycenter" to "com.miui.permcenter.autostart.AutoStartManagementActivity",
      // Oppo, Realme, OnePlus (ColorOS)
      "com.coloros.safecenter" to "com.coloros.safecenter.permission.startup.StartupAppListActivity",
      "com.coloros.safecenter" to "com.coloros.safecenter.startupapp.StartupAppListActivity",
      "com.oppo.safe" to "com.oppo.safe.permission.startup.StartupAppListActivity",
      // Vivo, iQOO
      "com.vivo.permissionmanager" to "com.vivo.permissionmanager.activity.BgStartUpManagerActivity",
      "com.iqoo.secure" to "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity",
      // Huawei, Honor
      "com.huawei.systemmanager" to "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity",
      "com.huawei.systemmanager" to "com.huawei.systemmanager.optimize.process.ProtectActivity",
      // Samsung has no auto-start screen that can be opened: the app's page is used instead
      // (Battery → Unrestricted)
      // Asus
      "com.asus.mobilemanager" to "com.asus.mobilemanager.MainActivity",
    )
  }
}
