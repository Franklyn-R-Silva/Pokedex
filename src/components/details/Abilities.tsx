import type { PokemonAbility } from '../../types';
import { useI18n } from '../../i18n/I18nContext';
import { useModal } from '../../context/ModalContext';
import { useTranslatedText } from '../../hooks/useTranslatedText';
import { AbilityDetail } from './AbilityDetail';

function AbilityChip({ ability }: { ability: PokemonAbility }) {
  const { t } = useI18n();
  const { open } = useModal();
  const name = useTranslatedText(ability.ability.name.replace(/-/g, ' '));

  return (
    <span
      className={`ability-chip is-clickable ${ability.is_hidden ? 'ability-chip--hidden' : ''}`}
      role="button"
      tabIndex={0}
      title={ability.is_hidden ? t('hiddenAbility') : undefined}
      onClick={() => open(<AbilityDetail url={ability.ability.url} title={name} />)}
    >
      {name}
    </span>
  );
}

export function Abilities({ abilities }: { abilities: PokemonAbility[] }) {
  const { t } = useI18n();
  return (
    <>
      <h2 className="section-title">{t('abilities')}</h2>
      <div className="details__abilities">
        {abilities.map((ability) => (
          <AbilityChip ability={ability} key={ability.ability.name} />
        ))}
      </div>
    </>
  );
}
