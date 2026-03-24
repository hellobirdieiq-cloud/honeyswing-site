/**
 * Stage 2 — White Corners (first layer corners).
 * Prerequisite: white cross solved. Goal: all 4 U-layer corners in place.
 */
const { isWhiteCrossSolved } = require('../../engine/classifiers/whiteCross');
const { classifyFirstLayer, isFirstLayerSolved } = require('../../engine/classifiers/firstLayer');
const { generatePreservingScramble } = require('./preservingScrambler');

const SCRAMBLE_CONFIG = {
  fixedCorners: [], freeCorners: [0, 1, 2, 3, 4, 5, 6, 7],
  fixedEdges: [0, 1, 2, 3], freeEdges: [4, 5, 6, 7, 8, 9, 10, 11],
};

const Stage2Corners = {
  id: 'stage2_corners',
  name: 'White Corners',
  description: 'Place all four white corner pieces on top',
  scramble: () => generatePreservingScramble(SCRAMBLE_CONFIG, isFirstLayerSolved),
  isComplete: isFirstLayerSolved,
  classify: classifyFirstLayer,
  progressField: 'count',
  progressTotal: 4,
};

module.exports = { Stage2Corners };
