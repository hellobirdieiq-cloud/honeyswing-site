/**
 * MoveValidator — generic hybrid validation for any coaching stage.
 *
 * Always accepts moves (beginners need setup moves). Flags the reason
 * so the UI can show soft visual feedback.
 */
const { applyMove } = require('../engine/moves');

/**
 * Validate a move for any stage.
 *
 * @param {CubeState} currentState
 * @param {string} moveName
 * @param {function(CubeState): object} classify - stage classifier returning { count, complete }
 * @returns {{ valid: boolean, reason: string, newState: CubeState, progress: number }}
 */
function validateMove(currentState, moveName, classify) {
  const before = classify(currentState);
  const newState = applyMove(currentState, moveName);
  const after = classify(newState);

  const beforeCount = before.count !== undefined ? before.count : 0;
  const afterCount = after.count !== undefined ? after.count : 0;
  const progress = afterCount - beforeCount;

  let reason;
  if (progress > 0) {
    reason = 'progress';
  } else if (progress < 0) {
    reason = 'breaks_solved';
  } else {
    reason = 'neutral';
  }

  return { valid: true, reason, newState, progress };
}

module.exports = { validateMove };
