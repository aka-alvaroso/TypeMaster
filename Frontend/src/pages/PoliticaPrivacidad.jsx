import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-base font-medium text-kp-text">{title}</h2>
    <div className="text-sm text-kp-muted leading-relaxed flex flex-col gap-2">{children}</div>
  </section>
);

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-kp-bg text-kp-text h-screen overflow-y-auto flex flex-col items-center">
      <div className="w-full max-w-2xl px-6 py-16 flex flex-col gap-10">

        <div className="flex flex-col gap-2">
          <Link to="/" className="text-xs text-kp-muted hover:text-kp-accent transition-colors">{t('privacy.back')}</Link>
          <h1 className="text-2xl font-medium">{t('privacy.title')}</h1>
          <p className="text-sm text-kp-muted">{t('privacy.lastUpdated')}</p>
        </div>

        <Section title={t('privacy.s1Title')}>
          <p>{t('privacy.s1p1')}</p>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>{t('privacy.s1li1')}</li>
            <li>{t('privacy.s1li2')}</li>
            <li>{t('privacy.s1li3')}</li>
          </ul>
          <p>{t('privacy.s1p2')}</p>
        </Section>

        <Section title={t('privacy.s2Title')}>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>{t('privacy.s2li1')}</li>
            <li>{t('privacy.s2li2')}</li>
            <li>{t('privacy.s2li3')}</li>
          </ul>
        </Section>

        <Section title={t('privacy.s3Title')}>
          <p>{t('privacy.s3p1')}</p>
        </Section>

        <Section title={t('privacy.s4Title')}>
          <p>
            {t('privacy.s4p1')}{' '}
            <code className="bg-kp-surface px-1 text-xs">{t('privacy.sessionStorage')}</code>{' '}
            {t('privacy.s4p2')}{' '}
            <code className="bg-kp-surface px-1 text-xs">{t('privacy.localStorage')}</code>{' '}
            {t('privacy.s4p3')}
          </p>
        </Section>

        <Section title={t('privacy.s5Title')}>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>{t('privacy.s5li1')}</li>
            <li>{t('privacy.s5li2')} <a href="mailto:albaol60n@gmail.com" className="text-kp-accent hover:underline">albaol60n@gmail.com</a></li>
          </ul>
        </Section>

        <Section title={t('privacy.s6Title')}>
          <p>{t('privacy.s6p1')} <a href="mailto:albaol60n@gmail.com" className="text-kp-accent hover:underline">albaol60n@gmail.com</a></p>
        </Section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
