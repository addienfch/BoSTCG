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
  art: '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee C.png',
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
  art: '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee A.png',
  skill1: {
    name: 'Punch',
    energyCost: createEnergyCost(1),
    damage: 1,
    effect: 'Quick strike that costs minimal energy.'
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
  art: '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee B.png',
  skill1: {
    name: 'Slash',
    energyCost: createEnergyCost(1, 1),
    damage: 2,
    effect: 'A stronger attack that requires both fire and neutral energy.'
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

// New Level 2 Avatar cards from uploaded images
export const crimson: AvatarCard = {
  id: 'kobar-102',
  name: 'Crimson',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kobar',
  baseType: 'kobar',
  health: 14,
  art: '/attached_assets/Red Elemental Avatar_Ava - Crimson-02.png',
  skill1: {
    name: 'Ignite',
    energyCost: createEnergyCost(2),
    damage: 2,
    effect: 'Target opponent Active Avatar get 2 Bleed Counters.'
  },
  skill2: {
    name: 'Inferno Burn',
    energyCost: createEnergyCost(4),
    damage: 9,
    effect: 'You may discard a energy card from energy pile. If you do this attack get +10 damage.'
  }
};

export const scarlet: AvatarCard = {
  id: 'borah-102',
  name: 'Scarlet',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'borah',
  baseType: 'borah',
  health: 13,
  art: '/attached_assets/Red Elemental Avatar_Ava - Scarlet.png',
  skill1: {
    name: 'Flame Arrow',
    energyCost: createEnergyCost(2),
    damage: 2,
    effect: 'Flip a coin. If head, opponent get 2 Bleed Counter'
  },
  skill2: {
    name: 'Inferno Burn',
    energyCost: createEnergyCost(4),
    damage: 9,
    effect: 'You may discard an energy card from energy pile. If you do, this attack get +10 damage.'
  }
};

export const banaspati: AvatarCard = {
  id: 'kuhaka-101',
  name: 'Banaspati',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kuhaka',
  baseType: 'kuhaka',
  health: 13,
  art: '/attached_assets/Red Elemental Avatar_Ava - Banaspati.png',
  skill1: {
    name: 'Burning Dagger',
    energyCost: createEnergyCost(1, 1),
    damage: 1,
    effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters.'
  },
  skill2: {
    name: 'Blood Absorption',
    energyCost: createEnergyCost(2, 2),
    damage: 9,
    effect: 'If opponent active Avatar had Bleed Counter, heal 2 damage to one of your reserve Avatar.'
  }
};

export const banaspatiFem: AvatarCard = {
  id: 'kujana-101',
  name: 'Banaspati Fem',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kujana',
  baseType: 'kujana',
  health: 12,
  art: '/attached_assets/Red Elemental Avatar_Ava - Banaspati Fem.png',
  skill1: {
    name: 'Pyro Punch',
    energyCost: createEnergyCost(1, 1),
    damage: 3,
    effect: 'If opponent Active Avatar has Bleed Counter, this attack does +1 more damage.'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: createEnergyCost(2, 2),
    damage: 9,
    effect: 'This attack does 2 more damage if opponent were Air type.'
  }
};

// Spell Cards
export const afterBurn: ActionCard = {
  id: 'spell-kb-001',
  name: 'After Burn',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/attached_assets/Red Elemental Spell_2 - After Burn.png',
  description: 'Add 2 damage to an Avatar that took damage this turn.'
};

export const burnBall: ActionCard = {
  id: 'spell-kb-002',
  name: 'Burn Ball',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(1, 1),
  art: '/attached_assets/Red Elemental Spell_2 - Burn Ball.png',
  description: 'Direct 2 damage to opponent\'s active Avatar'
};

export const fallingFireball: ActionCard = {
  id: 'spell-kb-003',
  name: 'Falling Fireball',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(3, 1),
  art: '/attached_assets/Red Elemental Spell_4 - Falling Fireballs.png',
  description: 'Deals 2 damage to all opponent Active and Reserve Avatars.'
};

export const doubleBomb: ActionCard = {
  id: 'spell-kb-004',
  name: 'Double Bomb',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(3),
  art: '/attached_assets/Red Elemental Spell_4 - Double Bomb.png',
  description: 'Deals 4 damage to opponent\'s active Avatar.'
};

export const burningArmor: ActionCard = {
  id: 'spell-kb-005',
  name: 'Burning Armor',
  type: 'ritualArmor',
  element: 'fire',
  energyCost: createEnergyCost(2, 1),
  art: '/attached_assets/Red Elemental Spell_4 - Burning Armor.png',
  description: 'Add 2 shield counters to your active avatar and deal 1 damage to opponent\'s active avatar.'
};

export const crackingSword: ActionCard = {
  id: 'equipment-kb-001',
  name: 'Cracking Sword',
  type: 'equipment',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/attached_assets/Red Elemental Spell_1 - Cracking Sword.png',
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
  daisy,
  crimson,
  scarlet
];

// Kujana-Kuhaka Avatar Cards (could be moved to a separate file later)
export const kujanaKuhakaAvatarCards: AvatarCard[] = [
  banaspati,
  banaspatiFem
];

export const kobarBorahActionCards: ActionCard[] = [
  afterBurn,
  burnBall,
  fallingFireball,
  doubleBomb,
  burningArmor,
  crackingSword
];

// Combined card collections
export const allKobarBorahCards = [...kobarBorahAvatarCards, ...kobarBorahActionCards];
export const allKujanaKuhakaCards = [...kujanaKuhakaAvatarCards];
export const allFireCards = [...kobarBorahAvatarCards, ...kujanaKuhakaAvatarCards, ...kobarBorahActionCards];