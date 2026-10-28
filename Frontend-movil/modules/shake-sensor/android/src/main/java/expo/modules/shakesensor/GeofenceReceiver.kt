package expo.modules.shakesensor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent

/**
 * Android tells it when she leaves or arrives at one of her frequent places (also with the app closed).
 * Leaving starts the automatic protection; arriving at a frequent place ends it.
 */
class GeofenceReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent) {
    if (!AutoProtection.isEnabled(context)) return
    val event = GeofencingEvent.fromIntent(intent) ?: return
    if (event.hasError()) {
      Log.w(TAG, "Geofence error ${event.errorCode}")
      return
    }
    when (event.geofenceTransition) {
      Geofence.GEOFENCE_TRANSITION_EXIT -> {
        // A trip she started herself already watches over her
        if (TripService.status.running || AutoProtectionService.status.running) return
        val where = event.triggeringLocation
        val start = Intent(context, AutoProtectionService::class.java)
          .setAction(AutoProtectionService.ACTION_START)
          .putExtra(AutoProtectionService.EXTRA_LATITUDE, where?.latitude ?: Double.NaN)
          .putExtra(AutoProtectionService.EXTRA_LONGITUDE, where?.longitude ?: Double.NaN)
        // Geofence transitions may start a location foreground service from the background
        runCatching { context.startForegroundService(start) }
          .onFailure { Log.w(TAG, "Could not start the automatic protection", it) }
      }
      Geofence.GEOFENCE_TRANSITION_ENTER -> {
        if (AutoProtectionService.status.running) {
          context.startService(
            Intent(context, AutoProtectionService::class.java).setAction(AutoProtectionService.ACTION_ARRIVED),
          )
        }
      }
    }
  }

  companion object {
    private const val TAG = "GeofenceReceiver"
  }
}
