import { AvatarCard } from './cardTypes';

// Real working examples of conditional damage cards with proper game mechanics
export const conditionalDamageExamples: AvatarCard[] = [
  {
    id: 'vengeful-striker',
    name: 'Vengeful Striker',
    type: 'avatar',
    element: 'fire',
    level: 1,
    subType: 'kobar',
    health: 7,
    art: '/textures/cards/vengeful-striker.png',
    skill1: {
      name: 'Sacrifice Strike',
      energyCost: ['fire', 'neutral'],
      damage: 2,
      effect: 'If the player discard a card, then this attack damage become 8'
    },
    skill2: {
      name: 'Burning Fist',
      energyCost: ['fire', 'fire'],
      damage: 4,
      effect: 'Deal 4 damage to opponent active avatar'
    }
  },
  {
    id: 'bleed-hunter',
    name: 'Bleed Hunter',
    type: 'avatar',
    element: 'ground',
    level: 1,
    subType: 'borah',
    health: 6,
    art: '/textures/cards/bleed-hunter.png',
    skill1: {
      name: 'Bloodseeker',
      energyCost: ['ground', 'neutral'],
      damage: 1,
      effect: 'If the opponent active avatar has bleed counter this attack damage become 9'
    },
    skill2: {
      name: 'Poison Dart',
      energyCost: ['ground'],
      damage: 2,
      effect: 'Apply 1 bleed counter to opponent active avatar'
    }
  },
  {
    id: 'type-crusher',
    name: 'Type Crusher',
    type: 'avatar',
    element: 'water',
    level: 2,
    subType: 'kuhaka',
    baseType: 'kuhaka',
    health: 11,
    art: '/textures/cards/type-crusher.png',
    skill1: {
      name: 'Elemental Advantage',
      energyCost: ['water', 'neutral'],
      damage: 3,
      effect: 'If the opponent active avatar has fire type this attack damage become 10'
    },
    skill2: {
      name: 'Tidal Wave',
      energyCost: ['water', 'water', 'neutral'],
      damage: 6,
      effect: 'Deal 6 damage to opponent active avatar'
    }
  },
  {
    id: 'equipment-warrior',
    name: 'Equipment Warrior',
    type: 'avatar',
    element: 'air',
    level: 1,
    subType: 'kujana',
    health: 8,
    art: '/textures/cards/equipment-warrior.png',
    skill1: {
      name: 'Armed Strike',
      energyCost: ['air', 'neutral'],
      damage: 2,
      effect: 'If this card has equipment card attached this attack damage become 8'
    },
    skill2: {
      name: 'Wind Blade',
      energyCost: ['air', 'air'],
      damage: 5,
      effect: 'Deal 5 damage to opponent active avatar'
    },
    attachedEquipment: []
  },
  {
    id: 'self-harm-berserker',
    name: 'Self-Harm Berserker',
    type: 'avatar',
    element: 'fire',
    level: 1,
    subType: 'borah',
    health: 10,
    art: '/textures/cards/self-harm-berserker.png',
    skill1: {
      name: 'Pain Amplifier',
      energyCost: ['fire', 'neutral'],
      damage: 2,
      effect: 'If this card has bleed counter then this attack damage get +5'
    },
    skill2: {
      name: 'Self Mutilation',
      energyCost: ['fire'],
      damage: 0,
      effect: 'Apply 2 bleed counters to this card, draw 1 card'
    },
    counters: { damage: 0, bleed: 0, shield: 0, burn: 0, freeze: 0, poison: 0, stun: 0 }
  },
  {
    id: 'kobar-commander',
    name: 'Kobar Commander',
    type: 'avatar',
    element: 'neutral',
    level: 2,
    subType: 'kobar',
    baseType: 'kobar',
    health: 13,
    art: '/textures/cards/kobar-commander.png',
    skill1: {
      name: 'Tribal Leadership',
      energyCost: ['neutral', 'neutral'],
      damage: 0,
      effect: 'If your active avatar has kobar type that cards attack damage get +3'
    },
    skill2: {
      name: 'Command Strike',
      energyCost: ['neutral', 'neutral', 'neutral'],
      damage: 7,
      effect: 'Deal 7 damage to opponent active avatar'
    }
  },
  {
    id: 'borah-shaman',
    name: 'Borah Tribal Shaman',
    type: 'avatar',
    element: 'ground',
    level: 1,
    subType: 'borah',
    health: 5,
    art: '/textures/cards/borah-shaman.png',
    skill1: {
      name: 'Ancestral Blessing',
      energyCost: ['ground'],
      damage: 0,
      effect: 'If your active avatar has borah subtype that cards attack damage get +4'
    },
    skill2: {
      name: 'Earth Strike',
      energyCost: ['ground', 'ground'],
      damage: 4,
      effect: 'Deal 4 damage to opponent active avatar'
    }
  }
];

// Test scenarios for conditional damage mechanics
export const testScenarios = [
  {
    name: 'Discard Trigger Test',
    description: 'Test damage increase when player discards cards',
    setup: {
      playerActiveAvatar: 'vengeful-striker',
      playerGraveyard: ['discarded-card-1'],
      expectedDamage: { skill1: 8, skill2: 4 }
    }
  },
  {
    name: 'Bleed Counter Test',
    description: 'Test damage against bleeding opponents',
    setup: {
      playerActiveAvatar: 'bleed-hunter',
      opponentActiveAvatar: {
        counters: { bleed: 2, damage: 0, shield: 0, burn: 0, freeze: 0, poison: 0, stun: 0 }
      },
      expectedDamage: { skill1: 9, skill2: 2 }
    }
  },
  {
    name: 'Type Advantage Test',
    description: 'Test elemental type advantage mechanics',
    setup: {
      playerActiveAvatar: 'type-crusher',
      opponentActiveAvatar: { element: 'fire', type: 'avatar' },
      expectedDamage: { skill1: 10, skill2: 6 }
    }
  },
  {
    name: 'Equipment Test',
    description: 'Test equipment attachment bonus',
    setup: {
      playerActiveAvatar: {
        ...conditionalDamageExamples[3],
        attachedEquipment: [{ id: 'sword', name: 'Iron Sword', type: 'equipment', element: 'neutral', art: '/textures/equipment/sword.png' }]
      },
      expectedDamage: { skill1: 8, skill2: 5 }
    }
  },
  {
    name: 'Self Counter Test',
    description: 'Test self-inflicted counter bonuses',
    setup: {
      playerActiveAvatar: {
        ...conditionalDamageExamples[4],
        counters: { bleed: 3, damage: 0, shield: 0, burn: 0, freeze: 0, poison: 0, stun: 0 }
      },
      expectedDamage: { skill1: 7, skill2: 0 }
    }
  },
  {
    name: 'Passive Type Boost Test',
    description: 'Test passive damage boost from avatar type',
    setup: {
      playerActiveAvatar: conditionalDamageExamples[5], // Kobar Commander
      passiveBonus: 3,
      expectedDamage: { skill1: 0, skill2: 10 } // 7 base + 3 passive
    }
  },
  {
    name: 'Passive Subtype Boost Test',
    description: 'Test passive damage boost from avatar subtype',
    setup: {
      playerActiveAvatar: conditionalDamageExamples[6], // Borah Shaman
      passiveBonus: 4,
      expectedDamage: { skill1: 0, skill2: 8 } // 4 base + 4 passive
    }
  }
];

// Get card by ID for testing
export function getCardById(id: string): AvatarCard | undefined {
  return conditionalDamageExamples.find(card => card.id === id);
}

// Create mock game state for testing
export function createTestGameState(scenario: any) {
  return {
    playerActiveAvatar: typeof scenario.playerActiveAvatar === 'string' 
      ? getCardById(scenario.playerActiveAvatar) 
      : scenario.playerActiveAvatar,
    opponentActiveAvatar: scenario.opponentActiveAvatar || null,
    playerHand: scenario.playerHand || [],
    playerGraveyard: scenario.playerGraveyard || [],
    playerFieldCards: scenario.playerFieldCards || [],
    turn: 1
  };
}