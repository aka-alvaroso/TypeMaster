import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Navbar from '../components/Navbar/Navbar';
import GameSelector from '../components/GameSelector/GameSelector';
import TypingArea from '../components/TypingArea/TypingArea';
import Results from '../components/Results/Results';
import Timebar from '../components/Timebar/Timebar';
import Footer from '../components/Footer/Footer';
import FadeUp from '../components/ui/FadeUp';
import { useSettings } from '../context/SettingsContext';

const INITIAL_GAME_RESULTS = {
  isReady: false, score: 0, ppm: 0, cpm: 0, accurate: 0, errors: 0, totalChar: 0, time: 0,
};

const INITIAL_SAVE_STATUS = { user: false, test: false };


const Home = ({ sound, setSound }) => {
  const { t } = useTranslation();
  const { timerDisplay } = useSettings();
  const [isRunning, setIsRunning] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    mode: 'practice', type: 'text', difficulty: 'easy', length: 'medium', time: 60, language: 'es',
  });
  const [gameResults, setGameResults] = useState(INITIAL_GAME_RESULTS);
  const [saveStatus, setSaveStatus] = useState(INITIAL_SAVE_STATUS);
  const [timeRemaining, setTimeRemaining] = useState(gameSettings.time);

  useEffect(() => {
    if (!isRunning || gameSettings.mode !== 'timed') {
      setTimeRemaining(gameSettings.time);
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { clearInterval(interval); setTimeRemaining(gameSettings.time); };
  }, [isRunning, gameSettings.time]);

  if (sessionStorage.getItem('loggedIn') !== 'true') {
    sessionStorage.setItem('loggedIn', false);
    sessionStorage.setItem('token', null);
    sessionStorage.setItem('userData', null);
  }

  const resetGame = useCallback(() => {
    setGameResults(INITIAL_GAME_RESULTS);
    setSaveStatus(INITIAL_SAVE_STATUS);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!gameResults.isReady) return;
    const handler = (e) => { if (e.key === 'Escape') resetGame(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [gameResults.isReady, resetGame]);

  const percent = Math.round((timeRemaining / gameSettings.time) * 100);

  const hint = (
    <p className="text-sm text-kp-muted">
      <RotateCcw size={14} className="mr-1 inline" />
      {t('home.pressEscape')}
      <kbd className="bg-kp-surface border border-kp-border px-2 py-0.5 rounded text-kp-text text-xs">{t('home.escape')}</kbd>
      {t('home.toRestart')}
    </p>
  );

  return (
    <div className="bg-kp-bg text-kp-text w-screen h-screen flex flex-col items-center justify-evenly">
      <Navbar sound={sound} setSound={setSound} />

      <main className="w-full max-w-7xl h-4/5 p-2 flex flex-col items-center justify-center">
        {!gameResults.isReady && (
          <>
            <FadeUp delay={0} className="w-3/5 flex flex-col items-center justify-between">
              <GameSelector gameSettings={gameSettings} setGameSettings={setGameSettings} />
            </FadeUp>

            {gameSettings.mode === 'timed' && (timerDisplay === 'bar' || timerDisplay === 'both') && (
              <Timebar percent={percent} />
            )}

            <FadeUp delay={0.08} className="relative mt-8 w-4/5 text-3xl tracking-wider leading-9" id="test-container">
              {gameSettings.mode === 'timed' && (timerDisplay === 'number' || timerDisplay === 'both') && (
                <span className="absolute -top-7 right-0 text-sm font-medium text-kp-accent tabular-nums">
                  {timeRemaining}s
                </span>
              )}
              <TypingArea
                settings={gameSettings}
                sound={sound}
                timeRemaining={timeRemaining}
                onStart={() => { setIsRunning(true); setSaveStatus(INITIAL_SAVE_STATUS); }}
                onFinish={(results) => { setIsRunning(false); setGameResults(results); }}
                setAreResultsSaved={setSaveStatus}
              />
            </FadeUp>

            <FadeUp delay={0.16} className="mt-6">{hint}</FadeUp>
          </>
        )}

        {gameResults.isReady && (
          <>
            <Results results={gameResults} areResultsSaved={saveStatus} />
            <div className="mt-6">{hint}</div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

Home.propTypes = {
  sound: PropTypes.bool.isRequired,
  setSound: PropTypes.func.isRequired,
};

export default Home;
