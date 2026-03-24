/**
 * Stage 5 — Yellow Face (OLL corners).
 * Prerequisite: F2L + yellow cross. Goal: D face all yellow.
 */
const { isF2LSolved } = require('../../engine/classifiers/f2l');
const { classifyOLL, isOLLSolved } = require('../../engine/classifiers/oll');
const { generatePreservingScramble } = require('./preservingScrambler');
const { toStickers } = require('../../engine/stickers');
const { D_FACE } = require('../../engine/constants');

const SCRAMBLE_CONFIG = {
  fixedCorners: [0, 1, 2, 3], freeCorners: [4, 5, 6, 7],
  fixedEdges: [0, 1, 2, 3, 8, 9, 10, 11], freeEdges: [4, 5, 6, 7],
  lockEdgeOrient: true, // keep yellow cross intact
};

function hasYellowCross(state) {
  const stickers = toStickers(state);
  const d = stickers[D_FACE];
  return d[1] === D_FACE && d[3] === D_FACE && d[5] === D_FACE && d[7] === D_FACE;
}

function classifyOLLCorners(state) {
  const stickers = toStickers(state);
  const d = stickers[D_FACE];
  const cornerPositions = [0, 2, 6, 8];
  let count = 0;
  for (const p of cornerPositions) {
    if (d[p] === D_FACE) count++;
  }
  // +4 for the cross edges already done
  return { complete: count === 4, count, total: 4 };
}

const Stage5OLLCorners = {
  id: 'stage5_oll_corners',
  name: 'Yellow Face',
  description: 'Orient the bottom corners to complete the yellow face',
  scramble: () => generatePreservingScramble(
    SCRAMBLE_CONFIG,
    isOLLSolved,
  ),
  isComplete: isOLLSolved,
  classify: classifyOLLCorners,
  progressField: 'count',
  progressTotal: 4,
};

module.exports = { Stage5OLLCorners };
