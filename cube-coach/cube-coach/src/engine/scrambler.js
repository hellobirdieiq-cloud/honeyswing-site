/**
 * Scramble generator — 20-25 moves, no consecutive same-face,
 * guaranteed valid output.
 */
const { FACES } = require('./constants');
const { CubeState } = require('./CubeState');
const { applyMove } = require('./moves');
const { validate } = require('./validation');

const VARIANTS = ['', "'", '2'];

/**
 * Generate a random move sequence.
 * @param {number} [length] - number of moves (default: random 20-25)
 * @returns {string[]}
 */
function generateScramble(length) {
  if (length === undefined) {
    length = 20 + Math.floor(Math.random() * 6);
  }

  const moves = [];
  let lastFace = null;

  for (let i = 0; i < length; i++) {
    let face;
    do {
      face = FACES[Math.floor(Math.random() * FACES.length)];
    } while (face === lastFace);

    const variant = VARIANTS[Math.floor(Math.random() * 3)];
    moves.push(face + variant);
    lastFace = face;
  }

  return moves;
}

/**
 * Generate a scramble and apply it.
 * @param {CubeState} [state] - starting state (default: solved)
 * @param {number} [length]
 * @returns {{ state: CubeState, moves: string[] }}
 */
function scramble(state, length) {
  const moves = generateScramble(length);
  let result = state ? state.clone() : new CubeState();

  for (const m of moves) {
    result = applyMove(result, m);
  }

  const check = validate(result);
  if (!check.valid) {
    throw new Error('Scramble produced invalid state: ' + check.errors.join('; '));
  }

  return { state: result, moves };
}

module.exports = { generateScramble, scramble };
