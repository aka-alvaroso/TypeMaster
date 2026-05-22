import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div className="flex items-center gap-1">
      {LANGS.map(({ code, label }, idx) => (
        <span key={code} className="flex items-center gap-1">
          <button
            onClick={() => i18n.changeLanguage(code)}
            className={`text-xs font-medium transition-colors ${
              current === code
                ? 'text-kp-accent'
                : 'text-kp-muted hover:text-kp-text'
            }`}
          >
            {label}
          </button>
          {idx < LANGS.length - 1 && (
            <span className="text-kp-border text-xs">|</span>
          )}
        </span>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
