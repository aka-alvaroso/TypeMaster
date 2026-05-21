import { useState, useEffect, useRef } from 'react';
import axios from '../axiosConfig';

const IGNORED_KEYS = new Set([
  'CapsLock', 'Dead', 'Control', 'Tab', 'Alt', 'AltGraph', 'Shift', 'Meta',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'AudioVolumeDown', 'AudioVolumeUp', 'AudioVolumeMute',
]);

const EMPTY_RESULTS = { isReady: false, score: 0, ppm: 0, cpm: 0, accurate: 0, errors: 0, totalChar: 0, time: 0 };

export const useTypingGame = ({ settings, sound, timeRemaining, onStart, onFinish, setAreResultsSaved }) => {
  const [text, setText] = useState('');
  const [cursor, setCursor] = useState(0);
  const [charResults, setCharResults] = useState([]);

  // Refs para evitar stale closures en el listener del teclado
  const textRef = useRef('');
  const cursorRef = useRef(0);
  const charResultsRef = useRef([]);
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);
  const secondsRef = useRef(0);
  const isRunningRef = useRef(false);
  const isFinishedRef = useRef(false);
  const resultsSentRef = useRef(false);
  const timeRemainingRef = useRef(timeRemaining);

  // Acumuladores para modo timed (persisten entre resets de texto)
  const accTextRef = useRef([]);
  const accResultsRef = useRef([]);

  // Anti-repetición: últimos 5 IDs vistos
  const recentIdsRef = useRef([]);

  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);

  // Timer interno en segundos
  useEffect(() => {
    if (!isRunningRef.current) return;
    const interval = setInterval(() => { secondsRef.current += 1; }, 1000);
    return () => clearInterval(interval);
  }, [isRunningRef.current]); // eslint-disable-line

  useEffect(() => {
    cursorRef.current = 0;
    charResultsRef.current = [];
    correctRef.current = 0;
    incorrectRef.current = 0;
    secondsRef.current = 0;
    isRunningRef.current = false;
    isFinishedRef.current = false;
    resultsSentRef.current = false;
    accTextRef.current = [];
    accResultsRef.current = [];
    setCursor(0);
    setCharResults([]);
    onFinish(EMPTY_RESULTS);
    fetchText();
  }, [settings]);

  // Fin automático en modo timed cuando el tiempo llega a 0
  useEffect(() => {
    if (timeRemaining <= 0 && isRunningRef.current && settings.mode === 'timed') {
      finishGame();
    }
  }, [timeRemaining]);

  const fetchText = async (retries = 2) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/text/get`, {
        params: {
          type:       settings.type,
          difficulty: settings.difficulty,
          length:     settings.length,
          language:   settings.language,
          recentIds:  recentIdsRef.current.join(','),
        },
      });
      const picked = response.data;
      if (picked?.content) {
        textRef.current = picked.content;
        setText(picked.content);
        // Registrar como visto (máx 5)
        recentIdsRef.current = [...recentIdsRef.current, picked.id].slice(-5);
      }
    } catch (err) {
      console.error('[fetchText] Error al obtener texto:', err?.response?.status, err?.message);
      if (retries > 0) {
        setTimeout(() => fetchText(retries - 1), 1000);
      }
    }
  };

  const calculateResults = () => {
    const total = correctRef.current + incorrectRef.current;
    const secs = secondsRef.current;
    if (total === 0 || secs === 0) return null;

    const minutes = secs / 60;
    const cpm = Math.round(total / minutes);
    const ppm = cpm / 5;
    const accurate = Math.round((correctRef.current / total) * 100);
    const score = Math.round(Math.max(0, 100 * (
      (0.2 * ppm) / 100 +
      (0.6 * accurate) / 100 -
      (0.2 * incorrectRef.current) / total
    )));

    return { score, ppm, cpm, accurate, errors: incorrectRef.current, totalChar: total, time: Math.round(secs) };
  };

  const saveResults = (computed) => {
    if (sessionStorage.getItem('loggedIn') !== 'true' || resultsSentRef.current) return;
    resultsSentRef.current = true;

    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const isTimed = settings.mode === 'timed';
    const savedText = isTimed ? accTextRef.current.join('') : textRef.current;
    const savedCharResults = isTimed ? accResultsRef.current : charResultsRef.current;

    axios.post(`${import.meta.env.VITE_API_URL}/user/update`, {
      email: userData.email,
      stats: computed,
      test: { type: settings.type, difficulty: settings.difficulty },
    })
      .then(() => setAreResultsSaved(p => ({ ...p, user: true })))
      .catch(() => setAreResultsSaved(p => ({ ...p, user: false })));

    axios.post(`${import.meta.env.VITE_API_URL}/test/save`, {
      id: crypto.randomUUID(),
      text: savedText,
      player: userData.username,
      date: new Date().toLocaleString('es-ES'),
      charResults: savedCharResults,
      settings: { mode: settings.mode, type: settings.type, difficulty: settings.difficulty, language: settings.language },
      results: { score: computed.score, speed: computed.cpm, accuracy: computed.accurate, numErrors: computed.errors, numCharacters: computed.totalChar, time: computed.time },
    })
      .then(() => setAreResultsSaved(p => ({ ...p, test: true })))
      .catch(() => setAreResultsSaved(p => ({ ...p, test: false })));
  };

  const finishGame = () => {
    isRunningRef.current = false;
    isFinishedRef.current = true;
    const computed = calculateResults();
    if (!computed) {
      onFinish(EMPTY_RESULTS);
      return;
    }
    onFinish({ isReady: true, ...computed });
    saveResults(computed);
  };

  const resetGame = () => {
    isFinishedRef.current = false;
    cursorRef.current = 0;
    charResultsRef.current = [];
    correctRef.current = 0;
    incorrectRef.current = 0;
    secondsRef.current = 0;
    isRunningRef.current = false;
    resultsSentRef.current = false;
    accTextRef.current = [];
    accResultsRef.current = [];
    setCursor(0);
    setCharResults([]);
    onFinish(EMPTY_RESULTS);
    fetchText();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;

      if (key === 'Escape') { resetGame(); return; }
      if (isFinishedRef.current) return;
      if (IGNORED_KEYS.has(key)) return;

      // Tiempo agotado en modo timed — ignorar pulsaciones
      if (settings.mode === 'timed' && timeRemainingRef.current <= 0) return;

      // Arrancar al primer carácter alfanumérico
      if (!isRunningRef.current && /^[\S]$/.test(key) && key !== 'Backspace') {
        isRunningRef.current = true;
        onStart();
      }

      if (key === 'Backspace') {
        if (cursorRef.current > 0) {
          cursorRef.current -= 1;
          const newResults = charResultsRef.current.slice(0, cursorRef.current);
          charResultsRef.current = newResults;
          setCursor(cursorRef.current);
          setCharResults([...newResults]);
        }
        return;
      }

      const currentChar = textRef.current[cursorRef.current];
      const isCorrect = key === currentChar;

      accTextRef.current.push(currentChar);
      accResultsRef.current.push(isCorrect ? 'correct' : 'incorrect');

      if (isCorrect) correctRef.current += 1;
      else incorrectRef.current += 1;

      if (sound) {
        const audio = new Audio('/keysound.mp3');
        audio.currentTime = 0;
        audio.play();
      }

      const newResults = [...charResultsRef.current];
      newResults[cursorRef.current] = isCorrect ? 'correct' : 'incorrect';
      charResultsRef.current = newResults;
      setCharResults([...newResults]);

      // Último carácter del texto
      if (cursorRef.current === textRef.current.length - 1) {
        if (settings.mode === 'timed' && timeRemainingRef.current > 0) {
          cursorRef.current = 0;
          charResultsRef.current = [];
          setCursor(0);
          setCharResults([]);
          fetchText();
          return;
        }
        finishGame();
        return;
      }

      cursorRef.current += 1;
      setCursor(cursorRef.current);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings, sound]); // los valores en tiempo de ejecución se leen via refs

  return { text, cursor, charResults };
};
