/**
 * CubieMeshFactory — creates 26 cubie meshes with correct sticker colors.
 *
 * Each cubie is a BoxGeometry at integer coordinates (-1 to 1) with size 0.95.
 * BoxGeometry face order: +X(R), -X(L), +Y(U), -Y(D), +Z(F), -Z(B).
 * Exposed faces get sticker colors; hidden faces get interior black.
 *
 * The sticker mapping uses toStickers() from the engine to determine which
 * color goes on each face of each cubie based on the current CubeState.
 */
const THREE = require('three');
const { CUBIE_SIZE } = require('./constants');
const { STICKER_COLORS, INTERIOR_COLOR } = require('./colorMap');
const { toStickers } = require('../engine/stickers');
const { U_FACE, D_FACE, R_FACE, L_FACE, F_FACE, B_FACE } = require('../engine/constants');

// Map (x, y, z) grid position to which face-sticker-index it exposes on each axis.
// A cubie at (x, y, z) exposes:
//   +X face (R_FACE) if x === 1
//   -X face (L_FACE) if x === -1
//   +Y face (U_FACE) if y === 1
//   -Y face (D_FACE) if y === -1
//   +Z face (F_FACE) if z === 1
//   -Z face (B_FACE) if z === -1

// Sticker index on a face given (row, col) derived from the other two axes.
// Face layout when looking at it from outside:
//   0 1 2
//   3 4 5
//   6 7 8

/**
 * Get the sticker index on a face for a cubie at grid position (x, y, z).
 *
 * For each face, we map the two "other" axes to row/col:
 *   U (+Y): row = 1+z (back=0, front=2), col = 1+x (left=0, right=2)
 *   D (-Y): row = 1-z (front=0, back=2), col = 1+x
 *   R (+X): row = 1-y (top=0, bot=2),    col = 1-z (front=0, back=2)
 *   L (-X): row = 1-y (top=0, bot=2),    col = 1+z (back=0, front=2)
 *   F (+Z): row = 1-y (top=0, bot=2),    col = 1+x (left=0, right=2)
 *   B (-Z): row = 1-y (top=0, bot=2),    col = 1-x (right=0, left=2)
 */
function stickerIndex(face, x, y, z) {
  let row, col;
  switch (face) {
    case U_FACE: row = 1 + z; col = 1 + x; break;
    case D_FACE: row = 1 - z; col = 1 + x; break;
    case R_FACE: row = 1 - y; col = 1 - z; break;
    case L_FACE: row = 1 - y; col = 1 + z; break;
    case F_FACE: row = 1 - y; col = 1 + x; break;
    case B_FACE: row = 1 - y; col = 1 - x; break;
  }
  return row * 3 + col;
}

/**
 * Create materials for one cubie at grid position (x, y, z).
 * Returns an array of 6 MeshStandardMaterial in BoxGeometry face order:
 *   [+X, -X, +Y, -Y, +Z, -Z]
 *
 * @param {number[][]} stickers - 6×9 sticker array from toStickers()
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {THREE.MeshStandardMaterial[]}
 */
function createCubieMaterials(stickers, x, y, z) {
  // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
  const faceMap = [
    { face: R_FACE, exposed: x === 1 },
    { face: L_FACE, exposed: x === -1 },
    { face: U_FACE, exposed: y === 1 },
    { face: D_FACE, exposed: y === -1 },
    { face: F_FACE, exposed: z === 1 },
    { face: B_FACE, exposed: z === -1 },
  ];

  return faceMap.map(({ face, exposed }) => {
    if (!exposed) {
      return new THREE.MeshStandardMaterial({ color: INTERIOR_COLOR });
    }
    const idx = stickerIndex(face, x, y, z);
    const colorValue = stickers[face][idx];
    return new THREE.MeshStandardMaterial({ color: STICKER_COLORS[colorValue] });
  });
}

/**
 * Build all 26 cubie meshes for the given CubeState.
 * Returns { meshes: THREE.Mesh[], group: THREE.Group }.
 * Each mesh has userData.gridPos = {x, y, z} for later identification.
 */
function createCubies(cubeState) {
  const stickers = toStickers(cubeState);
  const geometry = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
  const group = new THREE.Group();
  const meshes = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue; // skip center

        const materials = createCubieMaterials(stickers, x, y, z);
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.position.set(x, y, z);
        mesh.userData.gridPos = { x, y, z };
        group.add(mesh);
        meshes.push(mesh);
      }
    }
  }

  return { meshes, group };
}

/**
 * Update sticker colors on existing cubie meshes for a new CubeState.
 * Avoids recreating geometry — just swaps material colors.
 */
function updateCubieColors(meshes, cubeState) {
  const stickers = toStickers(cubeState);
  const faceList = [R_FACE, L_FACE, U_FACE, D_FACE, F_FACE, B_FACE];
  const exposedCheck = [
    (x) => x === 1,
    (x) => x === -1,
    (_, y) => y === 1,
    (_, y) => y === -1,
    (_, __, z) => z === 1,
    (_, __, z) => z === -1,
  ];

  for (const mesh of meshes) {
    const { x, y, z } = mesh.userData.gridPos;
    for (let i = 0; i < 6; i++) {
      const face = faceList[i];
      const exposed = exposedCheck[i](x, y, z);
      if (exposed) {
        const idx = stickerIndex(face, x, y, z);
        const colorValue = stickers[face][idx];
        mesh.material[i].color.setHex(STICKER_COLORS[colorValue]);
      } else {
        mesh.material[i].color.setHex(INTERIOR_COLOR);
      }
    }
  }
}

module.exports = { createCubies, updateCubieColors, stickerIndex };
