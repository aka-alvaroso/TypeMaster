import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

import Navbar from '../components/Navbar/Navbar';
import FadeUp from '../components/ui/FadeUp';

const HEADERS = ['Modo', 'Puntuación', 'Dificultad', 'Tipo', 'Velocidad', 'Precisión', 'Fecha'];

const History = ({ sound, setSound }) => {
  const { username } = useParams();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/test/user/${username}`);
        if (response.status === 200) setHistory(response.data);
      } catch (e) {
        console.error('Error al obtener el historial:', e);
      }
    };
    fetchHistory();
  }, [username]);

  return (
    <div className="h-screen bg-kp-bg text-kp-text w-screen flex flex-col items-center">
      <Navbar sound={sound} setSound={setSound} />

      <FadeUp className="w-full max-w-4xl px-6 pt-8 flex flex-col gap-6">
        <div>
          <p className="text-xs text-kp-muted uppercase tracking-widest mb-1">Historial de partidas</p>
          <h1 className="text-2xl font-medium text-kp-text flex items-center gap-2">
            <Link to={`/profile/${username}`} className="hover:text-kp-accent transition-colors">
              {username}
            </Link>
            <Link to={`/profile/${username}`}>
              <ExternalLink size={14} className="text-kp-muted hover:text-kp-accent transition-colors" />
            </Link>
          </h1>
        </div>

        {history.length > 0 ? (
          <section className="max-h-[65vh] bg-kp-surface border border-kp-border overflow-y-auto">
            <div className="sticky top-0 bg-kp-surface border-b border-kp-border w-full flex px-4 py-3">
              {HEADERS.map((h, i) => (
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
                  <p className="w-1/6">{test.mode === 'practice' ? 'Práctica' : test.mode === 'timed' ? 'Cronómetro' : 'Competitivo'}</p>
                  <p className="w-1/6">{test.score}</p>
                  <p className="w-1/6">{test.difficulty === 'easy' ? 'Fácil' : test.difficulty === 'medium' ? 'Medio' : 'Difícil'}</p>
                  <p className="w-1/6">{test.type === 'text' ? 'Texto' : 'Código'}</p>
                  <p className="w-1/6">{test.speed} cpm</p>
                  <p className="w-1/6">{test.accuracy} %</p>
                  <p className="w-2/6 text-kp-muted">{test.date}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-kp-muted">No hay registros</p>
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
