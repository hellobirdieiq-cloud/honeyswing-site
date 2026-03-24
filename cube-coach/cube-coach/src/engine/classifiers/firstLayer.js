/**
 * First Layer classifier (Stage 2).
 *
 * First layer = white cross (4 U-edges solved) + 4 U-layer corners
 * (URF, UFL, ULB, UBR — pieces 0-3) in home positions with co = 0.
 */

/**
 * @param {CubeState} state
 * @returns {{ complete: boolean, crossSolved: boolean, cornersSolved: number[], cornersUnsolved: number[], count: number }}
 */
function classifyFirstLayer(state) {
  let crossOk = true;
  for (let i = 0; i < 4; i++) {
    if (state.ep[i] !== i || state.eo[i] !== 0) { crossOk = false; break; }
  }

  const cornersSolved = [];
  const cornersUnsolved = [];
  for (let i = 0; i < 4; i++) {
    if (state.cp[i] === i && state.co[i] === 0) {
      cornersSolved.push(i);
    } else {
      cornersUnsolved.push(i);
    }
  }

  return {
    complete: crossOk && cornersUnsolved.length === 0,
    crossSolved: crossOk,
    cornersSolved,
    cornersUnsolved,
    count: cornersSolved.length,
  };
}

function isFirstLayerSolved(state) {
  for (let i = 0; i < 4; i++) {
    if (state.ep[i] !== i || state.eo[i] !== 0) return false;
    if (state.cp[i] !== i || state.co[i] !== 0) return false;
  }
  return true;
}

module.exports = { classifyFirstLayer, isFirstLayerSolved };
