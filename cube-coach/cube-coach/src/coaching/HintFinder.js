/**
 * HintFinder — finds the next move toward the stage goal.
 *
 * Uses short IDDFS to find a move that increases the solved count
 * for the current stage. Returns the move name + the target piece
 * grid position for highlighting.
 */
const { applyMove } = require('../engine/moves');

const ALL_MOVES = [
  'U', "U'", 'U2', 'D', "D'", 'D2',
  'R', "R'", 'R2', 'L', "L'", 'L2',
  'F', "F'", 'F2', 'B', "B'", 'B2',
];

/**
 * Find the best next move for the given stage.
 * First tries all 18 single moves. If none makes progress,
 * searches 2-move sequences and returns the first move of the best pair.
 *
 * @param {CubeState} state
 * @param {function(CubeState): {count: number}} classify
 * @returns {{ move: string } | null}
 */
function findNextMove(state, classify) {
  const before = classify(state);
  const baseCount = before.count || 0;

  // Depth 1: try all 18 moves
  let bestMove = null;
  let bestProgress = 0;

  for (const m of ALL_MOVES) {
    const after = classify(applyMove(state, m));
    const progress = (after.count || 0) - baseCount;
    if (progress > bestProgress) {
      bestProgress = progress;
      bestMove = m;
    }
  }

  if (bestMove) return { move: bestMove };

  // Depth 2: try all 18×18 pairs, return first move of best pair
  for (const m1 of ALL_MOVES) {
    const s1 = applyMove(state, m1);
    for (const m2 of ALL_MOVES) {
      if (m2[0] === m1[0]) continue; // skip same-face
      const after = classify(applyMove(s1, m2));
      const progress = (after.count || 0) - baseCount;
      if (progress > bestProgress) {
        bestProgress = progress;
        bestMove = m1;
      }
    }
  }

  return bestMove ? { move: bestMove } : null;
}

module.exports = { findNextMove };
