// Define the types for the card game

export type ElementType = 'fire' | 'water' | 'ground' | 'air' | 'neutral';
export type SubType = 'kobar' | 'borah' | 'kuhaka' | 'kujana' | 'kuku';
export type ActionSubType = 'equipment' | 'healing' | 'damage' | 'draw' | 'search';
export type CardCategory = 'avatar' | 'spell' | 'quickSpell' | 'ritualArmor' | 'field' | 'equipment' | 'item';
export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

// Card interfaces
export interface Skill {
  name: string;
  energyCost: ElementType[];  // Array of elements needed
  damage: number;
  effect?: string;
  additionalEffect?: string; // Additional effect for more complex skills
}

export interface Counter {
  damage: number;
  bleed: number;
  burn: number;
  freeze: number;
  poison: number;
  stun: number;
  shield: number | 0;
  [key: string]: number;
}

// Base Card interface
export interface BaseCard {
  id: string;
  name: string;
  type: CardCategory;
  element: ElementType;
  rarity?: RarityType; // Card rarity for booster pack systems
  expansion?: string; // Expansion set identifier
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
  attachedEquipment?: BaseCard[]; // Equipment cards attached to this avatar
}

// Field Card interface - has passive effects like avatars
export interface FieldCard extends BaseCard {
  type: 'field';
  passiveEffect: string;
  affect1?: string; // First affect bar
  affect2?: string; // Second affect bar
  affect3?: string; // Third affect bar
  duration?: number; // How many turns the field stays active
}

// Action Card interface
export interface ActionCard extends BaseCard {
  type: 'spell' | 'quickSpell' | 'ritualArmor' | 'equipment' | 'item';
  subType?: ActionSubType;
}

export type Card = AvatarCard | ActionCard | FieldCard;

// Game phase type
export type GamePhase = 'setup' | 'refresh' | 'draw' | 'main1' | 'battle' | 'damage' | 'main2' | 'recheck' | 'end';

// Player type
export type Player = 'player' | 'opponent';