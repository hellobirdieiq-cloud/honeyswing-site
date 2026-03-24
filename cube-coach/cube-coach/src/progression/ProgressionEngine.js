/**
 * ProgressionEngine — pure logic for stage unlock and regression.
 *
 * From CLAUDE.md Section 9:
 *   Unlock threshold: 80% over last 10 attempts (85% for Phase 3 = stages 4-7)
 *   Regression threshold: <60% over last 5 on a previously-passed stage
 *
 * This module is pure — takes attempt data, returns decisions.
 * No persistence, no side effects.
 */

const UNLOCK_WINDOW = 10;
const UNLOCK_RATE_STANDARD = 0.80;  // stages 1-3
const UNLOCK_RATE_ADVANCED = 0.85;  // stages 4-7

const REGRESSION_WINDOW = 5;
const REGRESSION_RATE = 0.60;

// Stage indices 0-2 = standard (80%), 3-6 = advanced (85%)
function getUnlockRate(stageIdx) {
  return stageIdx <= 2 ? UNLOCK_RATE_STANDARD : UNLOCK_RATE_ADVANCED;
}

/**
 * An attempt record.
 * @typedef {{ success: boolean, timeMs: number, isDemo: boolean }} Attempt
 */

/**
 * Check if a stage should be unlocked based on attempt history.
 *
 * @param {Attempt[]} attempts - all attempts for this stage (oldest first)
 * @param {number} stageIdx - 0-based stage index
 * @returns {{ unlock: boolean, reason: string, rate: number }}
 */
function shouldUnlock(attempts, stageIdx) {
  // Filter out demo attempts — they don't count
  const real = attempts.filter(a => !a.isDemo);

  if (real.length < UNLOCK_WINDOW) {
    return {
      unlock: false,
      reason: `Need ${UNLOCK_WINDOW} attempts (have ${real.length})`,
      rate: real.length > 0 ? real.filter(a => a.success).length / real.length : 0,
    };
  }

  // Check the last UNLOCK_WINDOW attempts
  const recent = real.slice(-UNLOCK_WINDOW);
  const successes = recent.filter(a => a.success).length;
  const rate = successes / UNLOCK_WINDOW;
  const threshold = getUnlockRate(stageIdx);

  if (rate >= threshold) {
    return {
      unlock: true,
      reason: `${(rate * 100).toFixed(0)}% success over last ${UNLOCK_WINDOW} (needed ${(threshold * 100).toFixed(0)}%)`,
      rate,
    };
  }

  return {
    unlock: false,
    reason: `${(rate * 100).toFixed(0)}% success — need ${(threshold * 100).toFixed(0)}% over last ${UNLOCK_WINDOW}`,
    rate,
  };
}

/**
 * Check if a previously-passed stage has regressed.
 *
 * @param {Attempt[]} attempts - all attempts for this stage
 * @returns {{ regressed: boolean, reason: string, rate: number }}
 */
function checkRegression(attempts) {
  const real = attempts.filter(a => !a.isDemo);

  if (real.length < REGRESSION_WINDOW) {
    return { regressed: false, reason: 'Not enough attempts to evaluate', rate: 1 };
  }

  const recent = real.slice(-REGRESSION_WINDOW);
  const successes = recent.filter(a => a.success).length;
  const rate = successes / REGRESSION_WINDOW;

  if (rate < REGRESSION_RATE) {
    return {
      regressed: true,
      reason: `${(rate * 100).toFixed(0)}% success over last ${REGRESSION_WINDOW} (below ${(REGRESSION_RATE * 100).toFixed(0)}% threshold)`,
      rate,
    };
  }

  return { regressed: false, reason: 'Performance OK', rate };
}

/**
 * Determine which stage the user should be on, given all attempt data.
 *
 * @param {Attempt[][]} allAttempts - attempts[stageIdx] = array of attempts
 * @param {number} highestUnlocked - highest stage index that's been unlocked (0-based)
 * @returns {{ currentStage: number, highestUnlocked: number, regressionStage: number | null }}
 */
function evaluateProgression(allAttempts, highestUnlocked) {
  let newHighest = highestUnlocked;

  // Check if current highest stage should unlock the next
  if (highestUnlocked < 6) { // 6 = last stage index
    const current = allAttempts[highestUnlocked] || [];
    const result = shouldUnlock(current, highestUnlocked);
    if (result.unlock) {
      newHighest = highestUnlocked + 1;
    }
  }

  // Check for regression on any previously passed stage
  let regressionStage = null;
  for (let i = 0; i < highestUnlocked; i++) {
    const attempts = allAttempts[i] || [];
    const result = checkRegression(attempts);
    if (result.regressed) {
      regressionStage = i;
      break; // regress to earliest failing stage
    }
  }

  return {
    currentStage: regressionStage !== null ? regressionStage : Math.min(newHighest, 6),
    highestUnlocked: newHighest,
    regressionStage,
  };
}

module.exports = {
  shouldUnlock,
  checkRegression,
  evaluateProgression,
  UNLOCK_WINDOW,
  UNLOCK_RATE_STANDARD,
  UNLOCK_RATE_ADVANCED,
  REGRESSION_WINDOW,
  REGRESSION_RATE,
};
