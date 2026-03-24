/**
 * CubeState — cubie-level representation of a 3×3 Rubik's cube.
 *
 * Primary model: permutation + orientation arrays for corners and edges.
 * Sticker model (6×9 array) is derived on demand — never edited directly.
 *
 * Corner orientation: 0 = no twist, 1 = CW, 2 = CCW  (always mod 3)
 * Edge orientation:   0 = not flipped, 1 = flipped     (always mod 2)
 */
class CubeState {
  constructor() {
    this.cp = [0, 1, 2, 3, 4, 5, 6, 7];                 // corner permutation
    this.co = [0, 0, 0, 0, 0, 0, 0, 0];                 // corner orientation
    this.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];   // edge permutation
    this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];     // edge orientation
  }

  /** Deep copy — always use this, never assign arrays directly. */
  clone() {
    const c = new CubeState();
    c.cp = this.cp.slice();
    c.co = this.co.slice();
    c.ep = this.ep.slice();
    c.eo = this.eo.slice();
    return c;
  }

  /** Element-wise equality check. */
  equals(other) {
    for (let i = 0; i < 8; i++) {
      if (this.cp[i] !== other.cp[i] || this.co[i] !== other.co[i]) return false;
    }
    for (let i = 0; i < 12; i++) {
      if (this.ep[i] !== other.ep[i] || this.eo[i] !== other.eo[i]) return false;
    }
    return true;
  }

  /** True when every piece is in its home position with zero orientation. */
  isSolved() {
    for (let i = 0; i < 8; i++) {
      if (this.cp[i] !== i || this.co[i] !== 0) return false;
    }
    for (let i = 0; i < 12; i++) {
      if (this.ep[i] !== i || this.eo[i] !== 0) return false;
    }
    return true;
  }

  /** JSON round-trip. */
  serialize() {
    return JSON.stringify({
      cp: this.cp, co: this.co,
      ep: this.ep, eo: this.eo,
    });
  }

  static deserialize(json) {
    const d = JSON.parse(json);
    const c = new CubeState();
    c.cp = d.cp.slice();
    c.co = d.co.slice();
    c.ep = d.ep.slice();
    c.eo = d.eo.slice();
    return c;
  }
}

module.exports = { CubeState };
