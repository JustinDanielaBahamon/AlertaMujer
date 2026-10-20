package expo.modules.sensorsacudidas

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import java.io.File

/**
 * Graba el micrófono durante una alerta, también con la app minimizada o la pantalla apagada.
 *
 * Es un servicio en primer plano de tipo "micrófono": Android solo deja iniciarlo con la app
 * abierta, pero una vez encendido puede seguir grabando en segundo plano. Graba en trozos de
 * pocos segundos para que cada uno se suba apenas termina: si le quitan o apagan el teléfono,
 * lo ya grabado está en la nube. Mientras la cámara graba video (que ya trae audio), el servicio
 * queda "en pausa" sin usar el micrófono.
 */
class GrabadoraAudioService : Service() {
  private var grabadora: MediaRecorder? = null
  private var archivoActual: File? = null
  private var inicioActual = 0L
  private var segundosPorTrozo = 30
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACCION_INICIAR -> {
        segundosPorTrozo = intent.getIntExtra(EXTRA_SEGUNDOS, 30).coerceIn(5, 300)
        if (!enPrimerPlano()) return START_NOT_STICKY
        if (intent.getBooleanExtra(EXTRA_GRABAR, true)) empezarTrozo()
      }
      ACCION_REANUDAR -> if (grabadora == null) empezarTrozo()
      ACCION_PAUSAR -> terminarTrozo()
      ACCION_DETENER -> {
        terminarTrozo()
        apagar()
      }
    }
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    terminarTrozo()
    soltarWakeLock()
    activo = false
    super.onDestroy()
  }

  private fun enPrimerPlano(): Boolean {
    crearCanal()
    val abrirApp = packageManager.getLaunchIntentForPackage(packageName)?.let {
      PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }
    val aviso: Notification = Notification.Builder(this, CANAL)
      .setContentTitle("Alerta activa")
      .setContentText("Grabando evidencia para tus contactos")
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .setContentIntent(abrirApp)
      .build()
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        startForeground(ID_AVISO, aviso, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
      } else {
        startForeground(ID_AVISO, aviso)
      }
      activo = true
      tomarWakeLock()
      true
    } catch (e: Exception) {
      // Android 14 no deja iniciarlo desde segundo plano ni sin permiso de micrófono
      Log.w(TAG, "No se pudo iniciar la grabación en primer plano", e)
      oyenteError?.invoke(e.message ?: "No se pudo iniciar la grabación")
      stopSelf()
      false
    }
  }

  private fun empezarTrozo() {
    val carpeta = carpetaAudios(this)
    val archivo = File(carpeta, "audio_${System.currentTimeMillis()}.m4a")
    val nueva = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(this) else @Suppress("DEPRECATION") MediaRecorder()
    try {
      nueva.setAudioSource(MediaRecorder.AudioSource.MIC)
      nueva.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
      nueva.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
      nueva.setAudioChannels(1)
      nueva.setAudioSamplingRate(44100)
      nueva.setAudioEncodingBitRate(64000)
      nueva.setMaxDuration(segundosPorTrozo * 1000)
      nueva.setOutputFile(archivo.absolutePath)
      nueva.setOnInfoListener { _, que, _ ->
        // Al llegar al largo del trozo se cierra el archivo y empieza otro
        if (que == MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) {
          terminarTrozo()
          empezarTrozo()
        }
      }
      nueva.prepare()
      nueva.start()
      grabadora = nueva
      archivoActual = archivo
      rutaEnCurso = archivo.absolutePath
      inicioActual = System.currentTimeMillis()
    } catch (e: Exception) {
      Log.w(TAG, "No se pudo usar el micrófono", e)
      nueva.release()
      archivo.delete()
      oyenteError?.invoke("El micrófono está ocupado o sin permiso")
    }
  }

  private fun terminarTrozo() {
    val actual = grabadora ?: return
    val archivo = archivoActual
    val duracion = System.currentTimeMillis() - inicioActual
    grabadora = null
    archivoActual = null
    rutaEnCurso = null
    try {
      actual.stop()
    } catch (e: RuntimeException) {
      // stop() falla si no llegó a grabar nada: el archivo no sirve
      archivo?.delete()
    } finally {
      actual.release()
    }
    if (archivo == null || !archivo.exists()) return
    // Trozos de pocos segundos (al alternar con la cámara) no aportan nada: se descartan
    if (archivo.length() == 0L || duracion < MINIMO_TROZO_MS) {
      archivo.delete()
      return
    }
    oyenteTrozo?.invoke(archivo, duracion)
  }

  private fun apagar() {
    soltarWakeLock()
    activo = false
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  private fun crearCanal() {
    val gestor = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (gestor.getNotificationChannel(CANAL) == null) {
      gestor.createNotificationChannel(
        NotificationChannel(CANAL, "Grabación de evidencia", NotificationManager.IMPORTANCE_LOW).apply {
          description = "Aviso fijo mientras se graba la evidencia de una alerta"
        },
      )
    }
  }

  private fun tomarWakeLock() {
    if (wakeLock?.isHeld == true) return
    val energia = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = energia.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AlertaMujer:grabacion").apply {
      setReferenceCounted(false)
      acquire(4 * 60 * 60 * 1000L) // tope por si la alerta nunca se cierra
    }
  }

  private fun soltarWakeLock() {
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  companion object {
    private const val TAG = "GrabadoraAudio"
    private const val CANAL = "grabacion_evidencia"
    private const val ID_AVISO = 7301
    private const val MINIMO_TROZO_MS = 3000L
    const val ACCION_INICIAR = "alertamujer.grabacion.INICIAR"
    const val ACCION_PAUSAR = "alertamujer.grabacion.PAUSAR"
    const val ACCION_REANUDAR = "alertamujer.grabacion.REANUDAR"
    const val ACCION_DETENER = "alertamujer.grabacion.DETENER"
    const val EXTRA_SEGUNDOS = "segundos"
    const val EXTRA_GRABAR = "grabar"

    /** Avisan al módulo de JS de cada trozo terminado y de los errores. */
    var oyenteTrozo: ((File, Long) -> Unit)? = null
    var oyenteError: ((String) -> Unit)? = null

    @Volatile
    var activo = false
      private set

    /** Archivo que se está grabando ahora (no se sube hasta que termine). */
    @Volatile
    var rutaEnCurso: String? = null
      private set

    fun carpetaAudios(contexto: Context): File = File(contexto.cacheDir, "evidencias").apply { mkdirs() }
  }
}
