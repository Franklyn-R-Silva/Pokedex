import { useState, useEffect } from 'react';
import { fetchAbility } from '../../services/pokeapi';
import { useI18n } from '../../i18n/I18nContext';
import { useTranslatedText } from '../../hooks/useTranslatedText';

// Conteúdo do modal de habilidade (efeito) — endpoint /ability.
export function AbilityDetail({ url, title }: { url: string; title: string }) {
  const { t } = useI18n();
  const [effect, setEffect] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchAbility(url).then((data) => {
      if (!active) return;
      const entry = data?.effect_entries.find((e) => e.language.name === 'en');
      setEffect(entry?.short_effect ?? entry?.effect ?? t('none'));
    });
    return () => {
      active = false;
    };
  }, [url, t]);

  const translated = useTranslatedText(effect ?? '');

  return (
    <>
      <h2 className="detail-title">{title}</h2>
      {effect === null ? (
        <span className="muted">{t('loading')}</span>
      ) : (
        <p className="detail-effect">{translated}</p>
      )}
    </>
  );
}
