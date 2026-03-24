/**
 * F2L (First Two Layers) classifier (Stage 3).
 *
 * F2L = first layer complete + 4 middle-layer edges
 * (FR, FL, BL, BR — pieces 8-11) in home positions with eo = 0.
 */

/**
 * @param {CubeState} state
 * @returns {{ complete: boolean, firstLayerSolved: boolean, edgesSolved: number[], edgesUnsolved: number[], count: number }}
 */
function classifyF2L(state) {
  let firstLayerOk = true;
  for (let i = 0; i < 4; i++) {
    if (state.ep[i] !== i || state.eo[i] !== 0 ||
        state.cp[i] !== i || state.co[i] !== 0) {
      firstLayerOk = false;
      break;
    }
  }

  const edgesSolved = [];
  const edgesUnsolved = [];
  for (let i = 8; i < 12; i++) {
    if (state.ep[i] === i && state.eo[i] === 0) {
      edgesSolved.push(i);
    } else {
      edgesUnsolved.push(i);
    }
  }

  return {
    complete: firstLayerOk && edgesUnsolved.length === 0,
    firstLayerSolved: firstLayerOk,
    edgesSolved,
    edgesUnsolved,
    count: edgesSolved.length,
  };
}

function isF2LSolved(state) {
  for (let i = 0; i < 4; i++) {
    if (state.ep[i] !== i || state.eo[i] !== 0) return false;
    if (state.cp[i] !== i || state.co[i] !== 0) return false;
  }
  for (let i = 8; i < 12; i++) {
    if (state.ep[i] !== i || state.eo[i] !== 0) return false;
  }
  return true;
}

module.exports = { classifyF2L, isF2LSolved };
