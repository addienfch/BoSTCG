// Define the types for the card game

export type ElementType = 'fire' | 'water' | 'ground' | 'air' | 'neutral';
export type SubType = 'kobar' | 'borah' | 'kuhaka' | 'kujana';
export type CardCategory = 'avatar' | 'spell' | 'quickSpell' | 'ritualArmor' | 'field' | 'equipment' | 'item';

// Card interfaces
export interface Skill {
  name: string;
  energyCost: ElementType[];  // Array of elements needed
  damage: number;
  effect?: string;
}

export interface Counter {
  damage: number;
  bleed: number;
  shield: number | 0;
}

// Base Card interface
export interface BaseCard {
  id: string;
  name: string;
  type: CardCategory;
  element: ElementType;
  description?: string;
  energyCost?: ElementType[];
  effect?: string;
  art: string;
}

// Avatar Card interface
export interface AvatarCard extends BaseCard {
  type: 'avatar';
  level: 1 | 2;
  subType: SubType;
  baseType?: string; // For Level 2 cards, shows what Level 1 card it evolves from
  health: number;
  skill1: Skill;
  skill2?: Skill;
  counters?: Counter;
  isTapped?: boolean; // If avatar has already used a skill this turn
  turnPlayed?: number; // Track which turn the avatar was played
}

// Action Card interface
export interface ActionCard extends BaseCard {
  type: 'spell' | 'quickSpell' | 'ritualArmor' | 'field' | 'equipment' | 'item';
}

export type Card = AvatarCard | ActionCard;

// Game phase type
export type GamePhase = 'refresh' | 'draw' | 'main1' | 'battle' | 'damage' | 'main2' | 'end';

// Player type
export type Player = 'player' | 'opponent';