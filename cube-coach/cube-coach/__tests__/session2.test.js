/**
 * Session 2 Tests — Classifiers, Solvers, and Stickers
 *
 * Exit criteria:
 * - Each classifier returns correct results on 5+ known states
 * - Beginner solver solves 50 random scrambles
 * - Kociemba solves 20 scrambles in under 25 moves each
 * - toStickers() produces correct output for known states
 */
const {
  CubeState, applyMove, applyMoves, scramble,
  toStickers, toCubeJsString,
  classifyWhiteCross, isWhiteCrossSolved,
  classifyFirstLayer, isFirstLayerSolved,
  classifyF2L, isF2LSolved,
  classifyOLL, isOLLSolved,
  classifyPLL, isPLLSolved,
  beginnerSolve, kociembaSolve, initSolver,
  U_FACE, D_FACE, R_FACE, L_FACE, F_FACE, B_FACE,
} = require('../src/engine');

// -- Test harness ----------------------------------------------------------
let passed = 0, failed = 0;
const failures = [];

function section(name) { console.log('\n=== ' + name + ' ==='); }
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failed++; failures.push(msg); console.error('  FAIL: ' + msg); }
}

// =========================================================================
// 1. toStickers() — Sticker Conversion
// =========================================================================
section('1. toStickers — Solved State');
{
  const s = toStickers(new CubeState());
  assert(s[U_FACE].every(c => c === U_FACE), 'Solved U face all white');
  assert(s[D_FACE].every(c => c === D_FACE), 'Solved D face all yellow');
  assert(s[R_FACE].every(c => c === R_FACE), 'Solved R face all red');
  assert(s[L_FACE].every(c => c === L_FACE), 'Solved L face all orange');
  assert(s[F_FACE].every(c => c === F_FACE), 'Solved F face all green');
  assert(s[B_FACE].every(c => c === B_FACE), 'Solved B face all blue');
}

section('1b. toStickers — After R Move');
{
  const state = applyMove(new CubeState(), 'R');
  const s = toStickers(state);
  // R move: F right col → U right col
  assert(s[U_FACE][2] === F_FACE, 'After R: U2 = F');
  assert(s[U_FACE][5] === F_FACE, 'After R: U5 = F');
  assert(s[U_FACE][8] === F_FACE, 'After R: U8 = F');
  assert(s[R_FACE][4] === R_FACE, 'After R: R center unchanged');
}

section('1c. toCubeJsString — Matches cubejs');
{
  const Cube = require('cubejs');
  for (const move of ['R', 'U', 'F', "L'", 'D2', 'B']) {
    const ours = toCubeJsString(applyMove(new CubeState(), move));
    const c = new Cube(); c.move(move);
    assert(ours === c.asString(), 'toCubeJsString matches cubejs for ' + move);
  }
}

// =========================================================================
// 2. White Cross Classifier
// =========================================================================
section('2. White Cross Classifier');
{
  // State 1: Solved
  const r1 = classifyWhiteCross(new CubeState());
  assert(r1.complete === true, 'Solved cube: cross complete');
  assert(r1.count === 4, 'Solved cube: 4 edges solved');

  // State 2: One edge wrong
  let s2 = applyMove(new CubeState(), 'R');
  const r2 = classifyWhiteCross(s2);
  assert(r2.complete === false, 'After R: cross not complete');
  assert(r2.unsolved.length > 0, 'After R: some edges unsolved');

  // State 3: All edges wrong
  const { state: s3 } = scramble();
  const r3 = classifyWhiteCross(s3);
  assert(typeof r3.count === 'number', 'Scrambled: count is a number');

  // State 4: Just D layer moved (cross unaffected)
  let s4 = applyMove(new CubeState(), 'D');
  const r4 = classifyWhiteCross(s4);
  assert(r4.complete === true, 'After D: cross still complete');

  // State 5: F2 disrupts two cross edges
  let s5 = applyMove(new CubeState(), 'F2');
  const r5 = classifyWhiteCross(s5);
  assert(r5.complete === false, 'After F2: cross not complete');
  assert(r5.unsolved.length >= 1, 'After F2: at least 1 edge unsolved');
}

// =========================================================================
// 3. First Layer Classifier
// =========================================================================
section('3. First Layer Classifier');
{
  // State 1: Solved
  assert(classifyFirstLayer(new CubeState()).complete === true, 'Solved: first layer complete');

  // State 2: After D (first layer unaffected)
  assert(classifyFirstLayer(applyMove(new CubeState(), 'D')).complete === true, 'After D: first layer ok');

  // State 3: After R (disrupts corners)
  const r3 = classifyFirstLayer(applyMove(new CubeState(), 'R'));
  assert(r3.complete === false, 'After R: first layer broken');

  // State 4: Cross ok but corners wrong
  let s4 = applyMoves(new CubeState(), ["R'", "D'", "R"]); // displace one corner
  const r4 = classifyFirstLayer(s4);
  assert(r4.cornersUnsolved.length > 0, 'Corner displaced: some corners unsolved');

  // State 5: Scrambled
  const r5 = classifyFirstLayer(scramble().state);
  assert(typeof r5.count === 'number', 'Scrambled: has numeric count');
}

// =========================================================================
// 4. F2L Classifier
// =========================================================================
section('4. F2L Classifier');
{
  assert(classifyF2L(new CubeState()).complete === true, 'Solved: F2L complete');
  assert(classifyF2L(applyMove(new CubeState(), 'D')).complete === true, 'After D: F2L ok');

  let s3 = applyMove(new CubeState(), 'R');
  assert(classifyF2L(s3).complete === false, 'After R: F2L broken');

  // Middle edge only
  let s4 = applyMove(new CubeState(), 'D2');
  assert(classifyF2L(s4).complete === true, 'After D2: F2L still ok');

  const r5 = classifyF2L(scramble().state);
  assert(typeof r5.count === 'number', 'Scrambled: has numeric count');
}

// =========================================================================
// 5. OLL Classifier
// =========================================================================
section('5. OLL Classifier');
{
  // Solved: D face all yellow
  const r1 = classifyOLL(new CubeState());
  assert(r1.complete === true, 'Solved: OLL complete');
  assert(r1.correctCount === 9, 'Solved: 9 correct D-face stickers');

  // After D: same thing (just permutation)
  assert(classifyOLL(applyMove(new CubeState(), 'D')).complete === true, 'After D: OLL still ok');

  // After R: D face changes
  const r3 = classifyOLL(applyMove(new CubeState(), 'R'));
  assert(r3.complete === false, 'After R: OLL broken');

  // After F: D face changes
  assert(classifyOLL(applyMove(new CubeState(), 'F')).complete === false, 'After F: OLL broken');

  // Scrambled
  const r5 = classifyOLL(scramble().state);
  assert(typeof r5.correctCount === 'number', 'Scrambled: has numeric count');
}

// =========================================================================
// 6. PLL Classifier
// =========================================================================
section('6. PLL Classifier');
{
  assert(classifyPLL(new CubeState()).complete === true, 'Solved: PLL complete');
  assert(classifyPLL(applyMove(new CubeState(), 'D')).complete === false, 'After D: PLL broken');
  assert(classifyPLL(applyMove(new CubeState(), 'D2')).complete === false, 'After D2: PLL broken');

  // U move shouldn't affect D layer PLL
  assert(classifyPLL(applyMove(new CubeState(), 'U')).complete === true, 'After U: PLL still ok');

  const r5 = classifyPLL(scramble().state);
  assert(typeof r5.cornersAllCorrect === 'boolean', 'Scrambled: has boolean fields');
}

// =========================================================================
// 7. Beginner Solver — 50 random scrambles
// =========================================================================
section('7. Beginner Solver (50 scrambles)');
{
  let solvedCount = 0;
  let maxMoves = 0;
  const start = Date.now();

  for (let i = 0; i < 50; i++) {
    const { state } = scramble();
    const result = beginnerSolve(state);
    if (result.solved) {
      solvedCount++;
      maxMoves = Math.max(maxMoves, result.moves.length);
    }
  }

  const elapsed = Date.now() - start;
  assert(solvedCount === 50, 'Beginner solver: ' + solvedCount + '/50 solved');
  assert(maxMoves <= 200, 'Beginner solver: max moves ' + maxMoves + ' <= 200');
  console.log('  Time: ' + elapsed + 'ms (' + (elapsed / 50).toFixed(0) + 'ms/solve)');
  console.log('  Max moves: ' + maxMoves);
}

// =========================================================================
// 8. Kociemba Solver — 20 scrambles under 25 moves
// =========================================================================
section('8. Kociemba Solver (20 scrambles)');
{
  initSolver();
  let solvedCount = 0;
  let maxMoves = 0;
  let allUnder25 = true;

  for (let i = 0; i < 20; i++) {
    const { state } = scramble();
    const result = kociembaSolve(state);
    if (result.solved) {
      solvedCount++;
      maxMoves = Math.max(maxMoves, result.moveCount);
      if (result.moveCount > 25) allUnder25 = false;
    }
  }

  assert(solvedCount === 20, 'Kociemba: ' + solvedCount + '/20 solved');
  assert(allUnder25, 'Kociemba: all under 25 moves (max: ' + maxMoves + ')');
  console.log('  Max moves: ' + maxMoves);
}

// =========================================================================
// 9. Kociemba solution verifiable through our engine
// =========================================================================
section('9. Kociemba — Solutions Verified');
{
  initSolver();
  let verified = 0;
  for (let i = 0; i < 5; i++) {
    const { state } = scramble();
    const result = kociembaSolve(state);
    if (result.solved) {
      const final = applyMoves(state, result.moves);
      if (final.isSolved()) verified++;
    }
  }
  assert(verified === 5, 'Kociemba solutions verified through engine: ' + verified + '/5');
}

// =========================================================================
// Results
// =========================================================================
section('RESULTS');
console.log('  Passed: ' + passed);
console.log('  Failed: ' + failed);
if (failed > 0) {
  console.log('\n  Failures:');
  failures.forEach(f => console.log('    - ' + f));
}
console.log(failed === 0 ? '\n  ✅ ALL TESTS PASSED — Session 2 exit gate clear' : '\n  ❌ SOME TESTS FAILED');
process.exit(failed === 0 ? 0 : 1);
