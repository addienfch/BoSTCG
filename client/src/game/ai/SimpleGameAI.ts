import { Card, AvatarCard, ActionCard, GamePhase } from '../data/cardTypes';

// Interface for the game state that the AI can access and modify
export interface AIGameState {
  currentPlayer: 'player' | 'opponent';
  gamePhase: GamePhase;
  turn: number;
  
  player: {
    activeAvatar: AvatarCard | null;
    reserveAvatars: AvatarCard[];
    energyPile: Card[];
    hand: Card[];
    fieldCards: ActionCard[];
    health?: number;
    lifeCards?: Card[];
    graveyard?: Card[];
    usedEnergyPile?: Card[];
  };
  
  opponent: {
    activeAvatar: AvatarCard | null;
    reserveAvatars: AvatarCard[];
    energyPile: Card[];
    hand: Card[];
    fieldCards: ActionCard[];
    avatarToEnergyCount: number; // Track how many avatars were moved to energy this turn
    health?: number;
    lifeCards?: Card[];
    graveyard?: Card[];
    usedEnergyPile?: Card[];
  };
  
  // Function to move a card from opponent's hand to their energy pile
  moveCardToEnergy: (index: number) => void;
  
  // Function to play a card as an active avatar
  playAsActiveAvatar: (index: number) => void;
  
  // Function to play a card as a reserve avatar
  playAsReserveAvatar: (index: number) => void;
  
  // Function to play a spell card
  playSpell: (index: number) => void;
  
  // Function to use an avatar skill
  useAvatarSkill: (skillNumber: 1 | 2) => void;
  
  // Function to end the current phase
  nextPhase: () => void;
  
  // Helper function to check if opponent has enough energy
  hasEnoughEnergy: (energyCost: string[]) => boolean;
  
  // Add a log message
  addLog: (message: string) => void;
}

// Simple AI to play against the player
export class SimpleGameAI {
  public gameState: AIGameState;
  
  constructor(gameState: AIGameState) {
    this.gameState = gameState;
  }
  
  // Main function to make a move
  makeMove(): void {
    const { currentPlayer, gamePhase } = this.gameState;
    
    // Only act when it's the opponent's turn
    if (currentPlayer !== 'opponent') {
      return;
    }
    
    // Take different actions based on the game phase
    switch (gamePhase) {
      case 'refresh':
        // Automatically move to draw phase
        setTimeout(() => this.gameState.nextPhase(), 1000);
        break;
        
      case 'draw':
        // Automatically move to main1 phase
        setTimeout(() => this.gameState.nextPhase(), 1000);
        break;
        
      case 'main1':
        // This is where the AI makes most of its decisions
        setTimeout(() => this.decideMainPhaseAction(), 1500);
        break;
        
      case 'battle':
        // Decide whether to attack with active avatar
        setTimeout(() => this.decideBattleAction(), 1500);
        break;
        
      case 'damage':
        // Automatically move to main2 phase
        setTimeout(() => this.gameState.nextPhase(), 1000);
        break;
        
      case 'main2':
        // Maybe play some more cards if available
        setTimeout(() => this.decideMainPhaseAction(), 1500);
        break;
        
      case 'end':
        // Automatically end turn
        setTimeout(() => this.gameState.nextPhase(), 1000);
        break;
    }
  }
  
  // Decide what to do in the main phase
  private decideMainPhaseAction(): void {
    const { opponent } = this.gameState;
    
    // First priority: Place an active avatar if none exists
    if (!opponent.activeAvatar && this.findPlayableAvatars().length > 0) {
      this.placeActiveAvatar();
      return;
    }
    
    // Second priority: Place reserve avatars if slots available
    if (opponent.reserveAvatars.length < 2 && this.findPlayableAvatars().length > 0) {
      this.placeReserveAvatar();
      return;
    }
    
    // Third priority: Play spell cards if possible
    if (opponent.activeAvatar && this.findPlayableSpells().length > 0) {
      this.playSpellCard();
      return;
    }
    
    // Fourth priority: Add energy if available and needed
    if (this.shouldAddEnergy()) {
      this.addEnergy();
      return;
    }
    
    // If no other actions to take, move to next phase
    this.gameState.nextPhase();
  }
  
  // Find avatar cards in hand that can be played
  private findPlayableAvatars(): number[] {
    const { opponent } = this.gameState;
    const playableIndices: number[] = [];
    
    opponent.hand.forEach((card, index) => {
      if (card.type === 'avatar') {
        const avatarCard = card as AvatarCard;
        
        // Don't play level 2 avatars directly - AI isn't smart enough for that yet
        if (avatarCard.level === 1) {
          playableIndices.push(index);
        }
      }
    });
    
    return playableIndices;
  }
  
  // Find spell cards that can be played
  private findPlayableSpells(): number[] {
    const { opponent } = this.gameState;
    const playableIndices: number[] = [];
    
    // Need an active avatar to play spells
    if (!opponent.activeAvatar) {
      return [];
    }
    
    opponent.hand.forEach((card, index) => {
      if (card.type === 'spell' || card.type === 'quickSpell') {
        // Check if we have enough energy to play this spell
        if (this.gameState.hasEnoughEnergy(card.energyCost || [])) {
          playableIndices.push(index);
        }
      }
    });
    
    return playableIndices;
  }
  
  // Place an active avatar
  private placeActiveAvatar(): void {
    const playableAvatars = this.findPlayableAvatars();
    
    if (playableAvatars.length > 0) {
      // Select the first available avatar
      const avatarIndex = playableAvatars[0];
      this.gameState.playAsActiveAvatar(avatarIndex);
      
      this.gameState.addLog('Opponent placed an active avatar');
    }
  }
  
  // Place a reserve avatar
  private placeReserveAvatar(): void {
    const { opponent } = this.gameState;
    const playableAvatars = this.findPlayableAvatars();
    
    if (playableAvatars.length > 0 && opponent.reserveAvatars.length < 2) {
      // Select the first available avatar
      const avatarIndex = playableAvatars[0];
      this.gameState.playAsReserveAvatar(avatarIndex);
      
      this.gameState.addLog('Opponent placed a reserve avatar');
    }
  }
  
  // Play a spell card
  private playSpellCard(): void {
    const playableSpells = this.findPlayableSpells();
    
    if (playableSpells.length > 0) {
      // Select the first available spell
      const spellIndex = playableSpells[0];
      this.gameState.playSpell(spellIndex);
      
      this.gameState.addLog('Opponent played a spell');
    }
  }
  
  // Decide if we should add energy
  private shouldAddEnergy(): boolean {
    const { opponent } = this.gameState;
    
    // If we have less than 5 energy, it's a good idea to add more
    if (opponent.energyPile.length < 5 && opponent.hand.length > 0) {
      return true;
    }
    
    return false;
  }
  
  // Add a card to energy
  private addEnergy(): void {
    const { opponent } = this.gameState;
    
    if (opponent.hand.length === 0) {
      return;
    }
    
    // Try to find non-avatar cards first
    const nonAvatarIndices: number[] = [];
    const avatarIndices: number[] = [];
    
    opponent.hand.forEach((card, index) => {
      if (card.type === 'avatar') {
        avatarIndices.push(index);
      } else {
        nonAvatarIndices.push(index);
      }
    });
    
    // Prefer using non-avatar cards for energy
    if (nonAvatarIndices.length > 0) {
      this.gameState.moveCardToEnergy(nonAvatarIndices[0]);
      this.gameState.addLog('Opponent added a card to their energy pile');
    } 
    // Use avatar card if we haven't used one for energy yet
    else if (avatarIndices.length > 0 && opponent.avatarToEnergyCount < 1) {
      this.gameState.moveCardToEnergy(avatarIndices[0]);
      this.gameState.addLog('Opponent added an avatar to their energy pile');
    } else {
      this.gameState.nextPhase();
    }
  }
  
  // Decide what to do in battle phase
  private decideBattleAction(): void {
    const { opponent } = this.gameState;
    
    // If we have an active avatar, use its skill
    if (opponent.activeAvatar && !opponent.activeAvatar.isTapped) {
      // Use skill 2 if available, otherwise skill 1
      if (opponent.activeAvatar.skill2 && 
          this.gameState.hasEnoughEnergy(opponent.activeAvatar.skill2.energyCost)) {
        this.gameState.useAvatarSkill(2);
        this.gameState.addLog('Opponent used their avatar\'s second skill');
      } else if (this.gameState.hasEnoughEnergy(opponent.activeAvatar.skill1.energyCost)) {
        this.gameState.useAvatarSkill(1);
        this.gameState.addLog('Opponent used their avatar\'s first skill');
      } else {
        // Not enough energy for any skill
        this.gameState.nextPhase();
      }
    } else {
      // No active avatar or it's already tapped
      this.gameState.nextPhase();
    }
  }
}