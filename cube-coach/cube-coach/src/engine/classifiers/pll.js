/**
 * PLL (Permute Last Layer) classifier (Stages 6-7).
 *
 * PLL = OLL complete + all D-layer pieces in correct positions.
 * In cubie terms: D-layer corners (positions 4-7) and D-layer edges
 * (positions 4-7) are all in their home positions.
 *
 * Also detects sub-states: edges-only wrong, corners-only wrong, or both.
 */

function classifyPLL(state) {
  // Check D-layer corners (positions 4-7)
  const cornersCorrect = [];
  const cornersWrong = [];
  for (let i = 4; i < 8; i++) {
    if (state.cp[i] === i && state.co[i] === 0) {
      cornersCorrect.push(i);
    } else {
      cornersWrong.push(i);
    }
  }

  // Check D-layer edges (positions 4-7)
  const edgesCorrect = [];
  const edgesWrong = [];
  for (let i = 4; i < 8; i++) {
    if (state.ep[i] === i && state.eo[i] === 0) {
      edgesCorrect.push(i);
    } else {
      edgesWrong.push(i);
    }
  }

  const cornersAllCorrect = cornersWrong.length === 0;
  const edgesAllCorrect = edgesWrong.length === 0;

  return {
    complete: cornersAllCorrect && edgesAllCorrect,
    cornersCorrect,
    cornersWrong,
    edgesCorrect,
    edgesWrong,
    cornersAllCorrect,
    edgesAllCorrect,
  };
}

function isPLLSolved(state) {
  for (let i = 4; i < 8; i++) {
    if (state.cp[i] !== i || state.co[i] !== 0) return false;
    if (state.ep[i] !== i || state.eo[i] !== 0) return false;
  }
  return true;
}

module.exports = { classifyPLL, isPLLSolved };
