// Decks "do meta" (arquétipos populares) como ponto de partida. Cada carta é
// buscada pelo nome na Pokémon TCG API ao carregar. Contagens somam ~60.
export interface MetaDeckTemplate {
  id: string;
  name: string;
  cards: { query: string; count: number }[];
}

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
      { query: "Professor's Research", count: 4 },
      { query: 'Iono', count: 4 },
      { query: "Boss's Orders", count: 2 },
      { query: 'Arven', count: 4 },
      { query: 'Ultra Ball', count: 4 },
      { query: 'Rare Candy', count: 4 },
      { query: 'Nest Ball', count: 4 },
      { query: 'Super Rod', count: 2 },
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
      { query: "Professor's Research", count: 4 },
      { query: 'Iono', count: 3 },
      { query: "Boss's Orders", count: 2 },
      { query: 'Ultra Ball', count: 4 },
      { query: 'Nest Ball', count: 4 },
      { query: 'Electric Generator', count: 4 },
      { query: 'Battle VIP Pass', count: 4 },
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
      { query: 'Cresselia', count: 1 },
      { query: "Professor's Research", count: 4 },
      { query: 'Iono', count: 3 },
      { query: "Boss's Orders", count: 2 },
      { query: 'Arven', count: 3 },
      { query: 'Ultra Ball', count: 4 },
      { query: 'Rare Candy', count: 4 },
      { query: 'Level Ball', count: 3 },
      { query: 'Psychic Energy', count: 25 },
    ],
  },
];
