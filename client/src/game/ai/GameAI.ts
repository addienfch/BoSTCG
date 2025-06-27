import { Card, AvatarCard, ActionCard, ElementType, Player } from '../data/cardTypes';
import { AIDifficulty } from '../stores/useGameMode';

export interface AIPersonality {
  name: string;
  difficulty: AIDifficulty;
  description: string;
  
  // Tactical preferences
  aggression: number; // 0-100: How likely to play attacking cards
  caution: number; // 0-100: How likely to play defensive cards
  efficiency: number; // 0-100: How well it uses energy
  strategy: number; // 0-100: How well it plans ahead
  
  // Decision-making factors
  riskTolerance: number; // 0-100: Willingness to take risky plays
  adaptability: number; // 0-100: Ability to change tactics
  cardEvaluation: number; // 0-100: How accurately it evaluates card values
  
  // Behavioral patterns
  favoriteElements: ElementType[];
  preferredPlayStyle: 'aggressive' | 'defensive' | 'balanced' | 'control';
  mistakeChance: number; // 0-100: Probability of making suboptimal plays
}

// AI personality configurations for different difficulty levels
export const AI_PERSONALITIES: { [key in AIDifficulty]: AIPersonality } = {
  newbie: {
    name: 'Rookie Trainer',
    difficulty: 'newbie',
    description: 'A new player learning the ropes',
    aggression: 30,
    caution: 20,
    efficiency: 25,
    strategy: 15,
    riskTolerance: 40,
    adaptability: 20,
    cardEvaluation: 30,
    favoriteElements: ['fire', 'neutral'],
    preferredPlayStyle: 'aggressive',
    mistakeChance: 35
  },
  
  regular: {
    name: 'Experienced Duelist',
    difficulty: 'regular',
    description: 'A competent player with solid fundamentals',
    aggression: 60,
    caution: 55,
    efficiency: 65,
    strategy: 60,
    riskTolerance: 50,
    adaptability: 60,
    cardEvaluation: 70,
    favoriteElements: ['fire', 'water', 'ground'],
    preferredPlayStyle: 'balanced',
    mistakeChance: 15
  },
  
  advanced: {
    name: 'Master Strategist',
    difficulty: 'advanced',
    description: 'An expert player with deep tactical knowledge',
    aggression: 75,
    caution: 85,
    efficiency: 90,
    strategy: 95,
    riskTolerance: 70,
    adaptability: 90,
    cardEvaluation: 95,
    favoriteElements: ['fire', 'water', 'ground', 'air'],
    preferredPlayStyle: 'control',
    mistakeChance: 5
  }
};

export interface AIDecision {
  type: 'playCard' | 'useSkill' | 'addToEnergy' | 'evolve' | 'endPhase';
  cardIndex?: number;
  target?: string;
  skillIndex?: 1 | 2;
  reasoning: string;
  priority: number;
}

export class GameAI {
  private personality: AIPersonality;
  private gameState: any;
  
  constructor(difficulty: AIDifficulty) {
    this.personality = AI_PERSONALITIES[difficulty];
    console.log(`AI initialized: ${this.personality.name} (${difficulty})`);
  }
  
  // Enhanced AI decision making - Fix 3: Multi-level AI Intelligence
  makeDecision(gameState: any): AIDecision | null {
    this.gameState = gameState;
    
    const decisions: AIDecision[] = [];
    
    // Analyze current game state
    const playerState = gameState.opponent;
    const opponentState = gameState.player;
    
    console.log(`AI (${this.personality.name}) analyzing game state...`);
    console.log(`Phase: ${gameState.gamePhase}, Turn: ${gameState.turn}`);
    console.log(`AI Hand: ${playerState.hand.length} cards, Energy: ${playerState.energyPile.length}`);
    
    // Phase-specific decision making
    switch (gameState.gamePhase) {
      case 'main1':
      case 'main2':
        decisions.push(...this.evaluateMainPhaseActions(playerState, opponentState));
        break;
        
      case 'battle':
        decisions.push(...this.evaluateBattleActions(playerState, opponentState));
        break;
        
      case 'end':
        // Handle end-of-turn decisions
        if (playerState.hand.length > 7) {
          decisions.push(...this.evaluateDiscardActions(playerState));
        }
        break;
    }
    
    // Add end phase decision if no other actions
    if (decisions.length === 0) {
      decisions.push({
        type: 'endPhase',
        reasoning: 'No beneficial actions available',
        priority: 1
      });
    }
    
    // Sort decisions by priority and personality preferences
    const sortedDecisions = this.prioritizeDecisions(decisions);
    
    const bestDecision = sortedDecisions[0];
    console.log(`AI Decision: ${bestDecision.type} - ${bestDecision.reasoning}`);
    
    return bestDecision;
  }
  
  private evaluateMainPhaseActions(playerState: any, opponentState: any): AIDecision[] {
    const decisions: AIDecision[] = [];
    
    // Evaluate playing cards from hand
    playerState.hand.forEach((card: Card, index: number) => {
      const decision = this.evaluateCardPlay(card, index, playerState, opponentState);
      if (decision) {
        decisions.push(decision);
      }
    });
    
    // Evaluate adding cards to energy
    if (playerState.energyPile.length < 10) { // Don't exceed reasonable energy limit
      playerState.hand.forEach((card: Card, index: number) => {
        const energyDecision = this.evaluateEnergyAddition(card, index, playerState);
        if (energyDecision) {
          decisions.push(energyDecision);
        }
      });
    }
    
    // Evaluate avatar skills
    if (playerState.activeAvatar && !playerState.activeAvatar.isTapped) {
      const skillDecisions = this.evaluateSkillUsage(playerState.activeAvatar, playerState, opponentState);
      decisions.push(...skillDecisions);
    }
    
    return decisions;
  }
  
  private evaluateCardPlay(card: Card, index: number, playerState: any, opponentState: any): AIDecision | null {
    // Check if we can afford the card
    if (!this.canAffordCard(card, playerState)) {
      return null;
    }
    
    const cardValue = this.evaluateCardValue(card, playerState, opponentState);
    const situationalBonus = this.getSituationalBonus(card, playerState, opponentState);
    
    // Apply personality modifiers
    let priority = cardValue + situationalBonus;
    
    if (card.type === 'avatar') {
      priority *= (this.personality.aggression / 100);
    } else if (card.type === 'spell') {
      priority *= (this.personality.strategy / 100);
    }
    
    // Add randomness based on difficulty
    const randomFactor = (Math.random() - 0.5) * (this.personality.mistakeChance / 100);
    priority += randomFactor * 20;
    
    if (priority > 30) {
      return {
        type: 'playCard',
        cardIndex: index,
        reasoning: `Playing ${card.name} (value: ${cardValue.toFixed(1)}, situation: ${situationalBonus.toFixed(1)})`,
        priority
      };
    }
    
    return null;
  }
  
  private evaluateEnergyAddition(card: Card, index: number, playerState: any): AIDecision | null {
    // Don't add valuable cards to energy unless necessary
    const cardValue = this.evaluateCardValue(card, playerState, null);
    const energyNeed = this.assessEnergyNeeds(playerState);
    
    let priority = energyNeed - cardValue;
    
    // Efficiency modifier
    priority *= (this.personality.efficiency / 100);
    
    if (priority > 20) {
      return {
        type: 'addToEnergy',
        cardIndex: index,
        reasoning: `Adding ${card.name} to energy (need: ${energyNeed.toFixed(1)}, value: ${cardValue.toFixed(1)})`,
        priority
      };
    }
    
    return null;
  }
  
  private evaluateSkillUsage(avatar: AvatarCard, playerState: any, opponentState: any): AIDecision[] {
    const decisions: AIDecision[] = [];
    
    // Evaluate skill 1
    if (avatar.skill1 && this.canAffordSkill(avatar.skill1.energyCost, playerState)) {
      const skillValue = this.evaluateSkillValue(avatar.skill1, playerState, opponentState);
      if (skillValue > 40) {
        decisions.push({
          type: 'useSkill',
          skillIndex: 1,
          reasoning: `Using ${avatar.skill1.name} (value: ${skillValue.toFixed(1)})`,
          priority: skillValue
        });
      }
    }
    
    // Evaluate skill 2
    if (avatar.skill2 && this.canAffordSkill(avatar.skill2.energyCost, playerState)) {
      const skillValue = this.evaluateSkillValue(avatar.skill2, playerState, opponentState);
      if (skillValue > 40) {
        decisions.push({
          type: 'useSkill',
          skillIndex: 2,
          reasoning: `Using ${avatar.skill2.name} (value: ${skillValue.toFixed(1)})`,
          priority: skillValue
        });
      }
    }
    
    return decisions;
  }
  
  private evaluateBattleActions(playerState: any, opponentState: any): AIDecision[] {
    // For now, just end the battle phase
    return [{
      type: 'endPhase',
      reasoning: 'Battle phase completed',
      priority: 50
    }];
  }
  
  private evaluateDiscardActions(playerState: any): AIDecision[] {
    // Find the least valuable card to discard
    const handValues = playerState.hand.map((card: Card, index: number) => ({
      index,
      value: this.evaluateCardValue(card, playerState, null)
    }));
    
    handValues.sort((a, b) => a.value - b.value);
    
    return [{
      type: 'playCard', // This will trigger discard in the actual implementation
      cardIndex: handValues[0].index,
      reasoning: `Discarding lowest value card (${handValues[0].value.toFixed(1)})`,
      priority: 100
    }];
  }
  
  private prioritizeDecisions(decisions: AIDecision[]): AIDecision[] {
    return decisions.sort((a, b) => {
      // Apply personality-based modifications
      let priorityA = a.priority;
      let priorityB = b.priority;
      
      // Aggressive personalities prefer direct actions
      if (this.personality.preferredPlayStyle === 'aggressive') {
        if (a.type === 'playCard' || a.type === 'useSkill') priorityA *= 1.2;
        if (b.type === 'playCard' || b.type === 'useSkill') priorityB *= 1.2;
      }
      
      // Defensive personalities prefer energy building
      if (this.personality.preferredPlayStyle === 'defensive') {
        if (a.type === 'addToEnergy') priorityA *= 1.3;
        if (b.type === 'addToEnergy') priorityB *= 1.3;
      }
      
      return priorityB - priorityA;
    });
  }
  
  // Helper methods
  private canAffordCard(card: Card, playerState: any): boolean {
    if (!card.energyCost || card.energyCost.length === 0) return true;
    return playerState.energyPile.length >= card.energyCost.length;
  }
  
  private canAffordSkill(energyCost: ElementType[] | undefined, playerState: any): boolean {
    if (!energyCost || energyCost.length === 0) return true;
    return playerState.energyPile.length >= energyCost.length;
  }
  
  private evaluateCardValue(card: Card, playerState: any, opponentState: any): number {
    let value = 0;
    
    // Base value calculation
    if (card.type === 'avatar') {
      const avatar = card as AvatarCard;
      value += avatar.health * 5;
      value += avatar.level * 10;
      if (avatar.skill1) value += avatar.skill1.damage * 3;
      if (avatar.skill2) value += avatar.skill2.damage * 3;
    } else if (card.type === 'spell') {
      const spell = card as ActionCard;
      value += 25; // Base spell value
      if (spell.damage) value += spell.damage * 4;
    }
    
    // Apply AI evaluation skill
    const evaluationAccuracy = this.personality.cardEvaluation / 100;
    value *= evaluationAccuracy;
    
    return Math.max(0, value);
  }
  
  private evaluateSkillValue(skill: any, playerState: any, opponentState: any): number {
    let value = 0;
    
    if (skill.damage) {
      value += skill.damage * 8;
    }
    
    // Bonus for hitting opponent's avatar
    if (opponentState.activeAvatar) {
      value += 20;
    }
    
    return value;
  }
  
  private getSituationalBonus(card: Card, playerState: any, opponentState: any): number {
    let bonus = 0;
    
    // Bonus for element matching
    if (this.personality.favoriteElements.includes(card.element as ElementType)) {
      bonus += 15;
    }
    
    // Bonus for filling strategy needs
    if (card.type === 'avatar' && !playerState.activeAvatar) {
      bonus += 30; // Need an active avatar
    }
    
    return bonus;
  }
  
  private assessEnergyNeeds(playerState: any): number {
    const cardsInHand = playerState.hand.length;
    const currentEnergy = playerState.energyPile.length;
    const idealEnergy = Math.min(cardsInHand * 2, 8);
    
    return Math.max(0, idealEnergy - currentEnergy) * 10;
  }
}