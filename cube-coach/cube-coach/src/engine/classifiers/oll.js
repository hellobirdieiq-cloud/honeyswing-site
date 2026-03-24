/**
 * OLL (Orient Last Layer) classifier (Stages 4-5).
 *
 * OLL = D face is all yellow. In cubie terms: every piece at a D-layer
 * position has its D-sticker facing D.
 *
 * Uses the sticker model for accuracy — this works even if F2L isn't
 * fully solved (e.g. middle-layer edges in D positions).
 */
const { D_FACE } = require('../constants');
const { toStickers } = require('../stickers');

/**
 * Classify OLL state.  Reports which D-face stickers are correct.
 * Sticker indices on D face:
 *   0 1 2
 *   3 4 5   (4 = center, always correct)
 *   6 7 8
 *
 * @returns {{ complete: boolean, correctCount: number, pattern: boolean[] }}
 */
function classifyOLL(state) {
  const stickers = toStickers(state);
  const dFace = stickers[D_FACE];
  const pattern = new Array(9);
  let correctCount = 0;
  for (let i = 0; i < 9; i++) {
    pattern[i] = dFace[i] === D_FACE;
    if (pattern[i]) correctCount++;
  }
  return {
    complete: correctCount === 9,
    correctCount,
    pattern,
  };
}

function isOLLSolved(state) {
  const stickers = toStickers(state);
  const dFace = stickers[D_FACE];
  for (let i = 0; i < 9; i++) {
    if (dFace[i] !== D_FACE) return false;
  }
  return true;
}

module.exports = { classifyOLL, isOLLSolved };
