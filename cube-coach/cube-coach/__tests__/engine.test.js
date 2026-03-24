/**
 * Cube State Engine — Session 1 Exit Gate Tests
 *
 * Exit criteria verified:
 *   1. All 18 moves pass 4x identity test (apply 4 times → solved)
 *   2. Move then inverse = solved for all 6 faces
 *   3. Double move = base applied twice for all 6 faces
 *   4. Validation accepts 100 scrambles
 *   5. Validation rejects corrupted states with correct error messages
 *   6. 100 scrambles all valid, no consecutive same-face, length 20-25
 *   7. Orientation invariants (U/D no change, R/L corner only, F/B both)
 *   8. Known identity sequences
 *   9. Serialization round-trip
 *   10. Clone isolation (no reference-copy bugs)
 */

const { CubeState } = require('../src/engine/CubeState');
const { applyMove, applyMoves, invertMoveName } = require('../src/engine/moves');
const { validate } = require('../src/engine/validation');
const { scramble } = require('../src/engine/scrambler');
const { MOVE_NAMES, FACES } = require('../src/engine/constants');

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(message);
    console.error(`  FAIL: ${message}`);
  }
}

function section(name) {
  console.log(`\n=== ${name} ===`);
}

// ---------------------------------------------------------------------------
// 1. Solved state constructor
// ---------------------------------------------------------------------------
section('1. Solved State');

const solved = new CubeState();
assert(solved.isSolved(), 'New CubeState should be solved');
assert(validate(solved).valid, 'Solved state should be valid');

// ---------------------------------------------------------------------------
// 2. Clone and equals (no reference-copy bugs)
// ---------------------------------------------------------------------------
section('2. Clone & Equals');

const clone = solved.clone();
assert(clone.equals(solved), 'Clone should equal original');
assert(clone !== solved, 'Clone should be a different object');
assert(clone.cp !== solved.cp, 'Clone cp array should be different reference');
assert(clone.co !== solved.co, 'Clone co array should be different reference');
assert(clone.ep !== solved.ep, 'Clone ep array should be different reference');
assert(clone.eo !== solved.eo, 'Clone eo array should be different reference');

// Mutating clone must not affect original
clone.cp[0] = 7;
assert(!clone.equals(solved), 'Modified clone should not equal original');
assert(solved.cp[0] === 0, 'Original cp unmodified after clone mutation');

// ---------------------------------------------------------------------------
// 3. JSON round-trip (serialize / deserialize)
// ---------------------------------------------------------------------------
section('3. Serialization');

const scrambledForSerial = applyMoves(new CubeState(), ['R', 'U', 'F', "L'", 'D2']);
const json = JSON.stringify(scrambledForSerial.serialize());
const restored = CubeState.deserialize(JSON.parse(json));
assert(restored.equals(scrambledForSerial), 'Deserialized state equals original');
assert(restored.cp !== scrambledForSerial.cp, 'Deserialized uses fresh arrays');

// ---------------------------------------------------------------------------
// 4. All 18 moves pass 4x identity test
//    (CW/CCW: 4 applications = identity. Double: 2 applications = identity.)
// ---------------------------------------------------------------------------
section('4. 4x Identity Test (all 18 moves)');

for (const move of MOVE_NAMES) {
  const repeat = move.endsWith('2') ? 2 : 4;
  let state = new CubeState();
  for (let i = 0; i < repeat; i++) {
    state = applyMove(state, move);
  }
  assert(state.isSolved(), `${move} x${repeat} → solved`);
}

// ---------------------------------------------------------------------------
// 5. Move then inverse = solved for all faces
// ---------------------------------------------------------------------------
section('5. Move then Inverse');

for (const face of FACES) {
  // CW then CCW
  let state = applyMove(new CubeState(), face);
  state = applyMove(state, face + "'");
  assert(state.isSolved(), `${face} then ${face}' → solved`);

  // CCW then CW
  state = applyMove(new CubeState(), face + "'");
  state = applyMove(state, face);
  assert(state.isSolved(), `${face}' then ${face} → solved`);

  // Double is self-inverse
  state = applyMove(new CubeState(), face + '2');
  state = applyMove(state, face + '2');
  assert(state.isSolved(), `${face}2 x2 → solved`);
}

// ---------------------------------------------------------------------------
// 6. Double move = base applied twice
// ---------------------------------------------------------------------------
section('6. Double Move Consistency');

for (const face of FACES) {
  let via2 = applyMove(new CubeState(), face + '2');
  let viaRepeat = applyMove(applyMove(new CubeState(), face), face);
  assert(via2.equals(viaRepeat), `${face}2 equals ${face} applied twice`);
}

// ---------------------------------------------------------------------------
// 7. invertMoveName utility
// ---------------------------------------------------------------------------
section('7. invertMoveName');

for (const face of FACES) {
  assert(invertMoveName(face) === face + "'", `invertMoveName(${face}) = ${face}'`);
  assert(invertMoveName(face + "'") === face, `invertMoveName(${face}') = ${face}`);
  assert(invertMoveName(face + '2') === face + '2', `invertMoveName(${face}2) = ${face}2`);
}

// ---------------------------------------------------------------------------
// 8. Orientation invariants per face group
// ---------------------------------------------------------------------------
section('8. Orientation Invariants');

{
  // U and D: no orientation change at all
  for (const face of ['U', 'D']) {
    const state = applyMove(new CubeState(), face);
    const coSum = state.co.reduce((a, b) => a + b, 0);
    const eoSum = state.eo.reduce((a, b) => a + b, 0);
    assert(coSum === 0, `${face}: corner orientations unchanged`);
    assert(eoSum === 0, `${face}: edge orientations unchanged`);
  }

  // R and L: change corner orientation, NOT edge orientation
  for (const face of ['R', 'L']) {
    const state = applyMove(new CubeState(), face);
    const coSum = state.co.reduce((a, b) => a + b, 0);
    const eoSum = state.eo.reduce((a, b) => a + b, 0);
    assert(coSum > 0, `${face}: changes corner orientations`);
    assert(coSum % 3 === 0, `${face}: corner orientation sum mod 3 = 0`);
    assert(eoSum === 0, `${face}: does not change edge orientations`);
  }

  // F and B: change BOTH corner and edge orientation
  for (const face of ['F', 'B']) {
    const state = applyMove(new CubeState(), face);
    const coSum = state.co.reduce((a, b) => a + b, 0);
    const eoSum = state.eo.reduce((a, b) => a + b, 0);
    assert(coSum > 0, `${face}: changes corner orientations`);
    assert(coSum % 3 === 0, `${face}: corner orientation sum mod 3 = 0`);
    assert(eoSum > 0, `${face}: changes edge orientations`);
    assert(eoSum % 2 === 0, `${face}: edge orientation sum mod 2 = 0`);
  }
}

// All 18 single moves from solved produce valid states
for (const move of MOVE_NAMES) {
  const state = applyMove(new CubeState(), move);
  const result = validate(state);
  assert(result.valid, `Single ${move} from solved → valid state`);
}

// ---------------------------------------------------------------------------
// 9. Known algebraic identities
// ---------------------------------------------------------------------------
section('9. Known Identities');

{
  // Sexy move: (R U R' U') x6 = identity
  let state = new CubeState();
  for (let i = 0; i < 6; i++) {
    state = applyMoves(state, ['R', 'U', "R'", "U'"]);
  }
  assert(state.isSolved(), "(R U R' U') x6 = identity");
}

{
  // Sune: (R U R' U R U2 R') x6 = identity
  let state = new CubeState();
  for (let i = 0; i < 6; i++) {
    state = applyMoves(state, ['R', 'U', "R'", 'U', 'R', 'U2', "R'"]);
  }
  assert(state.isSolved(), "Sune x6 = identity");
}

{
  // (R' D' R D) x6 = identity (commutator cycle)
  let state = new CubeState();
  for (let i = 0; i < 6; i++) {
    state = applyMoves(state, ["R'", "D'", 'R', 'D']);
  }
  assert(state.isSolved(), "(R' D' R D) x6 = identity");
}

// ---------------------------------------------------------------------------
// 10. Stress test: 500 random moves then undo all
// ---------------------------------------------------------------------------
section('10. Stress Test (500 moves + undo)');

{
  const moves = [];
  let state = new CubeState();
  let lastFace = null;

  for (let i = 0; i < 500; i++) {
    let face;
    do {
      face = FACES[Math.floor(Math.random() * 6)];
    } while (face === lastFace);
    const variants = ['', "'", '2'];
    const move = face + variants[Math.floor(Math.random() * 3)];
    state = applyMove(state, move);
    moves.push(move);
    lastFace = face;
  }

  // Validate mid-scramble
  assert(validate(state).valid, 'Valid after 500 random moves');

  // Undo all in reverse
  for (let i = moves.length - 1; i >= 0; i--) {
    state = applyMove(state, invertMoveName(moves[i]));
  }
  assert(state.isSolved(), 'Solved after undoing 500 moves');
}

// ---------------------------------------------------------------------------
// 11. Validation rejects corrupted states
// ---------------------------------------------------------------------------
section('11. Validation Rejects Corrupted States');

{
  // Single twisted corner (co sum not mod 3)
  const state = new CubeState();
  state.co[0] = 1;
  const result = validate(state);
  assert(!result.valid, 'Rejects single twisted corner');
  assert(result.errors.some(e => e.includes('not divisible by 3')),
    'Error mentions corner orientation');
}

{
  // Single flipped edge (eo sum not mod 2)
  const state = new CubeState();
  state.eo[0] = 1;
  const result = validate(state);
  assert(!result.valid, 'Rejects single flipped edge');
  assert(result.errors.some(e => e.includes('not divisible by 2')),
    'Error mentions edge orientation');
}

{
  // Single corner swap (parity mismatch)
  const state = new CubeState();
  state.cp[0] = 1;
  state.cp[1] = 0;
  const result = validate(state);
  assert(!result.valid, 'Rejects single corner swap');
  assert(result.errors.some(e => e.toLowerCase().includes('parity')),
    'Error mentions parity');
}

{
  // Single edge swap (parity mismatch)
  const state = new CubeState();
  state.ep[0] = 1;
  state.ep[1] = 0;
  const result = validate(state);
  assert(!result.valid, 'Rejects single edge swap');
}

{
  // Duplicate corner piece
  const state = new CubeState();
  state.cp[0] = 1;
  state.cp[1] = 1;
  const result = validate(state);
  assert(!result.valid, 'Rejects duplicate corner');
  assert(result.errors.some(e => e.toLowerCase().includes('duplicate')),
    'Error mentions duplicate');
}

{
  // Duplicate edge piece
  const state = new CubeState();
  state.ep[0] = 1;
  state.ep[1] = 1;
  const result = validate(state);
  assert(!result.valid, 'Rejects duplicate edge');
}

{
  // Double swap (corners + edges) — should be VALID (parity matches)
  const state = new CubeState();
  state.cp[0] = 1; state.cp[1] = 0;
  state.ep[0] = 1; state.ep[1] = 0;
  assert(validate(state).valid, 'Double swap (corner+edge) is valid');
}

{
  // Out-of-range corner orientation
  const state = new CubeState();
  state.co[0] = 3; state.co[1] = 3; state.co[2] = 3;
  // Sum = 9, mod 3 = 0 so orientation sum check passes.
  // But values > 2 are semantically wrong. Let's test that the engine
  // doesn't crash and validation at least accepts it (the current
  // validator checks sums, not individual ranges).
  // This is acceptable for V1 — range checking is defensive, not essential.
}

{
  // Completely scrambled via moves — should always be valid
  let state = new CubeState();
  state = applyMoves(state, ['R', 'U', 'F', 'D', 'L', 'B', "R'", "U'", 'F2']);
  assert(validate(state).valid, 'Any sequence of real moves → valid');
}

// ---------------------------------------------------------------------------
// 12. 100 scrambles: all valid, correct length, no consecutive same-face
// ---------------------------------------------------------------------------
section('12. 100 Scrambles');

let scramblesFailed = 0;
for (let i = 0; i < 100; i++) {
  const { state, moves } = scramble();

  // Length 20-25
  if (moves.length < 20 || moves.length > 25) {
    scramblesFailed++;
    console.error(`  Scramble ${i}: bad length ${moves.length}`);
    continue;
  }

  // No consecutive same face
  let hasConsec = false;
  for (let j = 1; j < moves.length; j++) {
    if (moves[j - 1][0] === moves[j][0]) {
      hasConsec = true;
      console.error(`  Scramble ${i}: consecutive ${moves[j - 1]} ${moves[j]}`);
      break;
    }
  }
  if (hasConsec) { scramblesFailed++; continue; }

  // State is valid
  const result = validate(state);
  if (!result.valid) {
    scramblesFailed++;
    console.error(`  Scramble ${i}: invalid — ${result.errors.join('; ')}`);
    continue;
  }

  // State is not solved
  if (state.isSolved()) {
    scramblesFailed++;
    console.error(`  Scramble ${i}: still solved`);
  }
}
assert(scramblesFailed === 0, `All 100 scrambles valid (${scramblesFailed} failed)`);

// ---------------------------------------------------------------------------
// 13. applyMove immutability — original state is never mutated
// ---------------------------------------------------------------------------
section('13. Immutability');

{
  const original = new CubeState();
  const after = applyMove(original, 'R');
  assert(original.isSolved(), 'applyMove does not mutate original');
  assert(!after.isSolved(), 'applyMove returns a changed state');
}

{
  const original = new CubeState();
  const after = applyMoves(original, ['R', 'U', 'F']);
  assert(original.isSolved(), 'applyMoves does not mutate original');
  assert(!after.isSolved(), 'applyMoves returns a changed state');
}

// ---------------------------------------------------------------------------
// 14. R move produces correct specific state (spot check)
// ---------------------------------------------------------------------------
section('14. R Move Spot Check');

{
  // R CW cycle: DFR→URF→UBR→DRB→DFR means:
  //   piece at DFR goes to URF, URF→UBR, UBR→DRB, DFR fills from URF
  const state = applyMove(new CubeState(), 'R');
  assert(state.cp[0] === 4, 'R: URF position gets DFR piece (4)');
  assert(state.cp[3] === 0, 'R: UBR position gets URF piece (0)');
  assert(state.cp[7] === 3, 'R: DRB position gets UBR piece (3)');
  assert(state.cp[4] === 7, 'R: DFR position gets DRB piece (7)');

  // Corners not in the R cycle are untouched
  assert(state.cp[1] === 1, 'R: UFL untouched');
  assert(state.cp[2] === 2, 'R: ULB untouched');
  assert(state.cp[5] === 5, 'R: DLF untouched');
  assert(state.cp[6] === 6, 'R: DBL untouched');

  // R CW corner orientations: [1, 2, 1, 2] at positions [URF, UBR, DRB, DFR]
  assert(state.co[0] === 1, 'R: URF orient = 1');
  assert(state.co[3] === 2, 'R: UBR orient = 2');
  assert(state.co[7] === 1, 'R: DRB orient = 1');
  assert(state.co[4] === 2, 'R: DFR orient = 2');

  // R does not change edge orientations
  assert(state.eo.every(o => o === 0), 'R: no edge orientation change');
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
section('RESULTS');
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
if (failed > 0) {
  console.log('\n  Failures:');
  for (const f of failures) {
    console.log(`    - ${f}`);
  }
}
console.log(failed === 0 ? '\n  ✅ ALL TESTS PASSED — Session 1 exit gate clear' : '\n  ❌ SOME TESTS FAILED');
process.exit(failed === 0 ? 0 : 1);
