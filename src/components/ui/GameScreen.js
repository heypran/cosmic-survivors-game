import React, { useEffect, useCallback, useRef } from 'react';
import { HUD } from '../game/HUD';
import {
  Player,
  Enemy,
  Bullet,
  Grenade,
  HealthPack,
  Shield,
  Particle,
  InactiveTurret,
  ActiveTurret,
} from '../game/GameObjects';
import { useKeyboard } from '../../hooks/useKeyboard';
import { CollisionSystem } from '../../game/systems/collisionSystem';
import { SpawningSystem } from '../../game/systems/spawningSystem';
import { ParticleSystem } from '../../game/systems/particleSystem';
import { GAME_WIDTH, GAME_HEIGHT } from '../../config/gameConstants';

/**
 * Main game screen component
 * @param {Object} gameState - Current game state
 * @param {Function} dispatch - State dispatch function
 */
export const GameScreen = ({ gameState, dispatch }) => {
  const gameAreaRef = useRef(null);
  const playerPosRef = useRef({ x: gameState.player.x, y: gameState.player.y });
  const lastShotRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const gameLoopRef = useRef(null);

  // Initialize systems
  const collisionSystem = useRef(new CollisionSystem()).current;
  const spawningSystem = useRef(new SpawningSystem()).current;
  const particleSystem = useRef(new ParticleSystem()).current;

  // Handle key presses
  const handleKeyPress = useCallback(
    (key, event) => {
      if (key === 'p') {
        const newState =
          gameState.gameState === 'playing' ? 'paused' : 'playing';
        dispatch({ type: 'SET_GAME_STATE', payload: newState });
      }

      if (key === ' ' && gameState.gameState === 'playing') {
        event.preventDefault();
        // Handle shooting
      }

      // Weapon switching
      if (gameState.gameState === 'playing' && /^[1-9]$/.test(key)) {
        const weaponIndex = parseInt(key) - 1;
        if (weaponIndex < gameState.player.weapons.length) {
          dispatch({
            type: 'UPDATE_PLAYER',
            payload: { activeWeapon: weaponIndex },
          });
        }
      }

      // Tab cycling
      if (key === 'tab' && gameState.gameState === 'playing') {
        event.preventDefault();
        dispatch({
          type: 'UPDATE_PLAYER',
          payload: (prev) => ({
            ...prev,
            activeWeapon: (prev.activeWeapon + 1) % prev.weapons.length,
          }),
        });
      }
    },
    [gameState.gameState, gameState.player.weapons.length, dispatch]
  );

  const keysRef = useKeyboard(gameState.gameState, handleKeyPress);

  // Mouse handling
  const handleMouseMove = useCallback(
    (e) => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        dispatch({
          type: 'SET_MOUSE_POS',
          payload: {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          },
        });
      }
    },
    [dispatch]
  );

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.gameState !== 'playing') return;

    // Update player position ref
    playerPosRef.current = { x: gameState.player.x, y: gameState.player.y };

    // Handle player movement
    const keys = keysRef.current;
    let dx = 0,
      dy = 0;

    if (keys.w || keys.arrowup) dy = -1;
    if (keys.s || keys.arrowdown) dy = 1;
    if (keys.a || keys.arrowleft) dx = -1;
    if (keys.d || keys.arrowright) dx = 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    if (dx !== 0 || dy !== 0) {
      const speed = 5 * gameState.player.speedMultiplier;
      const newX = Math.max(
        16,
        Math.min(GAME_WIDTH - 16, gameState.player.x + dx * speed)
      );
      const newY = Math.max(
        16,
        Math.min(GAME_HEIGHT - 16, gameState.player.y + dy * speed)
      );

      dispatch({
        type: 'UPDATE_PLAYER',
        payload: { x: newX, y: newY },
      });
    }

    // Spawn enemies
    const spawnResult = spawningSystem.spawnEnemies(
      gameState.wave,
      gameState.enemies.length,
      lastSpawnRef.current,
      1200 // base spawn interval
    );

    if (spawnResult.shouldUpdateLastSpawn) {
      lastSpawnRef.current = Date.now();
      dispatch({
        type: 'SET_ENEMIES',
        payload: [...gameState.enemies, ...spawnResult.enemies],
      });
    }

    // Update particles
    particleSystem.update();

    // Update wave timer
    const newTimer = gameState.waveTimer - 16;
    if (newTimer <= 0) {
      dispatch({ type: 'SET_GAME_STATE', payload: 'waveComplete' });
    } else {
      dispatch({ type: 'UPDATE_WAVE_TIMER', payload: newTimer });
    }
  }, [gameState, keysRef, dispatch, spawningSystem, particleSystem]);

  // Start game loop
  useEffect(() => {
    if (gameState.gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 16); // 60 FPS
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.gameState, gameLoop]);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* HUD */}
      <HUD
        player={gameState.player}
        score={gameState.score}
        wave={gameState.wave}
        waveTimer={gameState.waveTimer}
        enemies={gameState.enemies}
      />

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-black overflow-hidden cursor-crosshair"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundImage: `radial-gradient(circle, rgba(100, 100, 100, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Player */}
        <Player player={gameState.player} />

        {/* Enemies */}
        {gameState.enemies.map((enemy) => (
          <Enemy key={enemy.id} enemy={enemy} />
        ))}

        {/* Bullets */}
        {gameState.bullets.map((bullet) => (
          <Bullet key={bullet.id} bullet={bullet} />
        ))}

        {/* Grenades */}
        {gameState.grenades.map((grenade) => (
          <Grenade key={grenade.id} grenade={grenade} />
        ))}

        {/* Health Packs */}
        {gameState.healthPacks.map((pack) => (
          <HealthPack key={pack.id} pack={pack} />
        ))}

        {/* Shields */}
        {gameState.shields.map((shield) => (
          <Shield key={shield.id} shield={shield} />
        ))}

        {/* Particles */}
        {gameState.particles.map((particle) => (
          <Particle key={particle.id} particle={particle} />
        ))}

        {/* Inactive Turrets */}
        {gameState.inactiveTurrets.map((turret) => (
          <InactiveTurret key={turret.id} turret={turret} />
        ))}

        {/* Active Turrets */}
        {gameState.turrets.map((turret) => (
          <ActiveTurret key={turret.id} turret={turret} />
        ))}

        {/* Pause button */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <span className="text-xs text-gray-400">Press P</span>
          <button
            onClick={() => {
              const newState =
                gameState.gameState === 'paused' ? 'playing' : 'paused';
              dispatch({ type: 'SET_GAME_STATE', payload: newState });
            }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm"
          >
            {gameState.gameState === 'paused' ? '▶️' : '⏸️'}
          </button>
        </div>
      </div>

      {/* Pause overlay */}
      {gameState.gameState === 'paused' && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white z-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
            <p className="text-gray-300">Press P to resume</p>
          </div>
        </div>
      )}
    </div>
  );
};
