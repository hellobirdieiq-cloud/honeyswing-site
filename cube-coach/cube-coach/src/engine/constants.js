// Corner positions
const URF = 0;
const UFL = 1;
const ULB = 2;
const UBR = 3;
const DFR = 4;
const DLF = 5;
const DBL = 6;
const DRB = 7;

// Edge positions
const UR = 0;
const UF = 1;
const UL = 2;
const UB = 3;
const DR = 4;
const DF = 5;
const DL = 6;
const DB = 7;
const FR = 8;
const FL = 9;
const BL = 10;
const BR = 11;

// Face identifiers
const FACES = ['U', 'D', 'R', 'L', 'F', 'B'];

// All 18 move names: U, U', U2, D, D', D2, ...
const MOVE_NAMES = [];
for (const f of FACES) {
  MOVE_NAMES.push(f, f + "'", f + '2');
}

// Face indices (for sticker model)
const U_FACE = 0;
const D_FACE = 1;
const R_FACE = 2;
const L_FACE = 3;
const F_FACE = 4;
const B_FACE = 5;

const NUM_CORNERS = 8;
const NUM_EDGES = 12;

module.exports = {
  URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB,
  UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR,
  U_FACE, D_FACE, R_FACE, L_FACE, F_FACE, B_FACE,
  FACES, MOVE_NAMES, NUM_CORNERS, NUM_EDGES,
};
