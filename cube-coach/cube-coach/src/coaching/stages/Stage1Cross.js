/**
 * Stage1Cross — Stage configuration for the white cross.
 *
 * Provides scrambling, goal detection, and coaching integration
 * for the first beginner stage.
 *
 * From CLAUDE.md: "Scrambler for any stage must validate that
 * pre-solved layers are intact. Regenerate if not."
 * For Stage 1, there are no pre-solved layers — full scramble is fine.
 */
const { CubeState } = require('../../engine/CubeState');
const { applyMove } = require('../../engine/moves');
const { validate } = require('../../engine/validation');
const { classifyWhiteCross, isWhiteCrossSolved } = require('../../engine/classifiers/whiteCross');
const { validateCrossMove } = require('../MoveValidator');
const { selectCrossCue } = require('../CueSelector');

const FACES = ['U', 'D', 'R', 'L', 'F', 'B'];
const VARIANTS = ['', "'", '2'];

/**
 * Generate a scramble for Stage 1.
 * Ensures the scramble is valid and the cross is NOT already solved.
 * Uses shorter scrambles (10-15 moves) to keep difficulty manageable.
 */
function generateStage1Scramble() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const length = 10 + Math.floor(Math.random() * 6);
    const moves = [];
    let lastFace = null;
    let state = new CubeState();

    for (let i = 0; i < length; i++) {
      let face;
      do {
        face = FACES[Math.floor(Math.random() * FACES.length)];
      } while (face === lastFace);
      const variant = VARIANTS[Math.floor(Math.random() * 3)];
      const move = face + variant;
      moves.push(move);
      state = applyMove(state, move);
      lastFace = face;
    }

    const check = validate(state);
    if (!check.valid) continue;

    // Ensure cross is not already solved (would be a trivial scramble)
    if (isWhiteCrossSolved(state)) continue;

    return { state, moves };
  }

  // Fallback: shouldn't happen
  throw new Error('Failed to generate Stage 1 scramble after 50 attempts');
}

const Stage1Cross = {
  id: 'stage1_cross',
  name: 'White Cross',
  description: 'Place all four white edge pieces on top',

  /** Generate a scrambled state for this stage. */
  scramble: generateStage1Scramble,

  /** Check if the goal is met. */
  isComplete: isWhiteCrossSolved,

  /** Classify the current progress. */
  classify: classifyWhiteCross,

  /** Validate a proposed move. */
  validateMove: validateCrossMove,

  /** Select a coaching cue. */
  selectCue: selectCrossCue,
};

module.exports = { Stage1Cross };
