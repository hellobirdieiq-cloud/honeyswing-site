/**
 * Cubie-to-sticker conversion.
 *
 * Produces a 6×9 array (one sub-array per face, 9 stickers each).
 * Face order: U(0), D(1), R(2), L(3), F(4), B(5)  — matches constants.js.
 * Sticker layout per face (looking at it):
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * Each sticker value is a face index (0–5) representing its color.
 */
const {
  U_FACE, D_FACE, R_FACE, L_FACE, F_FACE, B_FACE,
} = require('./constants');

// Corner facelets: for each corner POSITION, three [face, index] pairs.
// Order: [U/D facelet, 2nd facelet CW, 3rd facelet CW]
// Orientation 0 = facelet 0 of the PIECE is in slot 0 of the POSITION.
const CORNER_FACELETS = [
  /* 0 URF */ [[U_FACE, 8], [R_FACE, 0], [F_FACE, 2]],
  /* 1 UFL */ [[U_FACE, 6], [F_FACE, 0], [L_FACE, 2]],
  /* 2 ULB */ [[U_FACE, 0], [L_FACE, 0], [B_FACE, 2]],
  /* 3 UBR */ [[U_FACE, 2], [B_FACE, 0], [R_FACE, 2]],
  /* 4 DFR */ [[D_FACE, 2], [F_FACE, 8], [R_FACE, 6]],
  /* 5 DLF */ [[D_FACE, 0], [L_FACE, 8], [F_FACE, 6]],
  /* 6 DBL */ [[D_FACE, 6], [B_FACE, 8], [L_FACE, 6]],
  /* 7 DRB */ [[D_FACE, 8], [R_FACE, 8], [B_FACE, 6]],
];

// Corner colors: for each corner PIECE, three face-colors in the same
// slot order as CORNER_FACELETS for its home position.
const CORNER_COLORS = [
  /* 0 URF */ [U_FACE, R_FACE, F_FACE],
  /* 1 UFL */ [U_FACE, F_FACE, L_FACE],
  /* 2 ULB */ [U_FACE, L_FACE, B_FACE],
  /* 3 UBR */ [U_FACE, B_FACE, R_FACE],
  /* 4 DFR */ [D_FACE, F_FACE, R_FACE],
  /* 5 DLF */ [D_FACE, L_FACE, F_FACE],
  /* 6 DBL */ [D_FACE, B_FACE, L_FACE],
  /* 7 DRB */ [D_FACE, R_FACE, B_FACE],
];

// Edge facelets: for each edge POSITION, two [face, index] pairs.
// Order: [primary facelet, secondary facelet]
const EDGE_FACELETS = [
  /* 0  UR */ [[U_FACE, 5], [R_FACE, 1]],
  /* 1  UF */ [[U_FACE, 7], [F_FACE, 1]],
  /* 2  UL */ [[U_FACE, 3], [L_FACE, 1]],
  /* 3  UB */ [[U_FACE, 1], [B_FACE, 1]],
  /* 4  DR */ [[D_FACE, 5], [R_FACE, 7]],
  /* 5  DF */ [[D_FACE, 1], [F_FACE, 7]],
  /* 6  DL */ [[D_FACE, 3], [L_FACE, 7]],
  /* 7  DB */ [[D_FACE, 7], [B_FACE, 7]],
  /* 8  FR */ [[F_FACE, 5], [R_FACE, 3]],
  /* 9  FL */ [[F_FACE, 3], [L_FACE, 5]],
  /* 10 BL */ [[B_FACE, 5], [L_FACE, 3]],
  /* 11 BR */ [[B_FACE, 3], [R_FACE, 5]],
];

// Edge colors: for each edge PIECE, two face-colors.
const EDGE_COLORS = [
  /* 0  UR */ [U_FACE, R_FACE],
  /* 1  UF */ [U_FACE, F_FACE],
  /* 2  UL */ [U_FACE, L_FACE],
  /* 3  UB */ [U_FACE, B_FACE],
  /* 4  DR */ [D_FACE, R_FACE],
  /* 5  DF */ [D_FACE, F_FACE],
  /* 6  DL */ [D_FACE, L_FACE],
  /* 7  DB */ [D_FACE, B_FACE],
  /* 8  FR */ [F_FACE, R_FACE],
  /* 9  FL */ [F_FACE, L_FACE],
  /* 10 BL */ [B_FACE, L_FACE],
  /* 11 BR */ [B_FACE, R_FACE],
];

/**
 * Convert a CubeState (cubie model) to a 6×9 sticker array.
 * stickers[face][index] = face-color (0–5).
 */
function toStickers(state) {
  const stickers = [
    new Array(9), new Array(9), new Array(9),
    new Array(9), new Array(9), new Array(9),
  ];

  // Centers are fixed
  stickers[U_FACE][4] = U_FACE;
  stickers[D_FACE][4] = D_FACE;
  stickers[R_FACE][4] = R_FACE;
  stickers[L_FACE][4] = L_FACE;
  stickers[F_FACE][4] = F_FACE;
  stickers[B_FACE][4] = B_FACE;

  // Corners
  for (let pos = 0; pos < 8; pos++) {
    const piece = state.cp[pos];
    const orient = state.co[pos];
    const slots = CORNER_FACELETS[pos];
    const colors = CORNER_COLORS[piece];
    for (let i = 0; i < 3; i++) {
      const [face, idx] = slots[i];
      stickers[face][idx] = colors[(i + orient) % 3];
    }
  }

  // Edges
  for (let pos = 0; pos < 12; pos++) {
    const piece = state.ep[pos];
    const orient = state.eo[pos];
    const slots = EDGE_FACELETS[pos];
    const colors = EDGE_COLORS[piece];
    for (let i = 0; i < 2; i++) {
      const [face, idx] = slots[i];
      stickers[face][idx] = colors[(i + orient) % 2];
    }
  }

  return stickers;
}

/**
 * Convert a CubeState to a cubejs-compatible 54-char facestring.
 * cubejs face order: U R F D L B (each 9 chars, same 0-8 layout).
 */
const CUBEJS_FACE_ORDER = [U_FACE, R_FACE, F_FACE, D_FACE, L_FACE, B_FACE];
const FACE_CHARS = ['U', 'R', 'F', 'D', 'L', 'B'];
// Map our face index (U=0,D=1,R=2,L=3,F=4,B=5) to cubejs char
const FACE_TO_CUBEJS_CHAR = [];
FACE_TO_CUBEJS_CHAR[U_FACE] = 'U';
FACE_TO_CUBEJS_CHAR[D_FACE] = 'D';
FACE_TO_CUBEJS_CHAR[R_FACE] = 'R';
FACE_TO_CUBEJS_CHAR[L_FACE] = 'L';
FACE_TO_CUBEJS_CHAR[F_FACE] = 'F';
FACE_TO_CUBEJS_CHAR[B_FACE] = 'B';

function toCubeJsString(state) {
  const stickers = toStickers(state);
  let s = '';
  for (const face of CUBEJS_FACE_ORDER) {
    for (let i = 0; i < 9; i++) {
      s += FACE_TO_CUBEJS_CHAR[stickers[face][i]];
    }
  }
  return s;
}

module.exports = {
  toStickers,
  toCubeJsString,
  CORNER_FACELETS,
  CORNER_COLORS,
  EDGE_FACELETS,
  EDGE_COLORS,
};
