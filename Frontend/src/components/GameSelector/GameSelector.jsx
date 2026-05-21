import PropTypes from 'prop-types';
import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Clock, Globe, Code2, ChevronDown, BarChart2, AlignLeft } from 'lucide-react';

// ── Chip ──────────────────────────────────────────────────────────────────────
const Chip = ({ icon, label, open, onClick }) => (
  <button
    onClick={onClick}
    onMouseDown={e => e.preventDefault()}
    className={`flex items-center gap-1.5 bg-kp-surface border px-3 py-1.5 text-sm transition-all duration-150 cursor-pointer select-none ${
      open
        ? 'border-kp-accent text-kp-accent'
        : 'border-kp-border text-kp-muted hover:border-kp-accent hover:text-kp-accent'
    }`}
  >
    <span className="text-kp-accent">{icon}</span>
    <span>{label}</span>
    <ChevronDown
      size={12}
      className={`ml-0.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    />
  </button>
);

// ── Popover ───────────────────────────────────────────────────────────────────
const Popover = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: -6, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -6, scale: 0.97 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
    className="absolute top-full left-0 mt-2 bg-kp-bg border border-kp-border shadow-lg p-1.5 z-50 min-w-36"
  >
    {children}
  </motion.div>
);

const PopoverSection = ({ label }) => (
  <p className="text-xs text-kp-muted uppercase tracking-wider px-2 pt-2 pb-1">{label}</p>
);

const PopoverItem = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    onMouseDown={e => e.preventDefault()}
    className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm transition-colors duration-100 ${
      active ? 'text-kp-accent bg-kp-accent/8 font-medium' : 'text-kp-text hover:bg-kp-surface'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-kp-accent' : 'bg-transparent'}`} />
    {children}
  </button>
);

// ── usePopover ────────────────────────────────────────────────────────────────
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const close = useCallback((e) => {
    if (ref.current && !ref.current.contains(e.target)) setOpen(false);
  }, []);
  const closeKey = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', closeKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', closeKey);
    };
  }, [close, closeKey]);

  return { open, setOpen, ref };
}

// ── GameSelector ──────────────────────────────────────────────────────────────
const MODE_OPTIONS = [
  { value: 'practice', label: 'Práctica' },
  { value: 'timed',    label: 'Cronómetro' },
];
const DIFF_OPTIONS = [
  { value: 'easy',   label: 'Fácil' },
  { value: 'medium', label: 'Medio' },
  { value: 'hard',   label: 'Difícil' },
];
const LEN_OPTIONS = [
  { value: 'short',  label: 'Corto' },
  { value: 'medium', label: 'Medio' },
  { value: 'long',   label: 'Largo' },
];
const TIME_OPTIONS = [
  { value: 30,  label: '30 s' },
  { value: 60,  label: '60 s' },
  { value: 120, label: '120 s' },
];
const TEXT_LANGS = [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }];
const CODE_LANGS = [
  { value: 'python',     label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'c++',        label: 'C++' },
  { value: 'html',       label: 'HTML' },
  { value: 'java',       label: 'Java' },
];

const GameSelector = ({ gameSettings, setGameSettings }) => {
  const { mode, type, language: lang, difficulty, length, time } = gameSettings;

  const modeP = usePopover();
  const timeP = usePopover();
  const typeP = usePopover();
  const diffP = usePopover();
  const lenP  = usePopover();

  const pick = (key, value, closePopover) => {
    setGameSettings(p => ({ ...p, [key]: value }));
    closePopover(false);
  };

  const pickTypeLang = (t, l) => {
    setGameSettings(p => ({ ...p, type: t, language: l }));
    typeP.setOpen(false);
  };

  const modeLabel = MODE_OPTIONS.find(o => o.value === mode)?.label;
  const diffLabel = DIFF_OPTIONS.find(o => o.value === difficulty)?.label;
  const lenLabel  = LEN_OPTIONS.find(o => o.value === length)?.label;
  const timeLabel = `${time} s`;
  const typeLabel = type === 'text'
    ? TEXT_LANGS.find(o => o.value === lang)?.label
    : CODE_LANGS.find(o => o.value === lang)?.label;

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center">

      {/* Modo */}
      <div className="relative" ref={modeP.ref}>
        <Chip icon={<Keyboard size={14} />} label={modeLabel} open={modeP.open} onClick={() => modeP.setOpen(v => !v)} />
        <AnimatePresence>
          {modeP.open && (
            <Popover>
              {MODE_OPTIONS.map(o => (
                <PopoverItem key={o.value} active={mode === o.value} onClick={() => pick('mode', o.value, modeP.setOpen)}>
                  {o.label}
                </PopoverItem>
              ))}
            </Popover>
          )}
        </AnimatePresence>
      </div>

      {/* Tiempo (solo en modo cronómetro) */}
      {mode === 'timed' && (
        <div className="relative" ref={timeP.ref}>
          <Chip icon={<Clock size={14} />} label={timeLabel} open={timeP.open} onClick={() => timeP.setOpen(v => !v)} />
          <AnimatePresence>
            {timeP.open && (
              <Popover>
                {TIME_OPTIONS.map(o => (
                  <PopoverItem key={o.value} active={time === o.value} onClick={() => pick('time', o.value, timeP.setOpen)}>
                    {o.label}
                  </PopoverItem>
                ))}
              </Popover>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tipo + Idioma */}
      <div className="relative" ref={typeP.ref}>
        <Chip icon={type === 'text' ? <Globe size={14} /> : <Code2 size={14} />} label={typeLabel} open={typeP.open} onClick={() => typeP.setOpen(v => !v)} />
        <AnimatePresence>
          {typeP.open && (
            <Popover>
              <PopoverSection label="Texto" />
              {TEXT_LANGS.map(o => (
                <PopoverItem key={o.value} active={type === 'text' && lang === o.value} onClick={() => pickTypeLang('text', o.value)}>
                  {o.label}
                </PopoverItem>
              ))}
              <div className="border-t border-kp-border my-1" />
              <PopoverSection label="Código" />
              {CODE_LANGS.map(o => (
                <PopoverItem key={o.value} active={type === 'code' && lang === o.value} onClick={() => pickTypeLang('code', o.value)}>
                  {o.label}
                </PopoverItem>
              ))}
            </Popover>
          )}
        </AnimatePresence>
      </div>

      {/* Dificultad */}
      <div className="relative" ref={diffP.ref}>
        <Chip icon={<BarChart2 size={14} />} label={diffLabel} open={diffP.open} onClick={() => diffP.setOpen(v => !v)} />
        <AnimatePresence>
          {diffP.open && (
            <Popover>
              {DIFF_OPTIONS.map(o => (
                <PopoverItem key={o.value} active={difficulty === o.value} onClick={() => pick('difficulty', o.value, diffP.setOpen)}>
                  {o.label}
                </PopoverItem>
              ))}
            </Popover>
          )}
        </AnimatePresence>
      </div>

      {/* Longitud */}
      <div className="relative" ref={lenP.ref}>
        <Chip icon={<AlignLeft size={14} />} label={lenLabel} open={lenP.open} onClick={() => lenP.setOpen(v => !v)} />
        <AnimatePresence>
          {lenP.open && (
            <Popover>
              {LEN_OPTIONS.map(o => (
                <PopoverItem key={o.value} active={length === o.value} onClick={() => pick('length', o.value, lenP.setOpen)}>
                  {o.label}
                </PopoverItem>
              ))}
            </Popover>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

GameSelector.propTypes = {
  gameSettings: PropTypes.object.isRequired,
  setGameSettings: PropTypes.func.isRequired,
};

Chip.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string,
  open: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

Popover.propTypes = {
  children: PropTypes.node.isRequired,
};

PopoverItem.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};

export default GameSelector;
