import { useState, useEffect, useMemo } from 'react';
import type { RefItem, Lang } from '../../types';
import { fetchByType, fetchByGeneration } from '../../services/pokeapi';
import { getTypeColor, getTypeLabel } from '../../domain/pokemonTypes';
import { useI18n } from '../../i18n/I18nContext';

// Tipos na ordem do site de referência.
const TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
  'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];
const TYPE_EMOJI: Record<string, string> = {
  normal: '⚪', fighting: '🥊', flying: '🕊️', poison: '☠️', ground: '⛰️', rock: '🪨',
  bug: '🐛', ghost: '👻', steel: '⚙️', fire: '🔥', water: '💧', grass: '🌿',
  electric: '⚡', psychic: '🔮', ice: '❄️', dragon: '🐉', dark: '🌑', fairy: '✨',
};
const GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const GEN_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
const PAGE = 30;

const spriteUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
const L = (lang: Lang, pt: string, en: string) => (lang === 'pt' ? pt : en);

interface Data {
  base: RefItem[]; // todos (ordenado por id)
  typeOf: Map<number, string[]>;
  genOf: Map<number, number>;
}

export function PokedexBrowser({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (id: number) => void;
}) {
  const { lang } = useI18n();
  const [data, setData] = useState<Data | null>(null);
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [gen, setGen] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'num' | 'name'>('num');
  const [shown, setShown] = useState(PAGE);

  // Carrega tipos + gerações uma vez → base, membership e contadores.
  useEffect(() => {
    let active = true;
    void Promise.all([
      Promise.all(TYPES.map((tp) => fetchByType(tp).then((list) => [tp, list] as const))),
      Promise.all(GENS.map((g) => fetchByGeneration(g).then((list) => [g, list] as const))),
    ]).then(([typeLists, genLists]) => {
      if (!active) return;
      const typeOf = new Map<number, string[]>();
      typeLists.forEach(([tp, list]) =>
        list.forEach((p) => typeOf.set(p.id, [...(typeOf.get(p.id) ?? []), tp])),
      );
      const genOf = new Map<number, number>();
      const byId = new Map<number, RefItem>();
      genLists.forEach(([g, list]) =>
        list.forEach((p) => {
          genOf.set(p.id, g);
          byId.set(p.id, p);
        }),
      );
      const base = [...byId.values()].sort((a, b) => a.id - b.id);
      setData({ base, typeOf, genOf });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setShown(PAGE);
  }, [types, gen, search, sort]);

  const matchesType = (id: number) =>
    types.size === 0 || (data?.typeOf.get(id) ?? []).some((t) => types.has(t));
  const matchesGen = (id: number) => gen == null || data?.genOf.get(id) === gen;
  const matchesSearch = (p: RefItem) =>
    !search.trim() ||
    p.name.includes(search.trim().toLowerCase()) ||
    String(p.id).padStart(4, '0').includes(search.trim());

  const results = useMemo(() => {
    if (!data) return [];
    const list = data.base.filter((p) => matchesType(p.id) && matchesGen(p.id) && matchesSearch(p));
    return sort === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name)) : list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, types, gen, search, sort]);

  // Contadores contextuais (tipo respeita a geração; geração respeita os tipos).
  const typeCount = (tp: string) =>
    data ? data.base.filter((p) => matchesGen(p.id) && (data.typeOf.get(p.id) ?? []).includes(tp)).length : 0;
  const genCount = (g: number) =>
    data ? data.base.filter((p) => data.genOf.get(p.id) === g && matchesType(p.id)).length : 0;

  const toggleType = (tp: string) =>
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(tp)) next.delete(tp);
      else next.add(tp);
      return next;
    });
  const clear = () => {
    setTypes(new Set());
    setGen(null);
    setSearch('');
  };

  return (
    <div className="pkx">
      <div className="pkx__head">
        <button className="deck-back" type="button" onClick={onClose}>
          {L(lang, '← Voltar', '← Back')}
        </button>
        <h2 className="deck-title">{L(lang, '🔎 Explorar Pokédex', '🔎 Explore Pokédex')}</h2>
        <span className="pkx__count">{results.length}</span>
      </div>

      <div className="pkx__body">
        <div className="pkx__filters">
          <div className="pkx__filter-head">
            <strong>{L(lang, 'Filtros', 'Filters')}</strong>
            <button type="button" className="pkx__clear" onClick={clear}>
              {L(lang, 'LIMPAR', 'CLEAR')}
            </button>
          </div>

          <input
            className="pkx__search"
            type="search"
            placeholder={L(lang, 'Nome ou número…', 'Name or number…')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <h3 className="pkx__section">{L(lang, 'Tipo', 'Type')}</h3>
          <div className="pkx__types">
            {TYPES.map((tp) => {
              const n = typeCount(tp);
              const active = types.has(tp);
              return (
                <button
                  key={tp}
                  type="button"
                  className={`pkx__type ${active ? 'is-active' : ''}`}
                  style={active ? { borderColor: getTypeColor(tp) } : undefined}
                  disabled={n === 0 && !active}
                  onClick={() => toggleType(tp)}
                >
                  <span className="pkx__type-ic" style={{ background: getTypeColor(tp) }}>
                    {TYPE_EMOJI[tp]}
                  </span>
                  <span className="pkx__type-name">{getTypeLabel(tp, lang)}</span>
                  <span className="pkx__type-n">({n})</span>
                </button>
              );
            })}
          </div>

          <h3 className="pkx__section">{L(lang, 'Geração', 'Generation')}</h3>
          <div className="pkx__gens">
            {GENS.map((g, i) => (
              <button
                key={g}
                type="button"
                className={`pkx__gen ${gen === g ? 'is-active' : ''}`}
                onClick={() => setGen((cur) => (cur === g ? null : g))}
              >
                {L(lang, 'Gen', 'Gen')} {GEN_ROMAN[i]} <span className="pkx__type-n">({genCount(g)})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pkx__main">
          <div className="pkx__toolbar">
            <span className="muted">
              {types.size > 0 || gen != null
                ? L(lang, 'Resultados filtrados', 'Filtered results')
                : L(lang, 'Todos os Pokémon', 'All Pokémon')}
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value as 'num' | 'name')} aria-label="Ordenar">
              <option value="num">{L(lang, 'Número', 'Number')}</option>
              <option value="name">A–Z</option>
            </select>
          </div>

          {!data ? (
            <div className="pkx__grid">
              {Array.from({ length: 15 }).map((_, i) => (
                <div className="pkx__skeleton" key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <p className="muted pkx__empty">{L(lang, 'Nenhum Pokémon encontrado.', 'No Pokémon found.')}</p>
          ) : (
            <>
              <div className="pkx__grid">
                {results.slice(0, shown).map((p) => (
                  <button className="pkx__card" type="button" key={p.id} onClick={() => onSelect(p.id)}>
                    <img src={spriteUrl(p.id)} alt={p.name} loading="lazy" />
                    <span className="pkx__num">#{String(p.id).padStart(4, '0')}</span>
                    <span className="pkx__name">{p.name}</span>
                    <span className="pkx__badges">
                      {(data.typeOf.get(p.id) ?? []).map((tp) => (
                        <span
                          key={tp}
                          className="pkx__badge"
                          title={getTypeLabel(tp, lang)}
                          style={{ background: getTypeColor(tp) }}
                        >
                          {TYPE_EMOJI[tp]}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
              {shown < results.length && (
                <button className="load-more pkx__more" type="button" onClick={() => setShown((s) => s + PAGE)}>
                  {L(lang, 'Carregar mais', 'Load more')} ({results.length - shown})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
