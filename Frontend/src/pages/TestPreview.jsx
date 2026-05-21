import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

import Navbar from '../components/Navbar/Navbar';
import StatCard from '../components/ui/StatCard';

const LANG_LABELS = {
  es: 'Español', en: 'English', python: 'Python',
  javascript: 'JavaScript', 'c++': 'C++', html: 'HTML', java: 'Java',
};

const TestPreview = ({ sound, setSound }) => {
  const { id } = useParams();
  const [test, setTest] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/test/get/${id}`);
        if (response.status === 200) setTest(response.data);
      } catch (e) {
        console.error('Error al obtener el test:', e);
      }
    };
    fetchTest();
  }, [id]);

  const renderText = () => test.text.split('').map((char, index) => (
    <span
      key={index}
      className={test.charResults[index] === 'correct'
        ? 'text-kp-text/70 underline'
        : 'text-red-500 underline'}
    >
      {char}
    </span>
  ));

  return (
    <div className="bg-kp-bg text-kp-text w-screen h-screen flex flex-col items-center gap-4">
      <Navbar sound={sound} setSound={setSound} />

      {test ? (
        <main className="w-full flex items-start">
          <section className="w-4/6 flex flex-col items-center gap-6 p-4">
            <div className="w-full flex flex-col items-center gap-4">
              <p className="font-medium text-2xl text-left w-4/6">Texto</p>
              <div className="w-4/6 text-2xl tracking-wider leading-9">{renderText()}</div>
            </div>

            <div className="w-full flex flex-col items-center gap-4">
              <p className="font-medium text-2xl text-left w-4/6">Resultados</p>
              <div className="w-4/6 grid grid-cols-3 gap-3">
                <StatCard label="Puntuación" value={test.score} unit="pts." />
                <StatCard label="Velocidad" value={test.speed} unit="CPM" />
                <StatCard label="Precisión" value={test.accuracy} unit="%" />
                <StatCard label="Errores" value={test.numErrors} unit="err." />
                <StatCard label="Tiempo" value={test.time} unit="seg." />
                <StatCard label="Caracteres" value={test.numCharacters} unit="car." />
              </div>
            </div>
          </section>

          <section className="w-2/6 flex justify-center p-4 pt-8">
            <div className="w-5/6 bg-kp-surface border border-kp-border rounded-xl py-8 px-6 flex flex-col gap-4">
              <p className="font-medium text-xl">Detalles</p>

              {[
                ['Jugador', test.player, true],
                ['Fecha', test.date, false],
                ['Modo', { practice: 'Práctica', timed: 'Cronómetro', competitive: 'Competitivo' }[test.mode], false],
                ['Tipo', test.type === 'text' ? 'Texto' : 'Código', false],
                ['Dificultad', { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' }[test.difficulty], false],
                ['Lenguaje', LANG_LABELS[test.language] ?? test.language, false],
              ].map(([label, value, isLink]) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <span className="bg-kp-accent/20 text-kp-text px-2 py-1 rounded font-medium min-w-24">{label}</span>
                  {isLink ? (
                    <Link to={`/profile/${value}`} className="bg-kp-surface border border-kp-border px-2 py-1 rounded hover:text-kp-accent transition-colors flex items-center gap-1">
                      {value} <FontAwesomeIcon className="text-xs" icon={faArrowUpRightFromSquare} />
                    </Link>
                  ) : (
                    <span className="bg-kp-bg border border-kp-border px-2 py-1 rounded text-kp-muted">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <p className="text-kp-muted">No hay datos</p>
      )}
    </div>
  );
};

TestPreview.propTypes = {
  sound: PropTypes.bool.isRequired,
  setSound: PropTypes.func.isRequired,
};

export default TestPreview;
