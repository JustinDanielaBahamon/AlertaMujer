package expo.modules.shakesensor

import android.content.Context
import android.media.AudioManager
import android.media.VolumeProvider
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.SystemClock
import android.util.Log

/**
 * Quick cancel of the countdown: 4 presses of "volume down" within 2 seconds, also with the screen
 * off. Android does not tell apps about the volume keys, except to an active media session with its
 * own volume: while the countdown runs the app is that session (the keys do not change the phone's
 * volume during those seconds).
 *
 * To not cancel a real alert by accident:
 *  - only separate presses count: a key held down (pocket, struggle) repeats very fast and resets it;
 *  - during a call the keys are the call's volume and do not count.
 */
class VolumeCancelWatcher(private val context: Context, private val onCancel: () -> Unit) {

  private var session: MediaSession? = null
  private val presses = ArrayDeque<Long>()

  fun start() {
    if (session != null) return
    presses.clear()
    try {
      val provider = object : VolumeProvider(VOLUME_CONTROL_RELATIVE, 100, 50) {
        override fun onAdjustVolume(direction: Int) {
          if (direction < 0) onPress(SystemClock.elapsedRealtime())
        }
      }
      session = MediaSession(context, "AlertaMujerCancel").apply {
        setPlaybackToRemote(provider)
        setPlaybackState(PlaybackState.Builder().setState(PlaybackState.STATE_PLAYING, 0, 1f).build())
        isActive = true
      }
    } catch (e: Exception) {
      Log.w(TAG, "Volume cancel not available", e)
      session = null
    }
  }

  fun stop() {
    session?.let {
      it.isActive = false
      it.release()
    }
    session = null
    presses.clear()
  }

  private fun onPress(now: Long) {
    val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    if (audio.mode == AudioManager.MODE_IN_CALL || audio.mode == AudioManager.MODE_IN_COMMUNICATION) return
    val previous = presses.lastOrNull()
    // Faster than a person can press: the key is being held (auto-repeat), not pressed
    if (previous != null && now - previous < MIN_GAP_MS) {
      presses.clear()
      return
    }
    presses.addLast(now)
    while (presses.isNotEmpty() && now - presses.first() > WINDOW_MS) presses.removeFirst()
    if (presses.size >= PRESSES) {
      presses.clear()
      onCancel()
    }
  }

  companion object {
    private const val TAG = "VolumeCancel"
    const val PRESSES = 4
    const val WINDOW_MS = 2000L
    const val MIN_GAP_MS = 90L
  }
}
