package expo.modules.shakesensor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Android forgets the geofences after a reboot or an app update: they are registered again. */
class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED ->
        if (AutoProtection.isEnabled(context)) AutoProtection.registerGeofences(context)
    }
  }
}
