// Mathematical utility functions

/**
 * Calculate distance between two points
 * @param {Object} a - First point with x, y properties
 * @param {Object} b - Second point with x, y properties
 * @returns {number} Distance between points
 */
export const distance = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

/**
 * Calculate angle from one point to another
 * @param {Object} from - Source point with x, y properties
 * @param {Object} to - Target point with x, y properties
 * @returns {number} Angle in radians
 */
export const angle = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export const randomBetween = (min, max) => Math.random() * (max - min) + min;

/**
 * Check if a point is within bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Boundary width
 * @param {number} height - Boundary height
 * @returns {boolean} True if within bounds
 */
export const isWithinBounds = (x, y, width, height) => {
  return x >= 0 && x <= width && y >= 0 && y <= height;
};
