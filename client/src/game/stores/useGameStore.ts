import { create } from 'zustand';
import { toast } from 'sonner';
import { ActionCard, AvatarCard, Card, ElementType } from '../data/cardTypes';
import { Player, GamePhase } from '../data/gameTypes';
import { useDeckStore } from './useDeckStore';

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T extends any>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface PlayerState {
  health: number;
  deck: Card[];
  hand: Card[];
  energyPile: Card[];
  usedEnergyPile: Card[];
  activeAvatar: AvatarCard | null;
  reserveAvatars: AvatarCard[];
  fieldCards: ActionCard[];
  lifeCards: Card[];
  graveyard: Card[];
  avatarToEnergyCount: number; // Track how many avatars were moved to energy this turn
  isAI?: boolean; // Flag to identify AI-controlled player
}

interface GameState {
  currentPlayer: Player;
  gamePhase: GamePhase;
  turn: number;
  winner: Player | null;
  
  // Player states
  player: PlayerState;
  opponent: PlayerState;
  
  // Selection state
  selectedCard: number | null;
  selectedTarget: string | null;
  
  // Event logs
  logs: string[];
  
  // Actions
  initGame: () => void;
  shuffleDeck: (player: Player) => void;
  drawCard: (player: Player, count?: number) => void;
  
  // Core gameplay actions
  playCard: (handIndex: number, target?: string) => void;
  useAvatarSkill: (player: Player, skillIndex: 1 | 2, target?: string) => void;
  addToEnergyPile: (handIndex: number) => void;
  evolveAvatar: (handIndex: number, targetAvatar: 'active' | number) => void;
  
  // Game flow
  nextPhase: () => void;
  endTurn: () => void;
  
  // Helper functions
  getPhaseText: () => string;
  canPlayCard: (card: Card) => boolean;
  hasEnoughEnergy: (energyCost: ElementType[], player: Player) => boolean;
  useEnergy: (energyCost: ElementType[], player: Player) => boolean;
  checkDefeatedAvatars: () => void;
  
  // Card management
  moveCardToEnergy: (handIndex: number) => void; // Move a card from hand to energy pile
  discardCard: (handIndex: number, player: Player) => void; // Discard a card to graveyard
  
  // Selection helpers
  selectCard: (handIndex: number) => void;
  selectTarget: (targetId: string) => void;
  
  // Log helpers
  addLog: (message: string) => void;
  
  // AI actions
  performAIActions: () => void;
}

// Initialize a player state (player or opponent)
const initPlayerState = (isPlayer: boolean): PlayerState => {
  return {
    health: 20,
    deck: [], // Will be populated by the card selection screen
    hand: [],
    energyPile: [],
    usedEnergyPile: [],
    activeAvatar: null,
    reserveAvatars: [],
    fieldCards: [],
    lifeCards: [],
    graveyard: [],
    avatarToEnergyCount: 0,
    isAI: !isPlayer
  };
};

// Check if a card is an avatar
const isAvatarCard = (card: Card): boolean => {
  return card.type === 'avatar';
};

export const useGameStore = create<GameState>((set, get) => ({
  currentPlayer: 'player',
  gamePhase: 'refresh',
  turn: 1,
  winner: null,
  
  // Player states
  player: initPlayerState(true),
  opponent: initPlayerState(false),
  
  // Selection state
  selectedCard: null,
  selectedTarget: null,
  
  // Event logs
  logs: [],
  
  // Initialize game
  initGame: () => {
    // Get the active deck from useDeckStore
    const { decks, activeDeckId } = useDeckStore.getState();
    
    // Find the active deck
    let activeDeck = decks.find(deck => deck.id === activeDeckId);
    
    // If no active deck is set, use the first deck
    if (!activeDeck && decks.length > 0) {
      activeDeck = decks[0];
      console.log('No active deck set, using first deck:', activeDeck.name);
    } else if (activeDeck) {
      console.log('Using active deck:', activeDeck.name);
    } else {
      console.error('No decks found in deck store!');
    }
    
    // Get deck cards or use empty array if no deck is available
    const deckCards = activeDeck ? [...activeDeck.cards] : [];
    
    // Create player state with the deck
    const playerState = initPlayerState(true);
    playerState.deck = deckCards;
    
    // Reset game state with default values first
    set(state => ({
      currentPlayer: 'player',
      gamePhase: 'setup', // Start with the setup phase
      turn: 1,
      winner: null,
      player: playerState,
      opponent: initPlayerState(false),
      selectedCard: null,
      selectedTarget: null,
      logs: ['Game started! Place your Level 1 avatar as your active avatar to begin.']
    }));
    
    // After initial setup, copy the player's deck for the AI
    set(state => {
      // Deep clone player's deck for the opponent
      const playerDeck = state.player.deck;
      const opponentDeck = JSON.parse(JSON.stringify(playerDeck));
      
      // Set the opponent's isAI flag for AI behavior
      return {
        opponent: {
          ...state.opponent,
          deck: opponentDeck,
          isAI: true
        }
      };
    });
    
    // Set up life cards first so we don't remove them from the deck
    set(state => {
      const playerDeck = [...state.player.deck];
      const opponentDeck = [...state.opponent.deck];
      
      // Draw 4 cards for life cards
      const playerLifeCards = playerDeck.splice(0, 4);
      const opponentLifeCards = opponentDeck.splice(0, 4);
      
      return {
        player: {
          ...state.player,
          deck: playerDeck,
          lifeCards: playerLifeCards
        },
        opponent: {
          ...state.opponent,
          deck: opponentDeck,
          lifeCards: opponentLifeCards
        }
      };
    });
    
    // Draw initial hand with at least 1 level 1 avatar for player
    set(state => {
      const playerDeck = [...state.player.deck];
      const hand = [];
      
      // First, find all level 1 avatars in the deck
      const level1AvatarIndices = playerDeck
        .map((card, index) => card.type === 'avatar' && (card as AvatarCard).level === 1 ? index : -1)
        .filter(index => index !== -1);
      
      // If we have level 1 avatars, add one to hand first
      if (level1AvatarIndices.length > 0) {
        // Randomly select one level 1 avatar
        const randomIndex = Math.floor(Math.random() * level1AvatarIndices.length);
        const selectedAvatarIndex = level1AvatarIndices[randomIndex];
        
        // Add to hand and remove from deck
        hand.push(playerDeck[selectedAvatarIndex]);
        playerDeck.splice(selectedAvatarIndex, 1);
        
        // Draw the rest of the hand (5 more cards)
        for (let i = 0; i < 5; i++) {
          if (playerDeck.length > 0) {
            const drawnCard = playerDeck.shift();
            if (drawnCard) hand.push(drawnCard);
          }
        }
      } else {
        // If no level 1 avatars in deck, just draw 6 cards and we'll reshuffle later
        for (let i = 0; i < 6; i++) {
          if (playerDeck.length > 0) {
            const drawnCard = playerDeck.shift();
            if (drawnCard) hand.push(drawnCard);
          }
        }
        
        // Log that we're missing level 1 avatars
        get().addLog('No level 1 avatars found in the deck! You may need to reshuffle.');
      }
      
      return {
        player: {
          ...state.player,
          deck: playerDeck,
          hand
        }
      };
    });
    
    // Draw opponent's cards normally
    get().drawCard('opponent', 6);
    
    // Check if player has at least one level 1 avatar
    const hasLevel1Avatar = get().player.hand.some(
      card => card.type === 'avatar' && (card as AvatarCard).level === 1
    );
    
    if (!hasLevel1Avatar) {
      // If no level 1 avatar in hand, mulligan (reshuffle and draw again)
      set(state => {
        const combinedDeck = [...state.player.deck, ...state.player.hand];
        const shuffledDeck = shuffleArray(combinedDeck);
        
        // Log the mulligan
        get().addLog('No level 1 avatar in opening hand. Performing mulligan...');
        
        return {
          player: {
            ...state.player,
            deck: shuffledDeck,
            hand: []
          }
        };
      });
      
      // Try again with the same approach
      set(state => {
        const playerDeck = [...state.player.deck];
        const hand = [];
        
        // Find level 1 avatars in the reshuffled deck
        const level1AvatarIndices = playerDeck
          .map((card, index) => card.type === 'avatar' && (card as AvatarCard).level === 1 ? index : -1)
          .filter(index => index !== -1);
        
        if (level1AvatarIndices.length > 0) {
          // Randomly select one level 1 avatar
          const randomIndex = Math.floor(Math.random() * level1AvatarIndices.length);
          const selectedAvatarIndex = level1AvatarIndices[randomIndex];
          
          // Add to hand and remove from deck
          hand.push(playerDeck[selectedAvatarIndex]);
          playerDeck.splice(selectedAvatarIndex, 1);
          
          // Draw the rest of the hand (5 more cards)
          for (let i = 0; i < 5; i++) {
            if (playerDeck.length > 0) {
              const drawnCard = playerDeck.shift();
              if (drawnCard) hand.push(drawnCard);
            }
          }
          
          get().addLog('Mulligan successful. You have a level 1 avatar in your hand.');
        } else {
          // If still no level 1 avatars, just draw 6 cards
          for (let i = 0; i < 6; i++) {
            if (playerDeck.length > 0) {
              const drawnCard = playerDeck.shift();
              if (drawnCard) hand.push(drawnCard);
            }
          }
          
          get().addLog('No level 1 avatars found after mulligan. Please check your deck composition.');
        }
        
        return {
          player: {
            ...state.player,
            deck: playerDeck,
            hand
          }
        };
      });
    }
    
    // Add game setup log
    get().addLog('Each player has 4 life cards set aside.');
  },
  
  // Shuffle deck
  shuffleDeck: (player) => {
    set(state => {
      const targetState = player === 'player' ? state.player : state.opponent;
      const shuffledDeck = shuffleArray(targetState.deck);
      
      if (player === 'player') {
        return { player: { ...targetState, deck: shuffledDeck } };
      } else {
        return { opponent: { ...targetState, deck: shuffledDeck } };
      }
    });
    
    get().addLog(`${player === 'player' ? 'Your' : 'Opponent\'s'} deck has been shuffled.`);
  },
  
  // Draw cards
  drawCard: (player, count = 1) => {
    set(state => {
      const targetState = player === 'player' ? state.player : state.opponent;
      const updatedDeck = [...targetState.deck];
      const updatedHand = [...targetState.hand];
      
      // Draw up to count cards
      for (let i = 0; i < count; i++) {
        if (updatedDeck.length === 0) {
          get().addLog(`${player === 'player' ? 'You have' : 'Opponent has'} no cards left to draw!`);
          break;
        }
        
        const drawnCard = updatedDeck.shift();
        if (drawnCard) {
          updatedHand.push(drawnCard);
        }
      }
      
      if (player === 'player') {
        return { player: { ...targetState, deck: updatedDeck, hand: updatedHand } };
      } else {
        return { opponent: { ...targetState, deck: updatedDeck, hand: updatedHand } };
      }
    });
    
    get().addLog(`${player === 'player' ? 'You' : 'Opponent'} drew ${count} card(s).`);
  },
  
  // Play a card from hand
  playCard: (handIndex, target) => {
    const { player, currentPlayer, gamePhase } = get();
    
    // Main phases for regular play, setup phase for avatar placement
    const isMainPhase = gamePhase === 'main1' || gamePhase === 'main2';
    const isSetupPhase = gamePhase === 'setup';
    
    // Can only play cards during your turn and in the right phases
    if (currentPlayer !== 'player' || (!isMainPhase && !isSetupPhase)) {
      toast.error("You can only play cards during your Main Phases or the Setup Phase!");
      return;
    }
    
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    
    const card = player.hand[handIndex];
    
    // Special handling for setup phase
    if (isSetupPhase) {
      if (card.type !== 'avatar' || (card as AvatarCard).level !== 1) {
        toast.error("You can only play a Level 1 Avatar during the Setup Phase!");
        return;
      }
      
      if (player.activeAvatar !== null) {
        toast.error("You already have an active avatar! Click 'Next Phase' to continue.");
        return;
      }
      
      // Place level 1 avatar as active avatar in setup phase
      set(state => {
        const updatedHand = [...state.player.hand];
        updatedHand.splice(handIndex, 1);
        
        const avatarCard = card as AvatarCard;
        avatarCard.turnPlayed = state.turn; // Record when it was played
        
        return {
          player: {
            ...state.player,
            hand: updatedHand,
            activeAvatar: avatarCard
          }
        };
      });
      
      get().addLog(`Setup: You played ${card.name} as your active avatar.`);
      toast.success(`${card.name} placed as active avatar. Click 'Next Phase' to continue.`);
      return; // Exit early to skip the regular card playing logic
    }
    
    // For non-setup phases, check if the card can be played
    if (!get().canPlayCard(card)) {
      toast.error("You can't play this card right now!");
      return;
    }
    
    // Handle different card types
    if (card.type === 'avatar') {
      // Check if we have a spot for the avatar
      if (player.activeAvatar === null) {
        // Place as active avatar
        if (get().hasEnoughEnergy([], 'player')) { // No energy cost for initial avatar placement
          set(state => {
            const updatedHand = [...state.player.hand];
            updatedHand.splice(handIndex, 1);
            
            const avatarCard = card as AvatarCard;
            avatarCard.turnPlayed = state.turn; // Record when it was played
            
            return {
              player: {
                ...state.player,
                hand: updatedHand,
                activeAvatar: avatarCard
              }
            };
          });
          
          get().addLog(`You played ${card.name} as your active avatar.`);
        }
      } else if (player.reserveAvatars.length < 2) {
        // Place in reserve
        if (get().hasEnoughEnergy([], 'player')) { // No energy cost for reserve avatar placement
          set(state => {
            const updatedHand = [...state.player.hand];
            updatedHand.splice(handIndex, 1);
            
            const avatarCard = card as AvatarCard;
            avatarCard.turnPlayed = state.turn; // Record when it was played
            
            return {
              player: {
                ...state.player,
                hand: updatedHand,
                reserveAvatars: [...state.player.reserveAvatars, avatarCard]
              }
            };
          });
          
          get().addLog(`You placed ${card.name} in your reserve.`);
        }
      } else {
        toast.error("You already have an active avatar and two reserve avatars!");
      }
    } else {
      // Handle action cards based on their type
      switch (card.type) {
        case 'spell':
        case 'quickSpell':
          // First check if we have enough energy
          if (get().hasEnoughEnergy(card.energyCost || [], 'player')) {
            // Use the energy
            get().useEnergy(card.energyCost || [], 'player');
            
            // Remove from hand
            set(state => {
              const updatedHand = [...state.player.hand];
              updatedHand.splice(handIndex, 1);
              
              // For now, add to field cards
              return {
                player: {
                  ...state.player,
                  hand: updatedHand,
                  fieldCards: [...state.player.fieldCards, card as ActionCard]
                }
              };
            });
            
            get().addLog(`You played ${card.name}.`);
          } else {
            toast.error("Not enough energy to play this card!");
          }
          break;
      }
    }
  },
  
  // Use an avatar skill
  useAvatarSkill: (player, skillIndex, target) => {
    // Implementation for avatar skills
    toast.info('Avatar skill functionality will be implemented soon!');
  },
  
  // Add a card to energy
  addToEnergyPile: (handIndex) => {
    const { player, currentPlayer, gamePhase } = get();
    
    // Can only add to energy during your main phases
    const isMainPhase = gamePhase === 'main1' || gamePhase === 'main2';
    if (currentPlayer !== 'player' || !isMainPhase) {
      toast.error("You can only add cards to energy during your Main Phases!");
      return;
    }
    
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    
    const card = player.hand[handIndex];
    
    // Check if it's an avatar and we've already added one this turn
    if (card.type === 'avatar' && player.avatarToEnergyCount >= 1) {
      toast.error("You can only place one avatar card into energy per turn!");
      return;
    }
    
    // Move the card to energy pile
    set(state => {
      const updatedHand = [...state.player.hand];
      const cardToEnergy = updatedHand.splice(handIndex, 1)[0];
      
      // Track if we added an avatar to energy
      const avatarToEnergyCount = 
        state.player.avatarToEnergyCount + (cardToEnergy.type === 'avatar' ? 1 : 0);
      
      return {
        player: {
          ...state.player,
          hand: updatedHand,
          energyPile: [...state.player.energyPile, cardToEnergy],
          avatarToEnergyCount
        }
      };
    });
    
    get().addLog(`You added ${card.name} to your energy pile.`);
  },
  
  // Evolve an avatar (level 1 to level 2)
  evolveAvatar: (handIndex, targetAvatar) => {
    const { player, currentPlayer, gamePhase } = get();
    
    // Can only evolve during your main phases
    const isMainPhase = gamePhase === 'main1' || gamePhase === 'main2';
    if (currentPlayer !== 'player' || !isMainPhase) {
      toast.error("You can only evolve avatars during your Main Phases!");
      return;
    }
    
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    
    const level2Card = player.hand[handIndex] as AvatarCard;
    
    // Check if it's a level 2 avatar
    if (level2Card.type !== 'avatar' || level2Card.level !== 2) {
      toast.error("You can only evolve using a Level 2 avatar!");
      return;
    }
    
    // Find the target avatar to evolve
    let targetAvatarCard: AvatarCard | null = null;
    let targetLocation: 'active' | number = targetAvatar;
    
    if (targetAvatar === 'active') {
      targetAvatarCard = player.activeAvatar;
    } else if (typeof targetAvatar === 'number' && 
               targetAvatar >= 0 && 
               targetAvatar < player.reserveAvatars.length) {
      targetAvatarCard = player.reserveAvatars[targetAvatar];
    }
    
    // Check if target is valid
    if (!targetAvatarCard) {
      toast.error("Invalid evolution target!");
      return;
    }
    
    // Check if it's a level 1 avatar of the same type
    if (targetAvatarCard.level !== 1 || 
        targetAvatarCard.subType !== level2Card.subType) {
      toast.error(`You can only evolve a Level 1 ${level2Card.subType} into a Level 2 ${level2Card.subType}!`);
      return;
    }
    
    // Check if the level 1 has been in play for at least 1 turn
    if (targetAvatarCard.turnPlayed >= get().turn) {
      toast.error("You can only evolve an avatar that has been in play for at least 1 turn!");
      return;
    }
    
    // Perform the evolution
    set(state => {
      // Remove the level 2 card from hand
      const updatedHand = [...state.player.hand];
      updatedHand.splice(handIndex, 1);
      
      // Preserve important properties from level 1 avatar
      const evolvedAvatar: AvatarCard = {
        ...level2Card,
        counters: {
          ...targetAvatarCard!.counters || { damage: 0, bleed: 0, shield: 0 }
        },
        turnPlayed: state.turn
      };
      
      // Update the appropriate avatar slot
      if (targetLocation === 'active') {
        return {
          player: {
            ...state.player,
            hand: updatedHand,
            activeAvatar: evolvedAvatar,
            // Move the level 1 to the graveyard
            graveyard: [...state.player.graveyard, targetAvatarCard!]
          }
        };
      } else {
        // Update reserve avatar
        const updatedReserveAvatars = [...state.player.reserveAvatars];
        updatedReserveAvatars[targetLocation as number] = evolvedAvatar;
        
        return {
          player: {
            ...state.player,
            hand: updatedHand,
            reserveAvatars: updatedReserveAvatars,
            // Move the level 1 to the graveyard
            graveyard: [...state.player.graveyard, targetAvatarCard!]
          }
        };
      }
    });
    
    get().addLog(`You evolved ${targetAvatarCard.name} into ${level2Card.name}!`);
  },
  
  // Move to the next game phase
  nextPhase: () => {
    const { gamePhase, currentPlayer, player, opponent } = get();
    
    // Determine the next phase based on current phase
    let nextPhase: GamePhase = 'refresh';
    
    switch (gamePhase) {
      case 'setup':
        // Can only transition from setup to refresh if player has placed an active avatar
        if (player.activeAvatar) {
          nextPhase = 'refresh';
          
          // AI opponent also needs to place their starting avatar
          if (opponent.hand.length > 0 && !opponent.activeAvatar) {
            // Find a level 1 avatar in AI's hand
            const avatarIndex = opponent.hand.findIndex(
              card => card.type === 'avatar' && (card as AvatarCard).level === 1
            );
            
            if (avatarIndex !== -1) {
              const avatarCard = opponent.hand[avatarIndex] as AvatarCard;
              // Place as active avatar
              set(state => {
                const updatedHand = [...state.opponent.hand];
                updatedHand.splice(avatarIndex, 1);
                
                avatarCard.turnPlayed = state.turn;
                
                return {
                  opponent: {
                    ...state.opponent,
                    hand: updatedHand,
                    activeAvatar: avatarCard
                  }
                };
              });
              
              get().addLog(`Opponent placed ${opponent.hand[avatarIndex].name} as their active avatar.`);
              get().addLog('Setup complete. Game starting with Refresh Phase.');
            } else {
              // If AI doesn't have a level 1 avatar, create a default one
              const defaultAvatar: AvatarCard = {
                id: 'default-ai-avatar',
                name: 'Fire Spirit',
                type: 'avatar',
                element: 'fire',
                level: 1,
                subType: 'kobar',
                health: 8,
                counters: {
                  damage: 0,
                  bleed: 0,
                  shield: 0
                },
                skill1: {
                  name: 'Flame Strike',
                  energyCost: ['fire'],
                  damage: 2,
                  effect: 'Basic attack'
                },
                turnPlayed: get().turn
              };
              
              set(state => ({
                opponent: {
                  ...state.opponent,
                  activeAvatar: defaultAvatar
                }
              }));
              
              get().addLog(`Opponent placed Fire Spirit as their active avatar.`);
              get().addLog('Setup complete. Game starting with Refresh Phase.');
            }
          }
          
          // Move to refresh phase
          set({
            gamePhase: nextPhase,
          });
        } else {
          // Player must place an active avatar first
          toast.warning('You must place a Level 1 avatar as your active avatar first!');
          return; // Don't proceed to next phase
        }
        break;
        
      case 'refresh':
        nextPhase = 'draw';
        
        // Handle refresh phase actions
        set(state => {
          const playerState = currentPlayer === 'player' ? state.player : state.opponent;
          const updatedState = { ...state };
          
          // 1. Move used energy back to energy pile
          if (currentPlayer === 'player') {
            updatedState.player = {
              ...playerState,
              energyPile: [...playerState.energyPile, ...playerState.usedEnergyPile],
              usedEnergyPile: []
            };
          } else {
            updatedState.opponent = {
              ...playerState,
              energyPile: [...playerState.energyPile, ...playerState.usedEnergyPile],
              usedEnergyPile: []
            };
          }
          
          return updatedState;
        });
        
        get().addLog(`${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Refresh Phase: Energy refreshed.`);
        break;
        
      case 'draw':
        nextPhase = 'main1';
        
        // Draw a card in the draw phase
        if (currentPlayer === 'player') {
          get().drawCard('player');
        } else {
          get().drawCard('opponent');
        }
        
        get().addLog(`${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Draw Phase complete.`);
        break;
        
      case 'main1':
        nextPhase = 'battle';
        get().addLog(`${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Main Phase 1 complete.`);
        break;
        
      case 'battle':
        nextPhase = 'damage';
        get().addLog(`${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Battle Phase complete.`);
        break;
        
      case 'damage':
        nextPhase = 'main2';
        get().addLog(`${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Damage Phase complete.`);
        break;
        
      case 'main2':
        nextPhase = 'end';
        get().addLog(`${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Main Phase 2 complete.`);
        break;
        
      case 'end':
        // When ending the turn, we go back to the refresh phase but switch players
        nextPhase = 'refresh';
        
        // Handle end of turn
        get().endTurn();
        return; // exit early since endTurn will update the phase
    }
    
    // Update the phase
    set({ gamePhase: nextPhase });
  },
  
  // End the current turn and switch players
  endTurn: () => {
    const { currentPlayer, turn } = get();
    
    // Check for hand size limit (8) and discard excess cards
    set(state => {
      const playerState = currentPlayer === 'player' ? state.player : state.opponent;
      
      if (playerState.hand.length > 8) {
        // Need to discard down to 8 cards
        const cardsToDiscard = playerState.hand.length - 8;
        const updatedHand = [...playerState.hand];
        const discardedCards = updatedHand.splice(-cardsToDiscard); // Discard from the end
        
        if (currentPlayer === 'player') {
          get().addLog(`You discarded ${cardsToDiscard} cards at end of turn.`);
          
          return {
            player: {
              ...playerState,
              hand: updatedHand,
              graveyard: [...playerState.graveyard, ...discardedCards]
            }
          };
        } else {
          get().addLog(`Opponent discarded ${cardsToDiscard} cards at end of turn.`);
          
          return {
            opponent: {
              ...playerState,
              hand: updatedHand,
              graveyard: [...playerState.graveyard, ...discardedCards]
            }
          };
        }
      }
      
      return {};
    });
    
    // Reset the avatar to energy counter for the current player
    set(state => {
      if (currentPlayer === 'player') {
        return {
          player: {
            ...state.player,
            avatarToEnergyCount: 0 // Reset for next turn
          }
        };
      } else {
        return {
          opponent: {
            ...state.opponent,
            avatarToEnergyCount: 0 // Reset for next turn
          }
        };
      }
    });
    
    // Switch players
    const nextPlayer = currentPlayer === 'player' ? 'opponent' : 'player';
    const newTurn = nextPlayer === 'player' ? turn + 1 : turn;
    
    set({
      currentPlayer: nextPlayer,
      turn: newTurn,
      gamePhase: 'refresh'
    });
    
    get().addLog(`End of turn ${turn}. It's now ${nextPlayer === 'player' ? 'your' : 'opponent\'s'} turn.`);
    
    // Check if any avatars were defeated
    get().checkDefeatedAvatars();
    
    // If next player is the AI, automate their turn
    if (nextPlayer === 'opponent') {
      // Small delay before AI actions to make it more natural
      setTimeout(() => {
        // Make sure game state hasn't changed
        if (get().currentPlayer === 'opponent') {
          // Simulate AI going through each phase
          get().performAIActions();
        }
      }, 1000);
    }
  },
  
  // Perform AI actions for the opponent's turn
  performAIActions: () => {
    // AI will automatically play through its turn
    // Move on to the next phase after a short delay
    setTimeout(() => {
      get().nextPhase();
    }, 1000);
  },
  
  // Helper to format the current phase for display
  getPhaseText: () => {
    const { gamePhase, currentPlayer } = get();
    
    switch (gamePhase) {
      case 'setup':
        return 'Setup Phase';
      case 'refresh':
        return `${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Refresh Phase`;
      case 'draw':
        return `${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Draw Phase`;
      case 'main1':
        return `${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Main Phase 1`;
      case 'battle':
        return `${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Battle Phase`;
      case 'damage':
        return `${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Damage Phase`;
      case 'main2':
        return `${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} Main Phase 2`;
      case 'end':
        return `${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} End Phase`;
      default:
        return 'Unknown Phase';
    }
  },
  
  // Check if a card can be played right now
  canPlayCard: (card) => {
    const { gamePhase, currentPlayer } = get();
    
    // Can only play cards in main phases on your turn
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      return false;
    }
    
    // For now, all cards can be played in main phases if it's your turn
    return true;
  },
  
  // Check if player has enough energy to play a card
  hasEnoughEnergy: (energyCost: ElementType[], player: Player) => {
    // For now, always return true
    return true;
  },
  
  // Use energy to play a card
  useEnergy: (energyCost: ElementType[], player: Player) => {
    // For now, we'll just pretend to use energy
    return true;
  },
  
  // Check if avatars have been defeated (health - damage <= 0)
  checkDefeatedAvatars: () => {
    set(state => {
      const updatedState = { ...state };
      
      // Check player's active avatar
      if (state.player.activeAvatar) {
        const avatar = state.player.activeAvatar;
        const damage = avatar.counters?.damage || 0;
        
        if (damage >= avatar.health) {
          // Avatar defeated
          updatedState.player = {
            ...state.player,
            activeAvatar: null,
            graveyard: [...state.player.graveyard, avatar]
          };
          
          get().addLog(`Your ${avatar.name} was defeated!`);
          
          // Check if player has lost all life cards
          if (state.player.lifeCards.length === 0) {
            updatedState.winner = 'opponent';
            get().addLog('You have lost! Your opponent is victorious.');
          } else {
            // Remove a life card
            const lifeCards = [...state.player.lifeCards];
            const lostLifeCard = lifeCards.shift();
            
            updatedState.player.lifeCards = lifeCards;
            
            if (lostLifeCard) {
              get().addLog(`You lost a life card: ${lostLifeCard.name}!`);
            }
          }
        }
      }
      
      // Check opponent's active avatar
      if (state.opponent.activeAvatar) {
        const avatar = state.opponent.activeAvatar;
        const damage = avatar.counters?.damage || 0;
        
        if (damage >= avatar.health) {
          // Avatar defeated
          updatedState.opponent = {
            ...state.opponent,
            activeAvatar: null,
            graveyard: [...state.opponent.graveyard, avatar]
          };
          
          get().addLog(`Opponent's ${avatar.name} was defeated!`);
          
          // Check if opponent has lost all life cards
          if (state.opponent.lifeCards.length === 0) {
            updatedState.winner = 'player';
            get().addLog('You are victorious! Your opponent has been defeated.');
          } else {
            // Remove a life card
            const lifeCards = [...state.opponent.lifeCards];
            const lostLifeCard = lifeCards.shift();
            
            updatedState.opponent.lifeCards = lifeCards;
            
            if (lostLifeCard) {
              get().addLog(`Opponent lost a life card: ${lostLifeCard.name}!`);
            }
          }
        }
      }
      
      return updatedState;
    });
  },
  
  // Card management functions
  moveCardToEnergy: (handIndex) => {
    // Redirect to addToEnergyPile
    get().addToEnergyPile(handIndex);
  },
  
  // Discard a card to graveyard
  discardCard: (handIndex, player) => {
    set(state => {
      const targetState = player === 'player' ? state.player : state.opponent;
      
      // Make sure index is valid
      if (handIndex < 0 || handIndex >= targetState.hand.length) {
        return {};
      }
      
      const updatedHand = [...targetState.hand];
      const discardedCard = updatedHand.splice(handIndex, 1)[0];
      
      if (player === 'player') {
        return {
          player: {
            ...targetState,
            hand: updatedHand,
            graveyard: [...targetState.graveyard, discardedCard]
          }
        };
      } else {
        return {
          opponent: {
            ...targetState,
            hand: updatedHand,
            graveyard: [...targetState.graveyard, discardedCard]
          }
        };
      }
    });
  },
  
  // Selection helpers
  selectCard: (handIndex) => {
    set({ selectedCard: handIndex });
  },
  
  selectTarget: (targetId) => {
    set({ selectedTarget: targetId });
  },
  
  // Log helper
  addLog: (message) => {
    set(state => ({
      logs: [...state.logs, message]
    }));
  }
}));

// Expose the store globally for access in Card2D component
if (typeof window !== 'undefined') {
  (window as any).gameStore = useGameStore.getState();
  
  // Keep it updated
  useGameStore.subscribe((state) => {
    (window as any).gameStore = state;
  });
}