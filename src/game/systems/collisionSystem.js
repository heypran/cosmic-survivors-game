import { distance } from '../../utils/mathUtils';

/**
 * Collision detection and resolution system
 */
export class CollisionSystem {
  /**
   * Check collisions between bullets and enemies
   * @param {Array} bullets - Array of bullet objects
   * @param {Array} enemies - Array of enemy objects
   * @returns {Object} Results with remaining bullets and updated enemies
   */
  checkBulletEnemyCollisions(bullets, enemies) {
    const remainingBullets = [];
    let updatedEnemies = [...enemies];
    let xpGained = 0;
    let enemiesKilled = 0;

    bullets.forEach((bullet) => {
      let hit = false;

      updatedEnemies = updatedEnemies
        .map((enemy) => {
          if (hit) return enemy;

          if (distance(bullet, enemy) < enemy.size + bullet.size) {
            hit = true;
            const newHealth = enemy.health - bullet.damage;

            if (newHealth <= 0) {
              // Enemy killed
              xpGained += enemy.xp;
              enemiesKilled++;
              return null; // Mark for removal
            } else {
              // Enemy damaged
              return { ...enemy, health: newHealth };
            }
          }
          return enemy;
        })
        .filter(Boolean); // Remove null entries

      if (!hit) {
        remainingBullets.push(bullet);
      }
    });

    return {
      bullets: remainingBullets,
      enemies: updatedEnemies,
      xpGained,
      enemiesKilled,
    };
  }

  /**
   * Check collisions between player and enemies
   * @param {Object} player - Player object
   * @param {Array} enemies - Array of enemy objects
   * @returns {Object} Collision result
   */
  checkPlayerEnemyCollisions(player, enemies) {
    let damageDealt = 0;

    enemies.forEach((enemy) => {
      if (distance(player, enemy) < enemy.size + 16) {
        // 16 is player size
        damageDealt += enemy.damage;
      }
    });

    return { damageDealt };
  }

  /**
   * Check collisions between player and items (health packs, shields, etc.)
   * @param {Object} player - Player object
   * @param {Array} items - Array of item objects
   * @param {number} playerSize - Player collision radius
   * @returns {Object} Collision results
   */
  checkPlayerItemCollisions(player, items, playerSize = 16) {
    const collectedItems = [];
    const remainingItems = [];

    items.forEach((item) => {
      if (distance(player, item) < item.size + playerSize) {
        collectedItems.push(item);
      } else {
        remainingItems.push(item);
      }
    });

    return {
      collectedItems,
      remainingItems,
    };
  }

  /**
   * Check collisions between bullets and grenades
   * @param {Array} bullets - Array of bullet objects
   * @param {Array} grenades - Array of grenade objects
   * @returns {Object} Collision results
   */
  checkBulletGrenadeCollisions(bullets, grenades) {
    const remainingBullets = [];
    const explodedGrenades = [];

    bullets.forEach((bullet) => {
      let hit = false;

      grenades.forEach((grenade) => {
        if (hit) return;

        if (distance(bullet, grenade) < grenade.size + bullet.size) {
          hit = true;
          explodedGrenades.push(grenade);
        }
      });

      if (!hit) {
        remainingBullets.push(bullet);
      }
    });

    return {
      bullets: remainingBullets,
      explodedGrenades,
    };
  }

  /**
   * Check if bullets are out of bounds
   * @param {Array} bullets - Array of bullet objects
   * @param {number} gameWidth - Game area width
   * @param {number} gameHeight - Game area height
   * @returns {Array} Bullets that are still in bounds
   */
  filterOutOfBoundsBullets(bullets, gameWidth, gameHeight) {
    return bullets.filter((bullet) => {
      return (
        bullet.x >= -50 &&
        bullet.x <= gameWidth + 50 &&
        bullet.y >= -50 &&
        bullet.y <= gameHeight + 50
      );
    });
  }

  /**
   * Check collision between two circles
   * @param {Object} obj1 - First object with x, y, size
   * @param {Object} obj2 - Second object with x, y, size
   * @returns {boolean} True if collision detected
   */
  checkCircleCollision(obj1, obj2) {
    return distance(obj1, obj2) < obj1.size + obj2.size;
  }

  /**
   * Get nearest enemy to a position
   * @param {Object} position - Position with x, y
   * @param {Array} enemies - Array of enemy objects
   * @returns {Object|null} Nearest enemy or null if none
   */
  getNearestEnemy(position, enemies) {
    if (enemies.length === 0) return null;

    let nearest = enemies[0];
    let nearestDistance = distance(position, nearest);

    enemies.forEach((enemy) => {
      const dist = distance(position, enemy);
      if (dist < nearestDistance) {
        nearest = enemy;
        nearestDistance = dist;
      }
    });

    return nearest;
  }
}
