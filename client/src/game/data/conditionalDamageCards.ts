import { AvatarCard, ElementType } from './cardTypes';

// Example cards demonstrating conditional damage mechanics
export const discardTriggerAvatar: AvatarCard = {
  id: 'conditional-001',
  name: 'Vengeful Disciple',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'kobar',
  health: 8,
  art: '/textures/cards/vengeful-disciple.png',
  skill1: {
    name: 'Sacrificial Strike',
    energyCost: ['fire', 'neutral'],
    damage: 2,
    effect: 'If the player discard a card, then this attack damage become 6'
  },
  skill2: {
    name: 'Fury Punch',
    energyCost: ['fire', 'fire'],
    damage: 3,
    effect: 'Basic attack with no conditions'
  }
};

export const counterBasedAvatar: AvatarCard = {
  id: 'conditional-002',
  name: 'Poison Hunter',
  type: 'avatar',
  element: 'ground',
  level: 1,
  subType: 'borah',
  health: 6,
  art: '/textures/cards/poison-hunter.png',
  skill1: {
    name: 'Toxic Spear',
    energyCost: ['ground', 'neutral'],
    damage: 1,
    effect: 'If the opponent active avatar has -bleed counter- this attack damage become 8'
  },
  skill2: {
    name: 'Venomous Bite',
    energyCost: ['ground', 'ground'],
    damage: 2,
    effect: 'Apply 1 poison counter to opponent active avatar'
  }
};

export const typeBasedAvatar: AvatarCard = {
  id: 'conditional-003',
  name: 'Element Crusher',
  type: 'avatar',
  element: 'water',
  level: 2,
  subType: 'kuhaka',
  baseType: 'kuhaka',
  health: 12,
  art: '/textures/cards/element-crusher.png',
  skill1: {
    name: 'Elemental Weakness',
    energyCost: ['water', 'neutral'],
    damage: 3,
    effect: 'If the opponent active avatar has fire type this attack damage become 9'
  },
  skill2: {
    name: 'Crushing Wave',
    energyCost: ['water', 'water', 'neutral'],
    damage: 5,
    effect: 'If the opponent active avatar has kobar subtype this attack damage become 12'
  }
};

export const equipmentBasedAvatar: AvatarCard = {
  id: 'conditional-004',
  name: 'Armed Warrior',
  type: 'avatar',
  element: 'air',
  level: 1,
  subType: 'kujana',
  health: 7,
  art: '/textures/cards/armed-warrior.png',
  skill1: {
    name: 'Weapon Strike',
    energyCost: ['air', 'neutral'],
    damage: 2,
    effect: 'If this card has equipment card attached, this attack damage become 7'
  },
  skill2: {
    name: 'Wind Slash',
    energyCost: ['air', 'air'],
    damage: 4,
    effect: 'Basic wind attack'
  }
};

export const selfCounterAvatar: AvatarCard = {
  id: 'conditional-005',
  name: 'Bleeding Berserker',
  type: 'avatar',
  element: 'fire',
  level: 1,
  subType: 'borah',
  health: 9,
  art: '/textures/cards/bleeding-berserker.png',
  skill1: {
    name: 'Pain Surge',
    energyCost: ['fire', 'neutral'],
    damage: 1,
    effect: 'If this card has bleed counter, then this attack damage get +4'
  },
  skill2: {
    name: 'Self Harm',
    energyCost: ['fire'],
    damage: 0,
    effect: 'Apply 2 bleed counters to this card, then draw 1 card'
  }
};

export const passiveTypeBoostAvatar: AvatarCard = {
  id: 'conditional-006',
  name: 'Kobar Commander',
  type: 'avatar',
  element: 'neutral',
  level: 2,
  subType: 'kobar',
  baseType: 'kobar',
  health: 14,
  art: '/textures/cards/kobar-commander.png',
  skill1: {
    name: 'Leadership Aura',
    energyCost: ['neutral', 'neutral'],
    damage: 0,
    effect: 'If your active avatar has kobar type, that cards attack damage get +2'
  },
  skill2: {
    name: 'Command Strike',
    energyCost: ['neutral', 'neutral', 'neutral'],
    damage: 6,
    effect: 'Basic command attack'
  }
};

export const passiveSubtypeBoostAvatar: AvatarCard = {
  id: 'conditional-007',
  name: 'Borah Shaman',
  type: 'avatar',
  element: 'ground',
  level: 1,
  subType: 'borah',
  health: 5,
  art: '/textures/cards/borah-shaman.png',
  skill1: {
    name: 'Tribal Blessing',
    energyCost: ['ground'],
    damage: 0,
    effect: 'If your active avatar has borah subtype that cards attack damage get +3'
  },
  skill2: {
    name: 'Earth Tremor',
    energyCost: ['ground', 'ground'],
    damage: 3,
    effect: 'Basic earth attack'
  }
};

// Export all conditional damage cards
export const conditionalDamageCards: AvatarCard[] = [
  discardTriggerAvatar,
  counterBasedAvatar,
  typeBasedAvatar,
  equipmentBasedAvatar,
  selfCounterAvatar,
  passiveTypeBoostAvatar,
  passiveSubtypeBoostAvatar
];

// Utility function to get conditional damage cards by type
export const getConditionalCardsByType = (conditionType: string): AvatarCard[] => {
  return conditionalDamageCards.filter(card => {
    const skill1Effect = card.skill1.effect?.toLowerCase() || '';
    const skill2Effect = card.skill2?.effect?.toLowerCase() || '';
    
    switch (conditionType) {
      case 'discard':
        return skill1Effect.includes('discard') || skill2Effect.includes('discard');
      case 'counter':
        return skill1Effect.includes('counter') || skill2Effect.includes('counter');
      case 'type':
        return skill1Effect.includes('type') || skill2Effect.includes('type');
      case 'equipment':
        return skill1Effect.includes('equipment') || skill2Effect.includes('equipment');
      case 'passive':
        return skill1Effect.includes('attack damage get') || skill2Effect.includes('attack damage get');
      default:
        return false;
    }
  });
};