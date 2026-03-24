# Cube Coach Master Context V1

**Version:** 1.0  
**Date:** March 23, 2026  
**Last Updated:** March 24, 2026  
**Authority:** This document is the single source of truth. The live repo overrides this document where they conflict.

---

> **⚠️ DO NOT start new feature work before reading Section 0 and Section 6.**

---

## Evidence Labels

Use these on anything that matters:
- **[VERIFIED]** = confirmed in code or on a real device
- **[INFERENCE]** = you're pretty sure based on evidence
- **[RECOMMENDATION]** = worth trying but not proven
- **[SUPERSEDED]** = old info that is now wrong — following it will cause bugs

## Precedence (when things disagree)
1. The live repo (always wins)
2. The most recent extraction
3. This document
4. Older docs or chat history

---

## How To Use This Document

### For the human
- Read **Section 0** and **Section 6** at the start of every session.
- When this doc and code disagree, **code wins**.

### For the AI (paste this when starting a session)
> You are starting a development session on Cube Coach. The attached document is the single source of truth for project state. Treat Section 2 as the canonical architecture. Do not suggest features listed in "Not yet built" unless I specifically ask. When generating code, verify types against the structures in Section 2. When I ask what to work on, consult Section 6 for priorities. Default to concrete file paths and terminal commands, not open-ended suggestions. If I say "done," "that's it," "wrapping up," or anything that signals end of session, remind me to run the extraction prompt before I leave.

---

## SECTION 0 — Where Things Stand Right Now

### What the app does right now
- **Core loop in one sentence:** Engine is complete — applies moves, classifies stages, solves scrambles, converts to stickers. No UI yet.
- **What is real:** Cube state engine, all 5 classifiers, beginner solver (IDDFS + Kociemba hybrid), Kociemba wrapper, sticker conversion. 193 tests passing across 2 test suites.
- **What is simulated or test-only:** All engine features are test-only (no device/UI interaction yet).

### Feature trust levels

| Feature | Trust Level | Why |
|---------|-------------|-----|
| Cube State Engine | **Trusted** | 193 tests passing, all 18 moves verified against cubejs [VERIFIED] |
| Classifiers | **Trusted** | 5 classifiers, 5+ known states each, all passing [VERIFIED] |
| Beginner Solver | **Trusted** | 50/50 scrambles solved, avg ~75 moves, ~1.5s/solve [VERIFIED] |
| Kociemba Solver | **Trusted** | 20/20 scrambles solved, all under 25 moves (max 22) [VERIFIED] |
| Stickers (toStickers) | **Trusted** | Verified against cubejs for all 18 moves [VERIFIED] |
| 3D Rendering | **Untrusted** | Not yet built |
| Coaching System | **Untrusted** | Not yet built |
| Session Structure | **Untrusted** | Not yet built |
| Advanced Modules | **Untrusted** | Not yet built |

### Not yet built
- 3D renderer (Part 2) — depends on engine's `toStickers()` output (now available)
- Coaching system (Part 3) — depends on engine classifiers + renderer highlighting
- Session structure & progress (Part 4) — depends on coaching loop
- Advanced modules & deploy (Part 5) — depends on everything else

### Do not build yet
- AR camera scanning — complex, not needed to validate core coaching loop. Explicitly V2, after retention is proven.
- Multiplayer / race mode — retention must work in single-player first. V2.
- 2×2 and larger cubes — stay focused on the 3×3 problem. V2+.
- Android build — iOS first via TestFlight, Android after feedback. Post-beta.
- Social / sharing features — solve the learning problem first. V2.
- Subscription monetization — free during beta, pricing after retention data. Post-beta.
- Swipe-on-cube move input — add in a polish pass after button-triggered animations work perfectly. [RECOMMENDATION]

### Clean up later
- (Nothing yet — track temporary hacks, debug flags, and test scaffolding here as they appear.)

### Active blockers
- None. Engine is proven. Ready to start 3D rendering.

### Current milestone
- **Session 3:** First static 3D cube on screen, touch orbit, full move animation pipeline, highlighting, arrows.

### Operating rule
- Engine is complete and tested. Rendering can now consume `toStickers()` output. Do not modify engine files unless a bug is found. Pin Three.js version at install time.

### Current assumptions (not verified)
- expo-gl + Three.js will render and animate a 3×3 cube at 60fps on target iOS devices [INFERENCE]
- cubejs (Kociemba JS port) works in React Native / Expo environment [VERIFIED — works in Node, not yet tested in RN runtime]
- AsyncStorage is sufficient for all persistence needs at V1 scale [INFERENCE]
- The hybrid move validator (accept moves that make progress without breaking solved pieces) will feel fair to users [RECOMMENDATION]
- 5-minute session length is right for daily habit formation [RECOMMENDATION]

---

## SECTION 1 — Identity

| Field | Value |
|-------|-------|
| **Product Name** | Cube Coach |
| **Bundle ID (iOS)** | TBD — set during `eas build:configure` |
| **Application ID (Android)** | N/A for V1 (iOS only) |
| **Repo Path** | TBD — `npx create-expo-app cube-coach` |
| **Build System** | EAS CLI (Expo Application Services) |
| **Backend** | None — all local via AsyncStorage |
| **Current Version** | 0.0.0 (not yet created) |
| **Current Build** | N/A |
| **Node Version** | TBD — verify on machine before creating project |
| **Package Manager** | npm |
| **Expo SDK / RN Version** | TBD — verify latest stable before creating project |

---

## SECTION 2 — Architecture

### Pipeline
```text
USER INPUT (touch / button)
  → SESSION RUNNER (Part 4) — orchestrates 5-min daily session
  → COACHING ENGINE (Part 3) — stuck detection, cue selection, move validation
  → CUBE STATE ENGINE (Part 1) — applies moves, classifies cases, validates state
  → 3D RENDERER (Part 2) — animates moves, highlights pieces, shows arrows
  → PERSISTENCE (Part 4) — AsyncStorage for attempts, streaks, solve times
  → PROGRESS DASHBOARD (Part 4) — graphs, badges, PB tracking
```

Data flows downward. The engine is always the source of truth. The renderer is a derived view. Nothing flows upward.

### Observability boundary (critical V1 constraint)
- **Coach Mode (virtual drills):** Full cube state at all times. Can highlight, detect wrong moves, classify cases, measure latency. Full coaching loop.
- **Timer Mode (physical solves):** Outcome only — solve time, session count, PB. Cannot see the physical cube. No live cueing. The app must never imply it can see the physical cube.
- AR scanning (bridging this gap) is explicitly V2.

### Source-of-truth files
These are the files an AI session should check before writing code:

| What | File |
|------|------|
| Canonical types / cube data model | `src/engine/constants.js` + `src/engine/CubeState.js` |
| Move definitions | `src/engine/moves.js` |
| App config | `app.json` |
| Build config | `eas.json` |
| AsyncStorage schema | `src/storage/schema.js` |
| Route root | `src/navigation/AppNavigator.js` |
| Color map | `src/renderer/colorMap.js` |
| Cue strings | `src/coaching/CueLibrary.js` |

### Key type contracts

**CubeState (the foundation everything depends on):**
```js
class CubeState {
  cp = [0, 1, 2, 3, 4, 5, 6, 7];       // corner permutation (8 corners, positions 0-7)
  co = [0, 0, 0, 0, 0, 0, 0, 0];       // corner orientation (0=none, 1=CW, 2=CCW)
  ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // edge permutation (12 edges)
  eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];   // edge orientation (0=ok, 1=flipped)
}
```

- Cubie model is primary (permutation + orientation arrays).
- Sticker model (6×9 array) is secondary — derived on demand via `toStickers()`. Never edit sticker model directly.
- Corner positions: URF=0, UFL=1, ULB=2, UBR=3, DFR=4, DLF=5, DBL=6, DRB=7
- Edge positions: UR=0, UF=1, UL=2, UB=3, DR=4, DF=5, DL=6, DB=7, FR=8, FL=9, BL=10, BR=11
- Corner orientation: mod 3 always. Edge orientation: mod 2 always. Apply AFTER every move.

**Move definitions:**
- 18 total: 6 faces × 3 variants (CW, CCW, double)
- Define only 6 base moves as permutation cycles + orientation deltas
- Derive inverse by reversing cycle + negating orientations
- Derive double by applying base twice
- U/D: no orientation change. R/L: corner orientation only. F/B: both corner and edge orientation.

**State validation (4 invariant checks):**
- Permutation parity: corner parity must equal edge parity
- Corner orientation sum: `sum(co) mod 3 === 0`
- Edge orientation sum: `sum(eo) mod 2 === 0`
- Unique pieces: each piece ID appears exactly once

### Data flow
- **In-memory:** CubeState, current coaching state, animation queue, timer state, session runner state
- **Persisted (AsyncStorage):**
  - `@cubecoach/progression` — current stage, per-stage attempt arrays, unlock timestamps
  - `@cubecoach/streak` — current count, longest count, last session date
  - `@cubecoach/solves` — all timed solve records (timestamp, timeMs, scramble, DNF flag). Keep last 1,000, trim on launch.
  - `@cubecoach/sessions` — session logs (date, duration, blocks completed, abandoned flag)
  - `@cubecoach/settings` — notification time, color scheme, session length, cue timing
  - `@cubecoach/personalBest` — best solve time per category (full, cross-only, F2L-only)
  - `@cubecoach/onboarding` — completed flag (prevents re-showing onboarding)
- **Handoff between screens:** React Navigation params for session type. Progression state read from AsyncStorage on screen mount.
- **Storage rules:** Typed Store wrapper handles JSON serialization, error handling, `update()` with callback to prevent race conditions. Both session and practice attempts feed progression. Practice does NOT count for streaks.

### Complete file structure
```
src/
  engine/                          # PART 1
    constants.js                   # Corner/edge/face enums
    CubeState.js                   # Core class: state, clone, equals, serialize
    moves.js                       # 6 base moves + derivation of all 18
    validation.js                  # 4 invariant checks
    scrambler.js                   # Random scramble generator
    stickers.js                    # Cubie-to-sticker conversion
    classifiers/
      whiteCross.js                # Stage 1
      firstLayer.js                # Stage 2
      f2l.js                       # Stage 3 + F2L
      oll.js                       # Two-look OLL (7 groups, not 57)
      pll.js                       # Two-look PLL (6 groups, not 21)
    solvers/
      beginnerSolver.js            # Stage-by-stage solver (powers coaching)
      kociemba.js                  # Kociemba JS port wrapper (scrambles + optimal)
    index.js                       # Public API exports

  renderer/                        # PART 2
    CubeScene.js                   # Three.js scene, camera, lights
    CubieMeshFactory.js            # 26 cubie meshes
    MoveAnimator.js                # Animation queue + group rotation
    Highlighter.js                 # Piece glow/pulse
    ArrowOverlay.js                # Move arrows + positioning
    colorMap.js                    # Sticker values → hex colors
    constants.js                   # CUBIE_SIZE, durations

  coaching/                        # PART 3
    StuckDetector.js               # Idle detection + escalation
    CueLibrary.js                  # All cue strings by stage
    CueSelector.js                 # Picks cue from state + history
    MoveValidator.js               # Hybrid validation
    DemoPlayer.js                  # Animated demo playback
    stages/
      StageConfig.js               # Shared interface
      Stage1Cross.js ... Stage7PLLEdges.js
    scramblers/
      fullScramble.js              # Stage 1
      crossPreserving.js           # Stage 2
      firstLayerPreserving.js      # Stage 3
      lastLayerOnly.js             # Stages 4-7

  coaching/f2l/                    # PART 5
    F2LCoach.js                    # Pair detection + cues
    F2LScrambler.js                # Cross-preserving scrambler
    pairDefinitions.js             # Corner-edge mappings

  coaching/algorithms/             # PART 5
    AlgorithmDrill.js              # Rep-based practice
    CaseFlashcardDrill.js          # Weighted flashcards
    caseDefinitions.js             # OLL+PLL case data
    algorithmData.js               # Move sequences + inverses

  session/                         # PART 4
    SessionRunner.js               # State machine + timer
    SessionTemplate.js             # 5 phase templates
    activities/
      TimedAttempts.js, CoachModeActivity.js,
      FullSolveActivity.js, AlgorithmDrill.js,
      CaseRecognition.js, InspectionPractice.js

  timer/                           # PART 4
    SolveTimer.js                  # performance.now() timing
    PauseDetector.js               # Sub-second pause detection

  progression/                     # PARTS 3-4
    ProgressionEngine.js           # Unlock + regression logic
    AttemptStore.js                # Persistence wrapper
    StreakTracker.js               # Daily streak logic

  progress/                        # PARTS 4-5
    PersonalBest.js, SolveHistory.js
    insights/InsightEngine.js, insightRules.js

  storage/                         # PART 4
    Store.js                       # AsyncStorage wrapper
    schema.js                      # Key definitions + defaults
    migrations.js                  # Schema versioning

  screens/                         # PARTS 4-5
    HomeScreen.js, SessionScreen.js, PracticeScreen.js,
    ProgressScreen.js, AlgorithmLibraryScreen.js,
    SessionReviewScreen.js, SettingsScreen.js
    onboarding/
      OnboardingFlow.js, HookScreen.js, PromiseScreen.js,
      MethodScreen.js, AskScreen.js, FirstMoveScreen.js

  components/CubeView.js, MoveButtons.js   # PART 2
  ui/animations/confetti.js, celebrations.js # PART 5
  ui/theme.js                               # PART 5
  navigation/AppNavigator.js                # PART 4

  __tests__/                       # ALL PARTS
    moves.test.js, validation.test.js, classifiers.test.js,
    solver.test.js, stuckDetector.test.js, progression.test.js,
    scramblers.test.js, moveValidator.test.js, f2l.test.js

assets/icon.png, splash.png, sounds/       # PART 5
```

**File layering rule:** No file from an earlier part is modified by a later part. Later parts only add files and import from earlier ones.

---

## SECTION 3 — What Works (Verified)
- (Nothing yet — move items here only when verified in code on a real device.)

---

## SECTION 4 — What Broke + Why

1. **All 18 moves had CW/CCW swapped.** Every base move cycle in `moves.js` was listed in the wrong direction — our "R" was actually standard R', etc. Classifiers and `toStickers()` produced wrong results, which is how it was caught. Session 1 tests didn't detect it because they only checked internal consistency (4x identity, move+inverse), not absolute direction. **Root cause:** The cycle convention `new[cycle[i]] = old[cycle[(i+1)%n]]` was applied with cycles listed in the wrong winding order. **Fix:** Swapped `MOVE_DEFS[face]` and `MOVE_DEFS[face + "'"]` so the inverted definition (correct CW) is assigned to the CW slot.

2. **B move had wrong corner orientation deltas.** `orient: [2, 1, 2, 1]` should have been `[1, 2, 1, 2]`. This was a separate data-entry error from bug #1. After fixing the cycle direction, B still didn't match cubejs. **Root cause:** The B corner twist pattern was entered as the mirror of what it should be. **Fix:** Changed orient array in `BASE_MOVES.B.corners`.

3. **OLL corner "sexy move" technique doesn't reliably restore the first layer.** Applying R' D' R D repeatedly at DFR to orient corners only restores the full cube when the total application count is a multiple of 6. For valid cube states, the total is always a multiple of 3 but NOT always a multiple of 6. **Root cause:** The sexy move has order 6 on the full cube; 3 applications fix orientations but scramble permutations. **Fix:** Replaced algorithm-based OLL/PLL with Kociemba for the entire last layer.

### Recurring failure patterns
- **Cycle/orientation data-entry errors** (bugs #1 and #2). Always verify new move definitions against cubejs output, not just internal consistency tests.

### Known gotchas from implementation guide (not yet encountered)
These are pre-documented pitfalls. Move to "What Broke + Why" with real details when actually hit:

**Engine (Part 1):**
- ~~Cycle direction confusion — moves backward vs standard notation → R = clockwise looking at right face, verify against physical cube~~ **[HIT — see bug #1 above]**
- Orientation overflow — corner orientations drift above 2 after many moves → always mod 3 corners, mod 2 edges AFTER every move
- Off-by-one in parity — validation rejects valid scrambles → use counting-inversions algorithm, test with known even/odd permutations
- Solver infinite loops — beginner solver hangs on certain scrambles → add 200-move hard cap, log state for debugging
- Reference vs value copy — undo/redo corrupts state → always use `array.slice()` for deep copy, not assignment

**Renderer (Part 2):**
- expo-gl context lost — cube disappears after app backgrounds → listen for AppState changes, re-create GL context on foreground
- Coordinate confusion — R move rotates wrong face/direction → Three.js right-hand coords: +X right, +Y up, +Z toward camera
- `attach()` vs `add()` — cubies jump to wrong positions during animation → always use `attach()`, never `add()`. `attach()` preserves world transform.
- Missing `gl.endFrameEXP()` — black screen, no rendering → must call at end of every render loop iteration
- Floating-point drift — cubies drift off-grid after many moves → snap positions + rotations after EVERY move completes
- Material array ordering — colors on wrong faces → BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z. Test with single cubie.

**Coaching (Part 3):**
- Scrambler breaks pre-solved layers → assert pre-solved layers intact after every scramble, regenerate if not
- Strict validation frustrates users → use hybrid approach, only penalize moves that break solved pieces
- Cue fires too fast → 30 sec minimum idle before first cue
- Demo doesn't reset cube → store pre-demo state, reset to it after demo
- Stuck detector races with animations → pause idle timer during animations, resume when queue empty
- Progression double-counts demos → only count user-completed attempts, exclude demo completions

**Sessions (Part 4):**
- Timer drift → use `performance.now()` delta calculation, not interval counting
- AsyncStorage race conditions → serialize writes through Store wrapper, use `update()` with callback
- Session lost on background → persist session state on every block transition and on app background
- Streak timezone bugs → always use device local date, never UTC for streak calculations

**Deploy (Part 5):**
- F2L scrambler breaks cross → only apply non-D-layer moves, validate cross after every scramble
- EAS build fails on expo-gl → add expo-gl to plugins in `app.json`
- Onboarding shows every launch → check `@cubecoach/onboarding.completed` before showing

---

## SECTION 5 — Coding Rules
- Pure JS for the engine — no UI dependencies, no framework imports. Must be fully testable without a device.
- Cubie model is primary. Sticker model is derived via `toStickers()`. Never edit stickers directly.
- Always mod 3 corner orientation, mod 2 edge orientation AFTER every move application.
- Always `array.slice()` for state copies, never assignment.
- Always `attach()` not `add()` when grouping/ungrouping cubies for animation.
- Always call `gl.endFrameEXP()` at end of every render loop.
- Always snap cubie positions to nearest integer and rotations to nearest 90° after every move animation.
- Animation queue is non-negotiable — never let two move animations overlap.
- Max 15 words per coaching cue. No cube notation in beginner phases — use color names ("the red-blue corner") not position names ("the URF corner").
- Only one cue visible at a time. Auto-dismiss after 8 seconds or on next move.
- Use `performance.now()` for all timing, never `setInterval`.
- Pin Three.js version at project start. Do not upgrade mid-build. r158+ recommended.
- Scrambler for any stage must validate that pre-solved layers are intact. Regenerate if not.

---

## SECTION 6 — Roadmap

### Completed
- **Session 1 (Part 1):** Cube state engine — CubeState class, 18 moves, validation, scrambler. 143 tests. Exit gate passed.
- **Session 2 (Part 1→2 bridge):** Classifiers (whiteCross, firstLayer, f2l, oll, pll), `toStickers()`, beginner solver (IDDFS + Kociemba hybrid), Kociemba wrapper. 50 additional tests (193 total). Fixed critical move cycle direction bug and B orientation bug. Exit gate passed: 5 classifiers correct on 5+ states each, beginner solver 50/50, Kociemba 20/20 under 25 moves.

### Active now
- **Goal:** 3D rendering (Part 2, Session 3)
- **Exit criteria:**
  - Static 3D cube renders on screen with correct sticker colors from `toStickers()`
  - Touch orbit (rotate camera around cube)
  - Full move animation pipeline (queue-based, one at a time, 200-300ms easeInOutCubic)
  - Piece highlighting (glow/pulse on specified cubies)
  - Move arrows (overlay showing direction)
  - Snap positions + rotations after every animation completes
- **Non-goals:** No coaching logic, no session structure, no persistence. Rendering only.
- **Dependencies:** `toStickers()` is ready. Need to install expo-gl + three.js.

### Next
- **Session 4 (Part 2→3 bridge):** Touch-to-move input, move buttons, CubeView component wrapping the scene

### Later
- Sessions 4–6: Coaching system (Part 3) — all 7 stages, stuck detection, progression engine
- Sessions 7–8: Session structure & progress (Part 4) — 5-min sessions, timer, streaks, dashboard
- Sessions 9–12: Advanced modules & deploy (Part 5) — F2L, OLL+PLL, onboarding, TestFlight

### Operating rules
- Dependencies are strictly linear: Part N depends on Part N-1, never the reverse.
- Do not start the next session until the current one's "Done When" gate passes.
- Code progress > waiting on data collection.
- Build what can be tested now. Don't build UI for systems that don't exist yet.

---

## SECTION 7 — Validation

### Current dataset size
- None yet

### Validation target
- **Engine:** 100 scrambles validated, 50 beginner-solver solves, 20 Kociemba solves under 25 moves
- **Classifiers:** 5+ known states per classifier returning correct results
- **Coaching:** 100 scrambles per stage with pre-solved layers intact
- **Product (ultimate test):** A person who has never solved a Rubik's cube can follow the app from onboarding through all 7 beginner stages to their first complete solve

### Labeling system
- **Trusted** = verified in code on a real device with real user interaction
- **Noisy** = runs technically but not validated with real usage or edge cases
- **Broken** = known to fail, produce wrong output, or crash

### Current failure modes
- N/A — no code to fail yet

### Next validation milestone
- Session 1 exit gate: all 18 moves pass 4x identity test, validation catches corrupted states, 100 scrambles all valid

---

## SECTION 8 — Open Questions

### Blocks current work
- What Node version is on the dev machine? (Needed before `create-expo-app`)
- What is the latest stable Expo SDK version? (Verify before project creation)
- Does the dev machine have Xcode 16+ installed? (Needed for iOS builds eventually)

### Answer when data arrives
- Does cubejs work in React Native / Expo, or does it need a different Kociemba port? (Answer during Session 2)
- Will expo-gl + Three.js hit 60fps with 26 cubies + animation on older iOS devices like iPhone SE? (Answer during Session 3)
- Is 5 minutes the right session length for daily habit formation? (Answer from tester feedback)
- Does the hybrid move validator feel fair, or does it confuse users? (Answer from tester feedback)

---

## SECTION 9 — Reference Constants

| Item | Value |
|------|-------|
| Cube faces | 6 (U, D, R, L, F, B) |
| Cubies | 26 (8 corners + 12 edges + 6 centers) |
| Total moves | 18 (6 faces × 3 variants) |
| Corner positions | 8 (URF=0, UFL=1, ULB=2, UBR=3, DFR=4, DLF=5, DBL=6, DRB=7) |
| Edge positions | 12 (UR=0, UF=1, UL=2, UB=3, DR=4, DF=5, DL=6, DB=7, FR=8, FL=9, BL=10, BR=11) |
| Corner orientation range | 0, 1, 2 (mod 3) |
| Edge orientation range | 0, 1 (mod 2) |
| Cubie mesh size | 0.95 (gap = 0.025 for black plastic look) |
| Cubie grid positions | -1 to 1 on each axis, skip (0,0,0) |
| Camera position | (4, 3, 4) looking at origin |
| Ambient light | 0.6 intensity |
| Key light | 0.8 from upper-right |
| Fill light | 0.3 from lower-left |
| Move animation duration | 200–300ms, easeInOutCubic |
| Sticker colors | U/+Y=#FFFFFF, D/-Y=#FFD500, R/+X=#B71234, L/-X=#FF5800, F/+Z=#009B48, B/-Z=#0046AD |
| Idle cue threshold | 30s (highlight), 60s (text cue), 90s (break prompt) |
| Consecutive failure demo trigger | 5 failures in a row |
| Cue max length | 15 words |
| Cue auto-dismiss | 8 seconds or on next move |
| Unlock threshold | 80% over last 10 attempts (85% for Phase 3) |
| Regression threshold | <60% over last 5 on previously-passed stage |
| Session duration | 5 min (3 blocks: warmup/core/cooldown) |
| Streak credit threshold | 70% session completion (3:30 of 5:00) |
| Streak milestones | 3, 7, 14, 30, 60 days |
| Solve history retention | Last 1,000 solves, trim on launch |
| Scramble length | 20–25 random moves |
| Solver hard cap | 200 moves (beginner solver) |
| Kociemba target | Under 25 moves per solve |
| Two-look OLL cases | 7 groups |
| Two-look PLL cases | 6 groups |
| Total algorithms (V1) | 13 |
| Case recognition target | Under 2 seconds |
| Theme primary | #E67E22 (orange) |
| Theme secondary | #2C3E50 (dark slate) |
| Theme accent | #2980B9 (blue) |
| Theme success | #27AE60 (green) |
| Theme error | #C0392B (red) |
| Theme background | #F8F9FA |
| Theme cards | #FFFFFF |

---

## Success Metrics (V1)

| Metric | Target | What It Tells You |
|--------|--------|-------------------|
| Day 7 retention | ≥40% return after 7 days | Daily session habit is sticking |
| Stage completion rate | ≥60% complete all 7 beginner stages | Coaching keeps people moving forward |
| First solve rate | ≥80% complete first full solve within 3 sessions | Onboarding-to-coaching flow works |
| Sub-60 rate | ≥30% of Phase 3 users hit sub-60 in 30 days | Advanced modules deliver real speed gains |
| Session completion | ≥70% of started sessions completed | Session length and difficulty are right |
| Cue effectiveness | Success rate improves ≥15% in 3 attempts after cue | Cues are actually helping |

---

*Fill this document as you go. Every session should leave it more accurate than it started.*
