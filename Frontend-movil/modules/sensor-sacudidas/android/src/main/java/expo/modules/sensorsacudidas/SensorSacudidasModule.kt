package expo.modules.sensorsacudidas

import android.annotation.SuppressLint
import android.app.ActivityManager
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
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

    // ── Salud de la protección (pantalla "Permisos y protección") ──────────────────────────

    Function("fabricante") {
      Build.MANUFACTURER ?: ""
    }

    // Por qué se cerró la app desde desdeMs (Android 11+): Android lo registra aunque la usuaria no
    // lo note. importancia 125 = la protección (servicio en primer plano) estaba corriendo.
    Function("motivosDeCierre") { desdeMs: Double ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return@Function emptyList<Map<String, Any>>()
      val actividad = contexto.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      actividad.getHistoricalProcessExitReasons(contexto.packageName, 0, 20)
        .filter { it.timestamp > desdeMs.toLong() }
        .map {
          mapOf(
            "timestamp" to it.timestamp.toDouble(),
            "motivo" to it.reason,
            "importancia" to it.importance,
            "descripcion" to (it.description ?: ""),
          )
        }
    }

    // Android 14: la alarma de emergencia de un contacto necesita permiso de pantalla completa
    Function("puedePantallaCompleta") {
      if (Build.VERSION.SDK_INT < 34) return@Function true
      val notificaciones = contexto.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      notificaciones.canUseFullScreenIntent()
    }

    Function("pedirPantallaCompleta") {
      if (Build.VERSION.SDK_INT >= 34) {
        abrir(Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:" + contexto.packageName)))
      }
    }

    // "Inicio automático" no es de Android sino de cada marca: se abre su pantalla si existe
    Function("tieneAjusteInicioAutomatico") {
      pantallaInicioAutomatico() != null
    }

    Function("abrirInicioAutomatico") {
      val pantalla = pantallaInicioAutomatico()
      if (pantalla != null) {
        abrir(Intent().setComponent(pantalla))
        true
      } else {
        abrir(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + contexto.packageName)))
        false
      }
    }

    OnDestroy {
      detener()
    }
  }

  private fun abrir(intent: Intent) {
    contexto.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
  }

  private fun pantallaInicioAutomatico(): ComponentName? =
    PANTALLAS_INICIO_AUTOMATICO
      .map { ComponentName(it.first, it.second) }
      .firstOrNull { componente ->
        Intent().setComponent(componente).resolveActivity(contexto.packageManager) != null
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

  companion object {
    // Pantallas de "inicio automático" / "apps protegidas" de cada marca (las que matan apps)
    private val PANTALLAS_INICIO_AUTOMATICO = listOf(
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
      // Samsung (apps que nunca se suspenden)
      "com.samsung.android.lool" to "com.samsung.android.sm.battery.ui.BatteryActivity",
      // Asus
      "com.asus.mobilemanager" to "com.asus.mobilemanager.MainActivity",
    )
  }
}
