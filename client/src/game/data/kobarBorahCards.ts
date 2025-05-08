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

// KOBAR-BORAH TRIBE CARDS

// Level 1 Avatar Cards
export const kobarTraineeA: AvatarCard = {
  id: 'kobar-001',
  name: 'Kobar Trainee A',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 6,
  art: '/textures/cards/kobar-trainee-a.png',
  skill1: {
    name: 'Dagger Play',
    energyCost: createEnergyCost(1),
    damage: 1,
    effect: 'Target opponent gets 1 Bleed Counter.'
  }
};

export const kobarTraineeB: AvatarCard = {
  id: 'kobar-002',
  name: 'Kobar Trainee B',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 7,
  art: '/textures/cards/kobar-trainee-b.png',
  skill1: {
    name: 'Fire Blade',
    energyCost: createEnergyCost(1),
    damage: 2,
    effect: 'Basic attack damage.'
  }
};

export const kobarTraineeC: AvatarCard = {
  id: 'kobar-003',
  name: 'Kobar Trainee C',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 5,
  art: '/textures/cards/kobar-trainee-c.png',
  skill1: {
    name: 'Flame Strike',
    energyCost: createEnergyCost(2),
    damage: 3,
    effect: 'Deals +1 damage to air avatars.'
  }
};

export const borahTrainee: AvatarCard = {
  id: 'borah-001',
  name: 'Borah Trainee C',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 6,
  art: '/textures/cards/borah-trainee.png',
  skill1: {
    name: 'Explosion',
    energyCost: createEnergyCost(2),
    damage: 2,
    effect: 'If the defending avatar has Bleed counter, this attack gets +1 damage.'
  }
};

export const borahTraineeA: AvatarCard = {
  id: 'borah-002',
  name: 'Borah Trainee A',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 6,
  art: '/textures/cards/borah-trainee-a.png',
  skill1: {
    name: 'Punch',
    energyCost: createEnergyCost(1),
    damage: 1,
    effect: 'Basic attack damage.'
  }
};

export const borahTraineeB: AvatarCard = {
  id: 'borah-003',
  name: 'Borah Trainee B',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 5,
  art: '/textures/cards/borah-trainee-b.png',
  skill1: {
    name: 'Slash',
    energyCost: createEnergyCost(1, 1),
    damage: 2,
    effect: ''
  }
};

// Level 2 Avatar Cards
export const radja: AvatarCard = {
  id: 'kobar-101',
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
    energyCost: createEnergyCost(1, 1),
    damage: 3,
    effect: 'If you have 1 card or less card in hand, this attack gets +1'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: createEnergyCost(2, 2),
    damage: 6,
    effect: 'This attack does 2 more damage if opponent Active Avatar is Air type.'
  }
};

export const daisy: AvatarCard = {
  id: 'borah-101',
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
    energyCost: createEnergyCost(1, 1),
    damage: 4,
    effect: 'If you have 1 card or less card in hand, this attack gets +1'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: createEnergyCost(2, 2),
    damage: 7,
    effect: 'This attack does 3 more damage if opponent Active Avatar is Air type.'
  }
};

// Spell Cards
export const afterBurn: ActionCard = {
  id: 'spell-kb-001',
  name: 'After Burn',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/textures/cards/after-burn.png',
  description: 'Add 2 damage to an Avatar that took damage this turn.'
};

export const burnBall: ActionCard = {
  id: 'spell-kb-002',
  name: 'Burn Ball',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(1, 1),
  art: '/textures/cards/burn-ball.png',
  description: 'Direct 2 damage to opponent\'s active Avatar'
};

export const fallingFireball: ActionCard = {
  id: 'spell-kb-003',
  name: 'Falling Fireball',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(3, 1),
  art: '/textures/cards/falling-fireball.png',
  description: 'Deals 2 damage to all opponent Active and Reserve Avatars.'
};

export const doubleBomb: ActionCard = {
  id: 'spell-kb-004',
  name: 'Double Bomb',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(3),
  art: '/textures/cards/double-bomb.png',
  description: 'Deals 4 damage to opponent\'s active Avatar.'
};

export const burningArmor: ActionCard = {
  id: 'spell-kb-005',
  name: 'Burning Armor',
  type: 'ritualArmor',
  element: 'fire',
  energyCost: createEnergyCost(2, 1),
  art: '/textures/cards/burning-armor.png',
  description: 'Add 2 shield counters to your active avatar and deal 1 damage to opponent\'s active avatar.'
};

export const crackingSword: ActionCard = {
  id: 'equipment-kb-001',
  name: 'Cracking Sword',
  type: 'equipment',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/textures/cards/cracking-sword.png',
  description: 'Equipped Kobar avatar deals +2 damage with attacks.'
};

// All Kobar-Borah Cards Arrays
export const kobarBorahAvatarCards: AvatarCard[] = [
  kobarTraineeA,
  kobarTraineeB,
  kobarTraineeC,
  borahTrainee,
  borahTraineeA,
  borahTraineeB,
  radja,
  daisy
];

export const kobarBorahActionCards: ActionCard[] = [
  afterBurn,
  burnBall,
  fallingFireball,
  doubleBomb,
  burningArmor,
  crackingSword
];

export const allKobarBorahCards = [...kobarBorahAvatarCards, ...kobarBorahActionCards];