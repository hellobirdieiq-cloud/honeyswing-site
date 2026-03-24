/**
 * Stage 3 — Middle Layer Edges (F2L completion).
 * Prerequisite: first layer solved. Goal: all 4 middle edges in place.
 */
const { isFirstLayerSolved } = require('../../engine/classifiers/firstLayer');
const { classifyF2L, isF2LSolved } = require('../../engine/classifiers/f2l');
const { generatePreservingScramble } = require('./preservingScrambler');

const SCRAMBLE_CONFIG = {
  fixedCorners: [0, 1, 2, 3], freeCorners: [4, 5, 6, 7],
  fixedEdges: [0, 1, 2, 3], freeEdges: [4, 5, 6, 7, 8, 9, 10, 11],
};

const Stage3Middle = {
  id: 'stage3_middle',
  name: 'Middle Layer',
  description: 'Place the four middle-layer edge pieces',
  scramble: () => generatePreservingScramble(SCRAMBLE_CONFIG, isF2LSolved),
  isComplete: isF2LSolved,
  classify: classifyF2L,
  progressField: 'count',
  progressTotal: 4,
};

module.exports = { Stage3Middle };
