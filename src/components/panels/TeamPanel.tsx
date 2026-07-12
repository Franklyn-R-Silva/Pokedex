import { useRef, useEffect } from 'react';
import { setupTeam } from '../../features/team';
import type { TeamControls } from '../../features/team';
import { setupBattle } from '../../features/battle';
import type { BattleControls } from '../../features/battle';
import { setupAutocomplete } from '../../features/autocomplete';
import { useI18n } from '../../i18n/I18nContext';

interface TeamPanelProps {
  getNames: () => string[];
  onSelect: (nameOrId: string | number) => void;
}

// Reaproveita setupTeam (time de 6 + fraquezas) + setupBattle (mini-jogo).
export function TeamPanel({ getNames, onSelect }: TeamPanelProps) {
  const { t, lang } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLUListElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const battleRef = useRef<BattleControls | null>(null);
  const teamRef = useRef<TeamControls | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!formRef.current || !inputRef.current || !listRef.current || !resultRef.current) return;
    const teamCtl = setupTeam({
      form: formRef.current,
      input: inputRef.current,
      listEl: listRef.current,
      resultEl: resultRef.current,
      onSelect: (name) => onSelectRef.current(name),
    });
    teamRef.current = teamCtl;
    if (suggestRef.current) {
      setupAutocomplete({
        input: inputRef.current,
        container: suggestRef.current,
        getNames,
        onSelect: (name) => void teamCtl.add(name),
      });
    }
    if (modalRef.current && contentRef.current) {
      const modal = modalRef.current;
      battleRef.current = setupBattle({
        modal,
        content: contentRef.current,
        getTeam: () => teamCtl.getTeam(),
        getNames,
        show: (m) => (m.hidden = false),
      });
    }
  }, [getNames]);

  useEffect(() => {
    teamRef.current?.refresh();
  }, [lang]);

  const closeBattle = () => {
    if (modalRef.current) modalRef.current.hidden = true;
  };

  return (
    <section className="panel team">
      <div className="panel__head">
        <h2 className="panel__title">{t('teamTitle')}</h2>
        <button className="btn-battle" type="button" onClick={() => battleRef.current?.open()}>
          {t('battleButton')}
        </button>
      </div>
      <form className="team__controls" ref={formRef}>
        <div className="compare-field">
          <input
            className="team-input"
            type="search"
            placeholder={t('teamPlaceholder')}
            aria-label={t('teamPlaceholder')}
            autoComplete="off"
            ref={inputRef}
          />
          <ul className="suggestions team-suggest" role="listbox" ref={suggestRef} />
        </div>
        <button className="compare-add" type="submit" aria-label="Adicionar">
          ＋
        </button>
      </form>
      <div className="team-list" ref={listRef} />
      <div className="team-result" ref={resultRef} />

      <div
        className="modal battle-modal"
        hidden
        ref={modalRef}
        onClick={(e) => e.target === e.currentTarget && closeBattle()}
        onKeyDown={(e) => e.key === 'Escape' && closeBattle()}
      >
        <div className="modal__box battle-box">
          <button className="modal__close" type="button" aria-label="Fechar" onClick={closeBattle}>
            ✕
          </button>
          <div className="battle-content" ref={contentRef} />
        </div>
      </div>
    </section>
  );
}
