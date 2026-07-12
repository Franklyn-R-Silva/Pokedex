import { getTypeColor, getTypeLabel } from '../domain/pokemonTypes';
import { useI18n } from '../i18n/I18nContext';
import { TypeSymbol } from './TypeIcon';

// Badge de tipo, colorido pela cor do tipo. Reutilizável (detalhes, cartas…).
export function TypeBadge({ type }: { type: string }) {
  const { lang } = useI18n();
  return (
    <span className="type-badge" style={{ backgroundColor: getTypeColor(type) }}>
      <TypeSymbol type={type} size={15} />
      {getTypeLabel(type, lang)}
    </span>
  );
}
