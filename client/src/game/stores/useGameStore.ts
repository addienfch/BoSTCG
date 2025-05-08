import { create } from 'zustand';
import { toast } from 'sonner';
import { ActionCard, AvatarCard, Card, ElementType, GamePhase, Player } from '../data/cardTypes';
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
    
    // Shuffle the deck before using it (using Fisher-Yates algorithm)
    const shuffledDeckCards = shuffleArray(deckCards);
    console.log('Deck shuffled before game start');
    
    // Create player state with the shuffled deck
    const playerState = initPlayerState(true);
    playerState.deck = shuffledDeckCards;
    
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
          get().addLog(`${player === 'player' ? 'You draw' : 'Opponent draws'} ${drawnCard.name}.`);
        }
      }
      
      if (player === 'player') {
        return { player: { ...targetState, deck: updatedDeck, hand: updatedHand } };
      } else {
        return { opponent: { ...targetState, deck: updatedDeck, hand: updatedHand } };
      }
    });
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
              
              // Move to graveyard after use
              return {
                player: {
                  ...state.player,
                  hand: updatedHand,
                  graveyard: [...state.player.graveyard, card]
                }
              };
            });
            
            // Apply spell effects based on the card
            if (card.type === 'spell') {
              toast.success(`You cast ${card.name}!`);
              
              // Apply damage if the opponent has an active avatar
              if (get().opponent.activeAvatar) {
                // Default damage for spells is 2
                const damageAmount = 2;
                
                set(state => {
                  const opponentAvatar = state.opponent.activeAvatar!;
                  const currentDamage = opponentAvatar.counters?.damage || 0;
                  const newDamage = currentDamage + damageAmount;
                  
                  // Update opponent avatar with new damage
                  return {
                    opponent: {
                      ...state.opponent,
                      activeAvatar: {
                        ...opponentAvatar,
                        counters: {
                          ...opponentAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                          damage: newDamage
                        }
                      }
                    }
                  };
                });
                
                // Show animation and log
                get().addLog(`${card.name} deals ${damageAmount} damage to opponent's avatar!`);
                toast.success(`Dealt ${damageAmount} damage to opponent's avatar!`);
                
                // Check if this damage defeats the avatar
                setTimeout(() => get().checkDefeatedAvatars(), 500);
              } else {
                toast.info("Spell had no effect - opponent has no active avatar.");
              }
            } else if (card.type === 'quickSpell') {
              toast.success(`You cast quick spell ${card.name}!`);
              
              // Apply effects for quick spells
              if (get().opponent.activeAvatar) {
                // Default damage for quick spells is 1
                const damageAmount = 1;
                
                set(state => {
                  const opponentAvatar = state.opponent.activeAvatar!;
                  const currentDamage = opponentAvatar.counters?.damage || 0;
                  const newDamage = currentDamage + damageAmount;
                  
                  // Update opponent avatar with new damage
                  return {
                    opponent: {
                      ...state.opponent,
                      activeAvatar: {
                        ...opponentAvatar,
                        counters: {
                          ...opponentAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                          damage: newDamage
                        }
                      }
                    }
                  };
                });
                
                // Show animation and log
                get().addLog(`${card.name} deals ${damageAmount} damage to opponent's avatar!`);
                toast.success(`Dealt ${damageAmount} damage to opponent's avatar!`);
                
                // Check if this damage defeats the avatar
                setTimeout(() => get().checkDefeatedAvatars(), 500);
              } else {
                toast.info("Quick spell had no effect - opponent has no active avatar.");
              }
            }
            
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
    const state = get();
    const currentPhase = state.gamePhase;
    const currentPlayer = state.currentPlayer;
    
    // Can only use skills during battle phase on your turn
    if (currentPhase !== 'battle' || currentPlayer !== player) {
      toast.error(`You can only use avatar skills during your Battle Phase!`);
      return;
    }
    
    // Get the player state
    const playerState = player === 'player' ? state.player : state.opponent;
    
    // Check if player has an active avatar
    if (!playerState.activeAvatar) {
      toast.error(`You need an active avatar to use a skill!`);
      return;
    }
    
    // Get the avatar and skill
    const avatar = playerState.activeAvatar;
    
    // Check if avatar is tapped (already used)
    if (avatar.isTapped) {
      toast.error(`This avatar has already used a skill this turn!`);
      return;
    }
    
    // Get the skill based on the index
    const skill = skillIndex === 1 ? avatar.skill1 : avatar.skill2;
    
    // Check if skill exists
    if (!skill) {
      toast.error(`This avatar doesn't have that skill!`);
      return;
    }
    
    // Check if player has enough energy
    if (!state.hasEnoughEnergy(skill.energyCost, player)) {
      toast.error(`Not enough energy to use this skill!`);
      return;
    }
    
    // Target opponent's avatar
    const targetAvatar = player === 'player' ? 
      state.opponent.activeAvatar : 
      state.player.activeAvatar;
    
    // Check if there's a target
    if (!targetAvatar) {
      toast.error(`No target available for skill!`);
      return;
    }
    
    // Use energy for the skill
    state.useEnergy(skill.energyCost, player);
    
    // Calculate damage
    let damageAmount = skill.damage || 0;
    
    // Apply special effects
    if (skill.effect) {
      // Example effect: "If you have 1 card or less card in hand, this attack get +1"
      if (skill.effect.includes("1 card or less") && playerState.hand.length <= 1) {
        damageAmount += 1;
        toast.info(`Skill bonus: +1 damage due to having 1 or fewer cards!`);
      }
      
      // Example effect: "This attack does 2 more damage if opponent Active Avatar were Air type."
      if (skill.effect.includes("if opponent Active Avatar were Air type") && 
          targetAvatar.element === 'air') {
        damageAmount += 2;
        toast.info(`Type bonus: +2 damage against Air type!`);
      }
    }
    
    // Apply damage to target
    set(state => {
      const opponent = player === 'player' ? 'opponent' : 'player';
      const opponentState = state[opponent];
      const opponentAvatar = opponentState.activeAvatar!;
      const currentDamage = opponentAvatar.counters?.damage || 0;
      const newDamage = currentDamage + damageAmount;
      
      // Mark avatar as tapped
      const updatePlayerState = {
        ...state[player],
        activeAvatar: {
          ...state[player].activeAvatar!,
          isTapped: true
        }
      };
      
      // Update target with damage
      const updateOpponentState = {
        ...opponentState,
        activeAvatar: {
          ...opponentAvatar,
          counters: {
            ...opponentAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
            damage: newDamage
          }
        }
      };
      
      return {
        [player]: updatePlayerState,
        [opponent]: updateOpponentState
      };
    });
    
    // Show effects
    toast.success(`${avatar.name} used ${skill.name} for ${damageAmount} damage!`);
    get().addLog(`${player === 'player' ? 'You' : 'Opponent'} used ${skill.name} for ${damageAmount} damage!`);
    
    // Check for defeated avatars
    setTimeout(() => get().checkDefeatedAvatars(), 500);
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
    if (targetAvatarCard.turnPlayed && targetAvatarCard.turnPlayed >= get().turn) {
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
                art: '/textures/cards/fire-spirit.png',
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
          
          // Show toast for refresh phase
          toast.info('Setup complete. Starting game with Refresh Phase...', { duration: 3000 });
          
          // Move to refresh phase with a 3-second delay
          setTimeout(() => {
            set({
              gamePhase: nextPhase,
            });
            
            // After the refresh phase completes, wait 3 more seconds before moving to draw phase
            toast.info('Refresh Phase - Resetting energy...', { duration: 3000 });
            
            setTimeout(() => {
              // Move to draw phase after the refresh phase delay
              set({ gamePhase: 'draw' });
              get().addLog(`Your Draw Phase`);
              
              // Draw one card during draw phase (automatically)
              get().drawCard('player', 1);
              
              // Move to main1 phase after a short delay for draw
              setTimeout(() => {
                set({ gamePhase: 'main1' });
                get().addLog(`Your Main Phase 1`);
              }, 1000);
            }, 3000);
          }, 3000);
          
          return; // Early return for this special case
        } else {
          toast.error("You need to place a Level 1 Avatar before proceeding!");
          return;
        }
        
      case 'refresh':
        nextPhase = 'draw';
        
        // Move energy from used pile back to energy pile
        const currState = get(); // Get the current state
        const currPlayer = currState.currentPlayer;
        const playerState = currPlayer === 'player' ? currState.player : currState.opponent;
        
        if (playerState.usedEnergyPile.length > 0) {
          const combinedEnergy = [...playerState.energyPile, ...playerState.usedEnergyPile];
          
          // Update the correct player
          if (currPlayer === 'player') {
            set(state => ({
              player: {
                ...state.player,
                avatarToEnergyCount: 0, // Reset avatar to energy count for new turn
                energyPile: combinedEnergy,
                usedEnergyPile: []
              }
            }));
            toast.success(`${playerState.usedEnergyPile.length} used energy cards have been refreshed!`);
          } else {
            set(state => ({
              opponent: {
                ...state.opponent,
                avatarToEnergyCount: 0, // Reset avatar to energy count for new turn
                energyPile: combinedEnergy,
                usedEnergyPile: []
              }
            }));
            toast.info(`Opponent's ${playerState.usedEnergyPile.length} used energy cards have been refreshed.`);
          }
          
          // Log the energy refresh
          get().addLog(`${currPlayer === 'player' ? 'Your' : 'Opponent\'s'} used energy has been refreshed.`);
        }
        
        // ALWAYS reset avatar tap status AND position for current player during refresh phase
        if (currPlayer === 'player') {
          // Reset player's active avatar tap status and position
          if (currState.player.activeAvatar) {
            set(state => ({
              player: {
                ...state.player,
                activeAvatar: {
                  ...state.player.activeAvatar!,
                  isTapped: false,
                  // Reset any position-related properties
                  position: undefined,
                  rotation: undefined,
                  transform: undefined,
                  translateX: undefined,
                  translateY: undefined
                }
              }
            }));
            toast.info("Your active avatar is ready for battle again!");
          }
          
          // Also reset reserve avatars
          if (currState.player.reserveAvatars.length > 0) {
            set(state => ({
              player: {
                ...state.player,
                reserveAvatars: state.player.reserveAvatars.map(avatar => ({
                  ...avatar,
                  isTapped: false,
                  // Reset any position-related properties
                  position: undefined,
                  rotation: undefined,
                  transform: undefined,
                  translateX: undefined,
                  translateY: undefined
                }))
              }
            }));
          }
        } else if (currPlayer === 'opponent') {
          // Reset opponent's active avatar tap status and position
          if (currState.opponent.activeAvatar) {
            set(state => ({
              opponent: {
                ...state.opponent,
                activeAvatar: {
                  ...state.opponent.activeAvatar!,
                  isTapped: false,
                  // Reset any position-related properties
                  position: undefined,
                  rotation: undefined,
                  transform: undefined,
                  translateX: undefined,
                  translateY: undefined
                }
              }
            }));
          }
          
          // Also reset reserve avatars
          if (currState.opponent.reserveAvatars.length > 0) {
            set(state => ({
              opponent: {
                ...state.opponent,
                reserveAvatars: state.opponent.reserveAvatars.map(avatar => ({
                  ...avatar,
                  isTapped: false,
                  // Reset any position-related properties
                  position: undefined,
                  rotation: undefined,
                  transform: undefined,
                  translateX: undefined,
                  translateY: undefined
                }))
              }
            }));
          }
        }
        
        break;
        
      case 'draw':
        nextPhase = 'main1';
        
        // Draw 1 card for the active player
        // This is now handled in the refresh => draw transition
        break;
        
      case 'main1':
        nextPhase = 'battle';
        break;
        
      case 'battle':
        nextPhase = 'main2';
        
        // Check for defeated avatars after battle
        get().checkDefeatedAvatars();
        break;
        
      case 'main2':
        nextPhase = 'end';
        break;
        
      case 'end':
        nextPhase = 'refresh';
        
        // Check for maximum hand size (8)
        const activePlayer = currentPlayer === 'player' ? player : opponent;
        if (activePlayer.hand.length > 8) {
          const excessCards = activePlayer.hand.length - 8;
          // For AI, automatically discard excess cards
          if (currentPlayer === 'opponent') {
            for (let i = 0; i < excessCards; i++) {
              // Discard the last card
              get().discardCard(activePlayer.hand.length - 1, 'opponent');
            }
          } else {
            // For player, prompt that they need to discard
            toast.error(`You have ${activePlayer.hand.length} cards! You need to discard ${excessCards} to get to 8.`);
            return; // Don't progress until discarded
          }
        }
        
        // End turn (switch players)
        get().endTurn();
        return; // Skip the phase change below since endTurn handles this
    }
    
    // Update the game phase
    set({ gamePhase: nextPhase });
    
    // Log the phase change
    get().addLog(`${currentPlayer === 'player' ? 'Your' : 'Opponent\'s'} ${get().getPhaseText()}`);
    
    // If it's the opponent's turn, have the AI perform actions after a delay
    if (currentPlayer === 'opponent') {
      setTimeout(() => {
        get().performAIActions();
      }, 1000);
    }
  },
  
  // End the current turn and switch players
  endTurn: () => {
    // Get current player before switching
    const oldCurrentPlayer = get().currentPlayer;
    const gameState = get();
    
    // First, manually refresh the energy pile for the next player
    const nextPlayer = oldCurrentPlayer === 'player' ? 'opponent' : 'player';
    
    if (nextPlayer === 'player') {
      // Refresh player's energy
      const playerEnergy = [...gameState.player.energyPile, ...gameState.player.usedEnergyPile];
      set(state => ({
        player: {
          ...state.player,
          avatarToEnergyCount: 0,
          energyPile: playerEnergy,
          usedEnergyPile: []
        }
      }));
      
      // Log this action
      if (gameState.player.usedEnergyPile.length > 0) {
        toast.success(`${gameState.player.usedEnergyPile.length} used energy cards moved back to your energy pile!`);
        get().addLog(`Your used energy has been refreshed (${gameState.player.usedEnergyPile.length} cards).`);
      }
    } else {
      // Refresh opponent's energy
      const opponentEnergy = [...gameState.opponent.energyPile, ...gameState.opponent.usedEnergyPile];
      set(state => ({
        opponent: {
          ...state.opponent,
          avatarToEnergyCount: 0,
          energyPile: opponentEnergy,
          usedEnergyPile: []
        }
      }));
      
      // Log this action
      if (gameState.opponent.usedEnergyPile.length > 0) {
        get().addLog(`Opponent's used energy has been refreshed (${gameState.opponent.usedEnergyPile.length} cards).`);
      }
    }
    
    // Now switch the current player
    set(state => {
      // Switch current player
      const newCurrentPlayer = state.currentPlayer === 'player' ? 'opponent' : 'player';
      
      // If wrapping around to player, increment turn counter
      const newTurn = newCurrentPlayer === 'player' ? state.turn + 1 : state.turn;
      
      return {
        currentPlayer: newCurrentPlayer,
        turn: newTurn,
        gamePhase: 'refresh', // Always start a turn with refresh phase
      };
    });
    
    const newCurrentPlayer = get().currentPlayer;
    
    // Log the turn change
    if (newCurrentPlayer === 'player') {
      get().addLog(`Turn ${get().turn} - Your turn begins!`);
    } else {
      get().addLog(`Opponent's turn begins!`);
    }
    
    // Show toast for the turn change
    toast.info(`${newCurrentPlayer === 'player' ? 'Your' : 'Opponent\'s'} turn`, { duration: 3000 });
    
    // If it's now the opponent's turn, run the AI after a delay
    if (newCurrentPlayer === 'opponent') {
      toast.info(`Refresh Phase - Resetting opponent's energy...`, { duration: 3000 });
      
      // Move to draw phase after a brief delay
      setTimeout(() => {
        set({ gamePhase: 'draw' });
        get().addLog(`Opponent's Draw Phase`);
        
        // Auto-draw for opponent
        get().drawCard('opponent', 1);
        
        // Move to main1 phase after a short delay for draw
        setTimeout(() => {
          set({ gamePhase: 'main1' });
          get().addLog(`Opponent's Main Phase 1`);
          
          // Start the AI decision-making process
          get().performAIActions();
        }, 1000);
      }, 3000);
    } else {
      // It's the player's turn, show refresh phase
      toast.info(`Refresh Phase - Resetting your energy...`, { duration: 3000 });
      
      // Move to draw phase after a delay
      setTimeout(() => {
        set({ gamePhase: 'draw' });
        get().addLog(`Your Draw Phase`);
        
        // Auto-draw for player
        get().drawCard('player', 1);
        
        // Move to main1 phase after a short delay for draw
        setTimeout(() => {
          set({ gamePhase: 'main1' });
          get().addLog(`Your Main Phase 1`);
        }, 1000);
      }, 3000);
    }
  },
  
  // Get a human-readable version of the current phase
  getPhaseText: () => {
    const { gamePhase } = get();
    
    switch (gamePhase) {
      case 'setup':
        return 'Setup Phase';
      case 'refresh':
        return 'Refresh Phase';
      case 'draw':
        return 'Draw Phase';
      case 'main1':
        return 'Main Phase 1';
      case 'battle':
        return 'Battle Phase';
      case 'main2':
        return 'Main Phase 2';
      case 'end':
        return 'End Phase';
      default:
        return 'Unknown Phase';
    }
  },
  
  // Check if a card can be played right now
  canPlayCard: (card) => {
    const { gamePhase, currentPlayer, player } = get();
    
    // Main phases for regular play
    const isMainPhase = gamePhase === 'main1' || gamePhase === 'main2';
    
    // Can only play cards in main phases on your turn
    if (currentPlayer !== 'player' || !isMainPhase) {
      return false;
    }
    
    // For avatars, need an active avatar first
    if (card.type === 'avatar') {
      const level = (card as AvatarCard).level;
      
      if (level === 1) {
        // Can always play level 1 avatars if we have space
        if (player.activeAvatar === null || player.reserveAvatars.length < 2) {
          return true;
        } else {
          return false; // No space for more avatars
        }
      } else if (level === 2) {
        // For level 2 avatars, need a level 1 to evolve
        if (player.activeAvatar && player.activeAvatar.level === 1) {
          return true;
        }
        if (player.reserveAvatars.some(avatar => avatar.level === 1)) {
          return true;
        }
        return false;
      }
    }
    
    // For spells, need an active avatar
    if (card.type === 'spell') {
      if (!player.activeAvatar) {
        return false; // Need an active avatar to play spells
      }
      
      // Check if we have enough energy
      const energyCost = card.energyCost || [];
      return get().hasEnoughEnergy(energyCost, 'player');
    }
    
    // For quick spells, need an active avatar
    if (card.type === 'quickSpell') {
      if (!player.activeAvatar) {
        return false; // Need an active avatar to play quick spells
      }
      
      // Check if we have enough energy
      const energyCost = card.energyCost || [];
      return get().hasEnoughEnergy(energyCost, 'player');
    }
    
    // For other card types, always allow
    return true;
  },
  
  // Check if player has enough energy to play a card
  hasEnoughEnergy: (energyCost: ElementType[], player: Player) => {
    if (energyCost.length === 0) {
      return true; // No energy cost
    }
    
    const playerState = player === 'player' ? get().player : get().opponent;
    const energyPile = playerState.energyPile;
    
    // Count available energy by element
    const energyCount: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      light: 0,
      dark: 0,
      neutral: 0
    };
    
    // Count how many of each element we have in the energy pile
    energyPile.forEach(card => {
      if (card.element) {
        energyCount[card.element as ElementType]++;
      }
      
      // All cards can be used as neutral energy
      energyCount.neutral++;
    });
    
    // Check if we have enough of each required element
    const requiredEnergy: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      light: 0,
      dark: 0,
      neutral: 0
    };
    
    // Count required energy by type
    energyCost.forEach(element => {
      requiredEnergy[element]++;
    });
    
    // Check each element
    for (const element of Object.keys(requiredEnergy) as ElementType[]) {
      if (element === 'neutral') {
        // Neutral can be paid with any energy
        const totalAvailable = Object.values(energyCount).reduce((sum, count) => sum + count, 0);
        if (totalAvailable < requiredEnergy.neutral) {
          return false;
        }
      } else {
        // For specific elements, check if we have enough
        if (energyCount[element] < requiredEnergy[element]) {
          return false;
        }
      }
    }
    
    return true;
  },
  
  // Use energy to play a card
  useEnergy: (energyCost: ElementType[], player: Player) => {
    if (energyCost.length === 0) {
      return true; // No energy cost, nothing to do
    }
    
    set(state => {
      const playerState = player === 'player' ? state.player : state.opponent;
      const energyPile = [...playerState.energyPile];
      const usedEnergyPile = [...playerState.usedEnergyPile];
      
      // Track which energy cards we've used
      const usedIndices: number[] = [];
      
      // Process each energy cost
      for (const element of energyCost) {
        // Find an energy card of the right element
        let foundIndex = -1;
        
        if (element === 'neutral') {
          // Can use any card for neutral
          foundIndex = 0; // Just use the first available card
        } else {
          // Find a card of the specified element
          foundIndex = energyPile.findIndex(card => card.element === element);
          
          // If we can't find the exact element, use any card as neutral
          if (foundIndex === -1) {
            foundIndex = 0; // Just use the first available card
          }
        }
        
        // If we found a card to use, mark it
        if (foundIndex !== -1 && !usedIndices.includes(foundIndex)) {
          usedIndices.push(foundIndex);
        }
      }
      
      // Move the used cards to the used energy pile
      usedIndices.sort((a, b) => b - a); // Sort in descending order to remove from end first
      for (const index of usedIndices) {
        const energyCard = energyPile.splice(index, 1)[0];
        usedEnergyPile.push(energyCard);
      }
      
      // Update the player state
      if (player === 'player') {
        return {
          player: {
            ...playerState,
            energyPile,
            usedEnergyPile
          }
        };
      } else {
        return {
          opponent: {
            ...playerState,
            energyPile,
            usedEnergyPile
          }
        };
      }
    });
    
    // Log the energy usage
    get().addLog(`${player === 'player' ? 'You' : 'Opponent'} used ${energyCost.length} energy to play a card.`);
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
  },
  
  // AI actions
  performAIActions: () => {
    const { currentPlayer, gamePhase, opponent } = get();
    
    // Only perform AI actions when it's the opponent's turn
    if (currentPlayer !== 'opponent') {
      return;
    }
    
    console.log('AI performing actions in', gamePhase, 'phase');
    toast.info(`AI thinking in ${gamePhase} phase...`);
    
    switch (gamePhase) {
      case 'setup':
        // AI places initial avatar - already handled in nextPhase
        break;
        
      case 'main1':
        // Try to place active avatar if needed
        if (!opponent.activeAvatar) {
          // Find level 1 avatar in hand
          const avatarIndex = opponent.hand.findIndex(
            card => card.type === 'avatar' && (card as AvatarCard).level === 1
          );
          
          if (avatarIndex !== -1) {
            const avatarCard = opponent.hand[avatarIndex] as AvatarCard;
            const cardName = avatarCard.name;
            
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
            
            get().addLog(`Opponent played ${cardName} as their active avatar.`);
            toast.info(`Opponent played ${cardName} as active avatar.`);
            
            // After placing active avatar, continue with other actions
            setTimeout(() => get().performAIActions(), 500);
            return;
          }
        }
        
        // Try to place reserve avatars if there's space
        if (opponent.reserveAvatars.length < 2) {
          // Find level 1 avatar in hand
          const avatarIndex = opponent.hand.findIndex(
            card => card.type === 'avatar' && (card as AvatarCard).level === 1
          );
          
          if (avatarIndex !== -1) {
            const avatarCard = opponent.hand[avatarIndex] as AvatarCard;
            const cardName = avatarCard.name;
            
            // Place in reserve
            set(state => {
              const updatedHand = [...state.opponent.hand];
              updatedHand.splice(avatarIndex, 1);
              
              avatarCard.turnPlayed = state.turn;
              
              return {
                opponent: {
                  ...state.opponent,
                  hand: updatedHand,
                  reserveAvatars: [...state.opponent.reserveAvatars, avatarCard]
                }
              };
            });
            
            get().addLog(`Opponent played ${cardName} as a reserve avatar.`);
            toast.info(`Opponent placed ${cardName} in reserve.`);
            
            // After placing reserve avatar, continue with other actions
            setTimeout(() => get().performAIActions(), 500);
            return;
          }
        }
        
        // Try to play a spell if we have enough energy
        if (opponent.activeAvatar) {
          // Find a spell card in hand
          const spellIndex = opponent.hand.findIndex(
            card => (card.type === 'spell' || card.type === 'quickSpell') && 
                  get().hasEnoughEnergy(card.energyCost || [], 'opponent')
          );
          
          if (spellIndex !== -1) {
            const spellCard = opponent.hand[spellIndex];
            const energyCost = spellCard.energyCost || [];
            const cardName = spellCard.name;
            
            // Use energy
            get().useEnergy(energyCost, 'opponent');
            
            // Remove from hand
            set(state => {
              const updatedHand = [...state.opponent.hand];
              updatedHand.splice(spellIndex, 1);
              
              return {
                opponent: {
                  ...state.opponent,
                  hand: updatedHand,
                  graveyard: [...state.opponent.graveyard, spellCard]
                }
              };
            });
            
            // Apply spell effects
            if (spellCard.type === 'spell') {
              if (get().player.activeAvatar) {
                set(state => {
                  const playerAvatar = state.player.activeAvatar!;
                  const currentDamage = playerAvatar.counters?.damage || 0;
                  
                  return {
                    player: {
                      ...state.player,
                      activeAvatar: {
                        ...playerAvatar,
                        counters: {
                          ...playerAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                          damage: currentDamage + 2
                        }
                      }
                    }
                  };
                });
                
                get().addLog(`Opponent's ${cardName} deals 2 damage to your avatar!`);
                toast.info(`Opponent cast ${cardName}, dealing 2 damage to your avatar!`);
              }
            } else if (spellCard.type === 'quickSpell') {
              if (get().player.activeAvatar) {
                set(state => {
                  const playerAvatar = state.player.activeAvatar!;
                  const currentDamage = playerAvatar.counters?.damage || 0;
                  
                  return {
                    player: {
                      ...state.player,
                      activeAvatar: {
                        ...playerAvatar,
                        counters: {
                          ...playerAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                          damage: currentDamage + 1
                        }
                      }
                    }
                  };
                });
                
                get().addLog(`Opponent's ${cardName} deals 1 damage to your avatar!`);
                toast.info(`Opponent cast ${cardName}, dealing 1 damage to your avatar!`);
              }
            }
            
            // After playing a spell, continue with other actions
            setTimeout(() => get().performAIActions(), 500);
            return;
          }
        }
        
        // Add energy if we have cards left
        if (opponent.hand.length > 0 && opponent.avatarToEnergyCount < 1) {
          // Find a good card to use as energy - prioritize non-avatars
          let energyIndex = opponent.hand.findIndex(card => card.type !== 'avatar');
          
          // If no non-avatar cards, use any card
          if (energyIndex === -1) {
            energyIndex = 0;
          }
          
          if (energyIndex !== -1) {
            const energyCard = opponent.hand[energyIndex];
            const isAvatar = energyCard.type === 'avatar';
            const cardName = energyCard.name;
            
            // Add to energy
            set(state => {
              const updatedHand = [...state.opponent.hand];
              updatedHand.splice(energyIndex, 1);
              
              return {
                opponent: {
                  ...state.opponent,
                  hand: updatedHand,
                  energyPile: [...state.opponent.energyPile, energyCard],
                  avatarToEnergyCount: state.opponent.avatarToEnergyCount + (isAvatar ? 1 : 0)
                }
              };
            });
            
            get().addLog(`Opponent added ${cardName} to their energy pile.`);
            toast.info(`Opponent added a card to their energy pile.`);
            
            // After adding energy, move to next phase
            setTimeout(() => get().nextPhase(), 1000);
            return;
          }
        }
        
        // If no other actions, move to battle phase
        setTimeout(() => get().nextPhase(), 1000);
        break;
        
      case 'battle':
        // TODO: Implement battle phase AI actions
        
        // For now, just move to the next phase
        setTimeout(() => get().nextPhase(), 1000);
        break;
        
      case 'main2':
        // Additional card playing in main2
        // For the basic version, just move to the next phase
        setTimeout(() => get().nextPhase(), 1000);
        break;
        
      default:
        // For other phases, just move to the next phase after a delay
        setTimeout(() => get().nextPhase(), 1000);
        break;
    }
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