package expo.modules.sensorsacudidas

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Acelerómetro para "agitar el teléfono" que sigue leyendo con la app minimizada o la pantalla
 * apagada. expo-sensors deja de leer en cuanto la app pasa a segundo plano, aunque el servicio
 * "Protección activa" siga encendido; este módulo no depende de la pantalla de la app y mantiene
 * la CPU despierta (wake lock parcial) mientras la protección está encendida.
 */
class SensorSacudidasModule : Module() {
  private val principal = Handler(Looper.getMainLooper())
  private var oyente: SensorEventListener? = null
  private var wakeLock: PowerManager.WakeLock? = null

  private val contexto: Context
    get() = requireNotNull(appContext.reactContext) { "Sin contexto de Android" }

  private val sensores: SensorManager
    get() = contexto.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  override fun definition() = ModuleDefinition {
    Name("SensorSacudidas")
    Events("onLectura")

    Function("disponible") {
      sensores.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null
    }

    // Lecturas en g (como expo-sensors) para el detector de JS
    Function("iniciar") { intervaloMs: Int ->
      iniciar(intervaloMs)
    }

    Function("detener") {
      detener()
    }

    // Espera con un temporizador de Android: los de JS pueden no avanzar con la pantalla apagada
    AsyncFunction("esperar") { ms: Int, promise: Promise ->
      principal.postDelayed({ promise.resolve(null) }, ms.toLong())
    }

    Function("ignoraOptimizacionBateria") {
      val energia = contexto.getSystemService(Context.POWER_SERVICE) as PowerManager
      energia.isIgnoringBatteryOptimizations(contexto.packageName)
    }

    // Abre el diálogo del sistema "¿Permitir que la app se ejecute siempre en segundo plano?"
    Function("pedirIgnorarOptimizacionBateria") {
      @SuppressLint("BatteryLife")
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
        .setData(Uri.parse("package:" + contexto.packageName))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      contexto.startActivity(intent)
    }

    OnDestroy {
      detener()
    }
  }

  private fun iniciar(intervaloMs: Int): Boolean {
    detener()
    val acelerometro = sensores.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) ?: return false
    val nuevo = object : SensorEventListener {
      override fun onSensorChanged(evento: SensorEvent) {
        val g = SensorManager.GRAVITY_EARTH
        sendEvent(
          "onLectura",
          mapOf(
            "x" to evento.values[0] / g,
            "y" to evento.values[1] / g,
            "z" to evento.values[2] / g,
          ),
        )
      }

      override fun onAccuracyChanged(sensor: Sensor, precision: Int) = Unit
    }
    sensores.registerListener(nuevo, acelerometro, intervaloMs * 1000, principal)
    oyente = nuevo

    val energia = contexto.getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = energia.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "AlertaMujer:proteccion").apply {
      setReferenceCounted(false)
      acquire()
    }
    return true
  }

  private fun detener() {
    oyente?.let { sensores.unregisterListener(it) }
    oyente = null
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }
}
