import { useRef, useEffect, useState } from 'react';
import type { StatKey } from '../../i18n/translations';
import { setupCompare } from '../../features/compare';
import type { CompareControls } from '../../features/compare';
import { setupAutocomplete } from '../../features/autocomplete';
import { useI18n } from '../../i18n/I18nContext';

const STAT_ORDER: StatKey[] = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

// Reaproveita setupCompare (até 4 Pokémon → radar + tabela) + autocomplete.
export function ComparePanel({ getNames }: { getNames: () => string[] }) {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLUListElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const ctlRef = useRef<CompareControls | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    if (!formRef.current || !inputRef.current || !chipsRef.current || !resultRef.current) return;
    const ctl = setupCompare({
      form: formRef.current,
      input: inputRef.current,
      chipsEl: chipsRef.current,
      resultEl: resultRef.current,
    });
    ctlRef.current = ctl;
    if (suggestRef.current) {
      setupAutocomplete({
        input: inputRef.current,
        container: suggestRef.current,
        getNames,
        onSelect: (name) => void ctl.add(name),
      });
    }
  }, [getNames]);

  const labels = t('statLabels');
  const names = t('statNames');

  return (
    <section className="panel compare">
      <div className="panel__head">
        <h2 className="panel__title">{t('compareTitle')}</h2>
        <button
          className="info-btn compare-info"
          type="button"
          aria-label={t('statsLegendAria')}
          aria-expanded={legendOpen}
          onClick={() => setLegendOpen((v) => !v)}
        >
          ⓘ
        </button>
      </div>
      <div className="compare-legend" hidden={!legendOpen}>
        {STAT_ORDER.map((key) => (
          <div className="legend-item" key={key}>
            <strong>{labels[key]}</strong> {names[key]}
          </div>
        ))}
      </div>
      <form className="compare__controls" ref={formRef}>
        <div className="compare-field">
          <input
            className="compare-input"
            type="search"
            placeholder={t('comparePlaceholder')}
            aria-label={t('comparePlaceholder')}
            autoComplete="off"
            ref={inputRef}
          />
          <ul className="suggestions compare-suggest" role="listbox" ref={suggestRef} />
        </div>
        <button className="compare-add" type="submit" aria-label={t('compareAddAria')}>
          ＋
        </button>
      </form>
      <div className="compare-chips" ref={chipsRef} />
      <div className="compare-result" ref={resultRef} />
    </section>
  );
}
