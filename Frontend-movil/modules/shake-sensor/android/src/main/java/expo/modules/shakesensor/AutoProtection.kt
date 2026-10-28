package expo.modules.shakesensor

import android.Manifest
import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import org.json.JSONArray

/**
 * Automatic protection: she marks her frequent places (home, work, university) and Android watches a
 * geofence around each one, also with the app closed and at almost no battery cost (the system does it,
 * not the app). Leaving one starts AutoProtectionService; arriving at another ends it.
 *
 * The phone keeps its own key for the server (see the backend's ProtectionDevice), so it works even
 * days after the app was last opened, when her session may have expired.
 */
object AutoProtection {
  private const val TAG = "AutoProtection"
  private const val PREFS = "alertamujer_auto"
  private const val KEY_ENABLED = "enabled"
  private const val KEY_BASE_URL = "baseUrl"
  private const val KEY_KEY = "key"
  private const val KEY_PLACES = "places"
  private const val KEY_ZONES = "riskZones"
  private const val KEY_PIN = "pinRequired"
  /** Android allows 100 geofences per app; a person does not have that many frequent places. */
  private const val MAX_PLACES = 90
  /** Smaller circles fire with the GPS drift of a phone standing still at home. */
  private const val MIN_RADIUS_M = 150f
  private const val REQUEST_CODE = 7501

  data class Place(val id: String, val latitude: Double, val longitude: Double, val radius: Float)

  private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun isEnabled(context: Context) = prefs(context).getBoolean(KEY_ENABLED, false)
  fun baseUrl(context: Context) = prefs(context).getString(KEY_BASE_URL, "").orEmpty()
  fun key(context: Context) = prefs(context).getString(KEY_KEY, "").orEmpty()
  fun riskZonesJson(context: Context) = prefs(context).getString(KEY_ZONES, "[]").orEmpty()

  /** She has a cancel PIN: "Detener" opens the app to ask for it instead of stopping right away. */
  fun pinRequired(context: Context) = prefs(context).getBoolean(KEY_PIN, false)
  fun setPinRequired(context: Context, required: Boolean) = prefs(context).edit().putBoolean(KEY_PIN, required).apply()

  fun places(context: Context): List<Place> =
    runCatching {
      val list = JSONArray(prefs(context).getString(KEY_PLACES, "[]"))
      (0 until list.length()).map { i ->
        val p = list.getJSONObject(i)
        Place(p.getString("id"), p.getDouble("latitude"), p.getDouble("longitude"),
          maxOf(MIN_RADIUS_M, p.optDouble("radius", MIN_RADIUS_M.toDouble()).toFloat()))
      }
    }.getOrDefault(emptyList())

  /** Turns it on (or refreshes its places and zones). key = null keeps the one already stored. */
  fun configure(context: Context, baseUrl: String, key: String?, placesJson: String, zonesJson: String): Boolean {
    prefs(context).edit()
      .putBoolean(KEY_ENABLED, true)
      .putString(KEY_BASE_URL, baseUrl.trimEnd('/'))
      .apply {
        if (!key.isNullOrEmpty()) putString(KEY_KEY, key)
      }
      .putString(KEY_PLACES, placesJson)
      .putString(KEY_ZONES, zonesJson)
      .apply()
    return registerGeofences(context)
  }

  fun disable(context: Context) {
    prefs(context).edit().clear().apply()
    runCatching { LocationServices.getGeofencingClient(context).removeGeofences(pendingIntent(context)) }
    if (AutoProtectionService.status.running) {
      context.startService(Intent(context, AutoProtectionService::class.java).setAction(AutoProtectionService.ACTION_DISABLED))
    }
  }

  /** Background location ("Permitir todo el tiempo") is required for geofences on Android 10+. */
  fun hasPermissions(context: Context): Boolean {
    val fine = context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    val background = Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
      context.checkSelfPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED
    return fine && background
  }

  /** (Re)registers the geofences: after configuring, after a reboot and after an app update. */
  @SuppressLint("MissingPermission")
  fun registerGeofences(context: Context): Boolean {
    if (!isEnabled(context) || !hasPermissions(context)) return false
    val places = places(context).take(MAX_PLACES)
    val client = LocationServices.getGeofencingClient(context)
    runCatching { client.removeGeofences(pendingIntent(context)) }
    if (places.isEmpty()) return true
    val fences = places.map {
      Geofence.Builder()
        .setRequestId(it.id)
        .setCircularRegion(it.latitude, it.longitude, it.radius)
        .setExpirationDuration(Geofence.NEVER_EXPIRE)
        .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT)
        // Up to a minute late is fine and saves battery
        .setNotificationResponsiveness(60_000)
        .build()
    }
    val request = GeofencingRequest.Builder()
      // No trigger for the place she is in right now: only real exits and entries count
      .setInitialTrigger(0)
      .addGeofences(fences)
      .build()
    return try {
      client.addGeofences(request, pendingIntent(context))
        .addOnFailureListener { Log.w(TAG, "Geofences not added", it) }
      true
    } catch (e: SecurityException) {
      Log.w(TAG, "No permission for geofences", e)
      false
    }
  }

  private fun pendingIntent(context: Context): PendingIntent {
    val intent = Intent(context, GeofenceReceiver::class.java)
    // Geofencing fills the intent with the event: it must be mutable on Android 12+
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or
      (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0)
    return PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags)
  }
}
