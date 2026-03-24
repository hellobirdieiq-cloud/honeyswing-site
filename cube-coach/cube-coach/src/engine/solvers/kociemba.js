/**
 * Kociemba solver wrapper using cubejs.
 *
 * Converts our CubeState to cubejs format, solves, and returns moves
 * in our notation.
 */
const Cube = require('cubejs');
const { toCubeJsString } = require('../stickers');
const { applyMoves } = require('../moves');

let solverInitialized = false;

/**
 * Initialize the Kociemba solver (computes move/pruning tables).
 * Call once before solving. Takes a few seconds on first call.
 */
function initSolver() {
  if (!solverInitialized) {
    Cube.initSolver();
    solverInitialized = true;
  }
}

/**
 * Convert cubejs solution string to our move notation.
 * cubejs uses: "R L' U2 D' F B2" etc. — same notation we use.
 */
function parseSolution(solutionStr) {
  if (!solutionStr || solutionStr.trim() === '') return [];
  return solutionStr.trim().split(/\s+/);
}

/**
 * Solve a CubeState using the Kociemba two-phase algorithm.
 * @param {CubeState} state
 * @returns {{ solved: boolean, moves: string[], moveCount: number }}
 */
function kociembaSolve(state) {
  if (!solverInitialized) {
    initSolver();
  }

  const faceString = toCubeJsString(state);
  const cube = Cube.fromString(faceString);
  const solutionStr = cube.solve();
  const moves = parseSolution(solutionStr);

  // Verify the solution actually works
  const result = applyMoves(state, moves);
  const solved = result.isSolved();

  return {
    solved,
    moves,
    moveCount: moves.length,
  };
}

module.exports = { kociembaSolve, initSolver };
