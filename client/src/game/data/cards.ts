import { CardData, ElementType, SubType } from '../components/Card';

// Define a set of Level 1 Avatar cards
const avatars: CardData[] = [
  {
    id: 'avatar-1',
    name: 'Borah Trainee',
    type: 'avatar',
    level: 1,
    element: 'fire' as ElementType,
    subType: 'borah' as SubType,
    description: 'A novice fire wielder from the Borah clan',
    health: 8,
    skill1: {
      name: 'Fire Punch',
      energyCost: 1,
      damage: 2,
      effect: 'basic_attack'
    },
    art: 'guardian'
  },
  {
    id: 'avatar-2',
    name: 'Kobar Scout',
    type: 'avatar',
    level: 1,
    element: 'water' as ElementType,
    subType: 'kobar' as SubType,
    description: 'A water-attuned scout from the Kobar tribe',
    health: 7,
    skill1: {
      name: 'Water Jet',
      energyCost: 1,
      damage: 2,
      effect: 'basic_attack'
    },
    art: 'elemental'
  },
  {
    id: 'avatar-3',
    name: 'Kuhaka Apprentice',
    type: 'avatar',
    level: 1,
    element: 'ground' as ElementType,
    subType: 'kuhaka' as SubType,
    description: 'A young earth wielder from the Kuhaka mountains',
    health: 10,
    skill1: {
      name: 'Rock Throw',
      energyCost: 1,
      damage: 1,
      effect: 'basic_attack'
    },
    art: 'golem'
  },
  {
    id: 'avatar-4',
    name: 'Kujana Novice',
    type: 'avatar',
    level: 1,
    element: 'air' as ElementType,
    subType: 'kujana' as SubType,
    description: 'An air adept from the Kujana peaks',
    health: 6,
    skill1: {
      name: 'Gust',
      energyCost: 1,
      damage: 3,
      effect: 'basic_attack'
    },
    art: 'hawk'
  },
  {
    id: 'avatar-5',
    name: 'Borah Fighter',
    type: 'avatar',
    level: 2,
    element: 'fire' as ElementType,
    subType: 'borah' as SubType,
    description: 'An evolved Borah warrior with mastery over flames',
    health: 18,
    skill1: {
      name: 'Fire Punch',
      energyCost: 1,
      damage: 3,
      effect: 'basic_attack'
    },
    skill2: {
      name: 'Inferno',
      energyCost: 3,
      damage: 5,
      effect: 'area_damage'
    },
    art: 'assassin'
  },
  {
    id: 'avatar-6',
    name: 'Kobar Warrior',
    type: 'avatar',
    level: 2,
    element: 'water' as ElementType,
    subType: 'kobar' as SubType,
    description: 'An evolved Kobar master of water techniques',
    health: 16,
    skill1: {
      name: 'Water Jet',
      energyCost: 1,
      damage: 3,
      effect: 'basic_attack'
    },
    skill2: {
      name: 'Tidal Wave',
      energyCost: 3,
      damage: 4,
      effect: 'all_damage'
    },
    art: 'imp'
  },
  {
    id: 'avatar-7',
    name: 'Kuhaka Guardian',
    type: 'avatar',
    level: 2,
    element: 'ground' as ElementType,
    subType: 'kuhaka' as SubType,
    description: 'An evolved Kuhaka protector with earth powers',
    health: 22,
    skill1: {
      name: 'Rock Throw',
      energyCost: 1,
      damage: 2,
      effect: 'basic_attack'
    },
    skill2: {
      name: 'Earthquake',
      energyCost: 4,
      damage: 6,
      effect: 'stun'
    },
    art: 'turtle'
  },
  {
    id: 'avatar-8',
    name: 'Kujana Windcaller',
    type: 'avatar',
    level: 2,
    element: 'air' as ElementType,
    subType: 'kujana' as SubType,
    description: 'An evolved Kujana master of air currents',
    health: 15,
    skill1: {
      name: 'Gust',
      energyCost: 1,
      damage: 3,
      effect: 'basic_attack'
    },
    skill2: {
      name: 'Tornado',
      energyCost: 3,
      damage: 4,
      effect: 'bounce'
    },
    art: 'wolf'
  }
];

// Define a set of action cards
const actionCards: CardData[] = [
  {
    id: 'spell-1',
    name: 'Healing Light',
    type: 'spell',
    description: 'Restore 3 health to your active avatar',
    energyCost: 2,
    effect: 'heal_active',
    art: 'healing'
  },
  {
    id: 'spell-2',
    name: 'Fireball',
    type: 'spell',
    description: 'Deal 2 damage to opponent\'s active avatar',
    energyCost: 2,
    effect: 'damage_active',
    art: 'fireball'
  },
  {
    id: 'quickSpell-1',
    name: 'Counter Strike',
    type: 'quickSpell',
    description: 'Negate an opponent\'s attack',
    energyCost: 2,
    effect: 'negate_attack',
    art: 'blessing'
  },
  {
    id: 'ritualArmor-1',
    name: 'Stone Skin',
    type: 'ritualArmor',
    description: 'Add 2 shield counters to your active avatar',
    energyCost: 3,
    effect: 'add_shield',
    art: 'lightning'
  },
  {
    id: 'field-1',
    name: 'Arena of Champions',
    type: 'field',
    description: 'Both players\' active avatars get +1 damage on basic attacks',
    energyCost: 3,
    effect: 'boost_basic',
    art: 'fireball'
  },
  {
    id: 'equipment-1',
    name: 'Fire Sword',
    type: 'equipment',
    description: 'Equipped avatar\'s fire attacks deal +2 damage',
    energyCost: 2,
    effect: 'boost_fire',
    art: 'assassin'
  },
  {
    id: 'item-1',
    name: 'Energy Crystal',
    type: 'item',
    description: 'Add one energy of any type to your energy pile',
    energyCost: 0,
    effect: 'add_energy',
    art: 'elemental'
  }
];

// Function to generate a specific number of random cards
export const getRandomCards = (
  count: number, 
  avatarPool: CardData[], 
  actionPool: CardData[]
): CardData[] => {
  // Create a new pool to draw from
  const combined = [...avatarPool, ...actionPool];
  
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
  // Create a balanced deck with avatars and action cards
  const deckAvatars = avatars.filter(a => a.level === 1).map(a => ({ ...a }));
  const deckLevel2Avatars = avatars.filter(a => a.level === 2).map(a => ({ ...a }));
  const deckActions = actionCards.map(a => ({ ...a }));
  
  // Add unique IDs to avoid conflicts
  const uniquePrefix = player === 'player' ? 'p' : 'o';
  
  // Create a deck with a mix of avatars and action cards
  return [
    ...deckAvatars.map((card, index) => ({
      ...card,
      id: `${uniquePrefix}-${card.id}-${index}`
    })),
    // Include fewer level 2 avatars
    ...deckLevel2Avatars.slice(0, 2).map((card, index) => ({
      ...card,
      id: `${uniquePrefix}-l2-${card.id}-${index}`
    })),
    ...deckActions.map((card, index) => ({
      ...card,
      id: `${uniquePrefix}-${card.id}-${index}`
    }))
  ];
};

// Function to shuffle a deck
export const shuffleDeck = (deck: CardData[]): CardData[] => {
  return [...deck].sort(() => Math.random() - 0.5);
};

export default { avatars, actionCards, getRandomCards, getInitialDeck, shuffleDeck };
