// Particle effects management system

/**
 * Create particle effects at a specific location
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Particle color
 * @param {number} count - Number of particles to create
 * @returns {Array} Array of particle objects
 */
export const createParticles = (x, y, color, count = 5) => {
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      id: Date.now() + Math.random() + i,
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 30 + Math.random() * 20,
      maxLife: 30 + Math.random() * 20,
      color,
    });
  }

  return particles;
};

/**
 * Update particle positions and lifecycle
 * @param {Array} particles - Array of particle objects
 * @returns {Array} Updated particles array with aged particles
 */
export const updateParticles = (particles) => {
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - 1,
      vx: particle.vx * 0.98,
      vy: particle.vy * 0.98,
    }))
    .filter((particle) => particle.life > 0);
};

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Add particles to the system
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} color - Particle color
   * @param {number} count - Number of particles
   */
  addParticles(x, y, color, count = 5) {
    const newParticles = createParticles(x, y, color, count);
    this.particles.push(...newParticles);
  }

  /**
   * Update all particles in the system
   */
  update() {
    this.particles = updateParticles(this.particles);
  }

  /**
   * Get all particles for rendering
   * @returns {Array} Current particles
   */
  getParticles() {
    return this.particles;
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
  }
}
