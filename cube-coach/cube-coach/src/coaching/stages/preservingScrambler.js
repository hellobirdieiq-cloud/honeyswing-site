/**
 * Preserving scrambler — generates scrambles by directly constructing
 * valid cube states with pre-solved layers intact.
 *
 * Strategy: set fixed pieces in their home positions, randomly permute
 * and orient free pieces, then fix invariants (parity + orientation sums).
 *
 * From CLAUDE.md: "Scrambler for any stage must validate that pre-solved
 * layers are intact. Regenerate if not."
 */
const { CubeState } = require('../../engine/CubeState');
const { validate } = require('../../engine/validation');

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function permParity(perm) {
  const n = perm.length;
  const visited = new Array(n).fill(false);
  let parity = 0;
  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    let len = 0;
    let j = i;
    while (!visited[j]) { visited[j] = true; j = perm[j]; len++; }
    parity = (parity + len - 1) % 2;
  }
  return parity;
}

function randInt(max) { return Math.floor(Math.random() * max); }

/**
 * Build a scrambled CubeState with certain positions fixed as solved.
 *
 * @param {object} opts
 * @param {number[]} opts.fixedCorners - corner positions that must stay solved (e.g. [0,1,2,3])
 * @param {number[]} opts.fixedEdges - edge positions that must stay solved
 * @param {number[]} opts.freeCorners - corner positions to scramble (e.g. [4,5,6,7])
 * @param {number[]} opts.freeEdges - edge positions to scramble
 * @param {boolean} [opts.lockCornerOrient] - if true, free corners keep co=0 (permute only)
 * @param {boolean} [opts.lockEdgeOrient] - if true, free edges keep eo=0 (permute only)
 * @param {number[]} [opts.lockEdgeOrientPositions] - specific edge positions to lock orient on
 * @returns {CubeState}
 */
function buildScrambledState(opts) {
  const s = new CubeState();

  // Fixed positions already have identity values from constructor.

  // Randomly permute free corners
  if (opts.freeCorners.length > 0) {
    const pieces = shuffle(opts.freeCorners); // random assignment of piece IDs
    for (let i = 0; i < opts.freeCorners.length; i++) {
      s.cp[opts.freeCorners[i]] = pieces[i];
    }
  }

  // Randomly permute free edges
  if (opts.freeEdges.length > 0) {
    const pieces = shuffle(opts.freeEdges);
    for (let i = 0; i < opts.freeEdges.length; i++) {
      s.ep[opts.freeEdges[i]] = pieces[i];
    }
  }

  // Fix parity: corner parity must equal edge parity
  const cParity = permParity(s.cp);
  const eParity = permParity(s.ep);
  if (cParity !== eParity) {
    // Swap two free edges to flip edge parity
    if (opts.freeEdges.length >= 2) {
      const a = opts.freeEdges[0], b = opts.freeEdges[1];
      [s.ep[a], s.ep[b]] = [s.ep[b], s.ep[a]];
    } else if (opts.freeCorners.length >= 2) {
      const a = opts.freeCorners[0], b = opts.freeCorners[1];
      [s.cp[a], s.cp[b]] = [s.cp[b], s.cp[a]];
    }
  }

  // Random corner orientations (if not locked)
  if (!opts.lockCornerOrient && opts.freeCorners.length > 0) {
    let sum = 0;
    for (let i = 0; i < opts.freeCorners.length - 1; i++) {
      const o = randInt(3);
      s.co[opts.freeCorners[i]] = o;
      sum += o;
    }
    // Last corner fixes the sum to be 0 mod 3
    const fixedSum = opts.fixedCorners.reduce((acc, p) => acc + s.co[p], 0);
    s.co[opts.freeCorners[opts.freeCorners.length - 1]] = (3 - (sum + fixedSum) % 3) % 3;
  }

  // Random edge orientations (if not locked)
  const lockedOrientEdges = new Set(opts.lockEdgeOrientPositions || []);
  if (!opts.lockEdgeOrient && opts.freeEdges.length > 0) {
    const orientableEdges = opts.freeEdges.filter(p => !lockedOrientEdges.has(p));
    if (orientableEdges.length > 0) {
      let sum = 0;
      for (let i = 0; i < orientableEdges.length - 1; i++) {
        const o = randInt(2);
        s.eo[orientableEdges[i]] = o;
        sum += o;
      }
      const fixedSum = opts.fixedEdges.reduce((acc, p) => acc + s.eo[p], 0)
        + opts.freeEdges.filter(p => lockedOrientEdges.has(p)).reduce((acc, p) => acc + s.eo[p], 0);
      s.eo[orientableEdges[orientableEdges.length - 1]] = (2 - (sum + fixedSum) % 2) % 2;
    }
  }

  return s;
}

/**
 * Generate a scramble that preserves prerequisite layers.
 *
 * @param {object} config - { fixedCorners, fixedEdges, freeCorners, freeEdges, ... }
 * @param {function(CubeState): boolean} goalAlreadyMet
 * @param {number} [maxAttempts=50]
 * @returns {{ state: CubeState, moves: string[] }}
 */
function generatePreservingScramble(config, goalAlreadyMet, maxAttempts = 50) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const state = buildScrambledState(config);

    const check = validate(state);
    if (!check.valid) continue;

    if (goalAlreadyMet(state)) continue;

    // Return empty moves array — the state was constructed directly, not via moves
    return { state, moves: [] };
  }
  throw new Error('Failed to generate preserving scramble after ' + maxAttempts + ' attempts');
}

module.exports = { generatePreservingScramble, buildScrambledState };
