/**
 * Highlighter — pulsing emissive glow on selected cubies.
 *
 * Sine-wave emissive intensity from 0 to 0.4 at ~2 Hz.
 * Call update(now) every frame from the render loop.
 */
const THREE = require('three');

const GLOW_COLOR = new THREE.Color(0xffff00); // yellow glow
const MAX_INTENSITY = 0.4;
const PULSE_SPEED = 4; // radians per second (~2 Hz full cycle)

class Highlighter {
  constructor() {
    this._meshes = [];       // currently highlighted cubie meshes
    this._active = false;
  }

  /**
   * Highlight cubies at the given grid positions.
   * @param {THREE.Mesh[]} allMeshes - all 26 cubie meshes
   * @param {{ x: number, y: number, z: number }[]} positions - grid positions to highlight
   */
  show(allMeshes, positions) {
    this.clear();
    if (!positions || positions.length === 0) return;

    const posSet = new Set(positions.map(p => `${p.x},${p.y},${p.z}`));
    for (const mesh of allMeshes) {
      const { x, y, z } = mesh.userData.gridPos;
      if (posSet.has(`${x},${y},${z}`)) {
        this._meshes.push(mesh);
      }
    }
    this._active = this._meshes.length > 0;
  }

  /** Clear all highlights. */
  clear() {
    for (const mesh of this._meshes) {
      if (Array.isArray(mesh.material)) {
        for (const mat of mesh.material) {
          mat.emissive.setScalar(0);
          mat.emissiveIntensity = 0;
        }
      }
    }
    this._meshes = [];
    this._active = false;
  }

  /**
   * Update pulse effect. Call every frame.
   * @param {number} now - performance.now() timestamp
   */
  update(now) {
    if (!this._active) return;

    const intensity = MAX_INTENSITY * Math.max(0, Math.sin(now / 1000 * PULSE_SPEED));

    for (const mesh of this._meshes) {
      if (Array.isArray(mesh.material)) {
        for (const mat of mesh.material) {
          mat.emissive.copy(GLOW_COLOR);
          mat.emissiveIntensity = intensity;
        }
      }
    }
  }
}

module.exports = { Highlighter };
