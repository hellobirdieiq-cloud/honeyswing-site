/**
 * DemoPlayer — after 5 consecutive failures, plays an animated demo
 * of the solution using the beginner solver, then resets for retry.
 *
 * From CLAUDE.md:
 *   - Consecutive failure demo trigger: 5 failures
 *   - Demo completions do NOT count as successful attempts
 *   - Store pre-demo state, reset to it after demo
 */
const { beginnerSolve } = require('../engine/solvers/beginnerSolver');

const CONSECUTIVE_FAILURES_TRIGGER = 5;
const DEMO_MOVE_INTERVAL_MS = 400; // time between demo moves

class DemoPlayer {
  constructor() {
    this.consecutiveFailures = 0;
    this._demoActive = false;
    this._preDemoState = null;
    this._demoMoves = [];
    this._demoIdx = 0;
    this._timer = null;
    this.onDemoStart = null;  // () => void
    this.onDemoMove = null;   // (moveName: string) => void
    this.onDemoEnd = null;    // (preDemoState: CubeState) => void
  }

  /** Record a successful attempt. Resets failure counter. */
  recordSuccess() {
    this.consecutiveFailures = 0;
  }

  /**
   * Record a failed attempt. Returns true if demo should trigger.
   * @returns {boolean}
   */
  recordFailure() {
    this.consecutiveFailures++;
    return this.consecutiveFailures >= CONSECUTIVE_FAILURES_TRIGGER;
  }

  /** @returns {boolean} */
  get shouldTriggerDemo() {
    return this.consecutiveFailures >= CONSECUTIVE_FAILURES_TRIGGER;
  }

  /** @returns {boolean} */
  get isPlaying() {
    return this._demoActive;
  }

  /**
   * Start a demo for the given scrambled state.
   * Solves the cube and plays moves one at a time via onDemoMove callback.
   *
   * @param {CubeState} scrambledState - the state to solve from
   */
  startDemo(scrambledState) {
    if (this._demoActive) return;

    this._preDemoState = scrambledState.clone();
    this._demoActive = true;
    this._demoIdx = 0;

    // Solve the scramble
    const result = beginnerSolve(scrambledState);
    this._demoMoves = result.solved ? result.moves : [];

    if (this._demoMoves.length === 0) {
      this._endDemo();
      return;
    }

    if (this.onDemoStart) this.onDemoStart();

    // Play moves with interval
    this._playNext();
  }

  /** Stop demo early. */
  stop() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (this._demoActive) {
      this._endDemo();
    }
  }

  _playNext() {
    if (this._demoIdx >= this._demoMoves.length) {
      // Demo complete — wait a beat then reset
      this._timer = setTimeout(() => this._endDemo(), 800);
      return;
    }

    const move = this._demoMoves[this._demoIdx];
    this._demoIdx++;

    if (this.onDemoMove) this.onDemoMove(move);

    this._timer = setTimeout(() => this._playNext(), DEMO_MOVE_INTERVAL_MS);
  }

  _endDemo() {
    this._demoActive = false;
    this.consecutiveFailures = 0;

    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    if (this.onDemoEnd) {
      this.onDemoEnd(this._preDemoState);
    }

    this._preDemoState = null;
    this._demoMoves = [];
    this._demoIdx = 0;
  }
}

module.exports = { DemoPlayer, CONSECUTIVE_FAILURES_TRIGGER };
