import React from 'react';
import { GameStateProvider, useGameState } from './game/core/gameState';
import { MenuScreen } from './components/ui/MenuScreen';
import { ControlsScreen } from './components/ui/ControlsScreen';
import { GameScreen } from './components/ui/GameScreen';
import { LevelUpScreen } from './components/ui/LevelUpScreen';
import { GameOverScreen } from './components/ui/GameOverScreen';
import { WaveCompleteScreen } from './components/ui/WaveCompleteScreen';

/**
 * Game Router component - handles different game states
 */
const GameRouter = () => {
  const { state, dispatch } = useGameState();

  const handleStartGame = () => {
    dispatch({ type: 'SET_GAME_STATE', payload: 'playing' });
  };

  const handleShowControls = () => {
    dispatch({ type: 'SET_GAME_STATE', payload: 'controls' });
  };

  const handleBackToMenu = () => {
    dispatch({ type: 'SET_GAME_STATE', payload: 'menu' });
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'SET_GAME_STATE', payload: 'playing' });
  };

  // Render appropriate screen based on game state
  switch (state.gameState) {
    case 'menu':
      return (
        <MenuScreen
          onStartGame={handleStartGame}
          onShowControls={handleShowControls}
        />
      );

    case 'controls':
      return <ControlsScreen onBackToMenu={handleBackToMenu} />;

    case 'playing':
    case 'paused':
      return <GameScreen gameState={state} dispatch={dispatch} />;

    case 'levelUp':
      return (
        <LevelUpScreen
          player={state.player}
          upgrades={state.upgrades}
          upgradeSelected={state.upgradeSelected}
          dispatch={dispatch}
        />
      );

    case 'gameOver':
      return (
        <GameOverScreen
          score={state.score}
          wave={state.wave}
          player={state.player}
          onRestart={handleRestart}
          onMainMenu={handleBackToMenu}
        />
      );

    case 'waveComplete':
      return (
        <WaveCompleteScreen
          wave={state.wave}
          score={state.score}
          player={state.player}
          dispatch={dispatch}
        />
      );

    default:
      return (
        <MenuScreen
          onStartGame={handleStartGame}
          onShowControls={handleShowControls}
        />
      );
  }
};

/**
 * Main App component with game state provider
 */
const App = () => {
  return (
    <div className="min-h-screen bg-black">
      <GameStateProvider>
        <GameRouter />
      </GameStateProvider>
    </div>
  );
};

export default App;
