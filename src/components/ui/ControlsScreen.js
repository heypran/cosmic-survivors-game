import React from 'react';

/**
 * Game controls and guide screen component
 * @param {Function} onBackToMenu - Callback when back to menu is clicked
 */
export const ControlsScreen = ({ onBackToMenu }) => {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center text-white overflow-y-auto">
      <div className="text-center space-y-6 max-w-4xl p-8">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
          GAME CONTROLS & GUIDE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Movement Controls */}
          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 border border-purple-500">
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              Movement & Combat
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="text-yellow-400 font-semibold">WASD</span> -
                Move player
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">
                  Mouse Click
                </span>{' '}
                - Shoot at cursor
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">SPACE</span> -
                Shoot forward
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">P</span> -
                Pause/Resume game
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">1-9</span> -
                Switch weapons
              </p>
              <p>
                <span className="text-yellow-400 font-semibold">TAB</span> -
                Cycle through weapons
              </p>
            </div>
          </div>

          {/* Weapons */}
          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 border border-green-500">
            <h3 className="text-xl font-bold text-green-400 mb-4">
              Weapons Arsenal
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>
                <span className="text-green-400">●</span> <strong>Laser</strong>{' '}
                - Fast precise shots
              </p>
              <p>
                <span className="text-purple-400">●</span>{' '}
                <strong>Plasma</strong> - Energy spread shots
              </p>
              <p>
                <span className="text-yellow-400">●</span>{' '}
                <strong>Missile</strong> - Heavy explosive rounds
              </p>
              <p>
                <span className="text-orange-400">●</span>{' '}
                <strong>Scatter Gun</strong> - Wide spread pellets
              </p>
              <p>
                <span className="text-red-400">●</span> <strong>Railgun</strong>{' '}
                - Piercing sniper shots
              </p>
              <p>
                <span className="text-cyan-400">●</span>{' '}
                <strong>Pulse Rifle</strong> - Rapid energy bursts
              </p>
              <p>
                <span className="text-pink-400">●</span>{' '}
                <strong>Ion Cannon</strong> - Charged particle beam
              </p>
              <p>
                <span className="text-blue-400">●</span>{' '}
                <strong>Flamethrower</strong> - Short-range fire cone
              </p>
              <p>
                <span className="text-amber-400">●</span>{' '}
                <strong>Sniper</strong> - Long-range precision
              </p>
            </div>
          </div>

          {/* Enemies */}
          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 border border-red-500">
            <h3 className="text-xl font-bold text-red-400 mb-4">Enemy Types</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="text-red-400 text-xl">●</span>{' '}
                <strong>Drone</strong> - Fast, weak (30 HP, 10 dmg)
              </p>
              <p>
                <span className="text-teal-400 text-xl">●</span>{' '}
                <strong>Shooter</strong> - Medium range (55 HP, 15 dmg)
              </p>
              <p>
                <span className="text-blue-400 text-xl">●</span>{' '}
                <strong>Tank</strong> - Heavy armor (110 HP, 25 dmg)
              </p>
              <p className="text-yellow-400 text-sm mt-3">
                ⚠️ Enemies get stronger each wave!
              </p>
            </div>
          </div>

          {/* Power-ups & Turrets */}
          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 border border-yellow-500">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">
              Power-ups & Turrets
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong>Level Up Rewards:</strong>
              </p>
              <p>• New weapons & weapon upgrades</p>
              <p>• Health boost & damage multipliers</p>
              <p>• Multi-shot & speed enhancements</p>
              <p className="mt-3">
                <strong>Turrets (Wave 10+):</strong>
              </p>
              <p>
                <span className="text-yellow-400">⚡</span> Touch to activate
                (30 seconds)
              </p>
              <p>
                <span className="text-yellow-400">⚡</span> Fires in 360° circle
                pattern
              </p>
              <p>
                <span className="text-yellow-400">⚡</span> Max 10 turrets per
                wave
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={onBackToMenu}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
