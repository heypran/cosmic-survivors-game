import React, { useState, useEffect, useCallback, useRef } from 'react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 12;
const BASE_ENEMY_SPAWN_INTERVAL = 1200;
const WAVE_DURATION = 30000;
const DIAGONAL_FACTOR = 0.707;
const MAX_ENEMIES = 50;
const MAX_BULLETS = 100;
const MAX_PARTICLES = 80;

// Utility functions
const distance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
const angle = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Enemy types
const ENEMY_TYPES = {
  drone: {
    health: 30,
    speed: 2.5,
    size: 16,
    color: '#ff6b6b',
    xp: 12,
    damage: 10,
  },
  shooter: {
    health: 55,
    speed: 1.8,
    size: 20,
    color: '#4ecdc4',
    xp: 25,
    damage: 15,
  },
  tank: {
    health: 110,
    speed: 1.2,
    size: 24,
    color: '#45b7d1',
    xp: 50,
    damage: 25,
  },
};

const getScaledEnemyStats = (type, wave) => {
  const base = ENEMY_TYPES[type];
  const healthMultiplier = 1 + (wave - 1) * 0.2;
  const damageMultiplier = 1 + (wave - 1) * 0.15;

  return {
    ...base,
    health: Math.floor(base.health * healthMultiplier),
    xp: Math.floor(base.xp * Math.sqrt(wave)),
    damage: Math.floor(base.damage * damageMultiplier),
  };
};

// Weapon types
const getWeaponStats = (weapon, player) => {
  const baseWeapons = {
    laser: {
      damage: 18,
      fireRate: 250,
      color: '#00ff00',
      spread: 0,
      name: 'Laser',
    },
    plasma: {
      damage: 35,
      fireRate: 400,
      color: '#ff00ff',
      spread: 0.3,
      name: 'Plasma',
    },
    missile: {
      damage: 50,
      fireRate: 700,
      color: '#ffff00',
      spread: 0,
      name: 'Missile',
    },
    shotgun: {
      damage: 15,
      fireRate: 350,
      color: '#ff6600',
      spread: 0.4,
      bulletCount: 5,
      name: 'Shotgun',
    },
    lightning: {
      damage: 40,
      fireRate: 300,
      color: '#66ffff',
      spread: 0.1,
      name: 'Lightning',
    },
    railgun: {
      damage: 80,
      fireRate: 1000,
      color: '#ffffff',
      spread: 0,
      name: 'Railgun',
    },
    burst: {
      damage: 22,
      fireRate: 200,
      color: '#ff3399',
      spread: 0.15,
      bulletCount: 3,
      name: 'Burst',
    },
  };

  const base = baseWeapons[weapon];
  return {
    ...base,
    damage: Math.floor(base.damage * player.damageMultiplier),
    fireRate: Math.floor(base.fireRate / player.fireRateMultiplier),
  };
};

// Upgrade options
const UPGRADE_OPTIONS = [
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
    description: 'Unlock plasma spread shots',
    icon: '💥',
  },
  {
    id: 'shotgunWeapon',
    name: 'Scatter Gun',
    description: 'Unlock shotgun weapon',
    icon: '🎯',
  },
  {
    id: 'lightningWeapon',
    name: 'Arc Cannon',
    description: 'Unlock lightning weapon',
    icon: '⚡',
  },
  {
    id: 'railgunWeapon',
    name: 'Rail Rifle',
    description: 'Unlock powerful railgun',
    icon: '🔫',
  },
  {
    id: 'burstWeapon',
    name: 'Burst Fire',
    description: 'Unlock burst weapon',
    icon: '💨',
  },
  {
    id: 'multiShot',
    name: 'Dual Targeting',
    description: 'Fire at 2 nearest enemies',
    icon: '🎯',
  },
];

const CosmicSurvivors = () => {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer] = useState({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    health: 100,
    maxHealth: 100,
    level: 1,
    xp: 0,
    xpToNext: 100,
    weapons: ['laser'],
    activeWeapon: 0,
    speed: PLAYER_SPEED,
    damageMultiplier: 1.0,
    fireRateMultiplier: 1.0,
    shieldActive: false,
    shieldTime: 0,
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [grenades, setGrenades] = useState([]);
  const [healthPacks, setHealthPacks] = useState([]);
  const [shields, setShields] = useState([]);
  const [particles, setParticles] = useState([]);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [waveTimer, setWaveTimer] = useState(WAVE_DURATION);
  const [upgrades, setUpgrades] = useState([]);
  const [grenadesSpawned, setGrenadesSpawned] = useState(0);
  const [healthPacksSpawned, setHealthPacksSpawned] = useState(0);
  const [shieldsSpawned, setShieldsSpawned] = useState(0);

  const gameLoopRef = useRef();
  const lastShotRef = useRef(0);
  const lastEnemySpawnRef = useRef(0);
  const playerPosRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const keysRef = useRef({});

  // Manual shooting with enhanced weapon variety
  const manualShoot = useCallback(() => {
    const now = Date.now();
    const currentWeapon = player.weapons[player.activeWeapon] || 'laser';
    const weaponStats = getWeaponStats(currentWeapon, player);

    if (now - lastShotRef.current < weaponStats.fireRate) return;

    const bulletAngle = angle(playerPosRef.current, mousePos);
    const bulletCount =
      weaponStats.bulletCount || (currentWeapon === 'plasma' ? 3 : 1);

    const newBullets = [];
    for (let j = 0; j < bulletCount; j++) {
      const spreadAngle =
        bulletCount > 1
          ? bulletAngle + (j - (bulletCount - 1) / 2) * weaponStats.spread
          : bulletAngle;

      newBullets.push({
        id: Date.now() + Math.random() + j,
        x: playerPosRef.current.x,
        y: playerPosRef.current.y,
        vx: Math.cos(spreadAngle) * BULLET_SPEED,
        vy: Math.sin(spreadAngle) * BULLET_SPEED,
        damage: weaponStats.damage,
        color: weaponStats.color,
        weapon: currentWeapon,
        size:
          currentWeapon === 'railgun' ? 6 : currentWeapon === 'plasma' ? 4 : 3,
      });
    }

    setBullets((prev) => [...prev, ...newBullets].slice(-MAX_BULLETS));
    lastShotRef.current = now;
  }, [player, mousePos]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      if (key === 'p' && gameState === 'playing') {
        setGameState('paused');
      } else if (key === 'p' && gameState === 'paused') {
        setGameState('playing');
      }

      if (key === ' ' && gameState === 'playing') {
        e.preventDefault();
        manualShoot();
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, manualShoot]);

  // Update player position ref
  useEffect(() => {
    playerPosRef.current = { x: player.x, y: player.y };
  }, [player.x, player.y]);

  // Create particle effect
  const createParticles = useCallback((x, y, color, count = 5) => {
    const newParticles = Array.from({ length: count }, () => ({
      id: Date.now() + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      maxLife: 30,
      color,
    }));
    setParticles((prev) => [...prev, ...newParticles].slice(-MAX_PARTICLES));
  }, []);

  // Spawn grenade near player with different types
  const spawnGrenade = useCallback(() => {
    if (wave < 3) return;

    const angleRad = Math.random() * 2 * Math.PI;
    const dist = 80 + Math.random() * 120;
    const x = playerPosRef.current.x + Math.cos(angleRad) * dist;
    const y = playerPosRef.current.y + Math.sin(angleRad) * dist;

    const clampedX = clamp(x, 30, GAME_WIDTH - 30);
    const clampedY = clamp(y, 30, GAME_HEIGHT - 30);

    let grenadeType = 'explosive';
    let color = '#ff8800';
    let explosionRadius = 600;
    let damage = 100;

    if (wave >= 8) {
      const rand = Math.random();
      if (rand < 0.3) {
        grenadeType = 'freeze';
        color = '#00ccff';
        explosionRadius = 500;
        damage = 50;
      } else if (rand < 0.6) {
        grenadeType = 'poison';
        color = '#66ff00';
        explosionRadius = 450;
        damage = 80;
      } else {
        grenadeType = 'nuclear';
        color = '#ff0066';
        explosionRadius = 700;
        damage = 150;
      }
    }

    setGrenades((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: clampedX,
        y: clampedY,
        size: 20,
        color: color,
        explosionRadius: explosionRadius,
        damage: damage,
        type: grenadeType,
      },
    ]);
  }, [wave]);

  // Spawn shield near player
  const spawnShield = useCallback(() => {
    if (wave < 10) return;

    const angleRad = Math.random() * 2 * Math.PI;
    const dist = 50 + Math.random() * 80;
    const x = playerPosRef.current.x + Math.cos(angleRad) * dist;
    const y = playerPosRef.current.y + Math.sin(angleRad) * dist;

    const clampedX = clamp(x, 25, GAME_WIDTH - 25);
    const clampedY = clamp(y, 25, GAME_HEIGHT - 25);

    setShields((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: clampedX,
        y: clampedY,
        size: 18,
        color: '#00aaff',
        duration: 4000 + Math.random() * 2000,
      },
    ]);
  }, [wave]);

  // Spawn health pack near player
  const spawnHealthPack = useCallback(() => {
    if (wave < 4) return;

    const angleRad = Math.random() * 2 * Math.PI;
    const dist = 60 + Math.random() * 100;
    const x = playerPosRef.current.x + Math.cos(angleRad) * dist;
    const y = playerPosRef.current.y + Math.sin(angleRad) * dist;

    const clampedX = clamp(x, 25, GAME_WIDTH - 25);
    const clampedY = clamp(y, 25, GAME_HEIGHT - 25);

    setHealthPacks((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        x: clampedX,
        y: clampedY,
        size: 16,
        color: '#00ff88',
        healAmount: 30,
      },
    ]);
  }, [wave]);

  // Explode grenade with different effects
  const explodeGrenade = useCallback(
    (grenade) => {
      const particleColor =
        grenade.type === 'freeze'
          ? '#00ccff'
          : grenade.type === 'poison'
            ? '#66ff00'
            : grenade.type === 'nuclear'
              ? '#ff0066'
              : '#ff8800';

      createParticles(grenade.x, grenade.y, particleColor, 20);
      createParticles(grenade.x, grenade.y, '#ffff00', 15);

      setEnemies((prev) =>
        prev.filter((enemy) => {
          const dist = distance(grenade, enemy);
          if (dist <= grenade.explosionRadius) {
            createParticles(enemy.x, enemy.y, enemy.color, 8);
            setScore((prevScore) => prevScore + enemy.xp);
            return false;
          }
          return true;
        })
      );

      setGrenades((prev) => prev.filter((g) => g.id !== grenade.id));
    },
    [createParticles]
  );

  // Spawn enemies
  const spawnEnemies = useCallback(() => {
    if (enemies.length >= MAX_ENEMIES) return;

    const baseSpawnCount = Math.min(1 + Math.floor(wave / 2), 3);
    const actualSpawnCount = Math.min(
      baseSpawnCount,
      MAX_ENEMIES - enemies.length
    );

    for (let i = 0; i < actualSpawnCount; i++) {
      let type;
      const rand = Math.random();
      if (wave < 2) {
        type = rand < 0.8 ? 'drone' : rand < 0.95 ? 'shooter' : 'tank';
      } else if (wave < 4) {
        type = rand < 0.6 ? 'drone' : rand < 0.85 ? 'shooter' : 'tank';
      } else if (wave < 8) {
        type = rand < 0.4 ? 'drone' : rand < 0.75 ? 'shooter' : 'tank';
      } else {
        type = rand < 0.25 ? 'drone' : rand < 0.6 ? 'shooter' : 'tank';
      }

      const config = getScaledEnemyStats(type, wave);

      const side = Math.floor(Math.random() * 4);
      let x, y;

      switch (side) {
        case 0:
          x = Math.random() * GAME_WIDTH;
          y = -config.size;
          break;
        case 1:
          x = GAME_WIDTH + config.size;
          y = Math.random() * GAME_HEIGHT;
          break;
        case 2:
          x = Math.random() * GAME_WIDTH;
          y = GAME_HEIGHT + config.size;
          break;
        case 3:
          x = -config.size;
          y = Math.random() * GAME_HEIGHT;
          break;
        default:
          x = 0;
          y = 0;
          break;
      }

      setEnemies((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random() + i,
          type,
          x,
          y,
          health: config.health,
          maxHealth: config.health,
          speed: config.speed,
          size: config.size,
          color: config.color,
          xp: config.xp,
          damage: config.damage,
        },
      ]);
    }
  }, [wave, enemies.length]);

  // Level up
  const levelUp = useCallback(() => {
    const randomUpgrades = UPGRADE_OPTIONS.sort(
      () => Math.random() - 0.5
    ).slice(0, 3);
    setUpgrades(randomUpgrades);
    setGameState('levelUp');
  }, []);

  // Apply upgrade with new weapons
  const applyUpgrade = useCallback((upgrade) => {
    setPlayer((prev) => {
      const newPlayer = { ...prev };
      switch (upgrade.id) {
        case 'damage':
          newPlayer.damageMultiplier = Math.min(
            newPlayer.damageMultiplier * 1.25,
            5.0
          );
          break;
        case 'speed':
          newPlayer.speed = Math.min(newPlayer.speed * 1.2, 12);
          break;
        case 'health':
          newPlayer.maxHealth += 25;
          newPlayer.health = Math.min(
            newPlayer.health + 25,
            newPlayer.maxHealth
          );
          break;
        case 'fireRate':
          newPlayer.fireRateMultiplier = Math.min(
            newPlayer.fireRateMultiplier * 1.3,
            4.0
          );
          break;
        case 'plasmaWeapon':
          if (!newPlayer.weapons.includes('plasma')) {
            newPlayer.weapons.push('plasma');
            newPlayer.activeWeapon = newPlayer.weapons.length - 1;
          }
          break;
        case 'shotgunWeapon':
          if (!newPlayer.weapons.includes('shotgun')) {
            newPlayer.weapons.push('shotgun');
            newPlayer.activeWeapon = newPlayer.weapons.length - 1;
          }
          break;
        case 'lightningWeapon':
          if (!newPlayer.weapons.includes('lightning')) {
            newPlayer.weapons.push('lightning');
            newPlayer.activeWeapon = newPlayer.weapons.length - 1;
          }
          break;
        case 'railgunWeapon':
          if (!newPlayer.weapons.includes('railgun')) {
            newPlayer.weapons.push('railgun');
            newPlayer.activeWeapon = newPlayer.weapons.length - 1;
          }
          break;
        case 'burstWeapon':
          if (!newPlayer.weapons.includes('burst')) {
            newPlayer.weapons.push('burst');
            newPlayer.activeWeapon = newPlayer.weapons.length - 1;
          }
          break;
        case 'multiShot':
          if (!newPlayer.weapons.includes('multiShot')) {
            newPlayer.weapons.push('multiShot');
          }
          break;
        default:
          break;
      }
      return newPlayer;
    });
    setGameState('playing');
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();

    // Move player with fluid movement
    let deltaX = 0;
    let deltaY = 0;

    if (keysRef.current['w'] || keysRef.current['arrowup']) deltaY -= 1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) deltaY += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) deltaX -= 1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) deltaX += 1;

    if (deltaX !== 0 && deltaY !== 0) {
      deltaX *= DIAGONAL_FACTOR;
      deltaY *= DIAGONAL_FACTOR;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      const newX = clamp(
        playerPosRef.current.x + deltaX * player.speed,
        16,
        GAME_WIDTH - 16
      );
      const newY = clamp(
        playerPosRef.current.y + deltaY * player.speed,
        16,
        GAME_HEIGHT - 16
      );

      playerPosRef.current = { x: newX, y: newY };
      setPlayer((prev) => ({ ...prev, x: newX, y: newY }));
    }

    // Spawn enemies
    const currentSpawnInterval = Math.max(
      BASE_ENEMY_SPAWN_INTERVAL - (wave - 1) * 80,
      500
    );

    if (now - lastEnemySpawnRef.current > currentSpawnInterval) {
      spawnEnemies();
      lastEnemySpawnRef.current = now;
    }

    // Spawn grenades (2 per wave after level 3)
    if (wave >= 3 && grenadesSpawned < wave * 2) {
      if (Math.random() < 0.01) {
        spawnGrenade();
        setGrenadesSpawned((prev) => prev + 1);
      }
    }

    // Spawn health packs (2 per wave after level 4)
    if (wave >= 4 && healthPacksSpawned < wave * 2) {
      if (Math.random() < 0.008) {
        spawnHealthPack();
        setHealthPacksSpawned((prev) => prev + 1);
      }
    }

    // Spawn shields (after level 10)
    if (wave >= 10 && shieldsSpawned < Math.floor(wave / 2)) {
      if (Math.random() < 0.005) {
        spawnShield();
        setShieldsSpawned((prev) => prev + 1);
      }
    }

    // Move enemies
    setEnemies((prev) =>
      prev.map((enemy) => {
        const moveAngle = angle(enemy, playerPosRef.current);
        return {
          ...enemy,
          x: enemy.x + Math.cos(moveAngle) * enemy.speed,
          y: enemy.y + Math.sin(moveAngle) * enemy.speed,
        };
      })
    );

    // Move bullets
    setBullets((prev) =>
      prev
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.vx,
          y: bullet.y + bullet.vy,
        }))
        .filter(
          (bullet) =>
            bullet.x > -10 &&
            bullet.x < GAME_WIDTH + 10 &&
            bullet.y > -10 &&
            bullet.y < GAME_HEIGHT + 10
        )
    );

    // Check bullet-grenade collisions
    setBullets((prevBullets) => {
      let remainingBullets = [...prevBullets];

      grenades.forEach((grenade) => {
        remainingBullets = remainingBullets.filter((bullet) => {
          if (distance(bullet, grenade) < grenade.size) {
            explodeGrenade(grenade);
            return false;
          }
          return true;
        });
      });

      return remainingBullets;
    });

    // Check player-grenade collisions
    grenades.forEach((grenade) => {
      if (distance(playerPosRef.current, grenade) < grenade.size + 16) {
        explodeGrenade(grenade);
      }
    });

    // Check player-shield collisions
    shields.forEach((shield) => {
      if (distance(playerPosRef.current, shield) < shield.size + 16) {
        setPlayer((prev) => ({
          ...prev,
          shieldActive: true,
          shieldTime: shield.duration,
        }));
        setShields((prev) => prev.filter((s) => s.id !== shield.id));
        createParticles(shield.x, shield.y, '#00aaff', 12);
      }
    });

    // Check player-health pack collisions
    healthPacks.forEach((pack) => {
      if (distance(playerPosRef.current, pack) < pack.size + 16) {
        setPlayer((prev) => ({
          ...prev,
          health: Math.min(prev.health + pack.healAmount, prev.maxHealth),
        }));
        setHealthPacks((prev) => prev.filter((p) => p.id !== pack.id));
        createParticles(pack.x, pack.y, '#00ff88', 8);
      }
    });

    // Bullet-enemy collisions
    setBullets((prevBullets) => {
      const remainingBullets = [];

      prevBullets.forEach((bullet) => {
        let hit = false;

        setEnemies((prevEnemies) => {
          return prevEnemies
            .map((enemy) => {
              if (!hit && distance(bullet, enemy) < enemy.size) {
                hit = true;
                createParticles(enemy.x, enemy.y, enemy.color, 3);

                const newHealth = enemy.health - bullet.damage;
                if (newHealth <= 0) {
                  setScore((prev) => prev + enemy.xp);
                  setPlayer((prev) => {
                    const newXp = prev.xp + enemy.xp;
                    if (newXp >= prev.xpToNext) {
                      setTimeout(levelUp, 100);
                      return {
                        ...prev,
                        level: prev.level + 1,
                        xp: newXp - prev.xpToNext,
                        xpToNext: Math.floor(prev.xpToNext * 1.5),
                      };
                    }
                    return { ...prev, xp: newXp };
                  });
                  return null;
                }
                return { ...enemy, health: newHealth };
              }
              return enemy;
            })
            .filter(Boolean);
        });

        if (!hit) {
          remainingBullets.push(bullet);
        }
      });

      return remainingBullets;
    });

    // Enemy-player collisions (with shield protection)
    setEnemies((prevEnemies) => {
      let playerHit = false;
      const remainingEnemies = prevEnemies.filter((enemy) => {
        if (distance(enemy, playerPosRef.current) < enemy.size + 16) {
          if (!playerHit && !player.shieldActive) {
            playerHit = true;
            setPlayer((prev) => {
              const newHealth = prev.health - enemy.damage;
              if (newHealth <= 0) {
                setGameState('gameOver');
              }
              return { ...prev, health: Math.max(0, newHealth) };
            });
          }
          createParticles(
            enemy.x,
            enemy.y,
            player.shieldActive ? '#00aaff' : '#ff0000',
            5
          );
          return false;
        }
        return true;
      });
      return remainingEnemies;
    });

    // Update shield timer
    if (player.shieldActive) {
      setPlayer((prev) => {
        const newShieldTime = prev.shieldTime - 16;
        if (newShieldTime <= 0) {
          return { ...prev, shieldActive: false, shieldTime: 0 };
        }
        return { ...prev, shieldTime: newShieldTime };
      });
    }

    // Update particles
    setParticles((prev) =>
      prev
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
        }))
        .filter((particle) => particle.life > 0)
    );

    // Update wave timer
    setWaveTimer((prev) => {
      const newTimer = prev - 16;
      if (newTimer <= 0) {
        setWave((prevWave) => {
          const newWave = prevWave + 1;
          setGrenadesSpawned(0);
          setHealthPacksSpawned(0);
          setShieldsSpawned(0);
          return newWave;
        });
        return WAVE_DURATION;
      }
      return newTimer;
    });
  }, [
    gameState,
    player,
    wave,
    grenadesSpawned,
    healthPacksSpawned,
    shieldsSpawned,
    grenades,
    healthPacks,
    shields,
    spawnEnemies,
    spawnGrenade,
    spawnHealthPack,
    spawnShield,
    explodeGrenade,
    createParticles,
    levelUp,
  ]);

  // Start game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(gameLoop, 16);
    } else {
      clearInterval(gameLoopRef.current);
    }

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, gameLoop]);

  // Start new game
  const startGame = () => {
    setGameState('playing');
    setPlayer({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      health: 100,
      maxHealth: 100,
      level: 1,
      xp: 0,
      xpToNext: 100,
      weapons: ['laser'],
      activeWeapon: 0,
      speed: PLAYER_SPEED,
      damageMultiplier: 1.0,
      fireRateMultiplier: 1.0,
      shieldActive: false,
      shieldTime: 0,
    });
    setEnemies([]);
    setBullets([]);
    setGrenades([]);
    setHealthPacks([]);
    setEnemies([]);
    setBullets([]);
    setGrenades([]);
    setHealthPacks([]);
    setShields([]);
    setParticles([]);
    setWave(1);
    setScore(0);
    setWaveTimer(WAVE_DURATION);
    setGrenadesSpawned(0);
    setHealthPacksSpawned(0);
    setShieldsSpawned(0);
    playerPosRef.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    lastShotRef.current = 0;
    lastEnemySpawnRef.current = 0;
  };

  // Render game object with shield effect
  const renderGameObject = (obj, isPlayer = false) => (
    <div
      key={obj.id || 'player'}
      className="absolute"
      style={{
        left: obj.x - (obj.size || 16) / 2,
        top: obj.y - (obj.size || 16) / 2,
        width: obj.size || 16,
        height: obj.size || 16,
        backgroundColor: obj.color || '#00ff00',
        borderRadius: isPlayer ? '2px' : '50%',
        border: isPlayer ? '2px solid #ffffff' : 'none',
        boxShadow:
          isPlayer && player.shieldActive
            ? `0 0 20px #00aaff, 0 0 40px #0088cc`
            : `0 0 ${isPlayer ? '8px' : '4px'} ${obj.color || '#00ff00'}`,
        zIndex: isPlayer ? 10 : 1,
      }}
    >
      {obj.health !== undefined && obj.health < obj.maxHealth && (
        <div className="absolute -top-3 left-0 w-full h-1 bg-red-500 rounded">
          <div
            className="h-full bg-green-500 rounded transition-all duration-200"
            style={{ width: `${(obj.health / obj.maxHealth) * 100}%` }}
          />
        </div>
      )}
      {isPlayer && player.shieldActive && (
        <div className="absolute -inset-2 rounded-full border-2 border-blue-400 opacity-60 animate-pulse"></div>
      )}
    </div>
  );

  if (gameState === 'menu') {
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
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              START MISSION
            </button>
            <div className="text-sm text-gray-400 space-y-1">
              <p>WASD to move • Click or SPACE to shoot</p>
              <p>Manual firing • Survive as long as possible</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'levelUp') {
    return (
      <div className="w-full h-screen bg-black bg-opacity-80 flex items-center justify-center text-white fixed inset-0 z-50">
        <div className="bg-gray-900 border border-purple-500 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">
            LEVEL UP!
          </h2>
          <p className="text-center mb-6 text-gray-300">
            Choose your enhancement:
          </p>
          <div className="space-y-3">
            {upgrades.map((upgrade) => (
              <button
                key={upgrade.id}
                onClick={() => applyUpgrade(upgrade)}
                className="w-full p-4 bg-gray-800 hover:bg-purple-700 border border-gray-600 hover:border-purple-400 rounded-lg transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{upgrade.icon}</span>
                  <div>
                    <div className="font-semibold text-purple-300">
                      {upgrade.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {upgrade.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-red-900 via-purple-900 to-black flex items-center justify-center text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            MISSION FAILED
          </h1>
          <div className="space-y-2 text-lg">
            <p>
              Final Score:{' '}
              <span className="text-purple-400 font-bold">{score}</span>
            </p>
            <p>
              Waves Survived:{' '}
              <span className="text-blue-400 font-bold">{wave}</span>
            </p>
            <p>
              Level Reached:{' '}
              <span className="text-green-400 font-bold">{player.level}</span>
            </p>
            <p className="text-sm text-gray-300">
              Damage: {(player.damageMultiplier * 100).toFixed(0)}% • Speed:{' '}
              {((player.speed / PLAYER_SPEED) * 100).toFixed(0)}% • Fire Rate:{' '}
              {(player.fireRateMultiplier * 100).toFixed(0)}%
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              RETRY MISSION
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="block mx-auto px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Enhanced HUD with power-ups display */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-between items-start p-4 bg-black bg-opacity-50 text-white">
        <div className="flex flex-col space-y-3">
          {/* Health and XP bars */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">❤️</span>
              <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                  style={{
                    width: `${(player.health / player.maxHealth) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm">
                {player.health}/{player.maxHealth}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">⭐</span>
              <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-200"
                  style={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
                />
              </div>
              <span className="text-sm">Lv.{player.level}</span>
            </div>
          </div>

          {/* Power-ups display */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="text-yellow-300">
              <span className="font-semibold">⚡ DMG:</span>{' '}
              {Math.round(player.damageMultiplier * 100)}%
            </div>
            <div className="text-blue-300">
              <span className="font-semibold">🚀 SPD:</span>{' '}
              {Math.round((player.speed / PLAYER_SPEED) * 100)}%
            </div>
            <div className="text-green-300">
              <span className="font-semibold">🔥 RATE:</span>{' '}
              {Math.round(player.fireRateMultiplier * 100)}%
            </div>
            {player.weapons.includes('multiShot') && (
              <div className="text-pink-300 font-bold">🎯 DUAL</div>
            )}
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-lg font-bold">Score: {score}</div>
          <div className="text-sm">
            Wave {wave} • {Math.ceil(waveTimer / 1000)}s
          </div>
          <div className="text-xs text-purple-300">
            Weapon:{' '}
            {(
              getWeaponStats(
                player.weapons[player.activeWeapon] || 'laser',
                player
              ).name || 'LASER'
            ).toUpperCase()}
            {player.shieldActive && (
              <span className="text-blue-400">
                {' '}
                • SHIELD: {Math.ceil(player.shieldTime / 1000)}s
              </span>
            )}
          </div>
          <div className="text-xs text-gray-300">
            Manual firing mode • Enemies: {enemies.length}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-black border-2 border-purple-500 cursor-crosshair"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onClick={(e) => {
          if (gameState === 'playing') {
            manualShoot();
          }
        }}
      >
        {/* Stars background */}
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Player */}
        {renderGameObject(player, true)}

        {/* Enemies */}
        {enemies.map((enemy) => renderGameObject(enemy))}

        {/* Grenades with different types */}
        {grenades.map((grenade) => (
          <div
            key={grenade.id}
            className="absolute rounded-full"
            style={{
              left: grenade.x - grenade.size / 2,
              top: grenade.y - grenade.size / 2,
              width: grenade.size,
              height: grenade.size,
              backgroundColor: grenade.color,
              border: `2px solid ${
                grenade.type === 'freeze'
                  ? '#66ccff'
                  : grenade.type === 'poison'
                    ? '#88ff44'
                    : grenade.type === 'nuclear'
                      ? '#ff4488'
                      : '#ffaa00'
              }`,
              boxShadow: `0 0 12px ${grenade.color}`,
              animation: 'pulse 1s infinite',
            }}
          >
            <div className="absolute inset-1 rounded-full bg-yellow-300 opacity-60"></div>
            {grenade.type !== 'explosive' && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {grenade.type === 'freeze'
                  ? '❄️'
                  : grenade.type === 'poison'
                    ? '☢️'
                    : '☢️'}
              </div>
            )}
          </div>
        ))}

        {/* Shields */}
        {shields.map((shield) => (
          <div
            key={shield.id}
            className="absolute rounded-full"
            style={{
              left: shield.x - shield.size / 2,
              top: shield.y - shield.size / 2,
              width: shield.size,
              height: shield.size,
              backgroundColor: shield.color,
              border: '2px solid #0088ff',
              boxShadow: `0 0 15px ${shield.color}`,
              animation: 'pulse 0.8s infinite',
            }}
          >
            <div className="absolute inset-1 bg-white opacity-40 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
              🛡️
            </div>
          </div>
        ))}

        {/* Health Packs */}
        {healthPacks.map((pack) => (
          <div
            key={pack.id}
            className="absolute rounded"
            style={{
              left: pack.x - pack.size / 2,
              top: pack.y - pack.size / 2,
              width: pack.size,
              height: pack.size,
              backgroundColor: pack.color,
              border: '2px solid #00ffaa',
              boxShadow: `0 0 10px ${pack.color}`,
              borderRadius: '4px',
            }}
          >
            <div className="absolute inset-1 bg-white opacity-80 rounded flex items-center justify-center text-xs font-bold text-green-600">
              +
            </div>
          </div>
        ))}

        {/* Enhanced Bullets */}
        {bullets.map((bullet) => (
          <div
            key={bullet.id}
            className="absolute rounded-full"
            style={{
              left: bullet.x - (bullet.size || 3) / 2,
              top: bullet.y - (bullet.size || 3) / 2,
              width: bullet.size || 3,
              height: bullet.size || 3,
              backgroundColor: bullet.color,
              boxShadow: `0 0 ${bullet.size === 6 ? '12px' : '8px'} ${bullet.color}, 
                         0 0 ${bullet.size === 6 ? '24px' : '16px'} ${bullet.color}40`,
              border: `1px solid ${bullet.color}`,
              opacity: 0.9,
            }}
          />
        ))}

        {/* Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              opacity: particle.life / particle.maxLife,
            }}
          />
        ))}

        {/* Pause button */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <span className="text-xs text-gray-400">Press P</span>
          <button
            onClick={() =>
              setGameState(gameState === 'paused' ? 'playing' : 'paused')
            }
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm"
          >
            {gameState === 'paused' ? '▶️' : '⏸️'}
          </button>
        </div>

        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">PAUSED</h2>
              <button
                onClick={() => setGameState('playing')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls reminder */}
      <div className="mt-4 text-gray-400 text-sm text-center">
        WASD: Move • Click or SPACE to shoot • P: Pause
        {wave >= 3 && <span> • Grenades explode on contact!</span>}
        {wave >= 4 && <span> • Green packs restore health</span>}
        {wave >= 8 && <span> • Special grenade types available</span>}
        {wave >= 10 && (
          <span> • Blue shields provide temporary protection</span>
        )}
      </div>
    </div>
  );
};

export default CosmicSurvivors;
