/**
 * MoveAnimator — queue-based move animation pipeline.
 *
 * For each move:
 *   1. Select 9 cubies on the moving face by grid position
 *   2. attach() them to a temporary pivot group
 *   3. Animate pivot rotation (90° or 180°) over 250ms with easeInOutCubic
 *   4. scene.attach() cubies back to the cube group
 *   5. Apply CubeState move + sync colors via toStickers()
 *   6. Snap positions to nearest integer, rotations to nearest 90°
 *
 * Moves are queued sequentially — never overlap two animations.
 */
const THREE = require('three');
const { MOVE_DURATION_MS } = require('./constants');
const { applyMove } = require('../engine/moves');
const { updateCubieColors } = require('./CubieMeshFactory');

const HALF_PI = Math.PI / 2;

// Face → { axis: Vector3, filter: (x,y,z) => bool, cwAngle: number }
// CW angle = rotation angle for a CW move (looking at face from outside)
// Positive-side faces (U,R,F): CW = -π/2; Negative-side faces (D,L,B): CW = +π/2
const FACE_CONFIG = {
  U: { axis: new THREE.Vector3(0, 1, 0), filter: (_, y) => y > 0.5,  cwAngle: -HALF_PI },
  D: { axis: new THREE.Vector3(0, 1, 0), filter: (_, y) => y < -0.5, cwAngle:  HALF_PI },
  R: { axis: new THREE.Vector3(1, 0, 0), filter: (x)    => x > 0.5,  cwAngle: -HALF_PI },
  L: { axis: new THREE.Vector3(1, 0, 0), filter: (x)    => x < -0.5, cwAngle:  HALF_PI },
  F: { axis: new THREE.Vector3(0, 0, 1), filter: (_, __, z) => z > 0.5,  cwAngle: -HALF_PI },
  B: { axis: new THREE.Vector3(0, 0, 1), filter: (_, __, z) => z < -0.5, cwAngle:  HALF_PI },
};

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Parse move name → { face, angle } */
function parseMoveAngle(moveName) {
  const face = moveName[0];
  const config = FACE_CONFIG[face];
  if (!config) return null;

  let angle;
  if (moveName.endsWith('2')) {
    angle = config.cwAngle * 2;  // 180°
  } else if (moveName.endsWith("'")) {
    angle = -config.cwAngle;     // CCW = opposite of CW
  } else {
    angle = config.cwAngle;      // CW
  }
  return { face, angle, axis: config.axis, filter: config.filter };
}

/** Snap a number to the nearest integer. */
function snapInt(v) {
  return Math.round(v);
}

/** Snap an angle to the nearest multiple of π/2. */
function snapAngle(v) {
  return Math.round(v / HALF_PI) * HALF_PI;
}

class MoveAnimator {
  /**
   * @param {CubeScene} cubeScene
   * @param {CubeState} initialState
   */
  constructor(cubeScene, initialState) {
    this.cubeScene = cubeScene;
    this.cubeState = initialState.clone();
    this.queue = [];
    this.animating = false;
    this.current = null;  // { pivot, meshes, axis, targetAngle, startTime, duration }
    this.onStateChange = null;
  }

  /** Queue a move for animation. */
  enqueue(moveName) {
    this.queue.push(moveName);
    if (!this.animating) {
      this._startNext();
    }
  }

  /** Called every frame from the render loop. */
  update(now) {
    if (!this.current) return;

    const { pivot, axis, targetAngle, startTime, duration } = this.current;
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(t);

    // Set pivot rotation to interpolated angle
    const angle = targetAngle * eased;
    pivot.rotation.set(0, 0, 0);
    pivot.rotateOnAxis(axis, angle);

    if (t >= 1) {
      this._finishCurrent();
    }
  }

  /** @returns {boolean} true if currently animating */
  get isAnimating() {
    return this.animating;
  }

  // -- Private --------------------------------------------------------------

  _startNext() {
    if (this.queue.length === 0) {
      this.animating = false;
      return;
    }

    this.animating = true;
    const moveName = this.queue.shift();
    const parsed = parseMoveAngle(moveName);
    if (!parsed) {
      this._startNext();
      return;
    }

    const { face, angle, axis, filter } = parsed;
    const { cubeGroup, cubieMeshes } = this.cubeScene;

    // Create pivot at origin, add to the cube group's parent (scene)
    const pivot = new THREE.Group();
    this.cubeScene.scene.add(pivot);

    // Select cubies on this face by their fixed grid position
    const selected = [];
    for (const mesh of cubieMeshes) {
      const { x, y, z } = mesh.userData.gridPos;
      if (filter(x, y, z)) {
        pivot.attach(mesh); // preserves world transform
        selected.push(mesh);
      }
    }

    this.current = {
      pivot,
      meshes: selected,
      axis,
      targetAngle: angle,
      startTime: performance.now(),
      duration: MOVE_DURATION_MS,
      moveName,
    };
  }

  _finishCurrent() {
    const { pivot, meshes, moveName } = this.current;
    const { cubeGroup } = this.cubeScene;

    // Reparent meshes back to cubeGroup (need to detach from pivot first)
    for (const mesh of meshes) {
      cubeGroup.attach(mesh);
    }

    // Remove pivot
    this.cubeScene.scene.remove(pivot);

    // Apply engine move
    this.cubeState = applyMove(this.cubeState, moveName);

    // Reset ALL cubies to their fixed grid positions with identity rotation.
    // The animation was visual-only via the pivot. Now we snap everything
    // back to axis-aligned positions and recolor from the engine state.
    // This avoids the rotated-local-axes problem where material[0] (+X in
    // geometry space) no longer corresponds to world +X after rotation.
    for (const mesh of this.cubeScene.cubieMeshes) {
      const { x, y, z } = mesh.userData.gridPos;
      mesh.position.set(x, y, z);
      mesh.rotation.set(0, 0, 0);
    }

    // Sync all sticker colors from the new engine state
    updateCubieColors(this.cubeScene.cubieMeshes, this.cubeState);

    if (this.onStateChange) {
      this.onStateChange(this.cubeState);
    }

    this.current = null;
    this._startNext();
  }
}

module.exports = { MoveAnimator };
