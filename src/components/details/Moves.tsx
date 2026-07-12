import { useRef, useEffect } from 'react';
import type { Pokemon } from '../../types';
import { renderMoves } from '../../features/moves';
import { useModal } from '../../context/ModalContext';
import { useI18n } from '../../i18n/I18nContext';
import { MoveDetail } from './MoveDetail';

// Reaproveita o renderMoves (lista agrupada + busca) via ref — a lógica de
// filtro já existe e é container-based, então roda dentro do React sem reescrever.
export function Moves({ pokemon }: { pokemon: Pokemon }) {
  const ref = useRef<HTMLDivElement>(null);
  const { open } = useModal();
  const { lang } = useI18n();

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    renderMoves(container, pokemon, (url, name) => open(<MoveDetail url={url} name={name} />));
    return () => {
      container.innerHTML = '';
    };
    // lang força re-render dos rótulos ao trocar idioma
  }, [pokemon, open, lang]);

  return (
    <div className="tab-panel is-active" data-panel="moves">
      <div className="details__moves" ref={ref} />
    </div>
  );
}
