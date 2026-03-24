/**
 * Beginner stage-by-stage solver.
 *
 * Uses IDDFS for stages 1-3, then Kociemba for the last layer.
 * This hybrid approach guarantees correctness while keeping solutions
 * human-readable for the first two layers.
 *
 * 200-move hard cap. Pure JS, no UI dependencies.
 */
const { CubeState } = require('../CubeState');
const { applyMove, applyMoves, invertMoveName } = require('../moves');

const MOVE_CAP = 200;
const ALL_FACES = ['U', 'D', 'R', 'L', 'F', 'B'];
const SUFFIXES = ['', "'", '2'];

// ---------------------------------------------------------------------------
// IDDFS engine
// ---------------------------------------------------------------------------

function iddfs(state, check, faces, maxDepth) {
  if (check(state)) return [];
  for (let d = 1; d <= maxDepth; d++) {
    const r = dfs(state, 0, d, '', check, faces);
    if (r) return r;
  }
  return null;
}

function dfs(state, depth, maxDepth, lastFace, check, faces) {
  if (depth === maxDepth) return check(state) ? [] : null;
  for (const f of faces) {
    if (f === lastFace) continue;
    for (const suf of SUFFIXES) {
      const m = f + suf;
      const ns = applyMove(state, m);
      const r = dfs(ns, depth + 1, maxDepth, f, check, faces);
      if (r !== null) { r.unshift(m); return r; }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function apply(state, moves, solution) {
  if (typeof moves === 'string') moves = moves.trim().split(/\s+/);
  for (const m of moves) { state = applyMove(state, m); solution.push(m); }
  return state;
}

function firstLayerOk(s) {
  for (let i = 0; i < 4; i++) {
    if (s.ep[i] !== i || s.eo[i] !== 0 || s.cp[i] !== i || s.co[i] !== 0) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Stage 1: White Cross — IDDFS (depth 7)
// ---------------------------------------------------------------------------

function solveWhiteCross(state, solution) {
  for (let piece = 0; piece < 4; piece++) {
    if (state.ep[piece] === piece && state.eo[piece] === 0) continue;
    const check = (s) => {
      for (let i = 0; i <= piece; i++) {
        if (s.ep[i] !== i || s.eo[i] !== 0) return false;
      }
      return true;
    };
    const moves = iddfs(state, check, ALL_FACES, 7);
    if (moves) state = apply(state, moves, solution);
  }
  return state;
}

// ---------------------------------------------------------------------------
// Stage 2: First Layer Corners — IDDFS (depth 8)
// ---------------------------------------------------------------------------

function solveFirstLayerCorners(state, solution) {
  for (let piece = 0; piece < 4; piece++) {
    if (state.cp[piece] === piece && state.co[piece] === 0) continue;
    const check = (s) => {
      for (let i = 0; i < 4; i++) {
        if (s.ep[i] !== i || s.eo[i] !== 0) return false;
      }
      for (let i = 0; i <= piece; i++) {
        if (s.cp[i] !== i || s.co[i] !== 0) return false;
      }
      return true;
    };
    const moves = iddfs(state, check, ALL_FACES, 8);
    if (moves) state = apply(state, moves, solution);
  }
  return state;
}

// ---------------------------------------------------------------------------
// Stage 3: Middle Layer Edges — IDDFS with restricted faces
// ---------------------------------------------------------------------------

const SLOT_FACES = {
  8:  ['D', 'R', 'F'],
  9:  ['D', 'F', 'L'],
  10: ['D', 'B', 'L'],
  11: ['D', 'B', 'R'],
};

function solveMiddleEdges(state, solution) {
  const solvedMiddle = [];

  for (const piece of [8, 9, 10, 11]) {
    if (state.ep[piece] === piece && state.eo[piece] === 0) {
      solvedMiddle.push(piece);
      continue;
    }

    const check = (s) => {
      if (!firstLayerOk(s)) return false;
      for (const p of solvedMiddle) {
        if (s.ep[p] !== p || s.eo[p] !== 0) return false;
      }
      return s.ep[piece] === piece && s.eo[piece] === 0;
    };

    const pos = state.ep.indexOf(piece);

    // If stuck in wrong middle slot, extract first
    if (pos >= 8 && pos <= 11 && pos !== piece) {
      const extractCheck = (s) => {
        if (!firstLayerOk(s)) return false;
        for (const p of solvedMiddle) {
          if (s.ep[p] !== p || s.eo[p] !== 0) return false;
        }
        const np = s.ep.indexOf(piece);
        return np >= 4 && np <= 7;
      };
      const extractMoves = iddfs(state, extractCheck, SLOT_FACES[pos], 8);
      if (extractMoves) state = apply(state, extractMoves, solution);
    }

    // Insert from D layer
    const insertMoves = iddfs(state, check, SLOT_FACES[piece], 10);
    if (insertMoves) {
      state = apply(state, insertMoves, solution);
      solvedMiddle.push(piece);
    } else {
      // Fallback: all faces
      const fallback = iddfs(state, check, ALL_FACES, 10);
      if (fallback) {
        state = apply(state, fallback, solution);
        solvedMiddle.push(piece);
      }
    }
  }
  return state;
}

// ---------------------------------------------------------------------------
// Stage 4: Last Layer — use Kociemba for reliability
// ---------------------------------------------------------------------------
// After F2L, only D-layer pieces remain. Use the Kociemba solver
// to finish optimally.

function solveLastLayer(state, solution) {
  if (state.isSolved()) return state;

  const { kociembaSolve, initSolver } = require('./kociemba');
  try {
    initSolver();
    const result = kociembaSolve(state);
    if (result.solved) {
      state = apply(state, result.moves, solution);
    }
  } catch (e) {
    // Kociemba failed — try IDDFS on D-layer moves as fallback
    const llFaces = ['D', 'R', 'L', 'F', 'B'];
    const check = (s) => s.isSolved();
    for (let d = 1; d <= 20; d++) {
      const r = dfs(state, 0, d, '', check, llFaces);
      if (r) { state = apply(state, r, solution); break; }
    }
  }
  return state;
}

// ---------------------------------------------------------------------------
// Main Solver
// ---------------------------------------------------------------------------

function beginnerSolve(state) {
  const solution = [];
  let s = state.clone();

  s = solveWhiteCross(s, solution);
  if (solution.length > MOVE_CAP) return { solved: false, moves: solution, state: s };

  s = solveFirstLayerCorners(s, solution);
  if (solution.length > MOVE_CAP) return { solved: false, moves: solution, state: s };

  s = solveMiddleEdges(s, solution);
  if (solution.length > MOVE_CAP) return { solved: false, moves: solution, state: s };

  s = solveLastLayer(s, solution);

  return { solved: s.isSolved(), moves: solution, state: s };
}

module.exports = { beginnerSolve };
