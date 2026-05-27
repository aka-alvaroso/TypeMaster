import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Navbar from '../components/Navbar/Navbar';
import FadeUp from '../components/ui/FadeUp';

const History = ({ sound, setSound }) => {
  const { t } = useTranslation();
  const { username } = useParams();
  const [tab, setTab] = useState('solo');
  const [history, setHistory] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, matchesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/test/user/${username}`),
          axios.get(`${import.meta.env.VITE_API_URL}/match/user/${username}`),
        ]);
        if (testsRes.status === 200) setHistory(testsRes.data);
        if (matchesRes.status === 200) setMatches(matchesRes.data);
      } catch (e) {
        console.error('Error al obtener el historial:', e);
      }
    };
    fetchData();
  }, [username]);

  const SOLO_HEADERS = [
    t('history.mode'), t('history.score'), t('history.difficulty'),
    t('history.type'), t('history.speed'), t('history.accuracy'), t('history.date'),
  ];

  const MULTI_HEADERS = [
    t('history.position'), t('history.score'), t('history.speed'),
    t('history.accuracy'), t('history.opponents'), t('history.date'),
  ];

  return (
    <div className="h-screen bg-kp-bg text-kp-text w-screen flex flex-col items-center">
      <Navbar sound={sound} setSound={setSound} />

      <FadeUp className="w-full max-w-4xl px-6 pt-8 flex flex-col gap-6">
        <div>
          <p className="text-xs text-kp-muted uppercase tracking-widest mb-1">{t('history.title')}</p>
          <h1 className="text-2xl font-medium text-kp-text flex items-center gap-2">
            <Link to={`/profile/${username}`} className="hover:text-kp-accent transition-colors">
              {username}
            </Link>
            <Link to={`/profile/${username}`}>
              <ExternalLink size={14} className="text-kp-muted hover:text-kp-accent transition-colors" />
            </Link>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-kp-border">
          <button
            onClick={() => setTab('solo')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'solo' ? 'border-kp-accent text-kp-accent' : 'border-transparent text-kp-muted hover:text-kp-text'}`}
          >
            {t('history.tabSolo')}
          </button>
          <button
            onClick={() => setTab('multi')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'multi' ? 'border-kp-accent text-kp-accent' : 'border-transparent text-kp-muted hover:text-kp-text'}`}
          >
            {t('history.tabMulti')} {matches.length > 0 && <span className="ml-1 text-xs bg-kp-accent/20 text-kp-accent px-1.5 py-0.5 rounded-full">{matches.length}</span>}
          </button>
        </div>

        {/* Solo history */}
        {tab === 'solo' && (
          history.length > 0 ? (
            <section className="max-h-[60vh] bg-kp-surface border border-kp-border overflow-y-auto">
              <div className="sticky top-0 bg-kp-surface border-b border-kp-border w-full flex px-4 py-3">
                {SOLO_HEADERS.map((h, i) => (
                  <p key={h} className={`text-xs font-medium uppercase text-kp-accent ${i < 6 ? 'w-1/6' : 'w-2/6'}`}>{h}</p>
                ))}
              </div>
              <div className="flex flex-col">
                {history.map((test, index) => (
                  <Link
                    to={`/test/${test.id}`}
                    key={index}
                    className="w-full flex items-center px-4 py-3 text-sm text-kp-text hover:bg-kp-border/30 transition-colors"
                  >
                    <p className="w-1/6">
                      {test.mode === 'practice' ? t('history.practice') : test.mode === 'timed' ? t('history.stopwatch') : t('history.competitive')}
                    </p>
                    <p className="w-1/6">{test.score}</p>
                    <p className="w-1/6">
                      {test.difficulty === 'easy' ? t('history.easy') : test.difficulty === 'medium' ? t('history.medium') : t('history.hard')}
                    </p>
                    <p className="w-1/6">{test.type === 'text' ? t('history.text') : t('history.code')}</p>
                    <p className="w-1/6">{test.speed} cpm</p>
                    <p className="w-1/6">{test.accuracy}%</p>
                    <p className="w-2/6 text-kp-muted">{test.date}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <p className="text-kp-muted">{t('history.noRecords')}</p>
          )
        )}

        {/* Multiplayer history */}
        {tab === 'multi' && (
          matches.length > 0 ? (
            <section className="max-h-[60vh] bg-kp-surface border border-kp-border overflow-y-auto">
              <div className="sticky top-0 bg-kp-surface border-b border-kp-border w-full flex px-4 py-3">
                {MULTI_HEADERS.map((h, i) => (
                  <p key={h} className={`text-xs font-medium uppercase text-kp-accent ${i === 4 ? 'flex-1' : 'w-1/6'}`}>{h}</p>
                ))}
              </div>
              <div className="flex flex-col">
                {matches.map((match, index) => (
                  <div key={index} className="w-full flex items-center px-4 py-3 text-sm text-kp-text border-b border-kp-border/30 last:border-0">
                    <p className="w-1/6 flex items-center gap-1 font-semibold">
                      {match.position === 1 && <Trophy size={12} className="text-yellow-400" />}
                      <span className={match.position === 1 ? 'text-kp-accent' : ''}>#{match.position}</span>
                    </p>
                    <p className="w-1/6">{Math.round(match.score)}</p>
                    <p className="w-1/6">{Math.round(match.speed)} cpm</p>
                    <p className="w-1/6">{Math.round(match.accuracy)}%</p>
                    <p className="flex-1 text-kp-muted text-xs truncate">
                      {match.players.map(p => p.username).join(', ')}
                    </p>
                    <p className="w-1/6 text-kp-muted">
                      {new Date(match.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <p className="text-kp-muted">{t('history.noMatches')}</p>
          )
        )}
      </FadeUp>
    </div>
  );
};

History.propTypes = {
  sound: PropTypes.bool.isRequired,
  setSound: PropTypes.func.isRequired,
};

export default History;
