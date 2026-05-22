import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="w-full grid grid-cols-3 items-center px-8 py-4 text-xs text-kp-muted border-t border-kp-border/50">
      <p>v2.0.0</p>
      <p className="text-center">
        {t('footer.madeWith')}
        <a href="https://alvaroso.dev/" target="_blank" rel="noreferrer" className="hover:text-kp-accent transition-colors">
          Alvaroso
        </a>
      </p>
      <div className="flex items-center justify-end gap-4">
        <Link to="/politica" className="hover:text-kp-accent transition-colors">{t('footer.privacy')}</Link>
        <Link to="/terminos" className="hover:text-kp-accent transition-colors">{t('footer.terms')}</Link>
        <a
          href="https://github.com/aka-alvaroso/KeyPro"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-kp-accent transition-colors"
        >
          {t('footer.sourceCode')}
        </a>
      </div>
    </footer>
  );
};

export default Footer;
