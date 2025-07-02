// Enemy type definitions and scaling logic

export const ENEMY_TYPES = {
  drone: {
    health: 30,
    speed: 2.5,
    size: 16,
    color: '#ff6b6b',
    xp: 12,
    damage: 10,
  },
  shooter: {
    health: 55,
    speed: 1.8,
    size: 20,
    color: '#4ecdc4',
    xp: 25,
    damage: 15,
  },
  tank: {
    health: 110,
    speed: 1.2,
    size: 24,
    color: '#45b7d1',
    xp: 50,
    damage: 25,
  },
};

/**
 * Get scaled enemy stats based on wave number
 * @param {string} type - Enemy type key
 * @param {number} wave - Current wave number
 * @returns {Object} Scaled enemy stats
 */
export const getScaledEnemyStats = (type, wave) => {
  const base = ENEMY_TYPES[type];
  const healthMultiplier = 1 + (wave - 1) * 0.2;
  const damageMultiplier = 1 + (wave - 1) * 0.15;

  return {
    ...base,
    health: Math.floor(base.health * healthMultiplier),
    xp: Math.floor(base.xp * Math.sqrt(wave)),
    damage: Math.floor(base.damage * damageMultiplier),
  };
};
