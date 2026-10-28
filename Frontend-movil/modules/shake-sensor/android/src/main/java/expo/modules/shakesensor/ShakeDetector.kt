package expo.modules.shakesensor

import kotlin.math.sqrt

/**
 * Detects motion activation (4 or more quick strong chops) on the native side, so the accelerometer
 * readings never cross to JavaScript: only a detection does. Sending every reading (25+ per second, all
 * day, also in the background) kept the main and JS threads busy and made the phone slow.
 *
 * Same algorithm and values as src/features/shake/shakeDetector.ts, which keeps the tests with readings
 * recorded on a real phone. Readings are in g, including gravity (at rest ~1 g).
 */
class ShakeDetector(
  private val thresholdG: Double = 4.5,
  private val restG: Double = 2.0,
  private val minRestMs: Long = 200,
  private val requiredHits: Int = 4,
  private val windowMs: Long = 8000,
  private val minGapMs: Long = 200,
  private val maxGapMs: Long = 1000,
  private val calmBeforeMs: Long = 400,
  private val calmAfterMs: Long = 600,
  private val pauseMs: Long = 8000,
) {
  private var previousG = 0.0
  private var previousT = 0L
  private var hasPrevious = false
  private var thirdToLast = 0.0
  private var lastPeak = Long.MIN_VALUE / 2
  private val peaks = ArrayList<Long>()
  private var stillSince: Long? = null
  private var pausedUntil = 0L

  private fun registerPeak(t: Long) {
    if (t - lastPeak < minGapMs) return // rebound of the same chop
    val hadCalm = t - lastPeak >= calmBeforeMs
    val continues = peaks.isNotEmpty() && t - lastPeak <= maxGapMs && t - peaks[0] <= windowMs
    if (continues) {
      peaks.add(t)
    } else {
      peaks.clear()
      if (hadCalm) peaks.add(t) // without calm before it is continuous activity (e.g. running)
    }
    lastPeak = t
  }

  companion object {
    /** The chop strength that counts on phones whose sensor measures 8 g or more. */
    private const val FULL_THRESHOLD_G = 4.5
    private const val FULL_REST_G = 2.0

    /**
     * Budget phones have accelerometers limited to ±2 g or ±4 g per axis (e.g. TCL T610E, SC7A20 chip):
     * a strong chop gets stuck at that limit and never reaches 4.5 g, so shaking could not activate the
     * alert there. The threshold follows the real range of the sensor (a bit above one saturated axis,
     * because the chop also moves the other axes). The other rules against false alarms stay: 4 chops,
     * calm before, stillness after.
     */
    fun forRange(rangeG: Float): ShakeDetector {
      if (!rangeG.isFinite() || rangeG <= 0f || rangeG >= 5f) return ShakeDetector()
      val threshold = minOf(FULL_THRESHOLD_G, maxOf(1.8, rangeG * 1.1))
      val rest = minOf(FULL_REST_G, threshold * 0.65)
      return ShakeDetector(thresholdG = threshold, restG = rest)
    }
  }

  /** Returns true when a full sequence of chops just ended. */
  fun add(x: Double, y: Double, z: Double, t: Long): Boolean {
    val strength = sqrt(x * x + y * y + z * z)
    if (t < pausedUntil) {
      hasPrevious = false
      return false
    }
    // Was the previous reading a strong local maximum?
    if (hasPrevious && previousG >= thresholdG && previousG >= thirdToLast && previousG > strength) {
      registerPeak(previousT)
    }
    thirdToLast = if (hasPrevious) previousG else strength
    previousG = strength
    previousT = t
    hasPrevious = true

    stillSince = if (strength < restG) (stillSince ?: t) else null
    val since = stillSince
    val still = since != null && t - since >= minRestMs
    if (peaks.size >= requiredHits && t - lastPeak >= calmAfterMs && still) {
      peaks.clear()
      pausedUntil = t + pauseMs
      return true
    }
    // Too much time passed without completing the sequence: discarded
    if (peaks.isNotEmpty() && t - lastPeak > maxGapMs && peaks.size < requiredHits) peaks.clear()
    return false
  }
}
