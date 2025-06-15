import { AvatarCard, Card } from '../data/cardTypes';
import { toast } from 'sonner';

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

// Basic damage effect - deals direct damage to target
function processBasicDamage(
  sourceAvatar: AvatarCard,
  targetAvatar: AvatarCard | null,
  damage: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (!targetAvatar) {
    return {
      success: false,
      message: 'No target available for damage'
    };
  }

  // Calculate final damage after shield
  const shieldAmount = targetAvatar.counters?.shield || 0;
  const finalDamage = Math.max(0, damage - shieldAmount);
  const shieldUsed = Math.min(damage, shieldAmount);

  // Apply damage and reduce shield
  const newDamageCounters = (targetAvatar.counters?.damage || 0) + finalDamage;
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
    message: `Dealt ${finalDamage} damage${shieldUsed > 0 ? ` (${shieldUsed} blocked by shield)` : ''}`,
    damage: finalDamage,
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