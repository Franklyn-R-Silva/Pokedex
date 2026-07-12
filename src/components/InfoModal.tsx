import { useI18n } from '../i18n/I18nContext';

// Conteúdo do modal "Sobre esta Pokédex".
export function InfoModal() {
  const { t } = useI18n();
  return (
    <>
      <h2>{t('infoTitle')}</h2>
      <p>{t('infoData')}</p>
      <p>{t('infoTranslate')}</p>
      <p>{t('infoShortcut')}</p>
      <p className="info-credit">
        <a href="https://github.com/Franklyn-R-Silva" target="_blank" rel="noopener">
          @Franklyn-R-Silva
        </a>{' '}
        · <a href="https://pokeapi.co/" target="_blank" rel="noopener">PokéAPI</a>
      </p>
    </>
  );
}
