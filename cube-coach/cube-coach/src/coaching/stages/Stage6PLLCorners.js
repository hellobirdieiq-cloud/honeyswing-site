/**
 * Stage 6 — Position Corners (PLL corners).
 * Prerequisite: F2L + full OLL. Goal: D-layer corners in correct positions.
 */
const { isF2LSolved } = require('../../engine/classifiers/f2l');
const { isOLLSolved } = require('../../engine/classifiers/oll');
const { classifyPLL } = require('../../engine/classifiers/pll');
const { generatePreservingScramble } = require('./preservingScrambler');

const SCRAMBLE_CONFIG = {
  fixedCorners: [0, 1, 2, 3], freeCorners: [4, 5, 6, 7],
  fixedEdges: [0, 1, 2, 3, 8, 9, 10, 11], freeEdges: [4, 5, 6, 7],
  lockCornerOrient: true,
  lockEdgeOrient: true,
};

function classifyPLLCorners(state) {
  const pll = classifyPLL(state);
  return {
    complete: pll.cornersAllCorrect,
    count: pll.cornersCorrect.length,
    total: 4,
  };
}

const Stage6PLLCorners = {
  id: 'stage6_pll_corners',
  name: 'Position Corners',
  description: 'Move the bottom corners to their correct positions',
  scramble: () => generatePreservingScramble(
    SCRAMBLE_CONFIG,
    (s) => classifyPLL(s).cornersAllCorrect,
  ),
  isComplete: (s) => classifyPLL(s).cornersAllCorrect,
  classify: classifyPLLCorners,
  progressField: 'count',
  progressTotal: 4,
};

module.exports = { Stage6PLLCorners };
