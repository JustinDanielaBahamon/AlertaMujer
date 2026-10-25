package expo.modules.shakesensor

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.AudioManager
import android.media.VolumeProvider
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import android.view.KeyEvent
import android.view.Window

/**
 * Quick cancel of the countdown: 4 presses of "volume down" within 2 seconds. Android does not tell
 * apps about the volume keys, so three ways are used, whichever the phone allows:
 *  1. App on screen: the key is caught in the app's window (any phone; the volume does not change).
 *  2. App in the background: a media session with its own volume. Some phones (Infinix/XOS) hand it
 *     the keys; Samsung (Android 12+) keeps them for cast sessions only.
 *  3. Fallback: the system's volume change broadcast (does not work if the volume is already at 0).
 *
 * To not cancel a real alert by accident:
 *  - a key held down (pocket, struggle) repeats very fast: only the first event of a fast series counts;
 *  - during a call the keys are the call's volume and do not count.
 */
class VolumeCancelWatcher(private val context: Context, private val onCancel: () -> Unit) {

  private var session: MediaSession? = null
  private var receiver: BroadcastReceiver? = null
  private var window: Window? = null
  private var originalCallback: Window.Callback? = null
  private var windowCallback: Window.Callback? = null
  private val presses = ArrayDeque<Long>()
  private var lastEvent = 0L

  fun start(activity: Activity?) {
    if (session != null) return
    presses.clear()
    lastEvent = 0L
    attachWindow(activity)
    startSession()
    startReceiver()
  }

  fun stop() {
    detachWindow()
    session?.let {
      it.isActive = false
      it.release()
    }
    session = null
    receiver?.let { runCatching { context.unregisterReceiver(it) } }
    receiver = null
    presses.clear()
  }

  // 1. App on screen: its window sees the key before the system changes the volume
  private fun attachWindow(activity: Activity?) {
    val win = activity?.window ?: return
    val original = win.callback ?: return
    val wrapper = object : Window.Callback by original {
      override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.keyCode != KeyEvent.KEYCODE_VOLUME_DOWN) return original.dispatchKeyEvent(event)
        if (event.action == KeyEvent.ACTION_DOWN) {
          onPress(SystemClock.elapsedRealtime(), held = event.repeatCount > 0)
        }
        return true
      }
    }
    win.callback = wrapper
    window = win
    originalCallback = original
    windowCallback = wrapper
  }

  private fun detachWindow() {
    val win = window
    // Only restored if nobody replaced it after us
    if (win != null && win.callback === windowCallback) win.callback = originalCallback
    window = null
    originalCallback = null
    windowCallback = null
  }

  // 2. App in the background: a media session with remote volume receives the keys on some phones
  private fun startSession() {
    try {
      val provider = object : VolumeProvider(VOLUME_CONTROL_RELATIVE, 100, 50) {
        override fun onAdjustVolume(direction: Int) {
          if (direction < 0) onPress(SystemClock.elapsedRealtime())
        }
      }
      session = MediaSession(context, "AlertaMujerCancel").apply {
        // Without a callback the session drops the volume adjustments: the provider never hears them
        setCallback(object : MediaSession.Callback() {}, Handler(Looper.getMainLooper()))
        setPlaybackToRemote(provider)
        setPlaybackState(PlaybackState.Builder().setState(PlaybackState.STATE_PLAYING, 0, 1f).build())
        isActive = true
      }
    } catch (e: Exception) {
      Log.w(TAG, "Media session not available", e)
      session = null
    }
  }

  // 3. Fallback: the system lowered a volume because of the key
  private fun startReceiver() {
    val r = object : BroadcastReceiver() {
      override fun onReceive(c: Context, intent: Intent) {
        val now = intent.getIntExtra(EXTRA_VOLUME, -1)
        val before = intent.getIntExtra(EXTRA_PREV_VOLUME, -1)
        if (now >= 0 && before >= 0 && now < before) onPress(SystemClock.elapsedRealtime())
      }
    }
    try {
      val filter = IntentFilter(VOLUME_CHANGED)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        context.registerReceiver(r, filter, Context.RECEIVER_EXPORTED)
      } else {
        context.registerReceiver(r, filter)
      }
      receiver = r
    } catch (e: Exception) {
      Log.w(TAG, "Volume broadcast not available", e)
    }
  }

  private fun onPress(now: Long, held: Boolean = false) {
    val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    if (audio.mode == AudioManager.MODE_IN_CALL || audio.mode == AudioManager.MODE_IN_COMMUNICATION) return
    // A held key, or the same press reported twice (several streams change together): only the
    // first event of a fast series counts, and the series keeps going while events keep coming
    val fast = now - lastEvent < MIN_GAP_MS
    lastEvent = now
    if (held || fast) return
    Log.d(TAG, "volume down")
    presses.addLast(now)
    while (presses.isNotEmpty() && now - presses.first() > WINDOW_MS) presses.removeFirst()
    if (presses.size >= PRESSES) {
      presses.clear()
      Log.i(TAG, "cancel")
      onCancel()
    }
  }

  companion object {
    private const val TAG = "VolumeCancel"
    const val PRESSES = 4
    const val WINDOW_MS = 2000L
    const val MIN_GAP_MS = 150L
    private const val VOLUME_CHANGED = "android.media.VOLUME_CHANGED_ACTION"
    private const val EXTRA_VOLUME = "android.media.EXTRA_VOLUME_STREAM_VALUE"
    private const val EXTRA_PREV_VOLUME = "android.media.EXTRA_PREV_VOLUME_STREAM_VALUE"
  }
}
