import { AvatarCard, ActionCard, ElementType } from './cardTypes';

// Helper function to create energy cost arrays
const createEnergyCost = (fire: number = 0, neutral: number = 0): ElementType[] => {
  const energyCost: ElementType[] = [];
  
  // Add fire energy
  for (let i = 0; i < fire; i++) {
    energyCost.push('fire');
  }
  
  // Add neutral energy
  for (let i = 0; i < neutral; i++) {
    energyCost.push('neutral');
  }
  
  return energyCost;
};

// KUJANA-KUHAKA TRIBE CARDS

// Level 1 Avatar Cards
export const witchTrainee: AvatarCard = {
  id: 'kujana-001',
  name: 'Witch Trainee',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kujana',
  health: 7,
  art: '/textures/cards/witch-trainee.png',
  skill1: {
    name: 'Unholy Bleed',
    energyCost: createEnergyCost(1, 1),
    damage: 1,
    effect: 'Opponent\'s active Avatar gets 2 Bleed Counters.'
  }
};

export const shamanA: AvatarCard = {
  id: 'kujana-002',
  name: 'Shaman A',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kujana',
  health: 6,
  art: '/textures/cards/shaman-a.png',
  skill1: {
    name: 'Flame Hex',
    energyCost: createEnergyCost(2),
    damage: 2,
    effect: 'Reduce opponent\'s next attack damage by 1.'
  }
};

export const shamanB: AvatarCard = {
  id: 'kujana-003',
  name: 'Shaman B',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kujana',
  health: 8,
  art: '/textures/cards/shaman-b.png',
  skill1: {
    name: 'Spirit Fire',
    energyCost: createEnergyCost(1, 1),
    damage: 2,
    effect: 'If you have less than 3 cards in hand, this attack gets +1 damage.'
  }
};

export const thug: AvatarCard = {
  id: 'kuhaka-001',
  name: 'Thug',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kuhaka',
  health: 8,
  art: '/textures/cards/thug.png',
  skill1: {
    name: 'Punch',
    energyCost: createEnergyCost(1),
    damage: 2,
    effect: 'Basic attack damage.'
  }
};

// Level 2 Avatar Cards
export const boarWitch: AvatarCard = {
  id: 'kujana-101',
  name: 'Boar Witch',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kujana',
  baseType: 'kujana',
  health: 12,
  art: '/textures/cards/boar-witch.png',
  skill1: {
    name: 'Witch Aura',
    energyCost: createEnergyCost(2),
    damage: 0,
    effect: 'Active Kuhaka/Kujana Fire Avatars get +2 damage until your next turn.'
  },
  skill2: {
    name: 'Heal Aura',
    energyCost: createEnergyCost(2, 2),
    damage: 5,
    effect: 'Deal damage and heal your Avatar for 2 health.'
  }
};

export const boarBerserker: AvatarCard = {
  id: 'kuhaka-101',
  name: 'Boar Berserker',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kuhaka',
  baseType: 'kuhaka',
  health: 16,
  art: '/textures/cards/boar-berserker.png',
  skill1: {
    name: 'Head Breaker',
    energyCost: createEnergyCost(2),
    damage: 3,
    effect: 'If the defending Avatar is Air-type, this attack gets +2'
  },
  skill2: {
    name: 'Burn and Slam',
    energyCost: createEnergyCost(2, 3),
    damage: 8,
    effect: 'You may discard an energy card from energy pile to give this attack +3 damage'
  }
};

// Spell Cards
export const burningSight: ActionCard = {
  id: 'spell-kk-001',
  name: 'Burning Sight',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(1, 1),
  art: '/textures/cards/burning-sight.png',
  description: 'Look at the top 3 cards of your deck, put one in your hand and the others at the bottom of your deck.'
};

export const burningUp: ActionCard = {
  id: 'spell-kk-002',
  name: 'Burning Up',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/textures/cards/burning-up.png',
  description: 'Add 3 Bleed counters to opponent\'s active Avatar.'
};

export const flamingBody: ActionCard = {
  id: 'spell-kk-003',
  name: 'Flaming Body',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(1, 2),
  art: '/textures/cards/flaming-body.png',
  description: 'Deal 1 damage to any Avatar that attacks your Avatar during this turn.'
};

export const lightingSpark: ActionCard = {
  id: 'spell-kk-004',
  name: 'Lighting Spark',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(2, 1),
  art: '/textures/cards/lighting-spark.png',
  description: 'Deal 3 damage to opponent\'s active Avatar. If it has Bleed counters, deal +2 damage.'
};

export const spark: ActionCard = {
  id: 'spell-kk-005',
  name: 'Spark',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(1),
  art: '/textures/cards/spark.png',
  description: 'Deal 1 damage to each of opponent\'s reserve Avatars.'
};

// All Kujana-Kuhaka Cards Arrays
export const kujanaKuhakaAvatarCards: AvatarCard[] = [
  witchTrainee,
  shamanA,
  shamanB,
  thug,
  boarWitch,
  boarBerserker
];

export const kujanaKuhakaActionCards: ActionCard[] = [
  burningSight,
  burningUp,
  flamingBody,
  lightingSpark,
  spark
];

export const allKujanaKuhakaCards = [...kujanaKuhakaAvatarCards, ...kujanaKuhakaActionCards];