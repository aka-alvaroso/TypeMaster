import PropTypes from 'prop-types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Trophy, ArrowLeft, Heart } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import FadeUp from '../components/ui/FadeUp';
import { useSocket } from '../context/SocketContext';
import { useSettings } from '../context/SettingsContext';
import { useMultiplayerTyping } from '../hooks/useMultiplayerTyping';

// ─── Sub-components ──────────────────────────────────────────────────────────

const Lives = ({ count, max = 3 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Heart
        key={`${i}-${count}`}
        size={12}
        className={
          i < count
            ? 'text-red-500 fill-red-500 transition-all'
            : 'text-kp-border fill-none kp-error'
        }
      />
    ))}
  </div>
);

const PlayerRow = ({ player, isMe, mode }) => (
  <div className={`flex items-center gap-3 py-2 px-3 border ${isMe ? 'border-kp-accent bg-kp-accent/5' : 'border-kp-border'} ${player.eliminated ? 'opacity-40' : ''}`}>
    <span className="text-sm font-medium text-kp-text w-28 truncate">
      {player.username}{isMe ? ' (you)' : ''}
      {player.eliminated && <span className="ml-1 text-xs text-kp-muted">💀</span>}
    </span>

    {mode === 'score_attack' ? (
      <>
        <span className="flex-1 text-right text-sm font-mono text-kp-accent">{Math.round(player.score)} pts</span>
      </>
    ) : mode === 'survival' ? (
      <>
        <div className="flex-1" />
        <Lives count={player.lives} />
      </>
    ) : (
      <>
        <div className="flex-1 h-1.5 bg-kp-surface rounded-full overflow-hidden">
          <div className="h-full bg-kp-accent transition-all duration-300 rounded-full" style={{ width: `${player.progress}%` }} />
        </div>
        <span className="text-xs text-kp-muted w-10 text-right">{Math.round(player.progress)}%</span>
        {player.finished && player.position && (
          <span className="text-xs font-semibold text-kp-accent w-6 text-right">#{player.position}</span>
        )}
      </>
    )}

    {player.ready && !player.finished && !player.eliminated && (
      <Check size={12} className="text-green-500 shrink-0" />
    )}
  </div>
);

const Countdown = ({ count }) => (
  <div className="flex items-center justify-center w-full h-32">
    <span className="text-8xl font-bold text-kp-accent animate-bounce">{count}</span>
  </div>
);

const ScoreAttackTimer = ({ remaining, total }) => {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const color = remaining <= 10 ? 'bg-red-500' : remaining <= 20 ? 'bg-yellow-400' : 'bg-kp-accent';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-kp-muted">
        <span>{remaining}s</span>
        <span>{total}s</span>
      </div>
      <div className="h-1.5 bg-kp-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const ResultsTable = ({ players, mode }) => {
  const { t } = useTranslation();
  const sorted = [...players].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-xs text-kp-muted uppercase tracking-widest mb-2">{t('multiplayer.results')}</p>
      {sorted.map((p, i) => (
        <div key={p.username} className={`flex items-center gap-4 px-4 py-3 border ${i === 0 ? 'border-kp-accent bg-kp-accent/5' : 'border-kp-border'}`}>
          <span className="text-lg font-bold text-kp-accent w-6">#{p.position ?? '-'}</span>
          {i === 0 && <Trophy size={14} className="text-yellow-400 shrink-0" />}
          <span className="text-sm font-medium text-kp-text flex-1">{p.username}</span>
          {mode === 'score_attack' ? (
            <span className="text-xs text-kp-muted">{Math.round(p.score)} pts</span>
          ) : p.stats ? (
            <span className="text-xs text-kp-muted">
              {Math.round(p.stats.speed)} CPM · {Math.round(p.stats.accuracy)}% · {Math.round(p.stats.score)} pts
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const TypingDisplay = ({ text, cursor, charResults, cursorStyle, typedStyle }) => (
  <div className="font-mono text-lg leading-relaxed break-words">
    {text.split('').map((char, index) => {
      const isCursor = index === cursor;
      const result   = charResults[index];
      let cls = '';
      if (isCursor) {
        cls = cursorStyle === 'underline' ? 'text-kp-accent kp-cursor-underline'
            : cursorStyle === 'line'      ? 'text-kp-muted kp-cursor-line'
            :                              'text-kp-text rounded-sm kp-cursor-block';
      } else if (result) {
        const ok = result === 'correct';
        cls = (ok ? 'text-kp-text/70' : 'text-red-500 kp-error') + (
          typedStyle === 'background' ? (ok ? ' bg-kp-accent/10 rounded-sm' : ' bg-red-500/10 rounded-sm') :
          typedStyle === 'underline'  ? ' underline' : ''
        );
      } else {
        cls = 'text-kp-muted';
      }
      return <span key={`${index}-${result}`} className={`whitespace-pre-wrap ${cls}`}>{char}</span>;
    })}
  </div>
);

// ─── Main page ───────────────────────────────────────────────────────────────

const MultiplayerRoom = ({ sound, setSound }) => {
  const { code }    = useParams();
  const navigate    = useNavigate();
  const { t }       = useTranslation();
  const { socket }  = useSocket();
  const { cursorStyle, typedStyle } = useSettings();

  const [room, setRoom]       = useState(null);
  const [status, setStatus]   = useState('waiting');
  const [countdown, setCountdown] = useState(null);
  const [gameText, setGameText]   = useState('');
  const [players, setPlayers]     = useState([]);
  const [myReady, setMyReady]     = useState(false);
  const [error, setError]         = useState('');
  const [eliminated, setEliminated] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [gameDuration, setGameDuration]   = useState(null);
  const [textKey, setTextKey] = useState(0);

  const myUsername = JSON.parse(sessionStorage.getItem('userData') ?? '{}')?.username ?? '';
  const mode = room?.mode ?? 'race';
  const lastProgressPct = useRef(-1);

  // ─── Callbacks for the typing hook ─────────────────────────────────────────

  const handleProgress = useCallback((pct) => {
    if (!socket || Math.abs(pct - lastProgressPct.current) < 2) return;
    lastProgressPct.current = pct;
    socket.emit('game:progress', { code, pct });
    // Actualizar barra propia localmente sin esperar al servidor
    setPlayers(prev => prev.map(p => p.username === myUsername ? { ...p, progress: pct } : p));
  }, [socket, code, myUsername]);

  const handleFinish = useCallback((stats) => {
    if (!socket) return;
    if (mode === 'score_attack' || mode === 'survival') {
      // Texto en bucle: pedir nuevo texto al servidor
      socket.emit('game:textDone', { code, stats });
    } else {
      socket.emit('game:finish', { code, stats }, ({ position }) => { void position; });
    }
  }, [socket, code, mode]);

  const handleError = useCallback(() => {
    setErrorCount(n => n + 1); // incrementar siempre dispara el re-mount del div
    if (socket && mode === 'survival') {
      socket.emit('game:error', { code });
    }
  }, [socket, code, mode]);

  const { cursor, charResults, isFinished } = useMultiplayerTyping({
    text: gameText,
    textKey,
    sound,
    disabled: eliminated,
    onProgress: handleProgress,
    onFinish: handleFinish,
    onError: handleError,
  });

  // ─── Socket events ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    socket.on('room:update',      ({ players: p }) => setPlayers(p));
    socket.on('room:playerJoined',({ players: p }) => setPlayers(p));
    socket.on('room:playerLeft',  ({ players: p }) => setPlayers(p));
    socket.on('room:error',       ({ message }) => setError(message));

    socket.on('game:countdown', ({ count }) => { setStatus('countdown'); setCountdown(count); });

    socket.on('game:start', ({ text, duration }) => {
      setGameText(text);
      setTextKey(k => k + 1);
      setStatus('playing');
      setCountdown(null);
      lastProgressPct.current = -1;
      if (duration) { setGameDuration(duration); setTimeRemaining(duration); }
    });

    // Score Attack
    socket.on('game:tick',        ({ remaining }) => setTimeRemaining(remaining));
    socket.on('game:scoreUpdate', ({ players: p }) => setPlayers(p));
    socket.on('game:newText', ({ text }) => {
      setGameText(text);
      setTextKey(k => k + 1);
      lastProgressPct.current = -1;
      setPlayers(prev => prev.map(p => p.username === myUsername ? { ...p, progress: 0 } : p));
    });

    // Survival
    socket.on('game:livesUpdate',     ({ players: p }) => setPlayers(p));
    socket.on('game:eliminated',      () => setEliminated(true));
    socket.on('game:playerEliminated',({ players: p }) => setPlayers(p));

    // Shared
    socket.on('game:opponentProgress',({ players: p }) => setPlayers(p));
    socket.on('game:playerFinished',  ({ players: p }) => setPlayers(p));
    socket.on('game:ended', ({ players: p }) => { setPlayers(p); setStatus('finished'); });

    return () => {
      ['room:update','room:playerJoined','room:playerLeft','room:error',
       'game:countdown','game:start','game:tick','game:scoreUpdate','game:newText',
       'game:livesUpdate','game:eliminated','game:playerEliminated',
       'game:opponentProgress','game:playerFinished','game:ended',
      ].forEach(ev => socket.off(ev));
    };
  }, [socket]);

  // Join room on mount
  useEffect(() => {
    if (!socket || !code) return;
    socket.emit('room:join', { code }, ({ room: r, error: err }) => {
      if (err && err !== 'already_in_room') { navigate('/multiplayer'); return; }
      if (r) { setRoom(r); setPlayers(r.players); setStatus(r.status); }
    });
  }, [socket, code, navigate]);

  const handleReady = () => {
    if (!socket) return;
    setMyReady(true);
    socket.emit('room:ready', { code });
  };

  const me = players.find(p => p.username === myUsername);

  return (
    <div className="min-h-screen flex flex-col items-center bg-kp-bg">
      <Navbar sound={sound} setSound={setSound} />
      <FadeUp className="flex flex-col w-full max-w-2xl px-4 py-8 gap-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/multiplayer')} className="text-kp-muted hover:text-kp-accent transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-xs text-kp-muted uppercase tracking-widest">{t('multiplayer.room')}</p>
            <p className="text-xl font-mono font-bold text-kp-accent tracking-widest">{code}</p>
          </div>
          {room && (
            <span className="text-xs border border-kp-border text-kp-muted px-2 py-0.5">
              {{ race: t('multiplayer.modeRace'), score_attack: t('multiplayer.modeScoreAttack'), survival: t('multiplayer.modeSurvival') }[room.mode] ?? room.mode}
            </span>
          )}
          <span className={`ml-auto text-xs px-2 py-1 border ${
            status === 'playing'  ? 'border-green-500 text-green-500' :
            status === 'finished' ? 'border-kp-muted text-kp-muted'  :
                                    'border-kp-border text-kp-muted'
          }`}>
            {t(`multiplayer.status_${status}`)}
          </span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Score Attack timer */}
        {status === 'playing' && mode === 'score_attack' && timeRemaining !== null && (
          <ScoreAttackTimer remaining={timeRemaining} total={gameDuration ?? 60} />
        )}

        {/* Players */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-kp-muted uppercase tracking-widest">{t('multiplayer.players')}</p>
          {players.map(p => (
            <PlayerRow key={p.username} player={p} isMe={p.username === myUsername} mode={mode} />
          ))}
          {players.length === 0 && <p className="text-kp-muted text-sm">{t('multiplayer.waitingPlayers')}</p>}
        </div>

        {/* Countdown */}
        {status === 'countdown' && countdown !== null && <Countdown count={countdown} />}

        {/* Typing area */}
        {status === 'playing' && gameText && (
          <div className="flex flex-col gap-3">
            {eliminated && (
              <div className="text-center py-4 text-kp-muted text-sm border border-kp-border">
                💀 {t('multiplayer.youAreEliminated')}
              </div>
            )}
            {!eliminated && (
              <div className="relative p-3">
                {errorCount > 0 && (
                  <div key={errorCount} className="kp-error-flash absolute inset-0 rounded-sm pointer-events-none" />
                )}
                <TypingDisplay
                  text={gameText}
                  cursor={cursor}
                  charResults={charResults}
                  cursorStyle={cursorStyle}
                  typedStyle={typedStyle}
                />
              </div>
            )}
            {isFinished && mode === 'race' && !eliminated && (
              <p className="text-center text-kp-muted text-sm">{t('multiplayer.waitingOthers')}</p>
            )}
            {isFinished && (mode === 'score_attack' || mode === 'survival') && !eliminated && (
              <p className="text-center text-kp-accent text-sm animate-pulse">{t('multiplayer.newTextLoading')}</p>
            )}
          </div>
        )}

        {/* Win / Lose banner */}
        {status === 'finished' && (() => {
          const me = players.find(p => p.username === myUsername);
          const won = me?.position === 1;
          return (
            <div className={`flex flex-col items-center py-6 border ${won ? 'border-kp-accent bg-kp-accent/5' : 'border-kp-border'}`}>
              <span className={`text-5xl font-bold tracking-tight ${won ? 'text-kp-accent' : 'text-kp-muted'}`}>
                {won ? t('multiplayer.youWon') : t('multiplayer.youLost')}
              </span>
              {me?.position && (
                <span className="text-sm text-kp-muted mt-1">
                  {t('multiplayer.finalPosition', { pos: me.position })}
                </span>
              )}
            </div>
          );
        })()}

        {/* Results */}
        {status === 'finished' && <ResultsTable players={players} mode={mode} />}

        {/* Waiting lobby */}
        {status === 'waiting' && (
          <div className="flex flex-col gap-3">
            <p className="text-kp-muted text-sm">{t('multiplayer.needTwoPlayers')}</p>
            {!myReady && !me?.ready && (
              <button onClick={handleReady} disabled={players.length < 2}
                className="py-2 px-6 bg-kp-accent text-white text-sm font-medium hover:brightness-105 transition-all disabled:opacity-40">
                {t('multiplayer.ready')}
              </button>
            )}
            {(myReady || me?.ready) && (
              <p className="text-green-500 text-sm flex items-center gap-2">
                <Check size={14} /> {t('multiplayer.youAreReady')}
              </p>
            )}
          </div>
        )}

        {/* Post-game buttons */}
        {status === 'finished' && (
          <button onClick={() => navigate('/multiplayer')}
            className="py-2 px-6 bg-kp-surface border border-kp-border text-sm text-kp-text hover:border-kp-accent hover:text-kp-accent transition-colors">
            {room?.host === myUsername ? t('multiplayer.newRoom') : t('multiplayer.backToLobby')}
          </button>
        )}

      </FadeUp>
    </div>
  );
};

MultiplayerRoom.propTypes = { sound: PropTypes.bool, setSound: PropTypes.func };
PlayerRow.propTypes = { player: PropTypes.object.isRequired, isMe: PropTypes.bool, mode: PropTypes.string };
Lives.propTypes = { count: PropTypes.number, max: PropTypes.number };
Countdown.propTypes = { count: PropTypes.number };
ScoreAttackTimer.propTypes = { remaining: PropTypes.number, total: PropTypes.number };
ResultsTable.propTypes = { players: PropTypes.array.isRequired, mode: PropTypes.string };
TypingDisplay.propTypes = {
  text: PropTypes.string.isRequired, cursor: PropTypes.number.isRequired,
  charResults: PropTypes.array.isRequired, cursorStyle: PropTypes.string, typedStyle: PropTypes.string,
};

export default MultiplayerRoom;
