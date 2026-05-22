import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-base font-medium text-kp-text">{title}</h2>
    <div className="text-sm text-kp-muted leading-relaxed flex flex-col gap-2">{children}</div>
  </section>
);

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-kp-bg text-kp-text h-screen overflow-y-auto flex flex-col items-center">
      <div className="w-full max-w-2xl px-6 py-16 flex flex-col gap-10">

        <div className="flex flex-col gap-2">
          <Link to="/" className="text-xs text-kp-muted hover:text-kp-accent transition-colors">{t('terms.back')}</Link>
          <h1 className="text-2xl font-medium">{t('terms.title')}</h1>
          <p className="text-sm text-kp-muted">{t('terms.lastUpdated')}</p>
        </div>

        <Section title={t('terms.s1Title')}>
          <p>{t('terms.s1p1')}</p>
        </Section>

        <Section title={t('terms.s2Title')}>
          <p>{t('terms.s2p1')}</p>
        </Section>

        <Section title={t('terms.s3Title')}>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>{t('terms.s3li1')}</li>
            <li>{t('terms.s3li2')}</li>
            <li>{t('terms.s3li3')}</li>
          </ul>
        </Section>

        <Section title={t('terms.s4Title')}>
          <p>{t('terms.s4p1')}</p>
          <p>{t('terms.s4p2')}</p>
        </Section>

        <Section title={t('terms.s5Title')}>
          <p>{t('terms.s5p1')}</p>
        </Section>

        <Section title={t('terms.s6Title')}>
          <p>{t('terms.s6p1')}</p>
        </Section>

        <Section title={t('terms.s7Title')}>
          <p>{t('terms.s7p1')}</p>
        </Section>

        <Section title={t('terms.s8Title')}>
          <p>{t('terms.s8p1')}</p>
        </Section>

      </div>
    </div>
  );
};

export default TermsOfService;
