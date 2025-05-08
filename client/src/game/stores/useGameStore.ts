import { create } from 'zustand';
import { fireAvatarCards, fireActionCards } from '../data/fireCards';
import { AvatarCard, ActionCard, Card, GamePhase, Player, ElementType } from '../data/cardTypes';
import { toast } from 'sonner';

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

// Helper function to initialize a default deck
const initializeDefaultDeck = (isPlayer: boolean): Card[] => {
  // For now, just use the fire cards
  const avatars = fireAvatarCards.filter(card => card.level === 1);
  const actions = fireActionCards;
  
  // Create a deck with a minimum of 40 cards
  // Balance between avatars and action cards
  const deck: Card[] = [];
  
  // Add copies of level 1 avatars (at least 2 of each)
  avatars.forEach(avatar => {
    // Add 3 copies of each level 1 avatar for more consistency
    for (let i = 1; i <= 3; i++) {
      deck.push({...avatar, id: `${avatar.id}-${i}`});
    }
  });
  
  // Add 4 copies of each action card
  actions.forEach(action => {
    for (let i = 0; i < 4; i++) {
      deck.push({...action, id: `${action.id}-${i+1}`});
    }
  });
  
  // Also add 1 copy of each level 2 avatar for evolution possibilities
  if (isPlayer) {
    const level2Avatars = fireAvatarCards.filter(card => card.level === 2);
    level2Avatars.forEach(avatar => {
      deck.push({...avatar, id: `${avatar.id}-1`});
    });
  }
  
  // If deck size is less than 40, add more action cards until we reach minimum size
  if (deck.length < 40) {
    const cardsNeeded = 40 - deck.length;
    let index = 0;
    
    for (let i = 0; i < cardsNeeded; i++) {
      const action = actions[index % actions.length]; // Cycle through action cards
      const copyId = Math.floor(i / actions.length) + 5; // Start from copy #5
      deck.push({...action, id: `${action.id}-extra-${copyId}`});
      index++;
    }
  }
  
  console.log(`Initialized deck with ${deck.length} cards (minimum 40 required)`);
  return deck;
};

// Function to initialize a deck from a deck configuration
const initializeDeck = (isPlayer: boolean, deckConfig?: { name: string, cards: Card[] }): Card[] => {
  // If no deck config is provided, use default deck
  if (!deckConfig) {
    return initializeDefaultDeck(isPlayer);
  }
  
  // Use the provided deck configuration
  if (deckConfig.cards.length >= 40) {
    return [...deckConfig.cards]; // Return a copy to avoid mutations
  } else {
    console.warn(`Deck ${deckConfig.name} has less than 40 cards. Using default deck instead.`);
    return initializeDefaultDeck(isPlayer);
  }
};

// Function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Initialize a new player state
const initPlayerState = (isPlayer: boolean): PlayerState => {
  const deck = initializeDeck(isPlayer);
  
  return {
    health: 20,
    deck: shuffleArray(deck),
    hand: [],
    energyPile: [],
    usedEnergyPile: [],
    activeAvatar: null,
    reserveAvatars: [],
    fieldCards: [],
    lifeCards: [],
    graveyard: [],
    avatarToEnergyCount: 0, // Track avatars moved to energy this turn
    isAI: !isPlayer  // If not player, it's AI-controlled
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
    // Reset game state
    set(state => ({
      currentPlayer: 'player',
      gamePhase: 'setup', // Start with the setup phase
      turn: 1,
      winner: null,
      player: initPlayerState(true),
      opponent: initPlayerState(false),
      selectedCard: null,
      selectedTarget: null,
      logs: ['Game started! Place your Level 1 avatar as your active avatar to begin.']
    }));
    
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
            if (get().useEnergy(card.energyCost || [], 'player')) {
              // Remove card from hand
              set(state => {
                const updatedHand = [...state.player.hand];
                updatedHand.splice(handIndex, 1);
                
                // Add to graveyard
                return {
                  player: {
                    ...state.player,
                    hand: updatedHand,
                    graveyard: [...state.player.graveyard, card]
                  }
                };
              });
              
              // Apply spell effect (would be complex based on card)
              toast.success(`You cast ${card.name}!`);
              get().addLog(`You played ${card.name} from your hand.`);
              
              // For now, handle spell effects manually
              if (card.name === 'Burn Ball') {
                // Direct damage to opponent's active avatar
                if (get().opponent.activeAvatar) {
                  set(state => {
                    const opponentAvatar = { ...state.opponent.activeAvatar } as AvatarCard;
                    const damage = 2;
                    const currentDamage = opponentAvatar.counters?.damage || 0;
                    
                    opponentAvatar.counters = {
                      ...opponentAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                      damage: currentDamage + damage
                    };
                    
                    return {
                      opponent: {
                        ...state.opponent,
                        activeAvatar: opponentAvatar
                      }
                    };
                  });
                  
                  get().addLog(`Burn Ball dealt 2 damage to opponent's ${get().opponent.activeAvatar?.name}!`);
                }
              } else if (card.name === 'Falling Fireball') {
                // Damage to all opponent avatars
                set(state => {
                  let opponent = { ...state.opponent };
                  const damage = 2;
                  
                  // Damage active avatar
                  if (opponent.activeAvatar) {
                    const activeAvatar = { ...opponent.activeAvatar };
                    const currentDamage = activeAvatar.counters?.damage || 0;
                    
                    activeAvatar.counters = {
                      ...activeAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                      damage: currentDamage + damage
                    };
                    
                    opponent.activeAvatar = activeAvatar;
                  }
                  
                  // Damage reserve avatars
                  const updatedReserves = opponent.reserveAvatars.map(avatar => {
                    const updatedAvatar = { ...avatar };
                    const currentDamage = updatedAvatar.counters?.damage || 0;
                    
                    updatedAvatar.counters = {
                      ...updatedAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                      damage: currentDamage + damage
                    };
                    
                    return updatedAvatar;
                  });
                  
                  opponent.reserveAvatars = updatedReserves;
                  
                  return { opponent };
                });
                
                get().addLog('Falling Fireball dealt 2 damage to all opponent avatars!');
              }
            }
          } else {
            toast.error("You don't have enough energy to play this card!");
          }
          break;
          
        case 'field':
          // Field cards are placed in the field zone
          if (get().hasEnoughEnergy(card.energyCost || [], 'player')) {
            // Use the energy
            if (get().useEnergy(card.energyCost || [], 'player')) {
              // Remove card from hand
              set(state => {
                const updatedHand = [...state.player.hand];
                updatedHand.splice(handIndex, 1);
                
                // Add to field
                return {
                  player: {
                    ...state.player,
                    hand: updatedHand,
                    fieldCards: [...state.player.fieldCards, card as ActionCard]
                  }
                };
              });
              
              toast.success(`You played ${card.name} to your field!`);
              get().addLog(`You played ${card.name} to your field zone.`);
            }
          } else {
            toast.error("You don't have enough energy to play this card!");
          }
          break;
          
        case 'ritualArmor':
        case 'equipment':
        case 'item':
          // These would have more complex implementations
          toast.info(`${card.type} cards are not fully implemented yet.`);
          break;
      }
    }
  },
  
  // Use avatar skill
  useAvatarSkill: (player, skillIndex, target) => {
    const state = get();
    const currentPlayerState = player === 'player' ? state.player : state.opponent;
    const avatar = currentPlayerState.activeAvatar;
    
    // Check if the avatar exists and isn't tapped
    if (!avatar) {
      toast.error("No active avatar to use skills!");
      return false;
    }
    
    if (avatar.isTapped) {
      toast.error("This avatar has already used a skill this turn!");
      return false;
    }
    
    // Get the skill
    const skill = skillIndex === 1 ? avatar.skill1 : avatar.skill2;
    
    if (!skill) {
      toast.error("This avatar doesn't have that skill!");
      return false;
    }
    
    // Check if we have enough energy for the skill
    if (!get().hasEnoughEnergy(skill.energyCost, player)) {
      toast.error("Not enough energy to use this skill!");
      return false;
    }
    
    // Use the energy
    if (get().useEnergy(skill.energyCost, player)) {
      // Apply skill effects
      const targetPlayer = player === 'player' ? 'opponent' : 'player';
      const targetPlayerState = targetPlayer === 'player' ? state.player : state.opponent;
      const targetAvatar = targetPlayerState.activeAvatar;
      
      if (!targetAvatar) {
        toast.error("No target avatar to attack!");
        return false;
      }
      
      // Update the avatar to be tapped
      set(state => {
        const updatedState = {...state};
        const playerKey = player === 'player' ? 'player' : 'opponent';
        
        if (updatedState[playerKey].activeAvatar) {
          updatedState[playerKey].activeAvatar = {
            ...updatedState[playerKey].activeAvatar as AvatarCard,
            isTapped: true
          };
        }
        
        return updatedState;
      });
      
      // Apply damage to target
      set(state => {
        const targetKey = targetPlayer === 'player' ? 'player' : 'opponent';
        const updatedState = {...state};
        
        if (updatedState[targetKey].activeAvatar) {
          const targetAvatar = updatedState[targetKey].activeAvatar as AvatarCard;
          const currentDamage = targetAvatar.counters?.damage || 0;
          
          // Calculate damage
          let damageAmount = skill.damage;
          
          // Apply extra damage based on skill effects
          if (skill.effect && skill.effect.includes('Bleed counter') && (targetAvatar.counters?.bleed || 0) > 0) {
            damageAmount += 2; // For skills like Explosion that do extra damage to bleeding targets
          }
          
          if (skill.effect && skill.effect.includes('Air type') && targetAvatar.element === 'air') {
            damageAmount += 2; // For skills that do extra damage to air types
          }
          
          updatedState[targetKey].activeAvatar = {
            ...targetAvatar,
            counters: {
              ...targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
              damage: currentDamage + damageAmount
            }
          };
        }
        
        return updatedState;
      });
      
      // Apply special effects from skills
      if (skill.effect) {
        // Handle bleed counter effects
        if (skill.effect.includes('Bleed Counter') || skill.effect.includes('Bleed counter')) {
          set(state => {
            const targetKey = targetPlayer === 'player' ? 'player' : 'opponent';
            const updatedState = {...state};
            
            if (updatedState[targetKey].activeAvatar) {
              const targetAvatar = updatedState[targetKey].activeAvatar as AvatarCard;
              const currentBleed = targetAvatar.counters?.bleed || 0;
              
              // Apply bleed counters (max 2)
              const newBleed = Math.min(currentBleed + 2, 2);
              
              updatedState[targetKey].activeAvatar = {
                ...targetAvatar,
                counters: {
                  ...targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                  bleed: newBleed
                }
              };
            }
            
            return updatedState;
          });
          
          get().addLog(`Applied 2 bleed counters to opponent's ${targetAvatar?.name}!`);
        }
        
        // Handle healing effects
        if (skill.effect.includes('heal')) {
          set(state => {
            const playerKey = player === 'player' ? 'player' : 'opponent';
            const updatedState = {...state};
            
            if (updatedState[playerKey].activeAvatar) {
              const currentAvatar = updatedState[playerKey].activeAvatar as AvatarCard;
              const currentDamage = currentAvatar.counters?.damage || 0;
              
              // Reduce damage by healing amount (minimum 0)
              const healAmount = 2; // From Heal Aura
              const newDamage = Math.max(currentDamage - healAmount, 0);
              
              updatedState[playerKey].activeAvatar = {
                ...currentAvatar,
                counters: {
                  ...currentAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                  damage: newDamage
                }
              };
            }
            
            return updatedState;
          });
          
          get().addLog(`Healed 2 damage from your ${avatar.name}!`);
        }
      }
      
      get().addLog(`${player === 'player' ? 'You' : 'Opponent'} used ${skill.name} dealing ${skill.damage} damage!`);
      
      // Check if any avatar is defeated
      get().checkDefeatedAvatars();
      
      return true;
    }
    
    return false;
  },
  
  // Add a card from hand to energy pile
  addToEnergyPile: (handIndex) => {
    const { player, currentPlayer, gamePhase, turn } = get();
    
    // Can only add energy during your turn and main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      toast.error("You can only add energy during your Main Phases!");
      return;
    }
    
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    
    const card = player.hand[handIndex];
    
    // Check if we've already added an avatar to energy this turn
    if (card.type === 'avatar') {
      if (player.avatarToEnergyCount >= 1) {
        toast.error("You can only add one avatar card to energy per turn!");
        return;
      }
    }
    
    // Remove from hand and add to energy pile
    set(state => {
      const updatedHand = [...state.player.hand];
      updatedHand.splice(handIndex, 1);
      
      return {
        player: {
          ...state.player,
          hand: updatedHand,
          energyPile: [...state.player.energyPile, card],
          // Increment avatar to energy counter if this is an avatar
          avatarToEnergyCount: card.type === 'avatar' 
            ? state.player.avatarToEnergyCount + 1 
            : state.player.avatarToEnergyCount
        }
      };
    });
    
    get().addLog(`Turn ${turn}: You added ${card.name} ${card.type === 'avatar' ? '(avatar)' : ''} to your energy pile.`);
  },
  
  // Evolve an avatar from level 1 to level 2
  evolveAvatar: (handIndex, targetAvatar) => {
    const { player, currentPlayer, gamePhase } = get();
    
    // Can only evolve during your turn and main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      toast.error("You can only evolve avatars during your Main Phases!");
      return;
    }
    
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    
    const card = player.hand[handIndex];
    
    // Check if the card is a level 2 avatar
    if (card.type !== 'avatar' || (card as AvatarCard).level !== 2) {
      toast.error("You can only evolve using a Level 2 Avatar card!");
      return;
    }
    
    const level2Avatar = card as AvatarCard;
    
    // Get the target avatar
    let targetAvatarCard: AvatarCard | null = null;
    let targetIndex: number | null = null;
    
    if (targetAvatar === 'active') {
      targetAvatarCard = player.activeAvatar;
    } else if (typeof targetAvatar === 'number' && targetAvatar >= 0 && targetAvatar < player.reserveAvatars.length) {
      targetAvatarCard = player.reserveAvatars[targetAvatar];
      targetIndex = targetAvatar;
    }
    
    if (!targetAvatarCard) {
      toast.error("Invalid target avatar!");
      return;
    }
    
    // Check evolution requirements
    // 1. Target must be level 1
    if (targetAvatarCard.level !== 1) {
      toast.error("You can only evolve Level 1 Avatars!");
      return;
    }
    
    // 2. Elements must match (except colorless)
    if (level2Avatar.element !== 'neutral' && level2Avatar.element !== targetAvatarCard.element) {
      toast.error("The elements must match to evolve!");
      return;
    }
    
    // 3. Subtypes must match
    if (level2Avatar.baseType !== targetAvatarCard.subType) {
      toast.error("The subtypes must match to evolve!");
      return;
    }
    
    // 4. Can't evolve in the same turn it was played
    // This would need to track when avatars were played - simplified for now
    
    // Perform the evolution
    set(state => {
      const updatedHand = [...state.player.hand];
      updatedHand.splice(handIndex, 1);
      
      const updatedState = {
        player: {
          ...state.player,
          hand: updatedHand
        }
      };
      
      // Preserve damage counters
      const currentCounters = targetAvatarCard?.counters || { damage: 0, bleed: 0, shield: 0 };
      
      const evolvedAvatar: AvatarCard = {
        ...level2Avatar,
        counters: currentCounters
      };
      
      // Update the correct avatar
      if (targetAvatar === 'active') {
        updatedState.player.activeAvatar = evolvedAvatar;
      } else if (typeof targetAvatar === 'number' && targetIndex !== null) {
        const updatedReserves = [...state.player.reserveAvatars];
        updatedReserves[targetIndex] = evolvedAvatar;
        updatedState.player.reserveAvatars = updatedReserves;
      }
      
      return updatedState;
    });
    
    get().addLog(`You evolved ${targetAvatarCard.name} into ${level2Avatar.name}!`);
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
          get().addLog('Setup complete. Game starting with Refresh Phase.');
          
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
              
              get().addLog(`Opponent placed ${avatarCard.name} as their active avatar.`);
            } else {
              // If AI doesn't have a level 1 avatar, draw until it finds one
              let foundAvatar = false;
              let drawAttempts = 0;
              
              while (!foundAvatar && drawAttempts < 10) {
                // Draw a card for AI
                set(state => {
                  if (state.opponent.deck.length === 0) return state;
                  
                  const newCard = state.opponent.deck[0];
                  const updatedDeck = [...state.opponent.deck.slice(1)];
                  const updatedHand = [...state.opponent.hand, newCard];
                  
                  return {
                    opponent: {
                      ...state.opponent,
                      deck: updatedDeck,
                      hand: updatedHand
                    }
                  };
                });
                
                // Check if we drew a level 1 avatar
                const aiHand = get().opponent.hand;
                const newAvatarIndex = aiHand.findIndex(
                  card => card.type === 'avatar' && (card as AvatarCard).level === 1
                );
                
                if (newAvatarIndex !== -1) {
                  foundAvatar = true;
                  const avatarCard = aiHand[newAvatarIndex] as AvatarCard;
                  
                  // Place as active avatar
                  set(state => {
                    const updatedHand = [...state.opponent.hand];
                    updatedHand.splice(newAvatarIndex, 1);
                    
                    avatarCard.turnPlayed = state.turn;
                    
                    return {
                      opponent: {
                        ...state.opponent,
                        hand: updatedHand,
                        activeAvatar: avatarCard
                      }
                    };
                  });
                  
                  get().addLog(`Opponent drew and placed ${avatarCard.name} as their active avatar.`);
                }
                
                drawAttempts++;
              }
              
              if (!foundAvatar) {
                // If still no avatar found, create one for the AI
                const defaultAvatar: AvatarCard = {
                  id: 'default-ai-avatar',
                  name: 'Fire Spirit',
                  type: 'avatar',
                  element: 'fire',
                  level: 1,
                  subType: 'kobar',
                  health: 8,
                  art: '/textures/cards/kobar-trainee.png',
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
              }
            }
          }
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
          
          // 2. Process bleed counters
          // For player
          if (state.player.activeAvatar && state.player.activeAvatar.counters?.bleed) {
            const avatar = state.player.activeAvatar;
            const bleedCount = avatar.counters?.bleed || 0;
            
            if (bleedCount > 0) {
              // Apply damage from bleed
              updatedState.player.activeAvatar = {
                ...avatar,
                counters: {
                  ...avatar.counters || { damage: 0, bleed: 0, shield: 0 },
                  bleed: bleedCount - 1, // Reduce bleed counter by 1
                  damage: (avatar.counters?.damage || 0) + 1 // Add 1 damage
                }
              };
              
              get().addLog(`Your ${avatar.name} took 1 damage from bleeding!`);
            }
          }
          
          // For opponent
          if (state.opponent.activeAvatar && state.opponent.activeAvatar.counters?.bleed) {
            const avatar = state.opponent.activeAvatar;
            const bleedCount = avatar.counters?.bleed || 0;
            
            if (bleedCount > 0) {
              // Apply damage from bleed
              updatedState.opponent.activeAvatar = {
                ...avatar,
                counters: {
                  ...avatar.counters || { damage: 0, bleed: 0, shield: 0 },
                  bleed: bleedCount - 1, // Reduce bleed counter by 1
                  damage: (avatar.counters?.damage || 0) + 1 // Add 1 damage
                }
              };
              
              get().addLog(`Opponent's ${avatar.name} took 1 damage from bleeding!`);
            }
          }
          
          // 3. Untap (refresh) avatars
          if (currentPlayer === 'player' && updatedState.player.activeAvatar) {
            updatedState.player.activeAvatar = {
              ...updatedState.player.activeAvatar,
              isTapped: false
            };
          } else if (currentPlayer === 'opponent' && updatedState.opponent.activeAvatar) {
            updatedState.opponent.activeAvatar = {
              ...updatedState.opponent.activeAvatar,
              isTapped: false
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
          
          // Automatically advance to main phase after player draws
          setTimeout(() => {
            if (get().gamePhase === 'draw' && get().currentPlayer === 'player') {
              get().nextPhase(); // Move to Main Phase 1 automatically
            }
          }, 500); // Short delay for better UX
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
    // Get the current state
    const { opponent, gamePhase } = get();
    
    if (gamePhase === 'refresh') {
      // Advance to draw phase
      get().nextPhase();
      
      // Short delay before next action
      setTimeout(() => {
        if (get().gamePhase === 'draw') {
          // Draw phase will automatically draw a card
          // Next go to main phase 1
          get().nextPhase();
        }
      }, 1000);
      
      // Short delay before next action
      setTimeout(() => {
        if (get().gamePhase === 'main1') {
          // In main phase 1, AI will:
          // 1. Place an avatar if needed
          // 2. Play action cards
          // 3. Move a card to energy if energy is low
          
          // Place avatar if needed
          if (!opponent.activeAvatar) {
            // Find a level 1 avatar to play
            const avatarIndex = opponent.hand.findIndex(
              card => card.type === 'avatar' && (card as AvatarCard).level === 1
            );
            
            if (avatarIndex !== -1) {
              const avatarCard = opponent.hand[avatarIndex];
              
              // Place as active avatar
              set(state => {
                const updatedHand = [...state.opponent.hand];
                updatedHand.splice(avatarIndex, 1);
                
                return {
                  opponent: {
                    ...state.opponent,
                    hand: updatedHand,
                    activeAvatar: avatarCard as AvatarCard
                  }
                };
              });
              
              get().addLog(`Opponent played ${avatarCard.name} as their active avatar.`);
            }
          } else if (opponent.reserveAvatars.length < 2) {
            // Try to place a reserve avatar if we have room
            const avatarIndex = opponent.hand.findIndex(
              card => card.type === 'avatar' && (card as AvatarCard).level === 1
            );
            
            if (avatarIndex !== -1) {
              const avatarCard = opponent.hand[avatarIndex];
              
              // Place in reserve
              set(state => {
                const updatedHand = [...state.opponent.hand];
                updatedHand.splice(avatarIndex, 1);
                
                return {
                  opponent: {
                    ...state.opponent,
                    hand: updatedHand,
                    reserveAvatars: [...state.opponent.reserveAvatars, avatarCard as AvatarCard]
                  }
                };
              });
              
              get().addLog(`Opponent placed ${avatarCard.name} in their reserve.`);
            }
          }
          
          // Check for evolving level 1 avatars
          const level2AvatarIndex = opponent.hand.findIndex(
            card => card.type === 'avatar' && (card as AvatarCard).level === 2
          );
          
          if (level2AvatarIndex !== -1) {
            const level2Avatar = opponent.hand[level2AvatarIndex] as AvatarCard;
            
            // Try evolving the active avatar if it matches
            if (opponent.activeAvatar && 
                opponent.activeAvatar.level === 1 && 
                (level2Avatar.baseType === opponent.activeAvatar.subType || level2Avatar.element === opponent.activeAvatar.element)) {
              
              // Only evolve if avatar has been in play for at least 1 turn
              const avatarTurnPlayed = opponent.activeAvatar.turnPlayed || 0;
              if (get().turn > avatarTurnPlayed + 1) {
                // Evolve active avatar
                set(state => {
                  const updatedHand = [...state.opponent.hand];
                  updatedHand.splice(level2AvatarIndex, 1);
                  
                  // Keep damage counters
                  const currentCounters = state.opponent.activeAvatar?.counters || { damage: 0, bleed: 0, shield: 0 };
                  
                  return {
                    opponent: {
                      ...state.opponent,
                      hand: updatedHand,
                      activeAvatar: {
                        ...level2Avatar,
                        counters: currentCounters
                      }
                    }
                  };
                });
                
                get().addLog(`Opponent evolved their active avatar into ${level2Avatar.name}!`);
              }
            }
          }
          
          // Add a card to energy if energy is low and we haven't already added an avatar this turn
          if (opponent.energyPile.length < 3 && opponent.avatarToEnergyCount === 0) {
            // First try to add a non-avatar card to energy
            const nonAvatarIndex = opponent.hand.findIndex(card => card.type !== 'avatar');
            
            if (nonAvatarIndex !== -1) {
              const cardToEnergy = opponent.hand[nonAvatarIndex];
              
              // Move to energy pile
              set(state => {
                const updatedHand = [...state.opponent.hand];
                updatedHand.splice(nonAvatarIndex, 1);
                
                return {
                  opponent: {
                    ...state.opponent,
                    hand: updatedHand,
                    energyPile: [...state.opponent.energyPile, cardToEnergy]
                  }
                };
              });
              
              get().addLog(`Opponent added a card to their energy pile.`);
            } else if (opponent.hand.length > 2) {
              // If no non-avatar card but we have extras, add an avatar to energy
              const avatarToEnergy = opponent.hand[0]; // Just take the first card
              
              // Move to energy pile
              set(state => {
                const updatedHand = [...state.opponent.hand];
                updatedHand.splice(0, 1);
                
                return {
                  opponent: {
                    ...state.opponent,
                    hand: updatedHand,
                    energyPile: [...state.opponent.energyPile, avatarToEnergy],
                    avatarToEnergyCount: state.opponent.avatarToEnergyCount + 1
                  }
                };
              });
              
              get().addLog(`Opponent added an avatar to their energy pile.`);
            }
          }
          
          // Try to play a spell card if we have energy
          if (opponent.energyPile.length > 0) {
            const spellIndex = opponent.hand.findIndex(
              card => (card.type === 'spell' || card.type === 'quickSpell') && 
                     get().hasEnoughEnergy(card.energyCost || [], 'opponent')
            );
            
            if (spellIndex !== -1) {
              const spellCard = opponent.hand[spellIndex];
              
              // Use energy for the spell
              if (get().useEnergy(spellCard.energyCost || [], 'opponent')) {
                // Cast the spell
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
                
                get().addLog(`Opponent cast ${spellCard.name}!`);
                
                // Apply spell effects
                if (spellCard.name.includes('Burn') || spellCard.name.includes('Fire')) {
                  // Deal damage to player's avatar
                  if (get().player.activeAvatar) {
                    set(state => {
                      const playerAvatar = { ...state.player.activeAvatar } as AvatarCard;
                      const damage = 2; // Default damage for spells
                      const currentDamage = playerAvatar.counters?.damage || 0;
                      
                      playerAvatar.counters = {
                        ...playerAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
                        damage: currentDamage + damage
                      };
                      
                      return {
                        player: {
                          ...state.player,
                          activeAvatar: playerAvatar
                        }
                      };
                    });
                    
                    get().addLog(`${spellCard.name} dealt 2 damage to your ${get().player.activeAvatar?.name}!`);
                  }
                }
              }
            }
          }
          
          // Skip battle phase for now (would be implemented with avatar skill usage)
          // Go directly to end phase
          setTimeout(() => {
            get().nextPhase(); // Main1 -> Battle
            setTimeout(() => {
              get().nextPhase(); // Battle -> Damage
              setTimeout(() => {
                get().nextPhase(); // Damage -> Main2
                setTimeout(() => {
                  get().nextPhase(); // Main2 -> End
                  setTimeout(() => {
                    get().nextPhase(); // End -> Refresh (Player's turn)
                  }, 500);
                }, 500);
              }, 500);
            }, 500);
          }, 1500);
        }
      }, 1500);
    }
  },
  
  // Helper function to get text description of current phase
  getPhaseText: () => {
    const { gamePhase, currentPlayer } = get();
    const playerText = currentPlayer === 'player' ? 'Your' : 'Opponent\'s';
    
    switch (gamePhase) {
      case 'setup': return 'Setup Phase - Place a Level 1 Avatar';
      case 'refresh': return `${playerText} Refresh Phase`;
      case 'draw': return `${playerText} Draw Phase`;
      case 'main1': return `${playerText} Main Phase 1`;
      case 'battle': return `${playerText} Battle Phase`;
      case 'damage': return `${playerText} Damage Phase`;
      case 'main2': return `${playerText} Main Phase 2`;
      case 'end': return `${playerText} End Phase`;
      default: return 'Unknown Phase';
    }
  },
  
  // Check if a card can be played based on current game state
  canPlayCard: (card: Card) => {
    const { currentPlayer, gamePhase, player } = get();
    
    // Can only play cards during your turn
    if (currentPlayer !== 'player') {
      return false;
    }
    
    // During setup phase, only level 1 avatars can be played
    if (gamePhase === 'setup') {
      return card.type === 'avatar' && (card as AvatarCard).level === 1 && player.activeAvatar === null;
    }
    
    // Different card types have different play restrictions
    switch (card.type) {
      case 'avatar':
        // Avatars can only be played during main phases
        return gamePhase === 'main1' || gamePhase === 'main2';
        
      case 'spell':
      case 'field':
      case 'equipment':
      case 'ritualArmor':
      case 'item':
        // Regular action cards can only be played during main phases
        return gamePhase === 'main1' || gamePhase === 'main2';
        
      case 'quickSpell':
        // Quick spells can be played anytime
        return true;
        
      default:
        return false;
    }
  },
  
  // Check if a player has enough energy for a cost
  hasEnoughEnergy: (energyCost: ElementType[], player: Player) => {
    const state = get();
    const playerState = player === 'player' ? state.player : state.opponent;
    
    // Count available energy by type
    const availableEnergy: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      ground: 0,
      air: 0,
      neutral: 0
    };
    
    // Count energy in energy pile
    playerState.energyPile.forEach(card => {
      if (card.type === 'avatar') {
        availableEnergy[card.element]++;
      }
    });
    
    // Check if we have enough of each type
    let neutralEnergy = availableEnergy.neutral; // Neutral energy can be used for any type
    
    for (const type of energyCost) {
      if (type === 'neutral') {
        // Can use any energy for neutral
        const totalEnergy = Object.values(availableEnergy).reduce((sum, val) => sum + val, 0);
        if (totalEnergy <= 0) {
          return false;
        }
        // Reduce any energy type (preferably non-specific ones)
        if (availableEnergy.neutral > 0) {
          availableEnergy.neutral--;
        } else if (availableEnergy.fire > 0) {
          availableEnergy.fire--;
        } else if (availableEnergy.water > 0) {
          availableEnergy.water--;
        } else if (availableEnergy.ground > 0) {
          availableEnergy.ground--;
        } else if (availableEnergy.air > 0) {
          availableEnergy.air--;
        }
      } else {
        // For specific types
        if (availableEnergy[type] > 0) {
          availableEnergy[type]--;
        } else if (neutralEnergy > 0) {
          neutralEnergy--; // Use neutral energy if needed
        } else {
          return false; // Not enough energy
        }
      }
    }
    
    return true;
  },
  
  // Use energy from the energy pile
  useEnergy: (energyCost: ElementType[], player: Player) => {
    if (!get().hasEnoughEnergy(energyCost, player)) {
      return false;
    }
    
    set(state => {
      const playerState = player === 'player' ? state.player : state.opponent;
      const energyPile = [...playerState.energyPile];
      const usedEnergyPile = [...playerState.usedEnergyPile];
      
      // Track which energies we still need to use
      const remainingCost = [...energyCost];
      
      // First use specific energy types
      for (let i = remainingCost.length - 1; i >= 0; i--) {
        const type = remainingCost[i];
        if (type !== 'neutral') {
          // Find a card of this type
          const cardIndex = energyPile.findIndex(card => card.element === type);
          if (cardIndex >= 0) {
            // Move card to used energy pile
            usedEnergyPile.push(energyPile[cardIndex]);
            energyPile.splice(cardIndex, 1);
            remainingCost.splice(i, 1);
          }
        }
      }
      
      // Use neutral energy for any remaining specific types
      while (remainingCost.some(type => type !== 'neutral')) {
        const neutralIndex = energyPile.findIndex(card => card.element === 'neutral');
        if (neutralIndex >= 0) {
          const nonNeutralIndex = remainingCost.findIndex(type => type !== 'neutral');
          if (nonNeutralIndex >= 0) {
            // Use neutral energy for this type
            usedEnergyPile.push(energyPile[neutralIndex]);
            energyPile.splice(neutralIndex, 1);
            remainingCost.splice(nonNeutralIndex, 1);
          }
        } else {
          break; // No more neutral energy
        }
      }
      
      // Use any energy for neutral costs
      for (let i = remainingCost.length - 1; i >= 0; i--) {
        if (remainingCost[i] === 'neutral' && energyPile.length > 0) {
          // Just use the first available energy
          usedEnergyPile.push(energyPile[0]);
          energyPile.splice(0, 1);
          remainingCost.splice(i, 1);
        }
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
    
    return true;
  },
  
  // Check if any avatars have been defeated and handle
  checkDefeatedAvatars: () => {
    set(state => {
      const updatedState = { ...state };
      
      // Check player avatar
      if (updatedState.player.activeAvatar &&
          (updatedState.player.activeAvatar.counters?.damage || 0) >= updatedState.player.activeAvatar.health) {
        // Active avatar defeated
        const defeatedAvatar = updatedState.player.activeAvatar;
        
        get().addLog(`Your active avatar ${defeatedAvatar.name} was defeated!`);
        
        // Move to graveyard
        updatedState.player.graveyard.push(defeatedAvatar);
        updatedState.player.activeAvatar = null;
        
        // If player has reserve avatars, move one to active
        if (updatedState.player.reserveAvatars.length > 0) {
          // Take the first reserve avatar
          const newActive = updatedState.player.reserveAvatars[0];
          updatedState.player.activeAvatar = newActive;
          updatedState.player.reserveAvatars.splice(0, 1);
          
          get().addLog(`Your reserve avatar ${newActive.name} has become active!`);
        } else {
          // Take a life card
          if (updatedState.player.lifeCards.length > 0) {
            const lifeCard = updatedState.player.lifeCards.shift() as Card;
            updatedState.player.hand.push(lifeCard);
            
            get().addLog(`You lost a life card! ${updatedState.player.lifeCards.length} remaining.`);
            
            // Check if player lost
            if (updatedState.player.lifeCards.length === 0) {
              updatedState.winner = 'opponent';
              get().addLog('You have no life cards left. You lose!');
            }
          }
        }
      }
      
      // Check opponent avatar
      if (updatedState.opponent.activeAvatar &&
          (updatedState.opponent.activeAvatar.counters?.damage || 0) >= updatedState.opponent.activeAvatar.health) {
        // Active avatar defeated
        const defeatedAvatar = updatedState.opponent.activeAvatar;
        
        get().addLog(`Opponent's active avatar ${defeatedAvatar.name} was defeated!`);
        
        // Move to graveyard
        updatedState.opponent.graveyard.push(defeatedAvatar);
        updatedState.opponent.activeAvatar = null;
        
        // If opponent has reserve avatars, move one to active
        if (updatedState.opponent.reserveAvatars.length > 0) {
          // Take the first reserve avatar
          const newActive = updatedState.opponent.reserveAvatars[0];
          updatedState.opponent.activeAvatar = newActive;
          updatedState.opponent.reserveAvatars.splice(0, 1);
          
          get().addLog(`Opponent's reserve avatar ${newActive.name} has become active!`);
        } else {
          // Take a life card
          if (updatedState.opponent.lifeCards.length > 0) {
            const lifeCard = updatedState.opponent.lifeCards.shift() as Card;
            updatedState.opponent.hand.push(lifeCard);
            
            get().addLog(`Opponent lost a life card! ${updatedState.opponent.lifeCards.length} remaining.`);
            
            // Check if opponent lost
            if (updatedState.opponent.lifeCards.length === 0) {
              updatedState.winner = 'player';
              get().addLog('Opponent has no life cards left. You win!');
            }
          }
        }
      }
      
      return updatedState;
    });
  },
  
  // Select a card from hand
  selectCard: (handIndex) => {
    set({ selectedCard: handIndex });
  },
  
  // Select a target
  selectTarget: (targetId) => {
    set({ selectedTarget: targetId });
  },
  
  // Add a log message
  addLog: (message) => {
    set(state => ({
      logs: [...state.logs, message].slice(-20) // Keep last 20 logs
    }));
  },
  
  // Move a card from hand to energy
  moveCardToEnergy: (handIndex: number) => {
    const { currentPlayer, gamePhase, player } = get();
    
    // Can only add energy during your turn and in main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      toast.error("You can only add energy during your Main Phases!");
      return;
    }
    
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    
    const card = player.hand[handIndex];
    
    // Check if it's an avatar and if we've already added an avatar to energy this turn
    if (isAvatarCard(card)) {
      if (player.avatarToEnergyCount >= 1) {
        toast.error("You can only add 1 avatar to your energy pile per turn!");
        return;
      }
    }
    
    // Move the card to energy
    set(state => {
      const updatedHand = [...state.player.hand];
      updatedHand.splice(handIndex, 1);
      
      // Add to energy pile
      return {
        player: {
          ...state.player,
          hand: updatedHand,
          energyPile: [...state.player.energyPile, card],
          avatarToEnergyCount: isAvatarCard(card) 
            ? state.player.avatarToEnergyCount + 1 
            : state.player.avatarToEnergyCount
        }
      };
    });
    
    get().addLog(`You added ${card.name} to your energy pile.`);
    toast.success(`Added ${card.name} to energy`);
  },
  
  // Discard a card to graveyard
  discardCard: (handIndex: number, player: Player) => {
    set(state => {
      const targetState = player === 'player' ? state.player : state.opponent;
      const updatedHand = [...targetState.hand];
      
      if (handIndex >= 0 && handIndex < updatedHand.length) {
        const discardedCard = updatedHand[handIndex];
        updatedHand.splice(handIndex, 1);
        
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
      }
      
      return {};
    });
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