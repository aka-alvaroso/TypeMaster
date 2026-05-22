import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Pencil, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Navbar from '../components/Navbar/Navbar';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import FadeUp from '../components/ui/FadeUp';

const DEFAULT_USER = {
  username: '',
  avgScore: 0, avgAccuracy: 0, avgSpeed: 0,
  bestScore: 0, bestSpeed: 0,
  totalTests: 0, numErrors: 0, numCharacters: 0,
  numEasyTests: 0, numMediumTests: 0, numHardTests: 0,
  imageURL: 'https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.webp',
};

const Profile = ({ sound, setSound }) => {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  const [velocityType, setVelocityType] = useState('ppm');
  const [userData, setUserData] = useState(DEFAULT_USER);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/data`, { headers: { username } });
        if (response.status === 200) setUserData(response.data.user);
      } catch (e) {
        console.error('Error al obtener el usuario:', e);
      }
    };
    fetchUser();
  }, [username]);

  const isOwner = sessionStorage.getItem('loggedIn') === 'true' &&
    userData.username === JSON.parse(sessionStorage.getItem('userData') || '{}').username;

  const toggleVelocity = () => setVelocityType(v => v === 'ppm' ? 'cpm' : 'ppm');

  return (
    <div className="bg-kp-bg text-kp-text w-screen h-screen flex flex-col items-center">
      <Navbar sound={sound} setSound={setSound} />

      <div className="w-full max-w-4xl px-6 pt-8 flex flex-col gap-8">

        {/* Profile header */}
        <FadeUp delay={0} className="flex items-center gap-6 border-b border-kp-border pb-6">
          <img
            className="w-24 h-24 rounded-full object-cover border border-kp-border"
            src={userData.imageURL}
            alt="Profile"
          />
          <div>
            <p className="text-xs text-kp-muted uppercase tracking-widest mb-1">{t('profile.title')}</p>
            <h2 className="text-2xl font-medium text-kp-text">{userData.username}</h2>
          </div>
          <div className="ml-auto flex gap-3">
            {isOwner && (
              <Button variant="subtle" onClick={() => navigate('/settings', { state: { tab: 'account' } })}>
                <Pencil size={14} /> {t('profile.editProfile')}
              </Button>
            )}
            <Link to={`/history/${username}`}>
              <Button variant="subtle">
                <List size={14} /> {t('profile.history')}
              </Button>
            </Link>
          </div>
        </FadeUp>

        {/* Top stats */}
        <FadeUp delay={0.08}>
          <p className="text-xs text-kp-muted uppercase tracking-widest mb-3">{t('profile.mainStats')}</p>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label={t('profile.avgScore')} value={userData.avgScore} unit={t('profile.pts')} />
            <StatCard label={t('profile.avgSpeed')} className="relative">
              <button onClick={toggleVelocity} className="absolute top-4 right-4 text-kp-muted hover:text-kp-accent transition-colors">
                <ArrowLeftRight size={12} />
              </button>
              <p className="text-center text-4xl font-medium text-kp-text">
                {velocityType === 'ppm' ? Math.trunc((userData.avgSpeed / 5) * 10) / 10 : userData.avgSpeed}
                <span className="text-lg font-medium text-kp-accent ml-1">{velocityType.toUpperCase()}</span>
              </p>
            </StatCard>
            <StatCard label={t('profile.avgAccuracy')} value={userData.avgAccuracy} unit="%" />
          </div>
        </FadeUp>

        {/* Extended stats */}
        <FadeUp delay={0.14}>
          <p className="text-xs text-kp-muted uppercase tracking-widest mb-3">{t('profile.breakdown')}</p>
          <div className="grid grid-cols-4 gap-3">
            <StatCard label={t('profile.bestScore')} value={userData.bestScore} unit={t('profile.pts')} />
            <StatCard label={t('profile.bestSpeed')} className="relative">
              <button onClick={toggleVelocity} className="absolute top-4 right-4 text-kp-muted hover:text-kp-accent transition-colors">
                <ArrowLeftRight size={12} />
              </button>
              <p className="text-center text-4xl font-medium text-kp-text">
                {velocityType === 'ppm' ? Math.trunc((userData.bestSpeed / 5) * 10) / 10 : userData.bestSpeed}
                <span className="text-lg font-medium text-kp-accent ml-1">{velocityType.toUpperCase()}</span>
              </p>
            </StatCard>
            <StatCard label={t('profile.totalTests')} value={userData.totalTests} />
            <StatCard label={t('profile.totalErrors')} value={userData.numErrors} />
            <StatCard label={t('profile.totalChars')} value={userData.numCharacters} />
            <StatCard label={t('profile.easyTests')} value={userData.numEasyTests} />
            <StatCard label={t('profile.mediumTests')} value={userData.numMediumTests} />
            <StatCard label={t('profile.hardTests')} value={userData.numHardTests} />
          </div>
        </FadeUp>

      </div>

    </div>
  );
};

Profile.propTypes = {
  sound: PropTypes.bool.isRequired,
  setSound: PropTypes.func.isRequired,
};

export default Profile;
