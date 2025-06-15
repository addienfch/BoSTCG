import { AvatarCard, BaseCard, ElementType } from '../data/cardTypes';

export interface Counter {
  bleed?: number;
  burn?: number;
  freeze?: number;
  poison?: number;
  stun?: number;
  shield?: number;
  [key: string]: number | undefined;
}

export interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  energy: {
    fire: number;
    water: number;
    ground: number;
    air: number;
    neutral: number;
  };
  hand: BaseCard[];
  deck: BaseCard[];
  discardPile: BaseCard[];
  field: BaseCard[];
  activeAvatar: AvatarCard | null;
  counters: Counter;
  discardedThisTurn: Card[];
  isActivePlayer: boolean;
}

export interface GameState {
  currentTurn: number;
  phase: 'setup' | 'main' | 'battle' | 'end' | 'game_over';
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
  winner: string | null;
  turnTimer: number;
  lastAction: string;
  battleLog: string[];
  effectStack: GameEffect[];
}

export interface GameEffect {
  id: string;
  sourceCard: Card;
  targetCard?: Card;
  targetPlayer?: Player;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'counter' | 'energy' | 'draw';
  value: number;
  duration?: number;
  conditions?: EffectCondition[];
}

export interface EffectCondition {
  type: 'card_type' | 'element' | 'counter_present' | 'health_threshold' | 'turn_number';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface BattleResult {
  damage: number;
  effects: GameEffect[];
  countersApplied: Counter;
  cardStates: {
    [cardId: string]: {
      health: number;
      counters: Counter;
      attachedEquipment: Card[];
    };
  };
}