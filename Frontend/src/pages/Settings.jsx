import axios from 'axios';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Navbar from '../components/Navbar/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FadeUp from '../components/ui/FadeUp';
import { useSettings } from '../context/SettingsContext';

const TYPED_STYLE_IDS = ['none', 'underline', 'background'];
const CURSOR_IDS = ['underline', 'line', 'block'];
const TIMER_DISPLAY_IDS = ['bar', 'number', 'both'];
const TAB_IDS = ['appearance', 'account'];

const AppearanceTab = () => {
  const { t } = useTranslation();
  const { cursorStyle, setCursorStyle, typedStyle, setTypedStyle, timerDisplay, setTimerDisplay } = useSettings();

  const TYPED_STYLES = [
    {
      id: 'none',
      label: t('settings.none'),
      preview: (
        <span className="font-mono text-sm">
          <span className="text-kp-text/70">co</span><span className="text-red-500">rr</span><span className="text-kp-text/70">ec</span><span className="text-red-500">t</span>
        </span>
      ),
    },
    {
      id: 'underline',
      label: t('settings.underline'),
      preview: (
        <span className="font-mono text-sm">
          <span className="text-kp-text/70 underline">co</span><span className="text-red-500 underline">rr</span><span className="text-kp-text/70 underline">ec</span><span className="text-red-500 underline">t</span>
        </span>
      ),
    },
    {
      id: 'background',
      label: t('settings.background'),
      preview: (
        <span className="font-mono text-sm">
          <span className="text-kp-text/70 bg-kp-accent/10 rounded-sm">co</span><span className="text-red-500 bg-red-500/10 rounded-sm">rr</span><span className="text-kp-text/70 bg-kp-accent/10 rounded-sm">ec</span><span className="text-red-500 bg-red-500/10 rounded-sm">t</span>
        </span>
      ),
    },
  ];

  const CURSORS = [
    {
      id: 'underline',
      label: t('settings.underline'),
      preview: <span className="text-kp-accent underline animate-pulse">A</span>,
    },
    {
      id: 'line',
      label: t('settings.line'),
      preview: (
        <span className="relative inline-block">
          <span className="absolute -left-px top-0.5 bottom-0.5 w-0.5 bg-kp-accent rounded-full animate-pulse" />
          <span className="text-kp-muted">A</span>
        </span>
      ),
    },
    {
      id: 'block',
      label: t('settings.block'),
      preview: <span className="bg-kp-accent/25 text-kp-text rounded-sm animate-pulse px-0.5">A</span>,
    },
  ];

  const TIMER_DISPLAYS = [
    {
      id: 'bar',
      label: t('settings.bar'),
      preview: (
        <span className="w-16 h-1.5 bg-kp-border rounded-full overflow-hidden flex">
          <span className="w-2/3 h-full bg-kp-accent rounded-full" />
        </span>
      ),
    },
    {
      id: 'number',
      label: t('settings.number'),
      preview: <span className="text-2xl font-medium text-kp-accent tabular-nums">42</span>,
    },
    {
      id: 'both',
      label: t('settings.both'),
      preview: (
        <span className="flex flex-col items-center gap-1.5">
          <span className="text-lg font-medium text-kp-accent tabular-nums">42</span>
          <span className="w-16 h-1.5 bg-kp-border rounded-full overflow-hidden flex">
            <span className="w-2/3 h-full bg-kp-accent rounded-full" />
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-medium text-kp-muted mb-3 uppercase tracking-widest">{t('settings.cursor')}</h3>
        <div className="flex gap-3">
          {CURSORS.map(({ id, label, preview }, i) => (
            <motion.button
              key={id}
              onClick={() => setCursorStyle(id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex flex-col items-center gap-3 p-5 border-2 transition-all duration-150 cursor-pointer ${
                cursorStyle === id
                  ? 'border-kp-accent bg-kp-accent/10'
                  : 'border-kp-text/15 bg-kp-text/5 hover:bg-kp-accent/10 hover:border-kp-accent/50'
              }`}
            >
              <span className="text-3xl font-medium w-12 h-10 flex items-center justify-center">
                {preview}
              </span>
              <span className={`text-xs font-medium ${cursorStyle === id ? 'text-kp-accent' : 'text-kp-muted'}`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-kp-muted mb-3 uppercase tracking-widest">{t('settings.timerDisplay')}</h3>
        <div className="flex gap-3">
          {TIMER_DISPLAYS.map(({ id, label, preview }, i) => (
            <motion.button
              key={id}
              onClick={() => setTimerDisplay(id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex flex-col items-center gap-3 p-5 border-2 transition-all duration-150 cursor-pointer ${
                timerDisplay === id
                  ? 'border-kp-accent bg-kp-accent/10'
                  : 'border-kp-text/15 bg-kp-text/5 hover:bg-kp-accent/10 hover:border-kp-accent/50'
              }`}
            >
              <span className="h-10 flex items-center justify-center">{preview}</span>
              <span className={`text-xs font-medium ${timerDisplay === id ? 'text-kp-accent' : 'text-kp-muted'}`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-kp-muted mb-3 uppercase tracking-widest">{t('settings.typedStyle')}</h3>
        <div className="flex gap-3">
          {TYPED_STYLES.map(({ id, label, preview }, i) => (
            <motion.button
              key={id}
              onClick={() => setTypedStyle(id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex flex-col items-center gap-3 p-5 border-2 transition-all duration-150 cursor-pointer ${
                typedStyle === id
                  ? 'border-kp-accent bg-kp-accent/10'
                  : 'border-kp-text/15 bg-kp-text/5 hover:bg-kp-accent/10 hover:border-kp-accent/50'
              }`}
            >
              <span className="h-10 flex items-center justify-center">{preview}</span>
              <span className={`text-xs font-medium ${typedStyle === id ? 'text-kp-accent' : 'text-kp-muted'}`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, status, onSave, children }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium text-kp-muted uppercase tracking-widest">{label}</h3>
      <div className="flex flex-col gap-2">
        {children}
        <div className="flex items-center gap-3">
          <Button variant="filled" size="sm" onClick={onSave}>
            <Upload size={13} /> {t('settings.save')}
          </Button>
          {status === 'ok'    && <span className="text-xs text-green-600">{t('settings.saved')}</span>}
          {status === 'error' && <span className="text-xs text-red-500">{t('settings.saveError')}</span>}
        </div>
      </div>
    </div>
  );
};

const useField = (apiKey) => {
  const [value,  setValue]  = useState('');
  const [status, setStatus] = useState(null);
  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

  const save = async (extra = {}) => {
    if (!value.trim()) return;
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/user/data`, {
        username: userData.username,
        [apiKey]: value,
        ...extra,
      });
      if (response.status === 200) {
        setStatus('ok');
        if (apiKey === 'username' || apiKey === 'email') {
          const updated = { ...userData, [apiKey]: value };
          sessionStorage.setItem('userData', JSON.stringify(updated));
        }
        setTimeout(() => setStatus(null), 2500);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 2500);
    }
  };

  return { value, setValue, status, save };
};

const AccountTab = () => {
  const { t } = useTranslation();
  const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
  const userData   = JSON.parse(sessionStorage.getItem('userData') || 'null');

  const image    = useField('imageURL');
  const username = useField('username');
  const email    = useField('email');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passStatus,  setPassStatus]  = useState(null);

  if (!isLoggedIn || !userData) {
    return <p className="text-kp-muted text-sm">{t('settings.loginRequired')}</p>;
  }

  const savePassword = async () => {
    if (!newPass.trim() || newPass !== confirmPass) {
      setPassStatus('error');
      setTimeout(() => setPassStatus(null), 2500);
      return;
    }
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/user/data`, {
        username: userData.username,
        password: newPass,
      });
      if (res.status === 200) {
        setNewPass('');
        setConfirmPass('');
        setPassStatus('ok');
        setTimeout(() => setPassStatus(null), 2500);
      }
    } catch {
      setPassStatus('error');
      setTimeout(() => setPassStatus(null), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-sm">

      <Field label={t('settings.avatarUrl')} status={image.status} onSave={image.save}>
        <Input type="text" placeholder={t('settings.avatarUrlPlaceholder')} value={image.value} onChange={e => image.setValue(e.target.value)} />
      </Field>

      <Field label={t('settings.username')} status={username.status} onSave={username.save}>
        <Input type="text" placeholder={userData.username} value={username.value} onChange={e => username.setValue(e.target.value)} />
      </Field>

      <Field label={t('settings.email')} status={email.status} onSave={email.save}>
        <Input type="email" placeholder={userData.email} value={email.value} onChange={e => email.setValue(e.target.value)} />
      </Field>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium text-kp-muted uppercase tracking-widest">{t('settings.password')}</h3>
        <Input type="password" placeholder={t('settings.newPasswordPlaceholder')} value={newPass}     onChange={e => setNewPass(e.target.value)} />
        <Input type="password" placeholder={t('settings.confirmPasswordPlaceholder')} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
        {newPass && confirmPass && newPass !== confirmPass && (
          <p className="text-xs text-red-500">{t('settings.passwordMismatch')}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <Button variant="filled" size="sm" onClick={savePassword}>
            <Upload size={13} /> {t('settings.save')}
          </Button>
          {passStatus === 'ok'    && <span className="text-xs text-green-600">{t('settings.passwordUpdated')}</span>}
          {passStatus === 'error' && <span className="text-xs text-red-500">{t('settings.passwordError')}</span>}
        </div>
      </div>

    </div>
  );
};

const Settings = ({ sound, setSound }) => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState(state?.tab ?? 'appearance');

  const TABS = [
    { id: 'appearance', label: t('settings.appearance') },
    { id: 'account',    label: t('settings.account') },
  ];

  return (
    <div className="bg-kp-bg text-kp-text w-screen h-screen flex flex-col items-center">
      <Navbar sound={sound} setSound={setSound} />

      <FadeUp className="w-full max-w-3xl px-6 pt-8 flex gap-8">
        {/* Sidebar */}
        <nav className="flex flex-col gap-1 w-40 shrink-0">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative text-left pl-4 pr-3 py-2 text-sm transition-colors duration-150 border-l-2 ${
                activeTab === id ? 'text-kp-accent font-medium border-kp-accent' : 'text-kp-muted hover:text-kp-text border-transparent'
              }`}
            >
              {activeTab === id && (
                <motion.span
                  layoutId="settings-tab-indicator"
                  className="absolute inset-0 bg-kp-accent/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-medium mb-6 text-kp-text">
            {TABS.find(t => t.id === activeTab)?.label}
          </h2>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {activeTab === 'appearance' && <AppearanceTab />}
              {activeTab === 'account'    && <AccountTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </FadeUp>
    </div>
  );
};

Settings.propTypes = {
  sound: PropTypes.bool.isRequired,
  setSound: PropTypes.func.isRequired,
};

Field.propTypes = {
  label: PropTypes.string.isRequired,
  status: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Settings;
