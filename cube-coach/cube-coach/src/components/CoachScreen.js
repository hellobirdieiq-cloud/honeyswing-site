/**
 * CoachScreen — full coaching loop with progression, demo, and layered hints.
 *
 * Hint escalation:
 *   0s  → highlight target piece immediately
 *   30s → show tappable arrow for the correct move (from HintFinder)
 *   60s → show text cue
 *   90s → prompt / demo trigger
 *
 * Input: color-coded face buttons (tap=CW, long-press=CCW).
 * Tapping the arrow also executes the hinted move.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CubeView from './CubeView';
import FaceButtons from './FaceButtons';
import { CubeState } from '../engine/CubeState';
import { ALL_STAGES } from '../coaching/stages';
import { StuckDetector } from '../coaching/StuckDetector';
import { DemoPlayer } from '../coaching/DemoPlayer';
import { validateMove } from '../coaching/MoveValidator';
import { selectCue } from '../coaching/CueSelector';
import { findNextMove } from '../coaching/HintFinder';
import { shouldUnlock, checkRegression } from '../progression/ProgressionEngine';

const CUE_DISMISS_MS = 8000;

export default function CoachScreen() {
  const cubeRef = useRef(null);
  const stuckRef = useRef(null);
  const demoRef = useRef(null);
  const cubeStateRef = useRef(new CubeState());
  const scrambleStateRef = useRef(null);
  const lastCueRef = useRef(null);
  const cueTimerRef = useRef(null);
  const readyRef = useRef(false);
  const attemptsRef = useRef(ALL_STAGES.map(() => []));
  const moveCountRef = useRef(0);
  const hintMoveRef = useRef(null); // current arrow hint move name

  const [stageIdx, setStageIdx] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);
  const [cueText, setCueText] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState({ count: 0, total: 4 });
  const [demoActive, setDemoActive] = useState(false);
  const [unlockCelebration, setUnlockCelebration] = useState(null);
  const [arrowHintVisible, setArrowHintVisible] = useState(false);

  const stage = ALL_STAGES[stageIdx];

  const showCue = useCallback((text) => {
    setCueText(text);
    lastCueRef.current = text;
    if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
    cueTimerRef.current = setTimeout(() => setCueText(null), CUE_DISMISS_MS);
  }, []);

  // Clear all hints (highlight, arrow, cue)
  const clearHints = useCallback(() => {
    cubeRef.current?.clearHighlight();
    cubeRef.current?.hideArrow();
    setCueText(null);
    setArrowHintVisible(false);
    hintMoveRef.current = null;
  }, []);

  // Show immediate highlight on the target piece for the current state
  const showTargetHighlight = useCallback(() => {
    const state = cubeStateRef.current;
    const classResult = stage.classify(state);
    // Find first unsolved piece and highlight it
    // For edges (stages 1,3,4,7): use unsolved edges
    // For corners (stages 2,5,6): use unsolved corners
    // Generic: use the classifier's unsolved/wrong arrays
    const unsolved = classResult.unsolved || classResult.cornersUnsolved ||
                     classResult.edgesUnsolved || classResult.cornersWrong ||
                     classResult.edgesWrong;
    if (unsolved && unsolved.length > 0) {
      // Find where this piece is in the cube
      const pieceIdx = unsolved[0];
      // Search ep or cp for the piece's current position
      const isCorner = (classResult.cornersUnsolved || classResult.cornersWrong) &&
                       (unsolved === classResult.cornersUnsolved || unsolved === classResult.cornersWrong);
      let gridPos = null;
      if (isCorner) {
        for (let i = 0; i < 8; i++) {
          if (state.cp[i] === pieceIdx) {
            gridPos = cornerPosToGrid(i);
            break;
          }
        }
      } else {
        for (let i = 0; i < 12; i++) {
          if (state.ep[i] === pieceIdx) {
            gridPos = edgePosToGrid(i);
            break;
          }
        }
      }
      if (gridPos) cubeRef.current?.showHighlight([gridPos]);
    }
  }, [stage]);

  // Stuck detector — layered escalation
  useEffect(() => {
    const detector = new StuckDetector();
    detector.onThreshold = (level) => {
      if (demoRef.current?.isPlaying) return;

      if (level === 'arrow') {
        // Show tappable arrow for the best next move
        const hint = findNextMove(cubeStateRef.current, stage.classify);
        if (hint) {
          hintMoveRef.current = hint.move;
          cubeRef.current?.showArrow(hint.move);
          setArrowHintVisible(true);
        }
      } else if (level === 'cue') {
        const result = selectCue(stage.id, cubeStateRef.current, level, lastCueRef.current);
        showCue(result.text);
      } else if (level === 'prompt') {
        const result = selectCue(stage.id, cubeStateRef.current, level, lastCueRef.current);
        showCue(result.text);
      }
    };
    stuckRef.current = detector;

    const interval = setInterval(() => {
      if (stuckRef.current) stuckRef.current.update(performance.now());
    }, 1000);

    return () => {
      clearInterval(interval);
      if (cueTimerRef.current) clearTimeout(cueTimerRef.current);
    };
  }, [stage, showCue]);

  // Demo player
  useEffect(() => {
    const demo = new DemoPlayer();
    demo.onDemoStart = () => setDemoActive(true);
    demo.onDemoMove = (move) => cubeRef.current?.enqueueMove(move);
    demo.onDemoEnd = (preDemoState) => {
      setDemoActive(false);
      showCue('Your turn — try again!');
      scrambleStateRef.current = preDemoState;
      cubeStateRef.current = preDemoState.clone();
      moveCountRef.current = 0;
      readyRef.current = true;
      if (stuckRef.current) stuckRef.current.start(performance.now());
      showTargetHighlight();
    };
    demoRef.current = demo;
    return () => demo.stop();
  }, [showCue, showTargetHighlight]);

  // Record attempt + check progression
  const recordAttempt = useCallback((success) => {
    attemptsRef.current[stageIdx].push({ success, timeMs: 0, isDemo: false });

    if (success) {
      demoRef.current?.recordSuccess();
      if (stageIdx === highestUnlocked && stageIdx < 6) {
        const result = shouldUnlock(attemptsRef.current[stageIdx], stageIdx);
        if (result.unlock) {
          setHighestUnlocked(stageIdx + 1);
          setUnlockCelebration(ALL_STAGES[stageIdx + 1].name);
          setTimeout(() => setUnlockCelebration(null), 3000);
        }
      }
    } else {
      const shouldDemo = demoRef.current?.recordFailure();
      if (shouldDemo && scrambleStateRef.current) {
        showCue('Showing you the solution...');
        readyRef.current = false;
        clearHints();
        demoRef.current.startDemo(scrambleStateRef.current);
      }
      if (stageIdx < highestUnlocked) {
        const reg = checkRegression(attemptsRef.current[stageIdx]);
        if (reg.regressed) showCue("Let's practice this stage a bit more");
      }
    }
  }, [stageIdx, highestUnlocked, showCue, clearHints]);

  // Start new scramble
  const startNewScramble = useCallback(() => {
    setComplete(false);
    setFeedback(null);
    clearHints();
    readyRef.current = false;
    moveCountRef.current = 0;

    if (demoRef.current?.isPlaying) demoRef.current.stop();

    const { state: scrambled } = stage.scramble();
    cubeStateRef.current = scrambled;
    scrambleStateRef.current = scrambled.clone();

    const classResult = stage.classify(scrambled);
    setProgress({
      count: classResult[stage.progressField] || classResult.count || 0,
      total: stage.progressTotal || 4,
    });

    setTimeout(() => {
      readyRef.current = true;
      if (stuckRef.current) stuckRef.current.start(performance.now());
      // Immediately highlight target piece
      showTargetHighlight();
    }, 300);
  }, [stage, clearHints, showTargetHighlight]);

  useEffect(() => {
    const timer = setTimeout(startNewScramble, 400);
    return () => clearTimeout(timer);
  }, [startNewScramble]);

  // Execute a move (from buttons or arrow tap)
  const executeMove = useCallback((moveName) => {
    if (complete || !readyRef.current || demoActive) return;

    const currentState = cubeStateRef.current;
    const result = validateMove(currentState, moveName, stage.classify);

    cubeRef.current?.enqueueMove(moveName);
    cubeStateRef.current = result.newState;
    moveCountRef.current++;

    // Clear hints on any move, then re-show highlight for new target
    clearHints();
    if (stuckRef.current) stuckRef.current.onMove(performance.now());

    if (result.reason === 'progress') {
      setFeedback('good');
      setTimeout(() => setFeedback(null), 400);
    }

    const classResult = stage.classify(result.newState);
    setProgress({
      count: classResult[stage.progressField] || classResult.count || 0,
      total: stage.progressTotal || 4,
    });

    if (stage.isComplete(result.newState)) {
      setComplete(true);
      clearHints();
      recordAttempt(true);
    } else {
      // Re-highlight next target after a short delay (let animation start)
      setTimeout(() => showTargetHighlight(), 50);
    }
  }, [complete, demoActive, stage, clearHints, recordAttempt, showTargetHighlight]);

  // Arrow tap handler — executes the hinted move
  const handleArrowTap = useCallback(() => {
    if (hintMoveRef.current) {
      executeMove(hintMoveRef.current);
    }
  }, [executeMove]);

  const handleGiveUp = useCallback(() => {
    recordAttempt(false);
    startNewScramble();
  }, [recordAttempt, startNewScramble]);

  const handleStageChange = useCallback((idx) => {
    if (idx > highestUnlocked) return;
    if (demoRef.current?.isPlaying) demoRef.current.stop();
    setStageIdx(idx);
  }, [highestUnlocked]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{stage.name}</Text>
        <Text style={styles.progress}>{progress.count} / {progress.total}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageBar}>
        {ALL_STAGES.map((s, idx) => {
          const locked = idx > highestUnlocked;
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.stageTab, idx === stageIdx && styles.stageTabActive, locked && styles.stageTabLocked]}
              onPress={() => handleStageChange(idx)}
              disabled={locked}
            >
              <Text style={[styles.stageTabText, idx === stageIdx && styles.stageTabTextActive, locked && styles.stageTabTextLocked]}>
                {locked ? '🔒' : idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {unlockCelebration && (
        <View style={styles.celebrationBanner}>
          <Text style={styles.celebrationText}>Stage Unlocked: {unlockCelebration}!</Text>
        </View>
      )}

      <View style={[styles.cubeContainer, feedback === 'good' && styles.feedbackGood, demoActive && styles.demoOutline]}>
        <CubeView ref={cubeRef} cubeState={cubeStateRef.current} style={styles.cube} />
        {demoActive && (
          <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>DEMO</Text></View>
        )}
      </View>

      {/* Tappable arrow hint indicator */}
      {arrowHintVisible && !demoActive && (
        <TouchableOpacity style={styles.arrowHintBar} onPress={handleArrowTap} activeOpacity={0.7}>
          <Text style={styles.arrowHintText}>Tap arrow on cube to execute hint</Text>
        </TouchableOpacity>
      )}

      {cueText && (
        <View style={styles.cueContainer}>
          <Text style={styles.cueText}>{cueText}</Text>
        </View>
      )}

      {complete ? (
        <View style={styles.completeContainer}>
          <Text style={styles.completeText}>
            {stageIdx === 6 ? 'Cube Solved!' : stage.name + ' Complete!'}
          </Text>
          <View style={styles.completeButtons}>
            <TouchableOpacity style={styles.newButton} onPress={startNewScramble}>
              <Text style={styles.newButtonText}>Again</Text>
            </TouchableOpacity>
            {stageIdx < highestUnlocked && stageIdx < 6 && (
              <TouchableOpacity style={[styles.newButton, styles.nextButton]} onPress={() => handleStageChange(stageIdx + 1)}>
                <Text style={styles.newButtonText}>Next Stage</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : demoActive ? (
        <View style={styles.demoFooter}>
          <Text style={styles.demoText}>Watching solution demo...</Text>
          <TouchableOpacity style={styles.skipButton} onPress={() => demoRef.current?.stop()}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <FaceButtons onMove={executeMove} />
          <TouchableOpacity style={styles.giveUpButton} onPress={handleGiveUp}>
            <Text style={styles.giveUpText}>Skip Scramble</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Helper: edge position → grid coordinates
function edgePosToGrid(pos) {
  const map = [
    {x:1,y:1,z:0},{x:0,y:1,z:1},{x:-1,y:1,z:0},{x:0,y:1,z:-1},
    {x:1,y:-1,z:0},{x:0,y:-1,z:1},{x:-1,y:-1,z:0},{x:0,y:-1,z:-1},
    {x:1,y:0,z:1},{x:-1,y:0,z:1},{x:-1,y:0,z:-1},{x:1,y:0,z:-1},
  ];
  return map[pos] || {x:0,y:0,z:0};
}

// Helper: corner position → grid coordinates
function cornerPosToGrid(pos) {
  const map = [
    {x:1,y:1,z:1},{x:-1,y:1,z:1},{x:-1,y:1,z:-1},{x:1,y:1,z:-1},
    {x:1,y:-1,z:1},{x:-1,y:-1,z:1},{x:-1,y:-1,z:-1},{x:1,y:-1,z:-1},
  ];
  return map[pos] || {x:0,y:0,z:0};
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    paddingTop: 60, paddingBottom: 4, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  progress: { fontSize: 16, color: '#aaaaaa' },
  stageBar: { flexGrow: 0, paddingHorizontal: 12, paddingVertical: 6 },
  stageTab: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 4,
  },
  stageTabActive: { backgroundColor: '#E67E22' },
  stageTabLocked: { backgroundColor: 'rgba(255,255,255,0.03)' },
  stageTabText: { fontSize: 14, fontWeight: '700', color: '#888888' },
  stageTabTextActive: { color: '#ffffff' },
  stageTabTextLocked: { color: '#444444', fontSize: 12 },
  celebrationBanner: {
    backgroundColor: '#27AE60', marginHorizontal: 12, borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  celebrationText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  cubeContainer: {
    flex: 1, borderWidth: 3, borderColor: 'transparent', borderRadius: 8, margin: 4,
  },
  feedbackGood: { borderColor: '#27AE60' },
  demoOutline: { borderColor: '#2980B9' },
  cube: { flex: 1 },
  demoBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#2980B9', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  demoBadgeText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  arrowHintBar: {
    backgroundColor: 'rgba(255, 204, 0, 0.15)', marginHorizontal: 12, borderRadius: 8,
    paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,204,0,0.3)',
  },
  arrowHintText: { color: '#ffcc00', fontSize: 14, fontWeight: '600' },
  cueContainer: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 12, borderRadius: 10, marginBottom: 4,
  },
  cueText: { fontSize: 16, color: '#E67E22', textAlign: 'center', fontWeight: '500' },
  completeContainer: { alignItems: 'center', paddingVertical: 24, gap: 16 },
  completeText: { fontSize: 24, fontWeight: '700', color: '#27AE60' },
  completeButtons: { flexDirection: 'row', gap: 12 },
  newButton: { backgroundColor: '#E67E22', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  nextButton: { backgroundColor: '#2980B9' },
  newButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  demoFooter: { alignItems: 'center', paddingVertical: 20, gap: 12 },
  demoText: { color: '#2980B9', fontSize: 16, fontWeight: '600' },
  skipButton: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  skipButtonText: { color: '#aaaaaa', fontSize: 14, fontWeight: '600' },
  giveUpButton: { alignItems: 'center', paddingVertical: 8 },
  giveUpText: { color: '#666666', fontSize: 13 },
});
