/**
 * State validation — four invariant checks that every reachable cube state
 * must satisfy. Any violation means the state is physically impossible.
 */
const { NUM_CORNERS, NUM_EDGES } = require('./constants');

/**
 * Compute the parity of a permutation (0 = even, 1 = odd).
 */
function computeParity(perm) {
  const n = perm.length;
  const visited = new Array(n).fill(false);
  let parity = 0;

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    let len = 0;
    let j = i;
    while (!visited[j]) {
      visited[j] = true;
      j = perm[j];
      len++;
    }
    parity = (parity + len - 1) % 2;
  }
  return parity;
}

/**
 * Validate a CubeState. Returns { valid: boolean, errors: string[] }.
 */
function validate(state) {
  const errors = [];

  // 1. Unique corner pieces (each 0-7 exactly once)
  {
    const seen = new Set();
    for (let i = 0; i < NUM_CORNERS; i++) {
      const p = state.cp[i];
      if (p < 0 || p >= NUM_CORNERS) {
        errors.push('Corner position ' + i + ': invalid piece id ' + p);
      } else if (seen.has(p)) {
        errors.push('Duplicate corner piece ' + p);
      }
      seen.add(p);
    }
  }

  // 2. Unique edge pieces (each 0-11 exactly once)
  {
    const seen = new Set();
    for (let i = 0; i < NUM_EDGES; i++) {
      const p = state.ep[i];
      if (p < 0 || p >= NUM_EDGES) {
        errors.push('Edge position ' + i + ': invalid piece id ' + p);
      } else if (seen.has(p)) {
        errors.push('Duplicate edge piece ' + p);
      }
      seen.add(p);
    }
  }

  // 3. Corner orientation sum divisible by 3
  {
    const sum = state.co.reduce((a, b) => a + b, 0);
    if (sum % 3 !== 0) {
      errors.push('Corner orientation sum ' + sum + ' is not divisible by 3 (twisted corner)');
    }
  }

  // 4. Edge orientation sum divisible by 2
  {
    const sum = state.eo.reduce((a, b) => a + b, 0);
    if (sum % 2 !== 0) {
      errors.push('Edge orientation sum ' + sum + ' is not divisible by 2 (flipped edge)');
    }
  }

  // 5. Permutation parity match (only if pieces are valid)
  if (errors.length === 0) {
    const cp = computeParity(state.cp);
    const ep = computeParity(state.ep);
    if (cp !== ep) {
      errors.push('Parity mismatch: corner parity ' + cp + ', edge parity ' + ep + ' (impossible single swap)');
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validate, computeParity };
