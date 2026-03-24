/**
 * Renderer constants — cubie sizing, camera, lights, animation timing.
 */

// Cubie geometry
const CUBIE_SIZE = 0.95;           // Slightly under 1.0 for black gap between cubies
const CUBIE_GAP = (1 - CUBIE_SIZE) / 2; // 0.025 per side

// Grid range: -1 to 1 on each axis, skip (0,0,0) → 26 cubies
const GRID_MIN = -1;
const GRID_MAX = 1;

// Camera
const CAMERA_POSITION = [4, 3, 4];
const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;

// Lights
const AMBIENT_INTENSITY = 0.6;
const KEY_LIGHT_INTENSITY = 0.8;
const KEY_LIGHT_POSITION = [4, 5, 3];   // upper-right
const FILL_LIGHT_INTENSITY = 0.3;
const FILL_LIGHT_POSITION = [-3, -2, -2]; // lower-left

// Orbit
const ORBIT_SENSITIVITY = 0.005;   // radians per pixel of touch delta
const PHI_MIN = 0.15;              // clamp to avoid gimbal lock at poles
const PHI_MAX = Math.PI - 0.15;

// Animation
const MOVE_DURATION_MS = 250;

module.exports = {
  CUBIE_SIZE,
  CUBIE_GAP,
  GRID_MIN,
  GRID_MAX,
  CAMERA_POSITION,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_FAR,
  AMBIENT_INTENSITY,
  KEY_LIGHT_INTENSITY,
  KEY_LIGHT_POSITION,
  FILL_LIGHT_INTENSITY,
  FILL_LIGHT_POSITION,
  ORBIT_SENSITIVITY,
  PHI_MIN,
  PHI_MAX,
  MOVE_DURATION_MS,
};
