import { AvatarCard } from '../data/cardTypes';
import { toast } from 'sonner';

// SkillEffect interface since it doesn't exist in cardTypes
export interface SkillEffect {
  name: string;
  energyCost: string[];
  damage: number;
  effect?: string;
}

// Types needed from useGameStore
export type Player = 'player' | 'opponent';

export interface PlayerState {
  hand: any[];
  energyPile: any[];
  usedEnergyPile: any[];
  activeAvatar: AvatarCard | null;
  reserveAvatars: AvatarCard[];
  graveyard: any[];
  avatarToEnergyCount: number;
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  gamePhase: string;
  currentPlayer: Player;
}

// Interface for skill trigger check result
export interface SkillTriggerResult {
  shouldTrigger: boolean;
  modifiedDamage?: number;
  applyBleed?: number;
  applyShield?: number;
  message?: string;
}

// Check if a skill effect should trigger based on the current game state
export function checkSkillTrigger(
  skill: SkillEffect,
  avatar: AvatarCard,
  targetAvatar: AvatarCard | null | undefined,
  gameState: GameState,
  player: Player
): SkillTriggerResult {
  // Default result - no trigger
  const result: SkillTriggerResult = {
    shouldTrigger: false
  };
  
  // If no effect description, no trigger to check
  if (!skill.effect) {
    return result;
  }

  const effectText = skill.effect.toLowerCase();
  const playerState = player === 'player' ? gameState.player : gameState.opponent;
  const opponentState = player === 'player' ? gameState.opponent : gameState.player;
  
  // Check for hand size triggers (e.g., Radja's skill)
  if (effectText.includes("1 or less card in hand") || 
      effectText.includes("if you have 1 or fewer cards in hand")) {
    
    if (playerState.hand.length <= 1) {
      console.log(`Skill trigger: Hand size condition met (${playerState.hand.length} cards)`);
      result.shouldTrigger = true;
      result.modifiedDamage = 5; // Specific value from Radja's skill
      result.message = "Skill trigger: Damage set to 5 due to having 1 or fewer cards in hand";
    } else {
      console.log(`Skill trigger: Hand size condition not met (${playerState.hand.length} cards)`);
    }
  }
  
  // Check for energy discard effects
  if (effectText.includes("discard a energy card from energy pile") || 
      effectText.includes("discard an energy card")) {
    
    result.shouldTrigger = true;
    result.modifiedDamage = skill.damage + 10; // Per card text: +10 damage
    result.message = "Skill trigger: +10 damage from discarding energy card";
  }
  
  // Element type matchup triggers
  if (targetAvatar) {
    // Wind/Air type bonus damage
    if ((effectText.includes("if opponent active avatar is wind element avatar") || 
         effectText.includes("if opponent active avatar were air type")) && 
        targetAvatar.element === 'air') {
      
      result.shouldTrigger = true;
      
      // Check for specific damage value (Radja's skill 2)
      if (effectText.includes("become 111")) {
        result.modifiedDamage = 111;
        result.message = "Element trigger: Massive damage against Air/Wind type avatar!";
      } else {
        // Default air type bonus
        result.modifiedDamage = skill.damage + 2;
        result.message = "Element trigger: +2 damage against Air type avatar";
      }
    }
    
    // Bleed counter effects
    if (effectText.includes("target opponent active avatar get") && 
        effectText.includes("bleed counters")) {
      
      result.shouldTrigger = true;
      
      // Check how many bleed counters to apply
      const bleedAmount = effectText.includes("2 bleed") ? 2 : 1;
      result.applyBleed = bleedAmount;
      result.message = `Effect trigger: Applied ${bleedAmount} bleed counters to opponent's avatar`;
    }
    
    // Shield counter effects
    if (effectText.includes("shield counters")) {
      result.shouldTrigger = true;
      
      // Check how many shield counters to apply
      const shieldAmount = effectText.includes("2 shield") ? 2 : 1;
      result.applyShield = shieldAmount;
      result.message = `Effect trigger: Applied ${shieldAmount} shield counters to your avatar`;
    }
  }
  
  // Return the final result with all triggers and effects
  return result;
}

// Apply the effects of triggered skills to the game state
export function applySkillTriggerEffects(
  triggerResult: SkillTriggerResult,
  avatar: AvatarCard,
  targetAvatar: AvatarCard | null | undefined,
  player: Player,
  updateGameState: (update: any) => void
): void {
  if (!triggerResult.shouldTrigger) {
    return;
  }
  
  // Show message if available
  if (triggerResult.message) {
    toast.info(triggerResult.message);
  }
  
  // Apply bleed counters to opponent
  if (triggerResult.applyBleed && targetAvatar) {
    const opponent = player === 'player' ? 'opponent' : 'player';
    
    updateGameState({
      [opponent]: {
        activeAvatar: {
          ...targetAvatar,
          counters: {
            ...targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
            bleed: (targetAvatar.counters?.bleed || 0) + triggerResult.applyBleed
          }
        }
      }
    });
  }
  
  // Apply shield counters to self
  if (triggerResult.applyShield) {
    updateGameState({
      [player]: {
        activeAvatar: {
          ...avatar,
          counters: {
            ...avatar.counters || { damage: 0, bleed: 0, shield: 0 },
            shield: (avatar.counters?.shield || 0) + triggerResult.applyShield
          }
        }
      }
    });
  }
}

// Utility function to get the total amount of damage to deal after triggers
export function getModifiedDamage(
  originalDamage: number,
  triggerResult: SkillTriggerResult
): number {
  if (triggerResult.shouldTrigger && triggerResult.modifiedDamage !== undefined) {
    return triggerResult.modifiedDamage;
  }
  return originalDamage;
}