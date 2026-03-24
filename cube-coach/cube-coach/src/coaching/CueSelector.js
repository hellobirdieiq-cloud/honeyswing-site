/**
 * CueSelector — picks a contextual cue based on stage, cube state, and stuck level.
 *
 * Generic for all 7 stages. Uses CueLibrary for stage-specific text.
 */
const { STAGE_CUES } = require('./CueLibrary');

function pickAvoidRepeat(arr, lastCue) {
  if (!arr || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  let pick;
  do {
    pick = arr[Math.floor(Math.random() * arr.length)];
  } while (pick === lastCue);
  return pick;
}

/**
 * Select a cue for any stage.
 *
 * @param {string} stageId - e.g. 'stage1_cross'
 * @param {CubeState} state - current state (unused for generic cues, available for future)
 * @param {'highlight' | 'cue' | 'prompt'} level
 * @param {string | null} lastCue
 * @returns {{ text: string }}
 */
function selectCue(stageId, state, level, lastCue) {
  const cues = STAGE_CUES[stageId];
  if (!cues) return { text: 'Keep going!' };

  if (level === 'prompt') {
    return { text: pickAvoidRepeat(cues.prompt, lastCue) };
  }

  // 'highlight' and 'cue' both use stuck cues (highlight is gentler but same text pool)
  return { text: pickAvoidRepeat(cues.stuck, lastCue) };
}

module.exports = { selectCue };
