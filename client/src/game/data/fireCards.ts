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

// Level 1 Avatar Cards
export const witchTrainee: AvatarCard = {
  id: 'fire-001',
  name: 'Witch Trainee',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kujana',
  health: 7,
  art: '/textures/cards/witch-trainee.png',
  skill1: {
    name: 'Unholy Bleed',
    energyCost: createEnergyCost(2),
    damage: 1,
    effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters.'
  }
};

export const thug: AvatarCard = {
  id: 'fire-002',
  name: 'Thug',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kuhaka',
  health: 7,
  art: '/textures/cards/thug.png',
  skill1: {
    name: 'Punch',
    energyCost: createEnergyCost(1),
    damage: 1
  }
};

export const kobarTrainee: AvatarCard = {
  id: 'fire-003',
  name: 'Kobar Trainee',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 6,
  art: '/textures/cards/kobar-trainee.png',
  skill1: {
    name: 'Dagger Play',
    energyCost: createEnergyCost(2),
    damage: 0,
    effect: 'Target opponent get 2 Bleed Counters.'
  }
};

export const borahTrainee: AvatarCard = {
  id: 'fire-004',
  name: 'Borah Trainee',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 4,
  art: '/textures/cards/borah-trainee.png',
  skill1: {
    name: 'Explosion',
    energyCost: createEnergyCost(2),
    damage: 1,
    effect: 'If the defending avatar has Bleed counter, this attack get 2 extra damage.'
  }
};

// Level 2 Avatar Cards
export const radja: AvatarCard = {
  id: 'fire-101',
  name: 'Radja',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kobar',
  baseType: 'kobar',
  health: 16,
  art: '/textures/cards/radja.png',
  skill1: {
    name: 'Pyro Punch',
    energyCost: [...createEnergyCost(1), 'neutral'],
    damage: 4,
    effect: 'If you have 1 card or less card in hand, this attack get +1'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: [...createEnergyCost(2), 'neutral', 'neutral'],
    damage: 9,
    effect: 'This attack does 2 more damage if opponent Active Avatar were Air type.'
  }
};

export const daisy: AvatarCard = {
  id: 'fire-102',
  name: 'Daisy',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'borah',
  baseType: 'borah',
  health: 15,
  art: '/textures/cards/daisy.png',
  skill1: {
    name: 'Pyro Kick',
    energyCost: [...createEnergyCost(1), 'neutral'],
    damage: 5,
    effect: 'If you have 1 card or less card in hand, this attack get +1'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: [...createEnergyCost(2), 'neutral', 'neutral'],
    damage: 10,
    effect: 'This attack does 3 more damage if opponent Active Avatar were Air type.'
  }
};

export const boarWitch: AvatarCard = {
  id: 'fire-103',
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
    energyCost: [],
    damage: 0,
    effect: 'Active Kuhaka/Kujana Fire Avatar, get +2 damage.'
  },
  skill2: {
    name: 'Heal Aura',
    energyCost: [...createEnergyCost(2), 'neutral', 'neutral'],
    damage: 7,
    effect: 'This attack heal 2 damage.'
  }
};

export const boarBerserker: AvatarCard = {
  id: 'fire-104',
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
    effect: 'If the defending Avatar were Air-type, this attack get +2'
  },
  skill2: {
    name: 'Burn and Slam',
    energyCost: [...createEnergyCost(2), 'neutral', 'neutral', 'neutral'],
    damage: 12,
    effect: 'You may discard a energy card from energy pile, if you do, this attack get +11 damage'
  }
};

// Spell Cards
export const afterBurn: ActionCard = {
  id: 'fire-201',
  name: 'After Burn',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/textures/cards/after-burn.png',
  description: 'Add 2 damage target Avatar who get damage this turn.'
};

export const burnBall: ActionCard = {
  id: 'fire-202',
  name: 'Burn Ball',
  type: 'quickSpell',
  element: 'fire',
  energyCost: [...createEnergyCost(1), 'neutral'],
  art: '/textures/cards/burn-ball.png',
  description: 'Direct 2 damage to front Avatar'
};

export const fallingFireball: ActionCard = {
  id: 'fire-203',
  name: 'Falling Fireball',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(4),
  art: '/textures/cards/falling-fireball.png',
  description: 'Deals 2 damage to all opponent Active and Reserve Avatars.'
};

// All Fire Cards Array (for easier access)
export const fireAvatarCards: AvatarCard[] = [
  witchTrainee,
  thug,
  kobarTrainee,
  borahTrainee,
  radja,
  daisy,
  boarWitch,
  boarBerserker
];

export const fireActionCards: ActionCard[] = [
  afterBurn,
  burnBall,
  fallingFireball
];

export const allFireCards = [...fireAvatarCards, ...fireActionCards];