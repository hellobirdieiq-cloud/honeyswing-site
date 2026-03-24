/**
 * Stage 7 — Position Edges (PLL edges).
 * Prerequisite: F2L + OLL + PLL corners. Goal: cube solved.
 */
const { isF2LSolved } = require('../../engine/classifiers/f2l');
const { isOLLSolved } = require('../../engine/classifiers/oll');
const { classifyPLL, isPLLSolved } = require('../../engine/classifiers/pll');
const { generatePreservingScramble } = require('./preservingScrambler');

const SCRAMBLE_CONFIG = {
  fixedCorners: [0, 1, 2, 3, 4, 5, 6, 7], freeCorners: [],
  fixedEdges: [0, 1, 2, 3, 8, 9, 10, 11], freeEdges: [4, 5, 6, 7],
  lockCornerOrient: true,
  lockEdgeOrient: true,
};

function classifyPLLEdges(state) {
  const pll = classifyPLL(state);
  return {
    complete: pll.edgesAllCorrect,
    count: pll.edgesCorrect.length,
    total: 4,
  };
}

const Stage7PLLEdges = {
  id: 'stage7_pll_edges',
  name: 'Position Edges',
  description: 'Move the bottom edges to their correct positions — solve complete!',
  scramble: () => generatePreservingScramble(
    SCRAMBLE_CONFIG,
    (s) => classifyPLL(s).complete,
  ),
  isComplete: isPLLSolved,
  classify: classifyPLLEdges,
  progressField: 'count',
  progressTotal: 4,
};

module.exports = { Stage7PLLEdges };
