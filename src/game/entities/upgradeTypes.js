// Upgrade system definitions and options

export const UPGRADE_OPTIONS = [
  {
    id: 'damage',
    name: 'Quantum Boost',
    description: '+25% damage',
    icon: '⚡',
  },
  {
    id: 'speed',
    name: 'Neural Enhancement',
    description: '+20% movement speed',
    icon: '🚀',
  },
  {
    id: 'health',
    name: 'Bio-Regenerator',
    description: '+25 max health',
    icon: '❤️',
  },
  {
    id: 'fireRate',
    name: 'Overclock Module',
    description: '+30% fire rate',
    icon: '🔥',
  },
  {
    id: 'plasmaWeapon',
    name: 'Plasma Arsenal',
    description: 'Unlock/Upgrade plasma spread shots',
    icon: '💥',
  },
  {
    id: 'shotgunWeapon',
    name: 'Scatter Gun',
    description: 'Unlock/Upgrade shotgun weapon',
    icon: '🎯',
  },
  {
    id: 'lightningWeapon',
    name: 'Arc Cannon',
    description: 'Unlock/Upgrade lightning weapon',
    icon: '⚡',
  },
  {
    id: 'railgunWeapon',
    name: 'Rail Rifle',
    description: 'Unlock/Upgrade powerful railgun',
    icon: '🔫',
  },
  {
    id: 'burstWeapon',
    name: 'Burst Fire',
    description: 'Unlock/Upgrade burst weapon',
    icon: '💨',
  },
  {
    id: 'multiShot',
    name: 'Dual Targeting',
    description: 'Fire at 2 nearest enemies',
    icon: '🎯',
  },
  {
    id: 'flamethrowerWeapon',
    name: 'Flamethrower',
    description: 'Unlock/Upgrade continuous fire stream',
    icon: '🔥',
  },
  {
    id: 'sniperWeapon',
    name: 'Sniper Rifle',
    description: 'Unlock/Upgrade ultra-long range weapon',
    icon: '🎯',
  },
];

/**
 * Get available upgrades based on player level and current state
 * @param {Object} player - Player object with current stats
 * @param {number} level - Current player level
 * @returns {Array} Array of available upgrade options
 */
export const getAvailableUpgrades = (player, level) => {
  // Filter upgrades based on player state and level
  return UPGRADE_OPTIONS.filter((upgrade) => {
    // Add logic here to determine which upgrades are available
    // based on player's current weapons, level, etc.
    return true; // For now, return all upgrades
  });
};
