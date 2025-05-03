import { CardData } from '../components/Card';

// Define a set of creatures
const creatures: CardData[] = [
  {
    id: 'creature-1',
    name: 'Forest Guardian',
    type: 'creature',
    description: 'Protector of the ancient woods',
    attack: 2,
    health: 3,
    cost: 2,
    art: 'guardian'
  },
  {
    id: 'creature-2',
    name: 'Mountain Golem',
    type: 'creature',
    description: 'Stone creature that grows stronger with age',
    attack: 4,
    health: 4,
    cost: 4,
    art: 'golem'
  },
  {
    id: 'creature-3',
    name: 'Fire Imp',
    type: 'creature',
    description: 'Small but deadly fire spirit',
    attack: 2,
    health: 1,
    cost: 1,
    art: 'imp'
  },
  {
    id: 'creature-4',
    name: 'Water Elemental',
    type: 'creature',
    description: 'Formed from the purest springs',
    attack: 3,
    health: 5,
    cost: 5,
    art: 'elemental'
  },
  {
    id: 'creature-5',
    name: 'Sky Hawk',
    type: 'creature',
    description: 'Swift aerial hunter',
    attack: 3,
    health: 2,
    cost: 3,
    art: 'hawk'
  },
  {
    id: 'creature-6',
    name: 'Shadow Assassin',
    type: 'creature',
    description: 'Strikes from the darkness',
    attack: 5,
    health: 2,
    cost: 4,
    art: 'assassin'
  },
  {
    id: 'creature-7',
    name: 'Ancient Turtle',
    type: 'creature',
    description: 'Slow but nearly indestructible',
    attack: 1,
    health: 8,
    cost: 5,
    art: 'turtle'
  },
  {
    id: 'creature-8',
    name: 'Spirit Wolf',
    type: 'creature',
    description: 'Loyal companion from the spirit realm',
    attack: 3,
    health: 3,
    cost: 3,
    art: 'wolf'
  }
];

// Define a set of spells
const spells: CardData[] = [
  {
    id: 'spell-1',
    name: 'Healing Light',
    type: 'spell',
    description: 'Restore 3 health to yourself',
    effect: 'heal_player',
    cost: 2,
    art: 'healing'
  },
  {
    id: 'spell-2',
    name: 'Fireball',
    type: 'spell',
    description: 'Deal 2 damage to all enemy creatures',
    effect: 'damage_all_enemies',
    cost: 3,
    art: 'fireball'
  },
  {
    id: 'spell-3',
    name: 'Nature\'s Blessing',
    type: 'spell',
    description: 'Give all your creatures +1/+1',
    effect: 'buff_all_creatures',
    cost: 4,
    art: 'blessing'
  },
  {
    id: 'spell-4',
    name: 'Lightning Strike',
    type: 'spell',
    description: 'Deal 3 damage to opponent',
    effect: 'damage_opponent',
    cost: 3,
    art: 'lightning'
  }
];

// Function to generate a specific number of random cards
export const getRandomCards = (
  count: number, 
  creaturePool: CardData[], 
  spellPool: CardData[]
): CardData[] => {
  // Create a new pool to draw from
  const combined = [...creaturePool, ...spellPool];
  
  // Shuffle the pool
  const shuffled = [...combined].sort(() => Math.random() - 0.5);
  
  // Take the required number of cards
  return shuffled.slice(0, count).map((card, index) => ({
    ...card,
    id: `${card.id}-${index}` // Ensure unique IDs
  }));
};

// Function to create initial deck for a player
export const getInitialDeck = (player: 'player' | 'opponent'): CardData[] => {
  // Create a balanced deck with creatures and spells
  const deckCreatures = creatures.map(c => ({ ...c }));
  const deckSpells = spells.map(s => ({ ...s }));
  
  // Add unique IDs to avoid conflicts
  const uniquePrefix = player === 'player' ? 'p' : 'o';
  
  return [
    ...deckCreatures.map((card, index) => ({
      ...card,
      id: `${uniquePrefix}-${card.id}-${index}`
    })),
    ...deckSpells.map((card, index) => ({
      ...card,
      id: `${uniquePrefix}-${card.id}-${index}`
    }))
  ];
};

// Function to shuffle a deck
export const shuffleDeck = (deck: CardData[]): CardData[] => {
  return [...deck].sort(() => Math.random() - 0.5);
};

export default { creatures, spells, getRandomCards, getInitialDeck, shuffleDeck };
