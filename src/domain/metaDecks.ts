// Top 10 decks "do meta" (arquétipos populares) como ponto de partida. Cada
// carta é buscada pelo nome na Pokémon TCG API ao carregar (em paralelo, com
// cache). As contagens somam ~60 e respeitam o limite de 4 cópias.
export interface MetaDeckTemplate {
  id: string;
  name: string;
  cards: { query: string; count: number }[];
}

const STAPLES = (extra: { query: string; count: number }[]) => [
  { query: "Professor's Research", count: 4 },
  { query: 'Iono', count: 3 },
  { query: "Boss's Orders", count: 2 },
  { query: 'Ultra Ball', count: 4 },
  { query: 'Nest Ball', count: 3 },
  ...extra,
];

export const META_DECKS: MetaDeckTemplate[] = [
  {
    id: 'charizard',
    name: '🔥 Charizard ex',
    cards: [
      { query: 'Charizard ex', count: 3 },
      { query: 'Charmander', count: 4 },
      { query: 'Charmeleon', count: 2 },
      { query: 'Pidgey', count: 3 },
      { query: 'Pidgeot ex', count: 2 },
      ...STAPLES([
        { query: 'Arven', count: 4 },
        { query: 'Rare Candy', count: 4 },
        { query: 'Super Rod', count: 2 },
      ]),
      { query: 'Fire Energy', count: 18 },
    ],
  },
  {
    id: 'miraidon',
    name: '⚡ Miraidon ex',
    cards: [
      { query: 'Miraidon ex', count: 3 },
      { query: 'Pikachu ex', count: 2 },
      { query: 'Flaaffy', count: 2 },
      { query: 'Mareep', count: 2 },
      { query: 'Raikou V', count: 2 },
      ...STAPLES([
        { query: 'Electric Generator', count: 4 },
        { query: 'Battle VIP Pass', count: 4 },
      ]),
      { query: 'Lightning Energy', count: 24 },
    ],
  },
  {
    id: 'gardevoir',
    name: '🔮 Gardevoir ex',
    cards: [
      { query: 'Gardevoir ex', count: 3 },
      { query: 'Ralts', count: 4 },
      { query: 'Kirlia', count: 3 },
      { query: 'Zacian V', count: 1 },
      ...STAPLES([
        { query: 'Arven', count: 3 },
        { query: 'Rare Candy', count: 4 },
        { query: 'Level Ball', count: 3 },
      ]),
      { query: 'Psychic Energy', count: 25 },
    ],
  },
  {
    id: 'lugia',
    name: '🌀 Lugia VSTAR',
    cards: [
      { query: 'Lugia VSTAR', count: 3 },
      { query: 'Lugia V', count: 3 },
      { query: 'Archeops', count: 4 },
      { query: 'Lumineon V', count: 2 },
      ...STAPLES([
        { query: 'Capacious Bucket', count: 3 },
        { query: 'Serena', count: 2 },
      ]),
      { query: 'Double Turbo Energy', count: 4 },
      { query: 'Powerful Colorless Energy', count: 4 },
      { query: 'Water Energy', count: 6 },
      { query: 'Fire Energy', count: 6 },
    ],
  },
  {
    id: 'lostbox',
    name: '🌌 Lost Box',
    cards: [
      { query: 'Comfey', count: 4 },
      { query: 'Sableye', count: 2 },
      { query: 'Cramorant', count: 2 },
      { query: 'Radiant Greninja', count: 1 },
      { query: 'Mew ex', count: 1 },
      { query: "Colress's Experiment", count: 4 },
      { query: 'Battle VIP Pass', count: 4 },
      { query: 'Nest Ball', count: 4 },
      { query: 'Ultra Ball', count: 4 },
      { query: "Boss's Orders", count: 2 },
      { query: 'Iono', count: 2 },
      { query: 'Switch Cart', count: 2 },
      { query: 'Water Energy', count: 6 },
      { query: 'Psychic Energy', count: 6 },
      { query: 'Lightning Energy', count: 5 },
    ],
  },
  {
    id: 'gholdengo',
    name: '🪙 Gholdengo ex',
    cards: [
      { query: 'Gholdengo ex', count: 3 },
      { query: 'Gimmighoul', count: 3 },
      { query: 'Bronzong', count: 2 },
      { query: 'Bronzor', count: 2 },
      ...STAPLES([{ query: 'Arven', count: 3 }]),
      { query: 'Metal Energy', count: 31 },
    ],
  },
  {
    id: 'chienpao',
    name: '❄️ Chien-Pao ex',
    cards: [
      { query: 'Chien-Pao ex', count: 3 },
      { query: 'Baxcalibur', count: 3 },
      { query: 'Frigibax', count: 4 },
      { query: 'Manaphy', count: 1 },
      ...STAPLES([
        { query: 'Superior Energy Retrieval', count: 3 },
        { query: 'Irida', count: 2 },
      ]),
      { query: 'Water Energy', count: 28 },
    ],
  },
  {
    id: 'arceus',
    name: '🌟 Arceus VSTAR',
    cards: [
      { query: 'Arceus VSTAR', count: 3 },
      { query: 'Arceus V', count: 4 },
      { query: 'Bidoof', count: 2 },
      { query: 'Bibarel', count: 2 },
      ...STAPLES([{ query: 'Ordinary Rod', count: 2 }]),
      { query: 'Double Turbo Energy', count: 4 },
      { query: 'Fire Energy', count: 14 },
      { query: 'Lightning Energy', count: 9 },
    ],
  },
  {
    id: 'roaringmoon',
    name: '🦖 Roaring Moon ex',
    cards: [
      { query: 'Roaring Moon ex', count: 3 },
      { query: 'Squawkabilly ex', count: 1 },
      { query: 'Koraidon', count: 2 },
      ...STAPLES([
        { query: 'Dark Patch', count: 4 },
        { query: 'Earthen Vessel', count: 3 },
        { query: 'Arven', count: 2 },
      ]),
      { query: 'Darkness Energy', count: 28 },
    ],
  },
  {
    id: 'snorlax',
    name: '💤 Snorlax Stall',
    cards: [
      { query: 'Snorlax', count: 4 },
      { query: 'Munchlax', count: 2 },
      { query: 'Pokémon Center Lady', count: 2 },
      { query: "Boss's Orders", count: 2 },
      { query: 'Iono', count: 3 },
      { query: "Professor's Research", count: 3 },
      { query: 'Pokégear 3.0', count: 4 },
      { query: 'Counter Catcher', count: 3 },
      { query: 'Great Ball', count: 4 },
      { query: 'Path to the Peak', count: 2 },
      { query: 'Cyllene', count: 2 },
      { query: 'Grass Energy', count: 6 },
    ],
  },
];
