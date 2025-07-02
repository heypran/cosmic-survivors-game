import { getScaledEnemyStats, ENEMY_TYPES } from '../entities/enemyTypes';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  MAX_TURRETS,
} from '../../config/gameConstants';
import { randomBetween } from '../../utils/mathUtils';

/**
 * Spawning system for enemies, items, and turrets
 */
export class SpawningSystem {
  /**
   * Spawn enemies for the current wave
   * @param {number} wave - Current wave number
   * @param {number} currentEnemyCount - Current number of enemies
   * @param {number} lastSpawn - Last spawn timestamp
   * @param {number} spawnInterval - Current spawn interval
   * @returns {Object} Spawn result
   */
  spawnEnemies(wave, currentEnemyCount, lastSpawn, spawnInterval) {
    const now = Date.now();
    const shouldSpawn =
      now - lastSpawn > spawnInterval && currentEnemyCount < 50;

    if (!shouldSpawn) {
      return { enemies: [], shouldUpdateLastSpawn: false };
    }

    const enemyTypes = Object.keys(ENEMY_TYPES);
    const spawnCount = Math.min(3, Math.floor(wave / 3) + 1);
    const newEnemies = [];

    for (let i = 0; i < spawnCount; i++) {
      const enemyType =
        enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const stats = getScaledEnemyStats(enemyType, wave);

      // Spawn from edges
      const side = Math.floor(Math.random() * 4);
      let x, y;

      switch (side) {
        case 0: // Top
          x = Math.random() * GAME_WIDTH;
          y = -stats.size;
          break;
        case 1: // Right
          x = GAME_WIDTH + stats.size;
          y = Math.random() * GAME_HEIGHT;
          break;
        case 2: // Bottom
          x = Math.random() * GAME_WIDTH;
          y = GAME_HEIGHT + stats.size;
          break;
        case 3: // Left
          x = -stats.size;
          y = Math.random() * GAME_HEIGHT;
          break;
      }

      newEnemies.push({
        id: Date.now() + Math.random() + i,
        type: enemyType,
        x,
        y,
        ...stats,
      });
    }

    return {
      enemies: newEnemies,
      shouldUpdateLastSpawn: true,
      newSpawnInterval: Math.max(300, spawnInterval - wave * 10),
    };
  }

  /**
   * Spawn a grenade at a random location
   * @param {number} wave - Current wave number
   * @param {Object} playerPos - Player position
   * @returns {Object} Grenade object
   */
  spawnGrenade(wave, playerPos) {
    // Don't spawn too close to player
    let x, y;
    do {
      x = Math.random() * (GAME_WIDTH - 60) + 30;
      y = Math.random() * (GAME_HEIGHT - 60) + 30;
    } while (
      Math.abs(x - playerPos.x) < 100 &&
      Math.abs(y - playerPos.y) < 100
    );

    const damage = 80 + wave * 10;
    const explosionRadius = 80 + wave * 5;

    return {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 12,
      damage,
      explosionRadius,
      color: '#ff6b35',
      type: 'standard',
    };
  }

  /**
   * Spawn a health pack
   * @param {number} wave - Current wave number
   * @param {Object} playerPos - Player position
   * @returns {Object} Health pack object
   */
  spawnHealthPack(wave, playerPos) {
    let x, y;
    do {
      x = Math.random() * (GAME_WIDTH - 40) + 20;
      y = Math.random() * (GAME_HEIGHT - 40) + 20;
    } while (Math.abs(x - playerPos.x) < 80 && Math.abs(y - playerPos.y) < 80);

    const healAmount = 25 + Math.floor(wave / 3) * 5;

    return {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 16,
      healAmount,
      color: '#00ff88',
    };
  }

  /**
   * Spawn a shield power-up
   * @param {number} wave - Current wave number
   * @param {Object} playerPos - Player position
   * @returns {Object} Shield object
   */
  spawnShield(wave, playerPos) {
    let x, y;
    do {
      x = Math.random() * (GAME_WIDTH - 40) + 20;
      y = Math.random() * (GAME_HEIGHT - 40) + 20;
    } while (Math.abs(x - playerPos.x) < 80 && Math.abs(y - playerPos.y) < 80);

    const duration = 5000 + wave * 500;

    return {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 18,
      duration,
      color: '#00aaff',
    };
  }

  /**
   * Spawn turrets for a wave (10+)
   * @param {number} waveNumber - Current wave number
   * @returns {Array} Array of turret objects
   */
  spawnTurretsForWave(waveNumber) {
    if (waveNumber < 10) return [];

    const turretCount = Math.min(MAX_TURRETS, Math.floor(waveNumber / 2));
    const newTurrets = [];

    for (let i = 0; i < turretCount; i++) {
      // Spawn turrets in random locations, not too close to player start
      const angle = (Math.PI * 2 * i) / turretCount + Math.random() * 0.5;
      const distance = randomBetween(200, 450);

      newTurrets.push({
        id: Date.now() + Math.random() + i,
        x: GAME_WIDTH / 2 + Math.cos(angle) * distance,
        y: GAME_HEIGHT / 2 + Math.sin(angle) * distance,
        size: 20,
        color: '#ffd700',
        glowColor: '#ffff00',
        pulseFactor: Math.random() * 0.5 + 0.5,
      });
    }

    return newTurrets;
  }

  /**
   * Check if an item should spawn based on wave and spawn count
   * @param {number} wave - Current wave number
   * @param {number} spawned - Number already spawned this wave
   * @param {number} maxPerWave - Maximum per wave
   * @param {number} spawnChance - Base spawn chance (0-1)
   * @returns {boolean} Should spawn
   */
  shouldSpawnItem(wave, spawned, maxPerWave, spawnChance = 0.3) {
    if (spawned >= maxPerWave) return false;

    const adjustedChance = spawnChance * (1 + wave * 0.1);
    return Math.random() < adjustedChance;
  }

  /**
   * Get spawn limits for current wave
   * @param {number} wave - Current wave number
   * @returns {Object} Spawn limits
   */
  getSpawnLimits(wave) {
    return {
      maxGrenades: Math.min(8, Math.floor(wave / 2) + 1),
      maxHealthPacks: Math.min(5, Math.floor(wave / 3) + 1),
      maxShields: Math.min(4, Math.floor(wave / 4) + 1),
    };
  }
}
