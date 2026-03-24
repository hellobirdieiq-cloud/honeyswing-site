/**
 * ArrowOverlay — 12 pre-built flat 3D arrow meshes (CW + CCW for 6 faces).
 *
 * Each arrow is a curved arc with an arrowhead, positioned just outside
 * the face it represents. All arrows start hidden; showArrow(moveName)
 * makes the relevant one visible, hideArrow() hides all.
 */
const THREE = require('three');

const ARROW_COLOR = 0xffcc00;
const ARROW_OFFSET = 1.7;    // distance from center to arrow plane
const ARROW_RADIUS = 1.0;    // arc radius
const ARROW_TUBE = 0.04;     // tube thickness
const HEAD_LENGTH = 0.25;
const HEAD_WIDTH = 0.15;
const ARC_SEGMENTS = 24;

// Build a curved arrow (arc + cone head) lying in the XY plane at z=0.
// CW = arc from ~135° to ~-45° (clockwise looking at -Z).
// CCW = arc from ~-45° to ~135°.
function buildArrowMesh(clockwise) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: ARROW_COLOR,
    transparent: true,
    opacity: 0.85,
    depthTest: false,
  });

  // Arc: a TubeGeometry following a partial circle
  const startAngle = clockwise ? Math.PI * 0.75 : -Math.PI * 0.25;
  const sweep = clockwise ? -Math.PI * 1.0 : Math.PI * 1.0; // 180° arc
  const points = [];
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const a = startAngle + sweep * t;
    points.push(new THREE.Vector3(
      ARROW_RADIUS * Math.cos(a),
      ARROW_RADIUS * Math.sin(a),
      0,
    ));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, ARC_SEGMENTS, ARROW_TUBE, 6, false);
  const tube = new THREE.Mesh(tubeGeo, material);
  group.add(tube);

  // Arrowhead: a cone at the end of the arc, tangent to the curve
  const endPoint = points[points.length - 1];
  const prevPoint = points[points.length - 2];
  const dir = new THREE.Vector3().subVectors(endPoint, prevPoint).normalize();
  const coneGeo = new THREE.ConeGeometry(HEAD_WIDTH, HEAD_LENGTH, 8);
  const cone = new THREE.Mesh(coneGeo, material);
  cone.position.copy(endPoint).addScaledVector(dir, HEAD_LENGTH * 0.5);
  // Orient cone along direction
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
  cone.quaternion.copy(quat);
  group.add(cone);

  group.visible = false;
  return group;
}

// For each face, define the normal direction (where to offset) and the
// rotation to align the XY-plane arrow with the face.
const FACE_SETUP = {
  U: { pos: [0, ARROW_OFFSET, 0], rot: [-Math.PI / 2, 0, 0] },
  D: { pos: [0, -ARROW_OFFSET, 0], rot: [Math.PI / 2, 0, 0] },
  R: { pos: [ARROW_OFFSET, 0, 0], rot: [0, Math.PI / 2, 0] },
  L: { pos: [-ARROW_OFFSET, 0, 0], rot: [0, -Math.PI / 2, 0] },
  F: { pos: [0, 0, ARROW_OFFSET], rot: [0, 0, 0] },
  B: { pos: [0, 0, -ARROW_OFFSET], rot: [0, Math.PI, 0] },
};

class ArrowOverlay {
  constructor() {
    this.arrows = {};  // key = moveName (e.g. "R", "R'"), value = THREE.Group
    this.group = new THREE.Group();
    this._currentKey = null;
    this._build();
  }

  _build() {
    const faces = ['U', 'D', 'R', 'L', 'F', 'B'];
    for (const face of faces) {
      const setup = FACE_SETUP[face];
      for (const cw of [true, false]) {
        const key = cw ? face : face + "'";
        const arrow = buildArrowMesh(cw);
        arrow.position.set(...setup.pos);
        arrow.rotation.set(...setup.rot);
        this.arrows[key] = arrow;
        this.group.add(arrow);
      }
    }
  }

  /**
   * Show the arrow for a given move name (e.g. "R", "F'").
   * Double moves (R2) show the CW arrow.
   */
  show(moveName) {
    this.hide();
    let key = moveName;
    if (key.endsWith('2')) key = key[0]; // doubles show CW arrow
    const arrow = this.arrows[key];
    if (arrow) {
      arrow.visible = true;
      this._currentKey = key;
    }
  }

  /** Hide all arrows. */
  hide() {
    if (this._currentKey) {
      const arrow = this.arrows[this._currentKey];
      if (arrow) arrow.visible = false;
      this._currentKey = null;
    }
  }
}

module.exports = { ArrowOverlay };
