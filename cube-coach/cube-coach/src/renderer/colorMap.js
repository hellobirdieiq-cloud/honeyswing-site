/**
 * Sticker value → hex color mapping.
 *
 * Sticker values are face indices from constants.js:
 *   U_FACE=0, D_FACE=1, R_FACE=2, L_FACE=3, F_FACE=4, B_FACE=5
 *
 * Colors from CLAUDE.md Section 9:
 *   U/+Y = #FFFFFF (white)
 *   D/-Y = #FFD500 (yellow)
 *   R/+X = #B71234 (red)
 *   L/-X = #FF5800 (orange)
 *   F/+Z = #009B48 (green)
 *   B/-Z = #0046AD (blue)
 */

const STICKER_COLORS = [
  0xffffff, // 0 = U = white
  0xffd500, // 1 = D = yellow
  0xb71234, // 2 = R = red
  0xff5800, // 3 = L = orange
  0x009b48, // 4 = F = green
  0x0046ad, // 5 = B = blue
];

// Interior / black plastic color for faces not exposed as stickers
const INTERIOR_COLOR = 0x111111;

module.exports = { STICKER_COLORS, INTERIOR_COLOR };
