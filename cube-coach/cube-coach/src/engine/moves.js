/**
 * Move system — 6 base moves defined as permutation cycles + orientation deltas.
 * Inverse derived by reversing cycle and negating deltas.
 * Double derived by applying the base twice.
 *
 * Cycle convention: for cycle [a, b, c, d], the piece at position b moves to
 * position a, c->b, d->c, a->d.  Formally: new[cycle[i]] = old[cycle[(i+1) % n]].
 *
 * Orientation deltas are added (mod 3 for corners, mod 2 for edges) to the
 * piece arriving at each cycle position.
 */
const {
  URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB,
  UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR,
} = require('./constants');
const { CubeState } = require('./CubeState');

// -- Base move definitions ------------------------------------------------
// U and D: no orientation change.
// R and L: corner orientation only.
// F and B: both corner and edge orientation.

const BASE_MOVES = {
  U: {
    corners: { cycle: [URF, UFL, ULB, UBR], orient: [0, 0, 0, 0] },
    edges:   { cycle: [UR, UF, UL, UB],     orient: [0, 0, 0, 0] },
  },
  D: {
    corners: { cycle: [DFR, DRB, DBL, DLF], orient: [0, 0, 0, 0] },
    edges:   { cycle: [DF, DR, DB, DL],     orient: [0, 0, 0, 0] },
  },
  R: {
    corners: { cycle: [URF, UBR, DRB, DFR], orient: [1, 2, 1, 2] },
    edges:   { cycle: [UR, BR, DR, FR],     orient: [0, 0, 0, 0] },
  },
  L: {
    corners: { cycle: [UFL, DLF, DBL, ULB], orient: [2, 1, 2, 1] },
    edges:   { cycle: [UL, FL, DL, BL],     orient: [0, 0, 0, 0] },
  },
  F: {
    corners: { cycle: [URF, DFR, DLF, UFL], orient: [2, 1, 2, 1] },
    edges:   { cycle: [UF, FR, DF, FL],     orient: [1, 1, 1, 1] },
  },
  B: {
    corners: { cycle: [UBR, ULB, DBL, DRB], orient: [1, 2, 1, 2] },
    edges:   { cycle: [UB, BL, DB, BR],     orient: [1, 1, 1, 1] },
  },
};

// -- Cycle application (mutates state) ------------------------------------

function applyCycle(perm, orient, cycle, deltas, mod) {
  const n = cycle.length;
  // Save the value that will be overwritten first
  const savedPerm = perm[cycle[0]];
  const savedOrient = orient[cycle[0]];

  for (let i = 0; i < n - 1; i++) {
    perm[cycle[i]]   = perm[cycle[i + 1]];
    orient[cycle[i]] = (orient[cycle[i + 1]] + deltas[i]) % mod;
  }
  perm[cycle[n - 1]]   = savedPerm;
  orient[cycle[n - 1]] = (savedOrient + deltas[n - 1]) % mod;
}

function applyMoveDef(state, def) {
  applyCycle(state.cp, state.co, def.corners.cycle, def.corners.orient, 3);
  applyCycle(state.ep, state.eo, def.edges.cycle, def.edges.orient, 2);
}

// -- Inverse derivation ---------------------------------------------------
// Reverse the cycle. For orientation deltas [o0, o1, ..., oN-1] the inverse
// deltas are: inv[i] = -o[N-2-i] (mod m) for i < N-1, inv[N-1] = -o[N-1].

function invertPart(part, mod) {
  const n = part.cycle.length;
  const revCycle = part.cycle.slice().reverse();
  const revOrient = new Array(n);
  for (let i = 0; i < n - 1; i++) {
    revOrient[i] = (mod - part.orient[n - 2 - i]) % mod;
  }
  revOrient[n - 1] = (mod - part.orient[n - 1]) % mod;
  return { cycle: revCycle, orient: revOrient };
}

function invertMoveDef(def) {
  return {
    corners: invertPart(def.corners, 3),
    edges:   invertPart(def.edges, 2),
  };
}

// -- Build all 18 move definitions ----------------------------------------

const MOVE_DEFS = {};
for (const [face, def] of Object.entries(BASE_MOVES)) {
  // BASE_MOVES are defined with the CCW cycle direction; invert to get CW.
  MOVE_DEFS[face]       = invertMoveDef(def);  // CW  (e.g. R)
  MOVE_DEFS[face + "'"] = def;                 // CCW (e.g. R')
  // Doubles (e.g. R2) handled by applying base twice in applyMove
}

// -- Public API -----------------------------------------------------------

/**
 * Apply a single named move. Returns a NEW CubeState (never mutates input).
 * Accepted names: U, U', U2, D, D', D2, R, R', R2, L, L', L2, F, F', F2, B, B', B2
 */
function applyMove(state, moveName) {
  const result = state.clone();

  if (moveName.endsWith('2')) {
    const face = moveName[0];
    const def = MOVE_DEFS[face];
    if (!def) throw new Error('Unknown move: ' + moveName);
    applyMoveDef(result, def);
    applyMoveDef(result, def);
  } else {
    const def = MOVE_DEFS[moveName];
    if (!def) throw new Error('Unknown move: ' + moveName);
    applyMoveDef(result, def);
  }

  return result;
}

/**
 * Apply a sequence of named moves. Returns a NEW CubeState.
 */
function applyMoves(state, moves) {
  let cur = state;
  for (const m of moves) {
    cur = applyMove(cur, m);
  }
  return cur;
}

/**
 * Return the inverse of a move name (e.g. "R" -> "R'", "R'" -> "R", "R2" -> "R2").
 */
function invertMoveName(name) {
  if (name.endsWith('2')) return name;          // doubles are self-inverse
  if (name.endsWith("'")) return name[0];       // CCW -> CW
  return name + "'";                            // CW -> CCW
}

module.exports = {
  applyMove,
  applyMoves,
  invertMoveName,
  BASE_MOVES,
  MOVE_DEFS,
};
