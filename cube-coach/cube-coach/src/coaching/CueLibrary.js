/**
 * CueLibrary — hand-written coaching cue strings for all 7 stages.
 *
 * Rules from CLAUDE.md Section 5:
 *   - Max 15 words per cue
 *   - No cube notation in beginner phases
 *   - Use color names ("the red-blue corner") not positions ("URF")
 *   - Only one cue visible at a time
 */

const STAGE_CUES = {
  stage1_cross: {
    stuck: [
      'Look for a white edge piece on the bottom or sides',
      'Try turning the bottom layer to line up colors',
      'Find a white sticker — that edge needs to go on top',
      'Move the bottom to match the side color with its center',
    ],
    prompt: [
      'Take your time — would you like to see the next step?',
      'Need a hint? Look for any white edge piece',
    ],
    progress: [
      'Nice! Keep building the white cross',
      'Good move — the cross is coming together',
    ],
  },

  stage2_corners: {
    stuck: [
      'Find a white corner piece — it has white and two other colors',
      'Look for white corners on the bottom layer',
      'Line up the corner below its correct spot on top',
      'The colors on the sides must match the center colors',
    ],
    prompt: [
      'Corner pieces have three colors — match them to three centers',
      'Try turning the bottom to position a white corner',
    ],
    progress: [
      'Corner placed! Keep going',
      'Great — the white layer is building up',
    ],
  },

  stage3_middle: {
    stuck: [
      'Look for an edge on the bottom with no yellow sticker',
      'That edge needs to go into the middle layer',
      'Line up the edge color with its matching center first',
      'Turn the bottom to match, then insert left or right',
    ],
    prompt: [
      'Middle edges have no yellow — find one on the bottom',
      'Match the front color to the center, then decide left or right',
    ],
    progress: [
      'Edge inserted! Nice work',
      'The middle layer is coming together',
    ],
  },

  stage4_oll_edges: {
    stuck: [
      'You need to make a yellow cross on the bottom',
      'Look at the yellow pattern — is it a dot, line, or L shape?',
      'Use the edge flip algorithm to change the pattern',
      'Rotate the bottom to align the pattern before the algorithm',
    ],
    prompt: [
      'The yellow cross comes from repeating one algorithm',
      'Dot needs it twice, L-shape or line needs it once',
    ],
    progress: [
      'Getting closer to the yellow cross!',
      'The yellow edges are lining up',
    ],
  },

  stage5_oll_corners: {
    stuck: [
      'Now orient the yellow corners to complete the yellow face',
      'Position an unfinished corner at the front-right of the bottom',
      'Repeat the corner twist until yellow faces down',
      'Then rotate the bottom to bring the next corner over',
    ],
    prompt: [
      'Work on one corner at a time at the front-right position',
      'Keep repeating the twist — it will come around',
    ],
    progress: [
      'Corner oriented! Move to the next one',
      'Yellow face is almost complete',
    ],
  },

  stage6_pll_corners: {
    stuck: [
      'Check if any bottom corner is already in the right spot',
      'Look at the colors — match corners to their side centers',
      'Use the corner swap algorithm to cycle three corners',
      'Position a correct corner in back-left, then swap the others',
    ],
    prompt: [
      'Find one corner where the colors match both adjacent centers',
      'If no corner matches, do the algorithm from any angle',
    ],
    progress: [
      'Corners moving into position!',
      'Almost there — the bottom corners are lining up',
    ],
  },

  stage7_pll_edges: {
    stuck: [
      'The last step — position the bottom edges correctly',
      'Check if one edge is already in the right spot',
      'Put the solved edge at the back, then cycle the other three',
      'You might need the algorithm twice to finish',
    ],
    prompt: [
      'Look for an edge where the color matches the center behind it',
      'If no edge matches, do the algorithm once and check again',
    ],
    progress: [
      'Edges shifting into place!',
      'So close to solving the entire cube!',
    ],
  },
};

module.exports = { STAGE_CUES };
