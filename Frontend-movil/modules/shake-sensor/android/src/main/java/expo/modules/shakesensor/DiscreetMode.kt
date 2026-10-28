package expo.modules.shakesensor

import android.content.Context

/**
 * "Modo discreto": the persistent notifications (protection, recording, trip) show neutral texts so
 * whoever looks at her locked phone does not learn that she is protected or being recorded.
 * On by default; the app changes it from its settings.
 */
object DiscreetMode {
  private const val PREFS = "alertamujer_settings"
  private const val KEY = "discreet"

  const val TITLE = "Servicio activo"
  const val TEXT = "Toca para abrir"

  fun isOn(context: Context): Boolean =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY, true)

  fun set(context: Context, on: Boolean) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY, on).apply()
  }
}
