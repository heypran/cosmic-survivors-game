import React, { createContext, useContext, useReducer } from 'react';

// Initial game state
const initialState = {
  // Game flow state
  gameState: 'menu', // 'menu', 'playing', 'paused', 'gameOver', 'levelUp', 'waveComplete', 'controls'

  // Player state
  player: {
    x: 400,
    y: 300,
    health: 100,
    maxHealth: 100,
    level: 1,
    xp: 0,
    xpToNext: 100,
    damageMultiplier: 1,
    fireRateMultiplier: 1,
    speedMultiplier: 1,
    weapons: ['laser'],
    weaponLevels: { laser: 1 },
    activeWeapon: 0,
    shieldActive: false,
    shieldTime: 0,
    hasMultiShot: false,
  },

  // Game objects
  enemies: [],
  bullets: [],
  grenades: [],
  healthPacks: [],
  shields: [],
  particles: [],
  turrets: [],
  inactiveTurrets: [],

  // Game progression
  wave: 1,
  score: 0,
  waveTimer: 30000,

  // Spawning counters
  grenadesSpawned: 0,
  healthPacksSpawned: 0,
  shieldsSpawned: 0,

  // UI state
  upgrades: [],
  upgradeSelected: false,
  mousePos: { x: 0, y: 0 },
};

// Action types
export const ACTIONS = {
  SET_GAME_STATE: 'SET_GAME_STATE',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  SET_ENEMIES: 'SET_ENEMIES',
  SET_BULLETS: 'SET_BULLETS',
  SET_PARTICLES: 'SET_PARTICLES',
  SET_TURRETS: 'SET_TURRETS',
  SET_INACTIVE_TURRETS: 'SET_INACTIVE_TURRETS',
  UPDATE_WAVE: 'UPDATE_WAVE',
  UPDATE_SCORE: 'UPDATE_SCORE',
  SET_UPGRADES: 'SET_UPGRADES',
  SET_MOUSE_POS: 'SET_MOUSE_POS',
  RESET_GAME: 'RESET_GAME',
};

// Game state reducer
const gameStateReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_GAME_STATE:
      return { ...state, gameState: action.payload };

    case ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        player:
          typeof action.payload === 'function'
            ? action.payload(state.player)
            : { ...state.player, ...action.payload },
      };

    case ACTIONS.SET_ENEMIES:
      return { ...state, enemies: action.payload };

    case ACTIONS.SET_BULLETS:
      return { ...state, bullets: action.payload };

    case ACTIONS.SET_PARTICLES:
      return { ...state, particles: action.payload };

    case ACTIONS.SET_TURRETS:
      return { ...state, turrets: action.payload };

    case ACTIONS.SET_INACTIVE_TURRETS:
      return { ...state, inactiveTurrets: action.payload };

    case ACTIONS.UPDATE_WAVE:
      return { ...state, wave: action.payload };

    case ACTIONS.UPDATE_SCORE:
      return { ...state, score: action.payload };

    case ACTIONS.SET_UPGRADES:
      return { ...state, upgrades: action.payload };

    case ACTIONS.SET_MOUSE_POS:
      return { ...state, mousePos: action.payload };

    case ACTIONS.RESET_GAME:
      return { ...initialState, gameState: 'menu' };

    default:
      return state;
  }
};

// Create context
const GameStateContext = createContext();

/**
 * Game State Provider component
 * @param {Object} children - Child components
 */
export const GameStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

/**
 * Custom hook to use game state
 * @returns {Object} Game state and dispatch function
 */
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

/**
 * Helper functions for common actions
 */
export const gameActions = {
  setGameState: (dispatch, gameState) =>
    dispatch({ type: ACTIONS.SET_GAME_STATE, payload: gameState }),

  updatePlayer: (dispatch, playerUpdate) =>
    dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: playerUpdate }),

  setEnemies: (dispatch, enemies) =>
    dispatch({ type: ACTIONS.SET_ENEMIES, payload: enemies }),

  setBullets: (dispatch, bullets) =>
    dispatch({ type: ACTIONS.SET_BULLETS, payload: bullets }),

  addParticles: (dispatch, particles) =>
    dispatch({ type: ACTIONS.SET_PARTICLES, payload: particles }),

  resetGame: (dispatch) => dispatch({ type: ACTIONS.RESET_GAME }),
};
