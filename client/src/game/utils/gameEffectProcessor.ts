import { AvatarCard, Card } from '../data/cardTypes';
import { toast } from 'sonner';
import { createConditionalDamageProcessor } from './conditionalDamageProcessor';

// Interface for effect processing results
export interface EffectResult {
  success: boolean;
  message: string;
  targetAvatar?: AvatarCard;
  sourceAvatar?: AvatarCard;
  damage?: number;
  healing?: number;
  cardsDraw?: number;
  energyGain?: number;
}

// Enhanced damage calculation with conditional modifiers
export function calculateEnhancedDamage(
  attackingCard: AvatarCard,
  skill: any,
  baseDamage: number,
  gameState: any
): number {
  // Create mock game state structure for conditional damage processor
  const mockGameState = {
    currentTurn: gameState.turn || 1,
    phase: 'battle' as const,
    players: [
      {
        id: 'player',
        name: 'Player',
        health: gameState.playerHealth || 20,
        maxHealth: 20,
        energy: gameState.playerEnergy || { fire: 0, water: 0, ground: 0, air: 0, neutral: 0 },
        hand: gameState.playerHand || [],
        deck: gameState.playerDeck || [],
        discardPile: gameState.playerGraveyard || [],
        field: gameState.playerFieldCards || [],
        activeAvatar: gameState.playerActiveAvatar,
        counters: gameState.playerActiveAvatar?.counters || {},
        discardedThisTurn: [],
        isActivePlayer: true
      },
      {
        id: 'opponent',
        name: 'Opponent',
        health: gameState.opponentHealth || 20,
        maxHealth: 20,
        energy: gameState.opponentEnergy || { fire: 0, water: 0, ground: 0, air: 0, neutral: 0 },
        hand: gameState.opponentHand || [],
        deck: gameState.opponentDeck || [],
        discardPile: gameState.opponentGraveyard || [],
        field: gameState.opponentFieldCards || [],
        activeAvatar: gameState.opponentActiveAvatar,
        counters: gameState.opponentActiveAvatar?.counters || {},
        discardedThisTurn: [],
        isActivePlayer: false
      }
    ] as const,
    currentPlayerIndex: 0 as const,
    winner: null,
    turnTimer: 30,
    lastAction: '',
    battleLog: [],
    effectStack: []
  };

  try {
    const processor = createConditionalDamageProcessor(mockGameState);
    return processor.calculateConditionalDamage(
      attackingCard,
      skill,
      baseDamage,
      mockGameState.players[0],
      mockGameState.players[1]
    );
  } catch (error) {
    console.error('Error calculating conditional damage:', error);
    return baseDamage; // Fallback to base damage
  }
}

// Process different effect types based on the effect string
export function processGameEffect(
  effectType: string,
  sourceAvatar: AvatarCard,
  targetAvatar: AvatarCard | null,
  damage: number,
  gameState: any,
  updateGameState: (update: any) => void
): EffectResult {
  
  const result: EffectResult = {
    success: false,
    message: 'Effect not processed'
  };

  switch (effectType) {
    case 'basic_damage':
      return processBasicDamage(sourceAvatar, targetAvatar, damage, updateGameState);
    
    case 'buff':
      return processBuff(sourceAvatar, updateGameState);
    
    case 'debuff':
      return processDebuff(targetAvatar, updateGameState);
    
    case 'increase_damage':
      return processIncreaseDamage(sourceAvatar, damage, updateGameState);
    
    case 'heal':
      return processHeal(sourceAvatar, damage, updateGameState);
    
    case 'shield':
      return processShield(sourceAvatar, damage, updateGameState);
    
    case 'draw_card':
      return processDrawCard(gameState, updateGameState);
    
    case 'energy_gain':
      return processEnergyGain(gameState, updateGameState);
    
    case 'counter_attack':
      return processCounterAttack(sourceAvatar, targetAvatar, damage, updateGameState);
    
    case 'bleed':
      return processBleed(targetAvatar, damage, updateGameState);
    
    default:
      result.message = `Unknown effect type: ${effectType}`;
      return result;
  }
}

// Basic damage effect with conditional damage calculation
function processBasicDamage(
  sourceAvatar: AvatarCard,
  targetAvatar: AvatarCard | null,
  damage: number,
  updateGameState: (update: any) => void,
  gameState?: any,
  skill?: any
): EffectResult {
  if (!targetAvatar) {
    return {
      success: false,
      message: 'No target available for damage'
    };
  }

  // Calculate enhanced damage with conditional modifiers
  let enhancedDamage = damage;
  if (gameState && skill) {
    enhancedDamage = calculateEnhancedDamage(sourceAvatar, skill, damage, gameState);
    
    if (enhancedDamage !== damage) {
      console.log(`Conditional damage applied: ${damage} → ${enhancedDamage}`);
    }
  }

  // Calculate final damage after shield
  const shieldAmount = targetAvatar.counters?.shield || 0;
  const damageAfterShield = Math.max(0, enhancedDamage - shieldAmount);
  const shieldUsed = Math.min(enhancedDamage, shieldAmount);

  // Apply damage and reduce shield
  const newDamageCounters = (targetAvatar.counters?.damage || 0) + damageAfterShield;
  const newShieldCounters = Math.max(0, shieldAmount - shieldUsed);

  updateGameState({
    opponent: {
      activeAvatar: {
        ...targetAvatar,
        counters: {
          ...targetAvatar.counters,
          damage: newDamageCounters,
          shield: newShieldCounters
        }
      }
    }
  });

  return {
    success: true,
    message: `Dealt ${damageAfterShield} damage${shieldUsed > 0 ? ` (${shieldUsed} blocked by shield)` : ''}`,
    damage: damageAfterShield,
    targetAvatar
  };
}

// Buff effect - increases avatar's stats temporarily
function processBuff(
  sourceAvatar: AvatarCard,
  updateGameState: (update: any) => void
): EffectResult {
  // Implement buff by adding temporary damage boost
  const buffAmount = 2;
  
  updateGameState({
    player: {
      activeAvatar: {
        ...sourceAvatar,
        skill1: {
          ...sourceAvatar.skill1,
          damage: sourceAvatar.skill1.damage + buffAmount
        }
      }
    }
  });

  return {
    success: true,
    message: `Avatar buffed! +${buffAmount} damage to next attack`,
    sourceAvatar
  };
}

// Debuff effect - reduces target's effectiveness
function processDebuff(
  targetAvatar: AvatarCard | null,
  updateGameState: (update: any) => void
): EffectResult {
  if (!targetAvatar) {
    return {
      success: false,
      message: 'No target available for debuff'
    };
  }

  // Reduce target's damage by applying a debuff counter
  const debuffAmount = 1;
  
  updateGameState({
    opponent: {
      activeAvatar: {
        ...targetAvatar,
        skill1: {
          ...targetAvatar.skill1,
          damage: Math.max(0, targetAvatar.skill1.damage - debuffAmount)
        }
      }
    }
  });

  return {
    success: true,
    message: `Target debuffed! -${debuffAmount} damage to their attacks`,
    targetAvatar
  };
}

// Increase damage effect - boosts current attack damage
function processIncreaseDamage(
  sourceAvatar: AvatarCard,
  bonusDamage: number,
  updateGameState: (update: any) => void
): EffectResult {
  return {
    success: true,
    message: `Damage increased by ${bonusDamage}!`,
    damage: bonusDamage
  };
}

// Heal effect - restores health by reducing damage counters
function processHeal(
  sourceAvatar: AvatarCard,
  healAmount: number,
  updateGameState: (update: any) => void
): EffectResult {
  const currentDamage = sourceAvatar.counters?.damage || 0;
  const actualHealing = Math.min(healAmount, currentDamage);
  const newDamage = currentDamage - actualHealing;

  updateGameState({
    player: {
      activeAvatar: {
        ...sourceAvatar,
        counters: {
          ...sourceAvatar.counters,
          damage: newDamage
        }
      }
    }
  });

  return {
    success: true,
    message: `Healed for ${actualHealing} points`,
    healing: actualHealing,
    sourceAvatar
  };
}

// Shield effect - adds shield counters for damage reduction
function processShield(
  sourceAvatar: AvatarCard,
  shieldAmount: number,
  updateGameState: (update: any) => void
): EffectResult {
  const currentShield = sourceAvatar.counters?.shield || 0;
  const newShield = currentShield + shieldAmount;

  updateGameState({
    player: {
      activeAvatar: {
        ...sourceAvatar,
        counters: {
          ...sourceAvatar.counters,
          shield: newShield
        }
      }
    }
  });

  return {
    success: true,
    message: `Added ${shieldAmount} shield counters`,
    sourceAvatar
  };
}

// Draw card effect - adds cards to hand
function processDrawCard(
  gameState: any,
  updateGameState: (update: any) => void
): EffectResult {
  const cardsToDrawNum = 1;
  
  // Simulate drawing cards by increasing hand size
  updateGameState({
    player: {
      hand: [...(gameState.player?.hand || []), { type: 'drawn_card', id: Date.now() }]
    }
  });

  return {
    success: true,
    message: `Drew ${cardsToDrawNum} card`,
    cardsDraw: cardsToDrawNum
  };
}

// Energy gain effect - adds energy to energy pile
function processEnergyGain(
  gameState: any,
  updateGameState: (update: any) => void
): EffectResult {
  const energyAmount = 1;
  
  // Add energy to player's energy pile
  updateGameState({
    player: {
      energyPile: [...(gameState.player?.energyPile || []), { type: 'energy', element: 'neutral', id: Date.now() }]
    }
  });

  return {
    success: true,
    message: `Gained ${energyAmount} energy`,
    energyGain: energyAmount
  };
}

// Counter attack effect - deals damage back to attacker
function processCounterAttack(
  sourceAvatar: AvatarCard,
  targetAvatar: AvatarCard | null,
  damage: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (!targetAvatar) {
    return {
      success: false,
      message: 'No target for counter attack'
    };
  }

  const counterDamage = Math.floor(damage / 2);
  
  // Deal counter damage to the original attacker
  const newDamage = (targetAvatar.counters?.damage || 0) + counterDamage;
  
  updateGameState({
    opponent: {
      activeAvatar: {
        ...targetAvatar,
        counters: {
          ...targetAvatar.counters,
          damage: newDamage
        }
      }
    }
  });

  return {
    success: true,
    message: `Counter attack deals ${counterDamage} damage back!`,
    damage: counterDamage,
    targetAvatar
  };
}

// Bleed effect - applies bleed counters for ongoing damage
function processBleed(
  targetAvatar: AvatarCard | null,
  bleedAmount: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (!targetAvatar) {
    return {
      success: false,
      message: 'No target for bleed effect'
    };
  }

  const currentBleed = targetAvatar.counters?.bleed || 0;
  const newBleed = currentBleed + bleedAmount;

  updateGameState({
    opponent: {
      activeAvatar: {
        ...targetAvatar,
        counters: {
          ...targetAvatar.counters,
          bleed: newBleed
        }
      }
    }
  });

  return {
    success: true,
    message: `Applied ${bleedAmount} bleed counters`,
    targetAvatar
  };
}

// Process bleed damage at start of turn
export function processBleedDamage(
  avatar: AvatarCard,
  updateGameState: (update: any) => void,
  player: 'player' | 'opponent'
): void {
  const bleedCounters = avatar.counters?.bleed || 0;
  
  if (bleedCounters > 0) {
    // Apply bleed damage
    const currentDamage = avatar.counters?.damage || 0;
    const newDamage = currentDamage + bleedCounters;
    
    // Reduce bleed counters by 1 each turn
    const newBleed = Math.max(0, bleedCounters - 1);
    
    updateGameState({
      [player]: {
        activeAvatar: {
          ...avatar,
          counters: {
            ...avatar.counters,
            damage: newDamage,
            bleed: newBleed
          }
        }
      }
    });
    
    toast.error(`${avatar.name} takes ${bleedCounters} bleed damage!`);
  }
}