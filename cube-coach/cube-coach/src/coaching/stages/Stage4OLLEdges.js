/**
 * Stage 4 — Yellow Cross (OLL edges).
 * Prerequisite: F2L solved. Goal: D-face edges all yellow (oriented).
 */
const { isF2LSolved } = require('../../engine/classifiers/f2l');
const { classifyOLL, isOLLSolved } = require('../../engine/classifiers/oll');
const { generatePreservingScramble } = require('./preservingScrambler');
const { toStickers } = require('../../engine/stickers');
const { D_FACE } = require('../../engine/constants');

const SCRAMBLE_CONFIG = {
  fixedCorners: [0, 1, 2, 3], freeCorners: [4, 5, 6, 7],
  fixedEdges: [0, 1, 2, 3, 8, 9, 10, 11], freeEdges: [4, 5, 6, 7],
};

function isYellowCross(state) {
  const stickers = toStickers(state);
  const d = stickers[D_FACE];
  // Edge sticker positions on D face: 1, 3, 5, 7
  return d[1] === D_FACE && d[3] === D_FACE && d[5] === D_FACE && d[7] === D_FACE;
}

function classifyYellowCross(state) {
  const stickers = toStickers(state);
  const d = stickers[D_FACE];
  const edgePositions = [1, 3, 5, 7];
  let count = 0;
  for (const p of edgePositions) {
    if (d[p] === D_FACE) count++;
  }
  return { complete: count === 4, count, total: 4 };
}

const Stage4OLLEdges = {
  id: 'stage4_oll_edges',
  name: 'Yellow Cross',
  description: 'Orient the bottom edges to make a yellow cross',
  scramble: () => generatePreservingScramble(SCRAMBLE_CONFIG, isYellowCross),
  isComplete: isYellowCross,
  classify: classifyYellowCross,
  progressField: 'count',
  progressTotal: 4,
};

module.exports = { Stage4OLLEdges };
