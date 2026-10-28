package expo.modules.shakesensor

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.Manifest
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import java.io.File

/**
 * Records the microphone during an alert, also with the app minimized or the screen off.
 *
 * It is a foreground service of type "microphone" and "location": Android only lets it start with the
 * app open, but once running it can keep recording and the app can keep reading the location in the
 * background (with only the "while using the app" location permission). Without that type the route of
 * an alert stopped as soon as the phone was locked. It records in chunks of a few seconds
 * so each one is uploaded as soon as it ends: if the phone is taken away or turned off, what was
 * already recorded is in the cloud. While the camera records video (which already has audio), the
 * service stays "paused" without using the microphone.
 */
class AudioRecorderService : Service() {
  private var recorder: MediaRecorder? = null
  private var currentFile: File? = null
  private var currentStart = 0L
  private var secondsPerChunk = 30
  // The first chunk is shorter, so the contacts get something within seconds
  private var firstChunkSeconds = 10
  private var firstChunkPending = true
  private var wakeLock: PowerManager.WakeLock? = null
  // The app wants audio now (not paused for the camera, not stopped)
  private var wantRecording = false
  // When the camera stops, it may still hold the microphone for a moment: starting fails and,
  // without retrying, no audio was recorded for the rest of the alert
  private var retries = 0
  private val handler = Handler(Looper.getMainLooper())

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> {
        secondsPerChunk = intent.getIntExtra(EXTRA_SECONDS, 30).coerceIn(5, 300)
        firstChunkSeconds = intent.getIntExtra(EXTRA_FIRST_SECONDS, secondsPerChunk).coerceIn(5, secondsPerChunk)
        if (!active) firstChunkPending = true
        // From the background (alert by shaking) the protection service keeps the app alive and holds
        // the microphone permission: this one runs without its own notification (Android does not let
        // a microphone service start from the background)
        val background = intent.getBooleanExtra(EXTRA_BACKGROUND, false)
        if (background) {
          active = true
          acquireWakeLock()
        } else if (!goForeground()) {
          return START_NOT_STICKY
        }
        wantRecording = intent.getBooleanExtra(EXTRA_RECORD, true)
        // Started again when she opens the app (it was recording from the background): the chunk in
        // progress goes on, or ends if the camera takes over
        if (wantRecording && recorder == null) {
          startFresh()
        } else if (!wantRecording) {
          handler.removeCallbacksAndMessages(null)
          endChunk()
        }
      }
      ACTION_RESUME -> {
        wantRecording = true
        if (recorder == null) startFresh()
      }
      ACTION_PAUSE -> {
        wantRecording = false
        handler.removeCallbacksAndMessages(null)
        endChunk()
      }
      ACTION_STOP -> {
        wantRecording = false
        handler.removeCallbacksAndMessages(null)
        endChunk()
        shutDown()
      }
    }
    return START_NOT_STICKY
  }

  private fun startFresh() {
    handler.removeCallbacksAndMessages(null)
    retries = 0
    startChunk()
  }

  override fun onDestroy() {
    wantRecording = false
    handler.removeCallbacksAndMessages(null)
    endChunk()
    releaseWakeLock()
    active = false
    super.onDestroy()
  }

  private fun goForeground(): Boolean {
    createChannel()
    val openApp = packageManager.getLaunchIntentForPackage(packageName)?.let {
      PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }
    val discreet = DiscreetMode.isOn(this)
    val notice: Notification = Notification.Builder(this, CHANNEL)
      .setContentTitle(if (discreet) DiscreetMode.TITLE else "Alerta activa")
      .setContentText(if (discreet) DiscreetMode.TEXT else "Grabando evidencia para tus contactos")
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .setContentIntent(openApp)
      .build()
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val types = serviceTypes()
        try {
          startForeground(NOTICE_ID, notice, types)
        } catch (e: SecurityException) {
          // Started from the background (widget, shake) Android may refuse the location type:
          // recording matters more, so it starts as a microphone service only
          if (types == ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE) throw e
          Log.w(TAG, "Location type refused, recording without it", e)
          startForeground(NOTICE_ID, notice, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
        }
      } else {
        startForeground(NOTICE_ID, notice)
      }
      active = true
      acquireWakeLock()
      true
    } catch (e: Exception) {
      // Android 14 does not let it start from the background or without the microphone permission
      Log.w(TAG, "Could not start the foreground recording", e)
      errorListener?.invoke(e.message ?: "No se pudo iniciar la grabación")
      stopSelf()
      false
    }
  }

  /** Each type needs its permission granted, or Android 14 refuses to start the service. */
  private fun serviceTypes(): Int {
    var types = 0
    if (granted(Manifest.permission.RECORD_AUDIO)) types = types or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
    if (granted(Manifest.permission.ACCESS_FINE_LOCATION) || granted(Manifest.permission.ACCESS_COARSE_LOCATION)) {
      types = types or ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
    }
    return if (types == 0) ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE else types
  }

  private fun granted(permission: String) =
    checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED

  private fun startChunk() {
    val folder = audioFolder(this)
    val file = File(folder, "audio_${System.currentTimeMillis()}.m4a")
    val newRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(this) else @Suppress("DEPRECATION") MediaRecorder()
    try {
      newRecorder.setAudioSource(MediaRecorder.AudioSource.MIC)
      newRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
      newRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
      newRecorder.setAudioChannels(1)
      newRecorder.setAudioSamplingRate(44100)
      newRecorder.setAudioEncodingBitRate(64000)
      newRecorder.setMaxDuration((if (firstChunkPending) firstChunkSeconds else secondsPerChunk) * 1000)
      newRecorder.setOutputFile(file.absolutePath)
      newRecorder.setOnInfoListener { _, what, _ ->
        // When the chunk length is reached the file is closed and another one starts
        if (what == MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) {
          endChunk()
          startChunk()
        }
      }
      newRecorder.prepare()
      newRecorder.start()
      recorder = newRecorder
      firstChunkPending = false
      currentFile = file
      currentPath = file.absolutePath
      currentStart = System.currentTimeMillis()
      retries = 0
    } catch (e: Exception) {
      Log.w(TAG, "Could not use the microphone (attempt ${retries + 1})", e)
      newRecorder.release()
      file.delete()
      if (wantRecording && retries < MAX_RETRIES) {
        retries++
        handler.postDelayed({ if (wantRecording && recorder == null) startChunk() }, RETRY_DELAY_MS)
      } else {
        errorListener?.invoke("El micrófono está ocupado o sin permiso")
      }
    }
  }

  private fun endChunk() {
    val current = recorder ?: return
    val file = currentFile
    val duration = System.currentTimeMillis() - currentStart
    recorder = null
    currentFile = null
    currentPath = null
    try {
      current.stop()
    } catch (e: RuntimeException) {
      // stop() fails if nothing was recorded: the file is useless
      file?.delete()
    } finally {
      current.release()
    }
    if (file == null || !file.exists()) return
    // Chunks of a few seconds (when switching with the camera) add nothing: they are discarded
    if (file.length() == 0L || duration < MIN_CHUNK_MS) {
      file.delete()
      return
    }
    chunkListener?.invoke(file, duration)
  }

  private fun shutDown() {
    releaseWakeLock()
    active = false
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  private fun createChannel() {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (manager.getNotificationChannel(CHANNEL) == null) {
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL, "Grabación de evidencia", NotificationManager.IMPORTANCE_LOW).apply {
          description = "Aviso fijo mientras se graba la evidencia de una alerta"
        },
      )
    }
  }

  private fun acquireWakeLock() {
    if (wakeLock?.isHeld == true) return
    val power = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AlertaMujer:grabacion").apply {
      setReferenceCounted(false)
      acquire(4 * 60 * 60 * 1000L) // cap in case the alert is never closed
    }
  }

  private fun releaseWakeLock() {
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  companion object {
    private const val TAG = "AudioRecorder"
    // Values kept from the first version: Android keeps the channel and the cached files
    private const val CHANNEL = "grabacion_evidencia"
    private const val NOTICE_ID = 7301
    private const val MIN_CHUNK_MS = 3000L
    // Up to ~8 s waiting for the camera to release the microphone
    private const val MAX_RETRIES = 10
    private const val RETRY_DELAY_MS = 800L
    const val ACTION_START = "alertamujer.recording.START"
    const val ACTION_PAUSE = "alertamujer.recording.PAUSE"
    const val ACTION_RESUME = "alertamujer.recording.RESUME"
    const val ACTION_STOP = "alertamujer.recording.STOP"
    const val EXTRA_SECONDS = "seconds"
    const val EXTRA_RECORD = "record"
    const val EXTRA_FIRST_SECONDS = "firstSeconds"
    const val EXTRA_BACKGROUND = "background"

    /** Notify the JS module of each finished chunk and of errors. */
    var chunkListener: ((File, Long) -> Unit)? = null
    var errorListener: ((String) -> Unit)? = null

    @Volatile
    var active = false
      private set

    /** File being recorded now (it is not uploaded until it ends). */
    @Volatile
    var currentPath: String? = null
      private set

    fun audioFolder(context: Context): File = File(context.cacheDir, "evidencias").apply { mkdirs() }
  }
}
