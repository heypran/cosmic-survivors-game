// Weapon type definitions and stats calculation

export const BASE_WEAPONS = {
  laser: {
    damage: 18,
    fireRate: 250,
    color: '#00ff00',
    spread: 0,
    bulletCount: 1,
    name: 'Laser',
    description: 'Fast precise shots',
    bulletSpeed: 1.0,
  },
  plasma: {
    damage: 28,
    fireRate: 450,
    color: '#ff00ff',
    spread: 0.25,
    bulletCount: 3,
    name: 'Plasma Cannon',
    description: 'Energy spread shots',
    bulletSpeed: 0.8,
  },
  missile: {
    damage: 65,
    fireRate: 800,
    color: '#ffff00',
    spread: 0,
    bulletCount: 1,
    name: 'Missile Launcher',
    description: 'Heavy explosive rounds',
    bulletSpeed: 0.7,
  },
  shotgun: {
    damage: 12,
    fireRate: 400,
    color: '#ff6600',
    spread: 0.5,
    bulletCount: 7,
    name: 'Scatter Gun',
    description: 'Wide spread pellets',
    bulletSpeed: 0.9,
  },
  lightning: {
    damage: 32,
    fireRate: 180,
    color: '#66ffff',
    spread: 0.2,
    bulletCount: 2,
    name: 'Arc Cannon',
    description: 'Electric twin bolts',
    bulletSpeed: 1.2,
  },
  railgun: {
    damage: 120,
    fireRate: 1200,
    color: '#ffffff',
    spread: 0,
    bulletCount: 1,
    name: 'Rail Rifle',
    description: 'Devastating single shots',
    bulletSpeed: 1.5,
  },
  burst: {
    damage: 20,
    fireRate: 150,
    color: '#ff3399',
    spread: 0.1,
    bulletCount: 4,
    name: 'Burst Fire',
    description: 'Rapid quad shots',
    bulletSpeed: 1.1,
  },
  flamethrower: {
    damage: 8,
    fireRate: 80,
    color: '#ff4400',
    spread: 0.6,
    bulletCount: 3,
    name: 'Flamethrower',
    description: 'Continuous fire stream',
    bulletSpeed: 0.6,
  },
  sniper: {
    damage: 150,
    fireRate: 1500,
    color: '#00ffff',
    spread: 0,
    bulletCount: 1,
    name: 'Sniper Rifle',
    description: 'Ultra-long range',
    bulletSpeed: 2.0,
  },
};

/**
 * Get weapon stats including level-based improvements
 * @param {string} weapon - Weapon type key
 * @param {Object} player - Player object with multipliers and weapon levels
 * @returns {Object} Calculated weapon stats
 */
export const getWeaponStats = (weapon, player) => {
  const base = BASE_WEAPONS[weapon];

  // Handle undefined weapons (fallback to laser)
  if (!base) {
    console.warn(`Unknown weapon: ${weapon}, falling back to laser`);
    return getWeaponStats('laser', player);
  }

  const weaponLevel = player.weaponLevels?.[weapon] || 1;

  // Level-based improvements
  const levelMultiplier = 1 + (weaponLevel - 1) * 0.3; // 30% improvement per level
  // More generous bullet count scaling: +1 bullet per level after level 1
  const bulletCountBonus = Math.max(0, weaponLevel - 1);

  return {
    ...base,
    damage: Math.floor(base.damage * player.damageMultiplier * levelMultiplier),
    fireRate: Math.floor(base.fireRate / player.fireRateMultiplier),
    bulletCount: base.bulletCount + bulletCountBonus,
    level: weaponLevel,
  };
};
