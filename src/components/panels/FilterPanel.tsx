import { useRef, useEffect } from 'react';
import { setupFilter } from '../../features/filter';
import type { FilterControls } from '../../features/filter';
import { useI18n } from '../../i18n/I18nContext';

// Reaproveita setupFilter (grid paginado por tipo/geração/ordem) via refs.
export function FilterPanel({ onSelect }: { onSelect: (nameOrId: string | number) => void }) {
  const { t, lang } = useI18n();
  const typeRef = useRef<HTMLSelectElement>(null);
  const genRef = useRef<HTMLSelectElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const ctlRef = useRef<FilterControls | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!typeRef.current || !genRef.current || !sortRef.current || !resultsRef.current || !pageRef.current)
      return;
    ctlRef.current = setupFilter({
      typeSelect: typeRef.current,
      genSelect: genRef.current,
      sortSelect: sortRef.current,
      resultsEl: resultsRef.current,
      paginationEl: pageRef.current,
      onSelect: (name) => onSelectRef.current(name),
    });
  }, []);

  useEffect(() => {
    ctlRef.current?.refresh();
  }, [lang]);

  return (
    <section className="panel filter">
      <h2 className="panel__title">{t('exploreTitle')}</h2>
      <div className="filter__controls">
        <select className="filter-type" aria-label={t('filterTypeLabel')} ref={typeRef} />
        <select className="filter-gen" aria-label={t('filterGenLabel')} ref={genRef} />
        <select className="filter-sort" aria-label="Ordenar" ref={sortRef} />
      </div>
      <div className="filter-results grid" ref={resultsRef} />
      <div className="filter-pagination" ref={pageRef} />
    </section>
  );
}
