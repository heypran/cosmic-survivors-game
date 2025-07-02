import React from 'react';
import { getWeaponStats } from '../../game/entities/weaponTypes';

/**
 * Game HUD component displaying player stats and game info
 * @param {Object} player - Player object
 * @param {number} score - Current score
 * @param {number} wave - Current wave
 * @param {number} waveTimer - Time remaining in wave
 * @param {Array} enemies - Current enemies
 */
export const HUD = ({ player, score, wave, waveTimer, enemies }) => {
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const currentWeapon = player.weapons[player.activeWeapon];
  const weaponStats = getWeaponStats(currentWeapon, player);

  return (
    <div className="absolute top-0 left-0 w-full p-4 bg-black bg-opacity-40 text-white z-10">
      <div className="flex justify-between items-start">
        {/* Left side - Player stats */}
        <div className="space-y-1">
          {/* Health bar */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">HP:</span>
            <div className="w-32 h-4 bg-red-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{
                  width: `${(player.health / player.maxHealth) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-mono">
              {player.health}/{player.maxHealth}
            </span>
          </div>

          {/* XP bar */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold">XP:</span>
            <div className="w-32 h-3 bg-blue-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                style={{
                  width: `${(player.xp / player.xpToNext) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-mono">Lv.{player.level}</span>
          </div>

          {/* Shield indicator */}
          {player.shieldActive && (
            <div className="flex items-center space-x-2 text-blue-400">
              <span className="text-sm">🛡️</span>
              <span className="text-sm font-mono">
                {Math.ceil(player.shieldTime / 1000)}s
              </span>
            </div>
          )}
        </div>

        {/* Center - Wave info */}
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">WAVE {wave}</div>
          <div className="text-sm text-gray-300">{formatTime(waveTimer)}</div>
          <div className="text-xs text-gray-400">{enemies.length} enemies</div>
        </div>

        {/* Right side - Score and weapon info */}
        <div className="text-right space-y-1">
          <div className="text-lg font-bold text-green-400">
            {score.toLocaleString()}
          </div>

          {/* Current weapon */}
          <div className="space-y-1">
            <div className="text-sm font-semibold">
              <span style={{ color: weaponStats.color }}>●</span>{' '}
              {weaponStats.name} Lv.{weaponStats.level}
            </div>
            <div className="text-xs text-gray-400">
              {weaponStats.damage} dmg • {weaponStats.bulletCount} bullets
            </div>
          </div>

          {/* Weapon switching help */}
          <div className="text-xs text-gray-500 mt-2">
            <div>1-9: Switch weapons</div>
            <div>Tab: Cycle weapons</div>
          </div>
        </div>
      </div>

      {/* Weapons bar */}
      <div className="mt-3 flex space-x-1">
        {player.weapons.map((weapon, index) => {
          const stats = getWeaponStats(weapon, player);
          const isActive = index === player.activeWeapon;

          return (
            <div
              key={weapon}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-lg">{index + 1}</span>
              <div style={{ color: stats.color }}>●</div>
              <div className="text-xs">Lv.{stats.level}</div>
            </div>
          );
        })}
      </div>

      {/* Multi-shot indicator */}
      {player.hasMultiShot && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-sm">
          🎯 DUAL TARGETING
        </div>
      )}
    </div>
  );
};
