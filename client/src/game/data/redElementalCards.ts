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

// Parse energy cost string like "fire,fire,neutral"
const parseEnergyCost = (costString?: string): ElementType[] => {
  if (!costString) return [];
  return costString.split(',').map(s => s.trim() as ElementType);
};

// RED ELEMENTAL CARDS FROM UPDATED CSV

// Level 1 Avatar Cards
export const borahTraineeA: AvatarCard = {
  id: 'borah-001',
  name: 'Borah Trainee A',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 6,
  art: '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee A.png',
  skill1: {
    name: 'Punch',
    energyCost: parseEnergyCost('fire'),
    damage: 1,
    effect: 'Basic attack'
  }
};

export const borahTraineeB: AvatarCard = {
  id: 'borah-002',
  name: 'Borah Trainee B',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 5,
  art: '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee B.png',
  skill1: {
    name: 'Slash',
    energyCost: parseEnergyCost('fire,neutral'),
    damage: 2,
    effect: 'Basic attack'
  }
};

export const borahTraineeC: AvatarCard = {
  id: 'borah-003',
  name: 'Borah Trainee C',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 4,
  art: '/attached_assets/Red Elemental Avatar_Ava - Borah Trainee C.png',
  skill1: {
    name: 'Explosion',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 1,
    effect: 'If opponent Active Avatar has Bleed Counter, this Skill1 Damage become 3'
  }
};

export const kobarTraineeA: AvatarCard = {
  id: 'kobar-001',
  name: 'Kobar Trainee A',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 7,
  art: '/attached_assets/Red Elemental Avatar_Ava - Kobar Trainee A.png',
  skill1: {
    name: 'Punch',
    energyCost: parseEnergyCost('fire'),
    damage: 1,
    effect: 'Basic attack'
  }
};

export const kobarTraineeB: AvatarCard = {
  id: 'kobar-002',
  name: 'Kobar Trainee B',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 8,
  art: '/attached_assets/Red Elemental Avatar_Ava - Kobar Trainee B.png',
  skill1: {
    name: 'Kick',
    energyCost: parseEnergyCost('fire,neutral'),
    damage: 2,
    effect: 'Basic attack'
  }
};

export const kobarTraineeC: AvatarCard = {
  id: 'kobar-003',
  name: 'Kobar Trainee C',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 6,
  art: '/attached_assets/Red Elemental Avatar_Ava - Kobar Trainee C.png',
  skill1: {
    name: 'Dagger Play',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 0,
    effect: 'Put 2 Bleed Counter on opponent Active Avatar'
  }
};

export const repoGirl: AvatarCard = {
  id: 'kujana-001',
  name: 'Repo Girl',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kujana',
  health: 6,
  art: '/attached_assets/Red Elemental Avatar_Ava - Repo Girl.png',
  skill1: {
    name: 'Kick',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 2,
    effect: 'Basic attack'
  }
};

export const shamanKuhaka: AvatarCard = {
  id: 'kuhaka-001',
  name: 'Shaman',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kuhaka',
  health: 6,
  art: '/attached_assets/Red Elemental Avatar_Ava - Shaman A.png',
  skill1: {
    name: 'Burn Spell',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 0,
    effect: 'Put 2 bleed counter into opponent Active Avatar'
  }
};

export const shamanKujana: AvatarCard = {
  id: 'kujana-002',
  name: 'Shaman',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kujana',
  health: 6,
  art: '/attached_assets/Red Elemental Avatar_Ava - Shaman B.png',
  skill1: {
    name: 'Direct Spell',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 0,
    effect: 'Put 1 damage into Opponent Target Avatar'
  }
};

export const thug: AvatarCard = {
  id: 'kuhaka-002',
  name: 'Thug',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kuhaka',
  health: 7,
  art: '/attached_assets/Red Elemental Avatar_Ava - Thug A.png',
  skill1: {
    name: 'Punch',
    energyCost: parseEnergyCost('fire'),
    damage: 1,
    effect: 'Basic attack'
  }
};

export const witchTrainee: AvatarCard = {
  id: 'kujana-003',
  name: 'Witch Trainee',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kujana',
  health: 7,
  art: '/attached_assets/Red Elemental Avatar_Ava - Witch Trainee.png',
  skill1: {
    name: 'Unholy Bleed',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 1,
    effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters'
  }
};

// Level 2 Avatar Cards
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
    energyCost: parseEnergyCost('fire,neutral'),
    damage: 1,
    effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters'
  },
  skill2: {
    name: 'Blood Abssorbtion',
    energyCost: parseEnergyCost('fire,fire,neutral,neutral'),
    damage: 9,
    effect: 'If opponent Active Avatar has Bleed Counter, heal 2 damage to one of your Reserve Avatar.'
  }
};

export const banaspatiFemale: AvatarCard = {
  id: 'kujana-101',
  name: 'Banaspati Female',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kujana',
  baseType: 'kujana',
  health: 12,
  art: '/attached_assets/Red Elemental Avatar_Ava - Banaspati Fem.png',
  skill1: {
    name: 'Pyro Punch',
    energyCost: parseEnergyCost('fire,neutral'),
    damage: 3,
    effect: 'If opponent Active Avatar has Bleed Counter, this Skill1 Damage become 4'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: parseEnergyCost('fire,fire,neutral,neutral'),
    damage: 9,
    effect: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 11'
  }
};

export const boarBerserker: AvatarCard = {
  id: 'kuhaka-102',
  name: 'Boar Berserker',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kuhaka',
  baseType: 'kuhaka',
  health: 8,
  art: '/attached_assets/Red Elemental Avatar_Ava - Boar Berserker.png',
  skill1: {
    name: 'Fire Slash',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 3,
    effect: 'If opponent Active Avatar is wind Element Avatar, this Skill1 Damage become 5'
  },
  skill2: {
    name: 'Burn and Slam',
    energyCost: parseEnergyCost('fire,neutral,neutral,neutral,neutral'),
    damage: 12,
    effect: 'Player may discard a energy card from energy pile or used energy pile. If the player does that, this Skill2Damage become 23'
  }
};

export const boarWitch: AvatarCard = {
  id: 'kujana-102',
  name: 'Boar Witch',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kujana',
  baseType: 'kujana',
  health: 12,
  art: '/attached_assets/Red Elemental Avatar_Ava - Boar Witch.png',
  skill1: {
    name: '',
    energyCost: [],
    damage: 0,
    effect: ''
  },
  skill2: {
    name: 'Heal Aura',
    energyCost: parseEnergyCost('fire,fire,neutral,neutral'),
    damage: 7,
    effect: 'After attack, heal 2 damage from this Avatar'
  }
};

export const crimson: AvatarCard = {
  id: 'kobar-101',
  name: 'Crimson',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kobar',
  baseType: 'kobar',
  health: 14,
  art: '/attached_assets/Red Elemental Avatar_Ava - Crimson.png',
  skill1: {
    name: 'Ignite',
    energyCost: parseEnergyCost('fire,fire'),
    damage: 0,
    effect: 'Put 2 bleed counter into opponent Active Avatar'
  },
  skill2: {
    name: 'Inferno Burn',
    energyCost: parseEnergyCost('fire,fire,fire,fire'),
    damage: 9,
    effect: 'Player may discard a energy card from energy pile or used energy pile. If the player does that, this Skill2Damage become 19'
  }
};

export const scarlet: AvatarCard = {
  id: 'borah-101',
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
    energyCost: parseEnergyCost('fire,fire'),
    damage: 2,
    effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters'
  },
  skill2: {
    name: 'Inferno Burn',
    energyCost: parseEnergyCost('fire,fire,fire,fire'),
    damage: 9,
    effect: 'Player may discard a energy card from energy pile or used energy pile. If the player does that, this Skill2Damage become 19'
  }
};

export const daisy: AvatarCard = {
  id: 'borah-102',
  name: 'Daisy',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'borah',
  baseType: 'borah',
  health: 15,
  art: '/attached_assets/Red Elemental Avatar_Ava - Daisy.png',
  skill1: {
    name: 'Pyro Kick',
    energyCost: parseEnergyCost('fire,neutral'),
    damage: 5,
    effect: 'If you has 1 or less card in hand, this Skill1Damage become 6'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: parseEnergyCost('fire,fire,neutral,neutral'),
    damage: 10,
    effect: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 13'
  }
};

export const radja: AvatarCard = {
  id: 'kobar-102',
  name: 'Radja',
  type: 'avatar',
  element: 'fire',
  level: 2,
  subType: 'kobar',
  baseType: 'kobar',
  health: 16,
  art: '/attached_assets/Red Elemental Avatar_Ava - Radja.png',
  skill1: {
    name: 'Pyro Punch',
    energyCost: parseEnergyCost('fire,neutral'),
    damage: 4,
    effect: 'If you has 1 or less card in hand, this Skill1Damage become 5'
  },
  skill2: {
    name: 'Burning Body',
    energyCost: parseEnergyCost('fire,fire,neutral,neutral'),
    damage: 10,
    effect: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 111'
  }
};

// Spell Cards
export const afterBurn: ActionCard = {
  id: 'spell-fire-001',
  name: 'After Burn',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/attached_assets/Red Elemental Spell_2 - After Burn.png',
  description: 'Add 2 damage to an Avatar that took damage this turn.'
};

export const burnBall: ActionCard = {
  id: 'spell-fire-002',
  name: 'Burn Ball',
  type: 'quickSpell',
  element: 'fire',
  energyCost: createEnergyCost(1, 1),
  art: '/attached_assets/Red Elemental Spell_2 - Burn Ball.png',
  description: 'Direct 2 damage to opponent\'s active Avatar'
};

export const fallingFireball: ActionCard = {
  id: 'spell-fire-003',
  name: 'Falling Fireball',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(3, 1),
  art: '/attached_assets/Red Elemental Spell_4 - Falling Fireballs.png',
  description: 'Deals 2 damage to all opponent Active and Reserve Avatars.'
};

export const doubleBomb: ActionCard = {
  id: 'spell-fire-004',
  name: 'Double Bomb',
  type: 'spell',
  element: 'fire',
  energyCost: createEnergyCost(3),
  art: '/attached_assets/Red Elemental Spell_4 - Double Bomb.png',
  description: 'Deals 4 damage to opponent\'s active Avatar.'
};

export const burningArmor: ActionCard = {
  id: 'spell-fire-005',
  name: 'Burning Armor',
  type: 'ritualArmor',
  element: 'fire',
  energyCost: createEnergyCost(2, 1),
  art: '/attached_assets/Red Elemental Spell_4 - Burning Armor.png',
  description: 'Add 2 shield counters to your active avatar and deal 1 damage to opponent\'s active avatar.'
};

export const crackingSword: ActionCard = {
  id: 'equipment-fire-001',
  name: 'Cracking Sword',
  type: 'equipment',
  element: 'fire',
  energyCost: createEnergyCost(2),
  art: '/attached_assets/Red Elemental Spell_1 - Cracking Sword.png',
  description: 'Equipped Kobar avatar deals +2 damage with attacks.'
};

// Card Arrays for easier access
export const redElementalLevel1AvatarCards: AvatarCard[] = [
  borahTraineeA,
  borahTraineeB,
  borahTraineeC,
  kobarTraineeA,
  kobarTraineeB,
  kobarTraineeC,
  repoGirl,
  shamanKuhaka,
  shamanKujana,
  thug,
  witchTrainee
];

export const redElementalLevel2AvatarCards: AvatarCard[] = [
  banaspati,
  banaspatiFemale,
  boarBerserker,
  boarWitch,
  crimson,
  scarlet,
  daisy,
  radja
];

export const redElementalSpellCards: ActionCard[] = [
  afterBurn,
  burnBall,
  fallingFireball,
  doubleBomb,
  burningArmor,
  crackingSword
];

// All cards
export const redElementalCards = [
  ...redElementalLevel1AvatarCards,
  ...redElementalLevel2AvatarCards,
  ...redElementalSpellCards
];