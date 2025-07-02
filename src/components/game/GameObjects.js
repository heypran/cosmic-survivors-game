import React from 'react';
import { TURRET_DURATION } from '../../config/gameConstants';

/**
 * Player component
 * @param {Object} player - Player object
 */
export const Player = ({ player }) => (
  <div
    className="absolute w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-600"
    style={{
      left: player.x - 16,
      top: player.y - 16,
      boxShadow: player.shieldActive
        ? '0 0 20px #00aaff, 0 0 40px #00aaff'
        : '0 0 10px rgba(147, 51, 234, 0.5)',
      opacity: player.shieldActive ? 0.8 : 1,
    }}
  >
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
      🚀
    </div>
  </div>
);

/**
 * Enemy component
 * @param {Object} enemy - Enemy object
 */
export const Enemy = ({ enemy }) => (
  <div
    className="absolute rounded-full border-2 border-red-600"
    style={{
      left: enemy.x - enemy.size,
      top: enemy.y - enemy.size,
      width: enemy.size * 2,
      height: enemy.size * 2,
      backgroundColor: enemy.color,
      boxShadow: `0 0 10px ${enemy.color}`,
    }}
  >
    {/* Health bar */}
    <div className="absolute -top-2 left-0 w-full h-1 bg-red-900 rounded-full overflow-hidden">
      <div
        className="h-full bg-red-500 transition-all duration-200"
        style={{
          width: `${(enemy.health / enemy.maxHealth || 1) * 100}%`,
        }}
      />
    </div>
  </div>
);

/**
 * Bullet component
 * @param {Object} bullet - Bullet object
 */
export const Bullet = ({ bullet }) => (
  <div
    className="absolute rounded-full"
    style={{
      left: bullet.x - (bullet.size || 2),
      top: bullet.y - (bullet.size || 2),
      width: (bullet.size || 2) * 2,
      height: (bullet.size || 2) * 2,
      backgroundColor: bullet.color,
      boxShadow: `0 0 8px ${bullet.color}`,
    }}
  />
);

/**
 * Grenade component
 * @param {Object} grenade - Grenade object
 */
export const Grenade = ({ grenade }) => {
  const getGrenadeStyle = () => {
    switch (grenade.type) {
      case 'freeze':
        return {
          backgroundColor: '#00ccff',
          border: '2px solid #0088cc',
          boxShadow: '0 0 15px #00ccff',
        };
      case 'heal':
        return {
          backgroundColor: '#00ff88',
          border: '2px solid #00cc66',
          boxShadow: '0 0 15px #00ff88',
        };
      default:
        return {
          backgroundColor: grenade.color,
          border: '2px solid #ff4400',
          boxShadow: '0 0 15px #ff6b35',
        };
    }
  };

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: grenade.x - grenade.size,
        top: grenade.y - grenade.size,
        width: grenade.size * 2,
        height: grenade.size * 2,
        ...getGrenadeStyle(),
      }}
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
        💣
      </div>
    </div>
  );
};

/**
 * Health Pack component
 * @param {Object} pack - Health pack object
 */
export const HealthPack = ({ pack }) => (
  <div
    className="absolute rounded border-2 border-green-400"
    style={{
      left: pack.x - pack.size,
      top: pack.y - pack.size,
      width: pack.size * 2,
      height: pack.size * 2,
      backgroundColor: pack.color,
      boxShadow: '0 0 15px #00ff88',
    }}
  >
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
      ❤️
    </div>
  </div>
);

/**
 * Shield component
 * @param {Object} shield - Shield object
 */
export const Shield = ({ shield }) => (
  <div
    className="absolute rounded-full border-2 border-blue-400"
    style={{
      left: shield.x - shield.size,
      top: shield.y - shield.size,
      width: shield.size * 2,
      height: shield.size * 2,
      backgroundColor: shield.color,
      boxShadow: '0 0 15px #00aaff',
    }}
  >
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
      🛡️
    </div>
  </div>
);

/**
 * Particle component
 * @param {Object} particle - Particle object
 */
export const Particle = ({ particle }) => (
  <div
    className="absolute w-1 h-1 rounded-full"
    style={{
      left: particle.x,
      top: particle.y,
      backgroundColor: particle.color,
      opacity: particle.life / particle.maxLife,
    }}
  />
);

/**
 * Inactive Turret component
 * @param {Object} turret - Turret object
 */
export const InactiveTurret = ({ turret }) => (
  <div
    className="absolute rounded-full border-4 border-yellow-400"
    style={{
      left: turret.x - turret.size,
      top: turret.y - turret.size,
      width: turret.size * 2,
      height: turret.size * 2,
      backgroundColor: turret.color,
      boxShadow: `0 0 ${10 + turret.pulseFactor * 5}px ${turret.glowColor}`,
      opacity: 0.6 + turret.pulseFactor * 0.4,
    }}
  >
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-black">
      ⚡
    </div>
  </div>
);

/**
 * Active Turret component
 * @param {Object} turret - Turret object
 */
export const ActiveTurret = ({ turret }) => {
  const timeActive = Date.now() - turret.activatedAt;
  const timeRemaining = Math.max(0, TURRET_DURATION - timeActive);
  const intensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;

  return (
    <div
      className="absolute rounded-full border-4 border-orange-400"
      style={{
        left: turret.x - turret.size,
        top: turret.y - turret.size,
        width: turret.size * 2,
        height: turret.size * 2,
        backgroundColor: '#ff6600',
        boxShadow: `0 0 ${15 * intensity}px #ff6600, 0 0 ${25 * intensity}px #ff3300`,
        opacity: 0.9,
        transform: `rotate(${turret.angle * 57.2958}deg)`, // Convert radians to degrees
      }}
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
        🔫
      </div>
      {/* Timer indicator */}
      <div
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-bold"
        style={{ fontSize: '10px' }}
      >
        {Math.ceil(timeRemaining / 1000)}s
      </div>
    </div>
  );
};
