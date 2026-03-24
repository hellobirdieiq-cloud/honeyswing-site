/**
 * White Cross classifier (Stage 1).
 *
 * White cross = the 4 U-layer edges (UR, UF, UL, UB — pieces 0-3)
 * are in their home positions with correct orientation (eo = 0).
 */

/**
 * @param {CubeState} state
 * @returns {{ complete: boolean, solved: number[], unsolved: number[], count: number }}
 */
function classifyWhiteCross(state) {
  const solved = [];
  const unsolved = [];
  for (let i = 0; i < 4; i++) {
    if (state.ep[i] === i && state.eo[i] === 0) {
      solved.push(i);
    } else {
      unsolved.push(i);
    }
  }
  return {
    complete: unsolved.length === 0,
    solved,
    unsolved,
    count: solved.length,
  };
}

function isWhiteCrossSolved(state) {
  for (let i = 0; i < 4; i++) {
    if (state.ep[i] !== i || state.eo[i] !== 0) return false;
  }
  return true;
}

module.exports = { classifyWhiteCross, isWhiteCrossSolved };
