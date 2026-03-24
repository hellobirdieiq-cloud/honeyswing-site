/**
 * StuckDetector — idle detection with escalating thresholds.
 *
 * Thresholds (layered escalation):
 *   0s  → 'highlight' (fired immediately by CoachScreen, not by StuckDetector)
 *   30s → 'arrow'     (show tappable arrow for the correct move)
 *   60s → 'cue'       (show a text cue)
 *   90s → 'prompt'    (suggest a break or demo)
 *
 * Tick via update(now) each frame. Resets on any move.
 * Pauses automatically when animation is in progress.
 */

const THRESHOLD_ARROW = 30000;
const THRESHOLD_CUE = 60000;
const THRESHOLD_PROMPT = 90000;

class StuckDetector {
  constructor() {
    this._lastMoveTime = null;
    this._paused = false;
    this._firedArrow = false;
    this._firedCue = false;
    this._firedPrompt = false;
    this.onThreshold = null; // (level: 'arrow' | 'cue' | 'prompt') => void
  }

  /** Call when the session starts or a new attempt begins. */
  start(now) {
    this._lastMoveTime = now;
    this._paused = false;
    this._firedArrow = false;
    this._firedCue = false;
    this._firedPrompt = false;
  }

  /** Call when the user makes any move. Resets idle timer. */
  onMove(now) {
    this._lastMoveTime = now;
    this._firedArrow = false;
    this._firedCue = false;
    this._firedPrompt = false;
  }

  /** Pause idle detection (e.g., during move animation). */
  pause() {
    this._paused = true;
  }

  /** Resume idle detection, adjusting the baseline so paused time doesn't count. */
  resume(now) {
    if (this._paused) {
      this._lastMoveTime = now - (this._firedArrow ? THRESHOLD_ARROW :
                                   this._firedCue ? THRESHOLD_CUE : 0);
    }
    this._paused = false;
  }

  /**
   * Call every frame. Checks idle time and fires thresholds.
   * @param {number} now - performance.now()
   */
  update(now) {
    if (this._paused || this._lastMoveTime === null) return;

    const idle = now - this._lastMoveTime;

    if (idle >= THRESHOLD_PROMPT && !this._firedPrompt) {
      this._firedPrompt = true;
      if (this.onThreshold) this.onThreshold('prompt');
    } else if (idle >= THRESHOLD_CUE && !this._firedCue) {
      this._firedCue = true;
      if (this.onThreshold) this.onThreshold('cue');
    } else if (idle >= THRESHOLD_ARROW && !this._firedArrow) {
      this._firedArrow = true;
      if (this.onThreshold) this.onThreshold('arrow');
    }
  }
}

module.exports = { StuckDetector };
