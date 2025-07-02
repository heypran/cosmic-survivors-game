import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling keyboard input
 * @param {string} gameState - Current game state
 * @param {Function} onKeyPress - Callback for key press events
 * @param {Function} onKeyRelease - Callback for key release events
 * @returns {Object} Keys ref object
 */
export const useKeyboard = (gameState, onKeyPress, onKeyRelease) => {
  const keysRef = useRef({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      if (onKeyPress) {
        onKeyPress(key, e);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;

      if (onKeyRelease) {
        onKeyRelease(key, e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, onKeyPress, onKeyRelease]);

  return keysRef;
};

/**
 * Check if a key is currently pressed
 * @param {Object} keysRef - Keys ref from useKeyboard hook
 * @param {string} key - Key to check
 * @returns {boolean} True if key is pressed
 */
export const isKeyPressed = (keysRef, key) => {
  return !!keysRef.current[key.toLowerCase()];
};

/**
 * Check if any of the provided keys are pressed
 * @param {Object} keysRef - Keys ref from useKeyboard hook
 * @param {Array} keys - Array of keys to check
 * @returns {boolean} True if any key is pressed
 */
export const areAnyKeysPressed = (keysRef, keys) => {
  return keys.some((key) => isKeyPressed(keysRef, key));
};
