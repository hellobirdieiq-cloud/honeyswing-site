/**
 * CubeScene — Three.js scene setup: camera, lights, cube group,
 * highlighter, and arrow overlay.
 *
 * Does NOT own the GL context or render loop — that's CubeView's job.
 */
const THREE = require('three');
const {
  CAMERA_POSITION,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
  AMBIENT_INTENSITY,
  KEY_LIGHT_INTENSITY,
  KEY_LIGHT_POSITION,
  FILL_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  PHI_MIN,
  PHI_MAX,
} = require('./constants');
const { createCubies, updateCubieColors } = require('./CubieMeshFactory');
const { Highlighter } = require('./Highlighter');
const { ArrowOverlay } = require('./ArrowOverlay');

class CubeScene {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.cubeGroup = null;
    this.cubieMeshes = null;
    this.highlighter = null;
    this.arrowOverlay = null;

    // Spherical orbit state
    this.orbitRadius = 0;
    this.orbitTheta = 0;
    this.orbitPhi = 0;
    this._defaultTheta = 0;
    this._defaultPhi = 0;

    // Snap-back animation state
    this._snapBack = null; // { startTheta, startPhi, startTime, duration }
  }

  /**
   * Initialize the scene, camera, lights, cube meshes, highlighter, and arrows.
   */
  init(width, height, cubeState) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
    this.camera.position.set(...CAMERA_POSITION);
    this.camera.lookAt(0, 0, 0);

    const [cx, cy, cz] = CAMERA_POSITION;
    this.orbitRadius = Math.sqrt(cx * cx + cy * cy + cz * cz);
    this.orbitTheta = Math.atan2(cx, cz);
    this.orbitPhi = Math.acos(cy / this.orbitRadius);
    this._defaultTheta = this.orbitTheta;
    this._defaultPhi = this.orbitPhi;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, KEY_LIGHT_INTENSITY);
    keyLight.position.set(...KEY_LIGHT_POSITION);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, FILL_LIGHT_INTENSITY);
    fillLight.position.set(...FILL_LIGHT_POSITION);
    this.scene.add(fillLight);

    // Cubies
    const { meshes, group } = createCubies(cubeState);
    this.cubieMeshes = meshes;
    this.cubeGroup = group;
    this.scene.add(this.cubeGroup);

    // Highlighter
    this.highlighter = new Highlighter();

    // Arrow overlay
    this.arrowOverlay = new ArrowOverlay();
    this.scene.add(this.arrowOverlay.group);
  }

  /**
   * Per-frame update — drives highlight pulse and snap-back animation.
   */
  update(now) {
    if (this.highlighter) {
      this.highlighter.update(now);
    }
    if (this._snapBack) {
      this._updateSnapBack(now);
    }
  }

  /** Orbit the camera by delta angles. Cancels any active snap-back. */
  orbit(dTheta, dPhi) {
    if (!this.camera) return;
    this._snapBack = null; // cancel snap-back on new touch input
    this.orbitTheta += dTheta;
    this.orbitPhi = Math.max(PHI_MIN, Math.min(PHI_MAX, this.orbitPhi + dPhi));
    this._applyCameraFromSpherical();
  }

  /**
   * Start animating the camera back to the default position over 300ms.
   */
  snapBack() {
    if (!this.camera) return;
    // Already at default? Skip.
    if (Math.abs(this.orbitTheta - this._defaultTheta) < 0.001 &&
        Math.abs(this.orbitPhi - this._defaultPhi) < 0.001) return;
    this._snapBack = {
      startTheta: this.orbitTheta,
      startPhi: this.orbitPhi,
      startTime: performance.now(),
      duration: 300,
    };
  }

  _updateSnapBack(now) {
    const sb = this._snapBack;
    const elapsed = now - sb.startTime;
    const t = Math.min(elapsed / sb.duration, 1);
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    this.orbitTheta = sb.startTheta + (this._defaultTheta - sb.startTheta) * eased;
    this.orbitPhi = sb.startPhi + (this._defaultPhi - sb.startPhi) * eased;
    this._applyCameraFromSpherical();

    if (t >= 1) this._snapBack = null;
  }

  _applyCameraFromSpherical() {
    const r = this.orbitRadius;
    const sinPhi = Math.sin(this.orbitPhi);
    this.camera.position.set(
      r * sinPhi * Math.sin(this.orbitTheta),
      r * Math.cos(this.orbitPhi),
      r * sinPhi * Math.cos(this.orbitTheta),
    );
    this.camera.lookAt(0, 0, 0);
  }

  resize(width, height) {
    if (!this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /** Update cubie sticker colors for a new CubeState. */
  updateState(cubeState) {
    if (this.cubieMeshes) {
      updateCubieColors(this.cubieMeshes, cubeState);
    }
  }

  /**
   * Highlight cubies at given grid positions with a pulsing glow.
   * Pass empty array or null to clear.
   * @param {{ x: number, y: number, z: number }[] | null} positions
   */
  showHighlight(positions) {
    if (!this.highlighter || !this.cubieMeshes) return;
    if (!positions || positions.length === 0) {
      this.highlighter.clear();
    } else {
      this.highlighter.show(this.cubieMeshes, positions);
    }
  }

  /**
   * Show a directional arrow for a move (e.g. "R", "F'").
   * @param {string} moveName
   */
  showArrow(moveName) {
    if (this.arrowOverlay) {
      this.arrowOverlay.show(moveName);
    }
  }

  /** Hide any visible arrow. */
  hideArrow() {
    if (this.arrowOverlay) {
      this.arrowOverlay.hide();
    }
  }

  dispose() {
    if (this.highlighter) this.highlighter.clear();
    if (this.cubieMeshes) {
      for (const mesh of this.cubieMeshes) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    }
    if (this.scene) this.scene.clear();
    this.scene = null;
    this.camera = null;
    this.cubeGroup = null;
    this.cubieMeshes = null;
    this.highlighter = null;
    this.arrowOverlay = null;
  }
}

module.exports = { CubeScene };
