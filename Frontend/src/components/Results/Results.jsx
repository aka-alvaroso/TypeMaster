import PropTypes from 'prop-types';
import { useState } from 'react';
import { ArrowLeftRight, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatCard from '../ui/StatCard';

const Results = ({ results, areResultsSaved }) => {
  const { t } = useTranslation();
  const [velocityType, setVelocityType] = useState('ppm');

  if (!results.isReady) return null;

  return (
    <>
      {areResultsSaved.user && areResultsSaved.test ? (
        <div className="my-4 flex items-center gap-3 py-2 px-6 border border-green-500/50 bg-green-50 text-green-700 text-sm">
          <Check size={14} />
          <span>{t('results.saved')}</span>
          <Check size={14} />
        </div>
      ) : (
        <div className="my-4 flex items-center gap-3 py-2 px-6 border border-kp-accent/50 bg-kp-accent/10 text-kp-text text-sm">
          <AlertTriangle size={14} className="text-kp-accent" />
          <span>{t('results.loginToSave')}</span>
          <AlertTriangle size={14} className="text-kp-accent" />
        </div>
      )}

      <p className="text-xs text-kp-muted uppercase tracking-widest w-4/6">{t('results.title')}</p>
      <div className="mt-4 w-4/6 grid grid-cols-3 gap-3">
        <StatCard label={t('results.score')} value={results.score} unit={t('results.pts')} />

        <StatCard label={t('results.speed')} className="relative">
          <button
            onClick={() => setVelocityType(velocityType === 'ppm' ? 'cpm' : 'ppm')}
            className="absolute top-3 right-3 text-kp-muted hover:text-kp-accent transition-colors"
          >
            <ArrowLeftRight size={12} />
          </button>
          <p className="text-center text-4xl font-medium text-kp-text">
            {velocityType === 'ppm' ? results.ppm : results.cpm}
            <span className="text-lg font-medium text-kp-accent ml-1">{velocityType.toUpperCase()}</span>
          </p>
        </StatCard>

        <StatCard label={t('results.accuracy')} value={results.accurate} unit="%" />
        <StatCard label={t('results.errors')} value={results.errors} unit={t('results.err')} />
        <StatCard label={t('results.time')} value={results.time} unit={t('results.sec')} />
        <StatCard label={t('results.chars')} value={results.totalChar} unit={t('results.car')} />
      </div>
    </>
  );
};

Results.propTypes = {
  results: PropTypes.object,
  areResultsSaved: PropTypes.object,
};

export default Results;
