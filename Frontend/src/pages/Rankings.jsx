import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

import Navbar from '../components/Navbar/Navbar';
import Button from '../components/ui/Button';
import FadeUp from '../components/ui/FadeUp';

const ORDER_OPTIONS = [
  { key: 'bestScore',    label: 'Mejor puntuación' },
  { key: 'bestSpeed',    label: 'Mejor velocidad' },
  { key: 'avgScore',     label: 'Puntuación media' },
  { key: 'avgSpeed',     label: 'Velocidad media' },
  { key: 'avgAccuracy',  label: 'Precisión media' },
  { key: 'totalTests',   label: 'Tests jugados' },
];

const COL_HEADERS = ['#', 'Usuario', 'Mejor pts.', 'Mejor vel.', 'Media pts.', 'Media vel.', 'Precisión', 'Tests'];

const Rankings = ({ sound, setSound }) => {
  const [ranking, setRanking] = useState([]);
  const [orderBy, setOrderBy] = useState('bestScore');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/ranking/${orderBy}`);
        if (response.status === 200 && Array.isArray(response.data)) setRanking(response.data);
      } catch (e) {
        console.error('Error al obtener el ranking:', e);
      }
    };
    fetchRanking();
  }, [orderBy]);

  const currentUsername = (JSON.parse(sessionStorage.getItem('userData') || 'null') ?? {}).username;

  return (
    <div className="h-screen bg-kp-bg text-kp-text w-screen flex flex-col items-center">
      <Navbar sound={sound} setSound={setSound} />

      <FadeUp className="w-full max-w-4xl px-6 pt-8 flex flex-col gap-6">
        <div>
          <p className="text-xs text-kp-muted uppercase tracking-widest mb-1">Clasificación global</p>
          <h1 className="text-2xl font-medium text-kp-text">Rankings</h1>
        </div>

        <div className="border-b border-kp-border pb-4 flex flex-wrap gap-2">
          {ORDER_OPTIONS.map(({ key, label }) => (
            <Button
              key={key}
              variant={orderBy === key ? 'filled' : 'subtle'}
              size="sm"
              onClick={() => setOrderBy(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {ranking.length > 0 ? (
          <section className="max-h-[55vh] bg-kp-surface border border-kp-border overflow-y-auto mb-8">
            <div className="sticky top-0 bg-kp-surface border-b border-kp-border w-full flex px-4 py-3">
              {COL_HEADERS.map(h => (
                <p key={h} className="w-[12.5%] text-xs font-medium uppercase text-kp-accent">{h}</p>
              ))}
            </div>
            <div className="flex flex-col">
              {ranking.map((user, index) => (
                <div
                  key={index}
                  className={`w-full flex items-center px-4 py-3 text-sm transition-colors
                    ${index % 2 === 0 ? 'bg-kp-border/10' : ''}
                    ${user.username === currentUsername ? 'text-kp-accent' : 'text-kp-text'}`}
                >
                  <p className="w-[12.5%] text-kp-muted">#{index + 1}</p>
                  <Link to={`/profile/${user.username}`} className="w-[12.5%] hover:underline flex items-center gap-1">
                    {user.username}
                    <ExternalLink size={12} />
                  </Link>
                  <p className="w-[12.5%]">{user.bestScore}</p>
                  <p className="w-[12.5%]">{user.bestSpeed}</p>
                  <p className="w-[12.5%]">{user.avgScore}</p>
                  <p className="w-[12.5%]">{user.avgSpeed}</p>
                  <p className="w-[12.5%]">{user.avgAccuracy}</p>
                  <p className="w-[12.5%]">{user.totalTests}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-kp-muted">No hay datos</p>
        )}
      </FadeUp>
    </div>
  );
};

Rankings.propTypes = {
  sound: PropTypes.bool.isRequired,
  setSound: PropTypes.func.isRequired,
};

export default Rankings;
