import React from 'react';

/**
 * Main menu screen component
 * @param {Function} onStartGame - Callback when start game is clicked
 * @param {Function} onShowControls - Callback when controls button is clicked
 */
export const MenuScreen = ({ onStartGame, onShowControls }) => {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center text-white">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
          COSMIC SURVIVORS
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Survive the alien onslaught on a desolate planet
        </p>
        <div className="space-y-4">
          <button
            onClick={onStartGame}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            START MISSION
          </button>
          <button
            onClick={onShowControls}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            GAME CONTROLS
          </button>
          <div className="text-sm text-gray-400 space-y-1">
            <p>WASD to move • Click or SPACE to shoot</p>
            <p>Manual firing • Survive as long as possible</p>
          </div>
        </div>
      </div>
    </div>
  );
};
