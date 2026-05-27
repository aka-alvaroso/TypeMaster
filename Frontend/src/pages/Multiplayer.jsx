import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Plus, LogIn, Flag, Timer, Heart } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FadeUp from '../components/ui/FadeUp';
import { useSocket } from '../context/SocketContext';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const LENGTHS      = ['short', 'medium', 'long'];
const TYPES        = ['text', 'code'];
const LANGUAGES    = ['es', 'en'];
const DURATIONS    = [30, 60, 120];

const MODES = [
  { id: 'race',         icon: Flag,  labelKey: 'modeRace' },
  { id: 'score_attack', icon: Timer, labelKey: 'modeScoreAttack' },
  { id: 'survival',     icon: Heart, labelKey: 'modeSurvival' },
];

const Multiplayer = ({ sound, setSound }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { socket, authError } = useSocket();

  const [tab, setTab]         = useState('create');
  const [joinCode, setJoinCode] = useState('');
  const [settings, setSettings] = useState({
    mode: 'race', difficulty: 'easy', length: 'medium',
    type: 'text', language: 'es', duration: 60,
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('loggedIn') !== 'true') navigate('/auth');
  }, [navigate]);

  const set = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const handleCreate = () => {
    if (!socket) return;
    setLoading(true);
    setError('');
    socket.emit('room:create', settings, ({ code, error: err }) => {
      setLoading(false);
      if (err) { setError(t('multiplayer.errorCreate')); return; }
      navigate(`/multiplayer/${code}`);
    });
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) { setError(t('multiplayer.invalidCode')); return; }
    if (!socket) return;
    setLoading(true);
    setError('');
    socket.emit('room:join', { code }, ({ room, error: err }) => {
      setLoading(false);
      if (err) {
        const msg = err === 'room_not_found' ? t('multiplayer.roomNotFound')
          : err === 'game_started'           ? t('multiplayer.gameStarted')
          : err === 'room_full'              ? t('multiplayer.roomFull')
          :                                    t('multiplayer.errorJoin');
        setError(msg);
        return;
      }
      void room;
      navigate(`/multiplayer/${code}`);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-kp-bg">
      <Navbar sound={sound} setSound={setSound} />
      <FadeUp className="flex flex-col items-center w-full max-w-xl px-4 py-12 gap-8">

        <div className="flex items-center gap-3">
          <Users size={20} className="text-kp-accent" />
          <h1 className="text-2xl font-semibold text-kp-text">{t('multiplayer.title')}</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex w-full border border-kp-border">
          {[['create', Plus, 'multiplayer.createRoom'], ['join', LogIn, 'multiplayer.joinRoom']].map(([id, Icon, key]) => (
            <button
              key={id}
              onClick={() => { setTab(id); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${tab === id ? 'bg-kp-accent text-white' : 'text-kp-muted hover:text-kp-text'}`}
            >
              <Icon size={14} />{t(key)}
            </button>
          ))}
        </div>

        {/* Create tab */}
        {tab === 'create' && (
          <div className="flex flex-col gap-5 w-full">

            {/* Mode selector */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-kp-muted uppercase tracking-widest">{t('multiplayer.mode')}</p>
              <div className="flex gap-2">
                {MODES.map(({ id, icon: Icon, labelKey }) => (
                  <button
                    key={id}
                    onClick={() => set('mode', id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 border text-sm transition-colors ${settings.mode === id ? 'border-kp-accent text-kp-accent bg-kp-accent/5' : 'border-kp-border text-kp-muted hover:text-kp-text hover:border-kp-text'}`}
                  >
                    <Icon size={16} />
                    <span>{t(`multiplayer.${labelKey}`)}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-kp-muted">{t(`multiplayer.${settings.mode}Desc`)}</p>
            </div>

            {/* Game settings */}
            <div className="flex flex-col gap-3">
              <p className="text-xs text-kp-muted uppercase tracking-widest">{t('multiplayer.gameSettings')}</p>
              <OptionGroup label={t('multiplayer.difficulty')} options={DIFFICULTIES} current={settings.difficulty} onSelect={v => set('difficulty', v)} labelKey="gameSelector" />
              {settings.mode !== 'score_attack' && (
                <OptionGroup label={t('multiplayer.length')} options={LENGTHS} current={settings.length} onSelect={v => set('length', v)} labelKey="gameSelector" />
              )}
              {settings.mode === 'score_attack' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-kp-muted w-24 shrink-0">{t('multiplayer.duration')}</span>
                  <div className="flex gap-2">
                    {DURATIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => set('duration', d)}
                        className={`px-3 py-1 text-sm border transition-colors ${settings.duration === d ? 'border-kp-accent text-kp-accent' : 'border-kp-border text-kp-muted hover:text-kp-text hover:border-kp-text'}`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <OptionGroup label={t('multiplayer.type')} options={TYPES} current={settings.type} onSelect={v => set('type', v)} labelKey="multiplayer" />
              <OptionGroup label={t('multiplayer.language')} options={LANGUAGES} current={settings.language} onSelect={v => set('language', v)} labelKey="multiplayer" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading || !socket}
              className="w-full py-3 bg-kp-accent text-white font-medium hover:brightness-105 transition-all disabled:opacity-50"
            >
              {loading ? t('multiplayer.creating') : t('multiplayer.createRoom')}
            </button>
          </div>
        )}

        {/* Join tab */}
        {tab === 'join' && (
          <div className="flex flex-col gap-4 w-full">
            <p className="text-xs text-kp-muted uppercase tracking-widest">{t('multiplayer.enterCode')}</p>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="XXXX"
              className="w-full bg-kp-surface border border-kp-border px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-kp-text placeholder:text-kp-muted focus:outline-none focus:border-kp-accent"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading || !socket}
              className="w-full py-3 bg-kp-accent text-white font-medium hover:brightness-105 transition-all disabled:opacity-50"
            >
              {loading ? t('multiplayer.joining') : t('multiplayer.joinRoom')}
            </button>
          </div>
        )}

        {authError && (
          <div className="w-full border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {t('multiplayer.sessionExpired')}{' '}
            <a href="/keypro/auth" className="underline hover:text-red-300">{t('multiplayer.loginAgain')}</a>
          </div>
        )}
        {!socket && !authError && (
          <p className="text-kp-muted text-sm">{t('multiplayer.connecting')}</p>
        )}

      </FadeUp>
      <Footer />
    </div>
  );
};

const OptionGroup = ({ label, options, current, onSelect, labelKey }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-kp-muted w-24 shrink-0">{label}</span>
      <div className="flex gap-2">
        {options.map(o => (
          <button key={o} onClick={() => onSelect(o)}
            className={`px-3 py-1 text-sm border transition-colors ${current === o ? 'border-kp-accent text-kp-accent' : 'border-kp-border text-kp-muted hover:text-kp-text hover:border-kp-text'}`}>
            {t(`${labelKey}.${o}`, o)}
          </button>
        ))}
      </div>
    </div>
  );
};

Multiplayer.propTypes  = { sound: PropTypes.bool, setSound: PropTypes.func };
OptionGroup.propTypes  = {
  label: PropTypes.string.isRequired, options: PropTypes.arrayOf(PropTypes.string).isRequired,
  current: PropTypes.string.isRequired, onSelect: PropTypes.func.isRequired, labelKey: PropTypes.string.isRequired,
};

export default Multiplayer;
