import { useState, useEffect } from 'react';
import { translateToPt } from '../services/translate';
import { useI18n } from '../i18n/I18nContext';

// Retorna o texto em inglês e, no modo PT, atualiza para a tradução (MyMemory)
// quando ela chega. Reaproveita o cache do serviço de tradução.
export function useTranslatedText(en: string): string {
  const { lang } = useI18n();
  const [pt, setPt] = useState<string | null>(null);

  useEffect(() => {
    if (lang !== 'pt' || !en) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setPt(null);
      return;
    }
    let active = true;
    void translateToPt(en).then((tr) => {
      if (active) setPt(tr);
    });
    return () => {
      active = false;
    };
  }, [en, lang]);

  return lang === 'pt' && pt ? pt : en;
}
