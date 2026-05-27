import { useState, useEffect, useRef } from 'react';

const IGNORED_KEYS = new Set([
  'CapsLock', 'Dead', 'Control', 'Tab', 'Alt', 'AltGraph', 'Shift', 'Meta',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
]);

/**
 * @param text       - current text to type
 * @param sound      - play key sound
 * @param disabled   - stop accepting input (e.g. eliminated in Survival)
 * @param onProgress - (pct: number) => void
 * @param onFinish   - (stats) => void  — called when text is fully typed
 * @param onError    - () => void       — called on first wrong key per character position (Survival)
 */
export const useMultiplayerTyping = ({ text, sound, disabled = false, onProgress, onFinish, onError }) => {
  const [cursor, setCursor] = useState(0);
  const [charResults, setCharResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const cursorRef       = useRef(0);
  const charResultsRef  = useRef([]);
  const correctRef      = useRef(0);
  const incorrectRef    = useRef(0);
  const secondsRef      = useRef(0);
  const isRunningRef    = useRef(false);
  const isFinishedRef   = useRef(false);
  const disabledRef     = useRef(disabled);

  useEffect(() => { disabledRef.current = disabled; }, [disabled]);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => { secondsRef.current += 1; }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Reset when text changes (new text in Score Attack, or new game)
  useEffect(() => {
    if (!text) return;
    cursorRef.current = 0;
    charResultsRef.current = [];
    correctRef.current = 0;
    incorrectRef.current = 0;
    secondsRef.current = 0;
    isRunningRef.current = false;
    isFinishedRef.current = false;
    setCursor(0);
    setCharResults([]);
    setIsRunning(false);
    setIsFinished(false);
  }, [text]);

  useEffect(() => {
    if (!text) return;

    const handleKeyDown = (e) => {
      const key = e.key;
      if (IGNORED_KEYS.has(key)) return;
      if (isFinishedRef.current) return;
      if (disabledRef.current) return;

      // Start on first non-modifier key
      if (!isRunningRef.current && /^[\S]$/.test(key) && key !== 'Backspace') {
        isRunningRef.current = true;
        setIsRunning(true);
      }

      if (key === 'Backspace') {
        if (charResultsRef.current[cursorRef.current] === 'incorrect') {
          // Clear incorrect mark, stay on same position
          charResultsRef.current[cursorRef.current] = undefined;
          setCharResults([...charResultsRef.current]);
        } else if (cursorRef.current > 0) {
          cursorRef.current -= 1;
          charResultsRef.current = charResultsRef.current.slice(0, cursorRef.current);
          setCursor(cursorRef.current);
          setCharResults([...charResultsRef.current]);
        }
        return;
      }

      if (!isRunningRef.current) return;

      const isCorrect = key === text[cursorRef.current];

      if (sound) {
        const audio = new Audio('/keysound.mp3');
        audio.currentTime = 0;
        audio.play();
      }

      if (!isCorrect) {
        incorrectRef.current += 1;
        // Always fire onError for feedback on every wrong keypress
        onError?.();
        // Only update charResults state if not already marked (avoids redundant re-renders)
        if (charResultsRef.current[cursorRef.current] !== 'incorrect') {
          charResultsRef.current[cursorRef.current] = 'incorrect';
          setCharResults([...charResultsRef.current]);
        }
        return;
      }

      // Correct key → advance
      correctRef.current += 1;
      charResultsRef.current[cursorRef.current] = 'correct';
      setCharResults([...charResultsRef.current]);

      const pct = Math.round(((cursorRef.current + 1) / text.length) * 100);
      onProgress?.(pct);

      if (cursorRef.current === text.length - 1) {
        isFinishedRef.current = true;
        isRunningRef.current = false;
        setIsFinished(true);
        setIsRunning(false);

        const total = correctRef.current + incorrectRef.current;
        const secs  = secondsRef.current || 1;
        const cpm   = Math.round(total / (secs / 60));
        const ppm   = cpm / 5;
        const accurate = Math.round((correctRef.current / total) * 100);
        const score = Math.round(Math.max(0, 100 * (
          (0.2 * ppm) / 100 +
          (0.6 * accurate) / 100 -
          (0.2 * incorrectRef.current) / total
        )));

        onFinish?.({ score, speed: cpm, accuracy: accurate, errors: incorrectRef.current, totalChar: total, time: Math.round(secs) });
        return;
      }

      cursorRef.current += 1;
      setCursor(cursorRef.current);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [text, sound]);

  return { cursor, charResults, isRunning, isFinished };
};
