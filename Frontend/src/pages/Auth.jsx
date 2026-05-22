import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LoginForm from '../components/LoginForm/LoginForm';
import RegisterForm from '../components/RegisterForm/RegisterForm';

const DURATION = 1200; // ms

const useCountUp = (target) => {
  const [display, setDisplay] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target == null) { setDisplay(null); return; }
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return display;
};

const fmt = (n) => n == null ? null : n.toLocaleString('es-ES');

const AnimatedStat = ({ target, suffix = '', label, delay, fixed = false }) => {
  const counted = useCountUp(fixed ? null : target);
  const display = fixed ? target : (counted != null ? fmt(counted) : '—');

  return (
    <motion.div
      className="bg-white/10 p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    >
      <p className="text-xl font-medium tabular-nums">
        {display}{!fixed && counted != null ? suffix : ''}
      </p>
      <p className="text-white/55 text-xs mt-0.5">{label}</p>
    </motion.div>
  );
};

const Logo = ({ className = 'w-7', fill = 'fill-kp-accent' }) => (
  <svg viewBox="529 728 789 848" className={`${className} h-auto ${fill}`} aria-label="logo">
    <g transform="translate(0,2304) scale(0.1,-0.1)">
      <path d="M9040 15559 c-174 -20 -373 -75 -502 -140 -88 -44 -422 -233 -743 -420 -148 -86 -391 -226 -540 -310 -316 -178 -857 -491 -965 -557 -187 -114 -388 -305 -503 -478 -123 -186 -225 -431 -269 -647 l-23 -112 0 -1360 c0 -1274 1 -1367 18 -1469 46 -272 156 -528 324 -752 73 -98 261 -276 369 -350 85 -59 498 -303 954 -564 118 -67 292 -167 385 -220 914 -526 938 -539 1050 -586 266 -109 573 -148 872 -110 268 34 411 89 763 292 135 77 380 218 545 313 165 95 372 215 460 266 88 51 338 195 555 320 446 258 482 280 599 379 268 226 484 594 556 951 34 167 36 288 32 1605 -3 1195 -5 1311 -21 1379 -50 214 -129 427 -206 557 -109 185 -317 418 -470 525 -61 44 -451 271 -1055 617 -471 270 -926 533 -1037 599 -213 127 -414 211 -593 247 -176 35 -383 44 -555 25z m2837 -1813 c164 -44 323 -162 417 -309 49 -77 92 -189 112 -293 22 -120 15 -326 -15 -441 -43 -167 -66 -215 -409 -885 -113 -221 -142 -307 -142 -429 0 -104 19 -169 73 -251 39 -58 170 -191 283 -286 120 -102 214 -247 266 -412 20 -66 23 -93 22 -225 -1 -127 -5 -165 -28 -250 -92 -352 -391 -687 -713 -800 -244 -85 -487 -37 -688 136 -166 142 -198 167 -245 193 -66 36 -145 44 -204 22 -124 -47 -191 -188 -246 -516 -44 -262 -101 -420 -215 -590 -83 -126 -222 -267 -335 -342 -99 -66 -148 -88 -274 -125 -79 -24 -108 -28 -221 -27 -148 0 -219 15 -330 69 -183 89 -311 252 -395 502 -59 177 -60 209 -60 1738 0 1470 2 1537 49 1731 90 370 375 677 731 788 63 20 115 28 200 33 221 10 353 -40 556 -212 117 -99 221 -142 314 -129 141 19 222 128 340 454 102 284 202 460 335 595 185 188 438 292 680 280 50 -3 113 -11 142 -19z"/>
    </g>
  </svg>
);

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [dir, setDir] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('loggedIn') === 'true') navigate('/');
  }, [navigate]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/test/stats`)
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  const switchTab = (id) => {
    setDir(id === 'register' ? 1 : -1);
    setTab(id);
  };

  return (
    <div className="bg-kp-bg text-kp-text w-screen h-screen flex">

      {/* ── Panel izquierdo ────────────────────────────────── */}
      <div className="hidden lg:flex w-[42%] bg-kp-accent flex-col justify-between p-10 text-white select-none">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <Logo className="w-7" fill="fill-white" />
            <span className="text-base font-medium tracking-tight text-white">KeyPro</span>
          </Link>
        </motion.div>

        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <p className="text-white/50 text-xs uppercase tracking-widest">{t('auth.tagline')}</p>
          <h2 className="text-3xl font-medium leading-snug">
            {t('auth.heading1')}<br />{t('auth.heading2')}
          </h2>
          <p className="text-white/65 text-sm leading-relaxed max-w-xs">
            {t('auth.description')}
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          <AnimatedStat target={stats?.totalTests}   label={t('auth.statsTests')}    delay={0.25} />
          <AnimatedStat target={stats?.totalHours}   label={t('auth.statsHours')}    delay={0.31} suffix=" h" />
          <AnimatedStat target={5}                   label={t('auth.statsLanguages')} delay={0.37} fixed />
          <AnimatedStat target={stats?.avgAccuracy}  label={t('auth.statsAccuracy')} delay={0.43} suffix="%" />
        </motion.div>
      </div>

      {/* ── Panel derecho ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-8">

        <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xs flex flex-col gap-7">

          {/* Logo mobile */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-2 w-fit">
            <Logo className="w-6" />
            <span className="text-base font-medium">KeyPro</span>
          </Link>

          {/* Cabecera */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          >
            <h1 className="text-xl font-medium text-kp-text">
              {tab === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h1>
            <p className="text-sm text-kp-muted mt-1">
              {tab === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
              <button
                onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                onMouseDown={e => e.preventDefault()}
                className="text-kp-accent hover:underline font-medium"
              >
                {tab === 'login' ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </motion.div>

          {/* Formulario */}
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={tab}
              custom={dir}
              initial={{ opacity: 0, y: dir * 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dir * -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {tab === 'login'    && <LoginForm />}
              {tab === 'register' && <RegisterForm />}
            </motion.div>
          </AnimatePresence>

          {/* Invitado */}
          <div className="text-center">
            <Link to="/" className="text-xs text-kp-muted hover:text-kp-accent transition-colors">
              {t('auth.guestEntry')}
            </Link>
          </div>

        </div>
        </div>

        {/* Footer legal */}
        <div className="flex justify-end gap-4 py-4 px-2">
          <Link to="/politica" className="text-xs text-kp-muted hover:text-kp-accent transition-colors">{t('auth.privacy')}</Link>
          <Link to="/terminos" className="text-xs text-kp-muted hover:text-kp-accent transition-colors">{t('auth.terms')}</Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-kp-muted hover:text-kp-accent transition-colors"
          >
            {t('auth.sourceCode')}
          </a>
        </div>

      </div>

    </div>
  );
};

export default Auth;
