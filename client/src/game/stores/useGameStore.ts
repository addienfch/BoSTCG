import { create } from 'zustand';
import { toast } from 'sonner';
import { ActionCard, AvatarCard, Card, ElementType, GamePhase, Player } from '../data/cardTypes';
import { useDeckStore } from './useDeckStore';
import { useGameMode } from './useGameMode';

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
  needsToSelectReserveAvatar?: boolean; // Flag to indicate player needs to select a reserve avatar to become active
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
    const gameMode = useGameMode.getState();
    
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
    
    // Shuffle the deck for player
    const shuffledPlayerDeckCards = shuffleArray([...deckCards]);
    console.log('Deck shuffled before game start');
    
    // For AI mode, use the same deck as the player (but with different IDs to avoid conflicts)
    const aiDeck = deckCards.map(card => ({
      ...card,
      id: `ai-${card.id.replace(/^[^-]+-/, '')}` // Replace the first ID prefix like "p-" with "ai-"
    }));
    
    // Shuffle the AI deck separately
    const shuffledAIDeckCards = shuffleArray(aiDeck);
    
    // Create player state with the shuffled deck
    const playerState = initPlayerState(true);
    playerState.deck = shuffledPlayerDeckCards;

    // Create opponent state with the AI deck
    const opponentState = initPlayerState(false);
    opponentState.deck = shuffledAIDeckCards;
    opponentState.isAI = gameMode.mode === 'playerVsAI';
    
    // Reset game state with default values first
    set(state => ({
      currentPlayer: 'player',
      gamePhase: 'setup', // Start with the setup phase
      turn: 1,
      winner: null,
      player: playerState,
      opponent: opponentState,
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
    
    // Get the card being played
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    const card = player.hand[handIndex];
    
    // Quick spells can be played anytime as long as player has an active avatar and enough energy
    const isQuickSpell = card.type === 'quickSpell';
    // Setup phase check for proper variable scoping
    const isSetupPhase = gamePhase === 'setup';
    
    // For quick spells, check if we have an active avatar and enough energy
    if (isQuickSpell) {
      if (!player.activeAvatar) {
        toast.error("You need an active avatar to play quick spells!");
        return;
      }
      
      // Check energy for quick spells separately - we allow them anytime
      if (!get().hasEnoughEnergy(card.energyCost || [], 'player')) {
        toast.error("Not enough energy to play this quick spell!");
        return;
      }
    } else {
      // Other cards are restricted to proper phases and turn
      // Main phases for regular play
      const isMainPhase = gamePhase === 'main1' || gamePhase === 'main2';
      
      // Regular cards can only be played during your turn and in the right phases
      if (currentPlayer !== 'player' || (!isMainPhase && !isSetupPhase)) {
        toast.error("You can only play regular cards during your Main Phases or the Setup Phase!");
        return;
      }
    }
    
    // Special handling for setup phase
    if (gamePhase === 'setup') {
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
    
    console.log("SKILL USAGE - Current State:", {
      player,
      skillIndex,
      currentPhase,
      currentPlayer,
      avatarState: player === 'player' ? state.player.activeAvatar : state.opponent.activeAvatar
    });
    
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
    
    // Check if avatar is tapped (already used a skill this battle phase)
    if (avatar.isTapped) {
      toast.error(`This avatar has already used a skill this battle phase!`);
      console.log("Avatar is tapped, can't use skill:", avatar);
      return;
    }
    
    // Avatars can use skills immediately after being played - no turn restriction
    console.log("Avatar using skill:", avatar.name);
    
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
    
    // Use energy for the skill - make sure we consume all the required energy
    if (!state.useEnergy(skill.energyCost, player)) {
      toast.error(`Failed to consume energy for skill! This is unexpected.`);
      return;
    }
    
    // Calculate damage
    let damageAmount = skill.damage || 0;
    
    // Apply special effects for skills
    if (skill.effect) {
      // Handle Radja's skill: "If you has 1 or less card in hand, this Skill1Damage become 5"
      if (skill.effect.includes("1 or less card in hand") && playerState.hand.length <= 1) {
        damageAmount = 5; // Set to exact value 5 as per card text
        toast.info(`Skill bonus: Damage set to 5 due to having 1 or fewer cards!`);
      }
      
      // Effects that depend on target avatar
      if (targetAvatar) {
        // Handle air/wind type bonus effects
        if ((skill.effect.includes("If opponent Active Avatar is wind Element Avatar") || 
            skill.effect.includes("if opponent Active Avatar were Air type")) && 
            targetAvatar.element === 'air') {
          if (skill.effect.includes("become 111")) {
            damageAmount = 111; // Set to ridiculous damage value for Radja's skill 2
            toast.info(`Type bonus: Massive damage against Air/Wind type!`);
          } else {
            damageAmount += 2;
            toast.info(`Type bonus: +2 damage against Air type!`);
          }
        }
      }
    }
    
    console.log("Applying skill with damage:", damageAmount);
    
    // Apply damage to target
    set(state => {
      const opponent = player === 'player' ? 'opponent' : 'player';
      const opponentState = state[opponent];
      const opponentAvatar = opponentState.activeAvatar!;
      const currentDamage = opponentAvatar.counters?.damage || 0;
      const newDamage = currentDamage + damageAmount;
      
      // Mark avatar as tapped (with debug info)
      console.log("Marking avatar as tapped:", state[player].activeAvatar);
      
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
  
  // Add a card to energy (only avatar cards)
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
    
    // Check if the card is an avatar - only avatar cards can be added to energy
    if (card.type !== 'avatar') {
      toast.error("Only avatar cards can be placed in the energy pile!");
      return;
    }
    
    // Check if we've already added one avatar this turn
    if (player.avatarToEnergyCount >= 1) {
      toast.error("You can only place one avatar card into energy per turn!");
      return;
    }
    
    // Move the card to energy pile
    set(state => {
      const updatedHand = [...state.player.hand];
      const cardToEnergy = updatedHand.splice(handIndex, 1)[0];
      
      // Increase avatar to energy count
      const avatarToEnergyCount = state.player.avatarToEnergyCount + 1;
      
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
      
      // Log the counters before evolution
      console.log("Evolution - Original avatar counters:", targetAvatarCard!.counters);
      
      // Use deep clone to ensure we don't lose the counters
      const existingCounters = targetAvatarCard!.counters 
        ? JSON.parse(JSON.stringify(targetAvatarCard!.counters))
        : { damage: 0, bleed: 0, shield: 0 };
        
      console.log("Evolution - Cloned counters:", existingCounters);
      
      // Preserve important properties from level 1 avatar, including damage counters
      const evolvedAvatar: AvatarCard = {
        ...level2Card,
        // Make sure we preserve existing counters from the level 1 avatar
        counters: existingCounters,
        turnPlayed: state.turn,
        // Also preserve tapped state from the level 1 avatar
        isTapped: targetAvatarCard!.isTapped
      };
      
      console.log("Evolution - Final evolved avatar:", evolvedAvatar);
      
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
        
        // ALWAYS reset avatar tap status and position for BOTH players (not just current player)
        // This ensures that ALL avatars on the board are reset properly
        
        console.log("REFRESH PHASE: Resetting all avatars - START");
        
        // First, check the current state of avatars
        const currentState = get();
        console.log("AVATAR RESET - Current Player Active Avatar:", 
          currentState.player.activeAvatar ? 
          { 
            name: currentState.player.activeAvatar.name,
            isTapped: currentState.player.activeAvatar.isTapped,
            turnPlayed: currentState.player.activeAvatar.turnPlayed 
          } : "None");
          
        console.log("AVATAR RESET - Current Opponent Active Avatar:", 
          currentState.opponent.activeAvatar ? 
          { 
            name: currentState.opponent.activeAvatar.name,
            isTapped: currentState.opponent.activeAvatar.isTapped,
            turnPlayed: currentState.opponent.activeAvatar.turnPlayed 
          } : "None");
        
        // Force a proper reset of ALL avatars in a single update to ensure consistency
        // This is now implemented in a more direct way to ensure the isTapped property is properly reset
        console.log("===== STARTING AVATAR REFRESH OPERATION =====");
        
        // First, let's log the current state of avatars
        console.log("Current player avatar tap state:", get().player.activeAvatar?.isTapped);
        console.log("Current opponent avatar tap state:", get().opponent.activeAvatar?.isTapped);
        
        // Now update the state directly for ALL avatars
        set(state => {
          // Deep clone existing state
          const updatedState = JSON.parse(JSON.stringify(state));
          
          // Reset player's active avatar if it exists
          if (updatedState.player.activeAvatar) {
            // Explicitly set isTapped to false
            updatedState.player.activeAvatar.isTapped = false;
            console.log("AVATAR RESET - Player avatar explicitly untapped");
          }
          
          // Reset player's reserve avatars if any exist
          if (updatedState.player.reserveAvatars.length > 0) {
            // Directly update the isTapped property for each avatar
            updatedState.player.reserveAvatars.forEach((avatar: AvatarCard) => {
              avatar.isTapped = false;
              console.log("AVATAR RESET - Player reserve avatar explicitly untapped:", avatar.name);
            });
          }
          
          // Reset opponent's active avatar if it exists
          if (updatedState.opponent.activeAvatar) {
            // Explicitly set isTapped to false - using the same direct approach
            updatedState.opponent.activeAvatar.isTapped = false;
            console.log("AVATAR RESET - Opponent avatar explicitly untapped");
          }
          
          // Reset opponent's reserve avatars if any exist
          if (updatedState.opponent.reserveAvatars.length > 0) {
            // Directly update the isTapped property for each avatar
            updatedState.opponent.reserveAvatars.forEach((avatar: AvatarCard) => {
              avatar.isTapped = false;
              console.log("AVATAR RESET - Opponent reserve avatar explicitly untapped:", avatar.name);
            });
          }
          
          return updatedState;
        });
        
        // Verify the avatars were reset correctly
        // IMPORTANT: We need to modify the current state AGAIN to ensure all avatars are untapped
        // This is a direct approach that will bypass any nested state issues
        console.log("PERFORMING FINAL FORCE UNTAP OF ALL AVATARS");
        
        // Directly modify the state again - both active and reserve avatars
        
        // Player's active avatar
        if (get().player.activeAvatar) {
          // Direct modification with native JavaScript
          get().player.activeAvatar.isTapped = false;
          console.log("FORCE UNTAPPED player active avatar");
        }
        
        // Player's reserve avatars
        get().player.reserveAvatars.forEach(avatar => {
          avatar.isTapped = false;
          console.log("FORCE UNTAPPED player reserve avatar:", avatar.name);
        });
        
        // Opponent's active avatar
        if (get().opponent.activeAvatar) {
          // Direct modification with native JavaScript
          get().opponent.activeAvatar.isTapped = false;
          console.log("FORCE UNTAPPED opponent active avatar");
        }
        
        // Opponent's reserve avatars
        get().opponent.reserveAvatars.forEach(avatar => {
          avatar.isTapped = false;
          console.log("FORCE UNTAPPED opponent reserve avatar:", avatar.name);
        });
        
        // Log the final state
        const finalState = get();
        console.log("FINAL AVATAR STATE - Player Active Avatar:", 
          finalState.player.activeAvatar ? 
          { 
            name: finalState.player.activeAvatar.name,
            isTapped: finalState.player.activeAvatar.isTapped
          } : "None");
          
        console.log("FINAL AVATAR STATE - Opponent Active Avatar:", 
          finalState.opponent.activeAvatar ? 
          { 
            name: finalState.opponent.activeAvatar.name,
            isTapped: finalState.opponent.activeAvatar.isTapped
          } : "None");
        
        // Show toast based on whose turn it is
        if (currPlayer === 'player') {
          toast.success("Your avatars are ready for battle again!");
        } else {
          toast.info("Opponent's avatars are ready for battle again");
        }
        
        // Log the reset for clarity in the game log
        get().addLog(`All avatars have been reset and are ready for battle.`);
        console.log("AVATAR RESET - Complete - all should be untapped now");
        
        // Dispatch an event to notify UI components about avatar reset
        console.log("Dispatching gamePhaseChanged event from refresh phase");
        
        // Dispatch multiple events to ensure all components receive the notification
        // First one for phase change
        const phaseChangeEvent = new Event('gamePhaseChanged');
        document.dispatchEvent(phaseChangeEvent);
        
        // Second one specifically for avatar reset
        const avatarResetEvent = new Event('avatarReset');
        document.dispatchEvent(avatarResetEvent);
        
        // Add a slight delay and dispatch the events again for redundancy
        setTimeout(() => {
          console.log("Re-dispatching avatar reset events after delay");
          document.dispatchEvent(new Event('gamePhaseChanged'));
          document.dispatchEvent(new Event('avatarReset'));
        }, 100);
        
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
      set(state => {
        // Create updated player state with untapped avatars
        const updatedPlayerState = {
          ...state.player,
          avatarToEnergyCount: 0,
          energyPile: playerEnergy,
          usedEnergyPile: []
        };
        
        // Ensure the active avatar is untapped for the next turn
        if (updatedPlayerState.activeAvatar) {
          updatedPlayerState.activeAvatar = {
            ...updatedPlayerState.activeAvatar,
            isTapped: false
          };
        }
        
        // Ensure all reserve avatars are untapped too
        if (updatedPlayerState.reserveAvatars.length > 0) {
          updatedPlayerState.reserveAvatars = updatedPlayerState.reserveAvatars.map(avatar => ({
            ...avatar,
            isTapped: false
          }));
        }
        
        return { player: updatedPlayerState };
      });
      
      // Also directly make isTapped false in any existing avatar objects
      console.log("TURN CHANGE - Directly untapping player avatars");
      if (get().player.activeAvatar) {
        get().player.activeAvatar.isTapped = false;
      }
      get().player.reserveAvatars.forEach(avatar => {
        avatar.isTapped = false;
      });
      
      // Log this action
      if (gameState.player.usedEnergyPile.length > 0) {
        toast.success(`${gameState.player.usedEnergyPile.length} used energy cards moved back to your energy pile!`);
        get().addLog(`Your used energy has been refreshed (${gameState.player.usedEnergyPile.length} cards).`);
      }
    } else {
      // Refresh opponent's energy
      const opponentEnergy = [...gameState.opponent.energyPile, ...gameState.opponent.usedEnergyPile];
      set(state => {
        // Create updated opponent state with untapped avatars
        const updatedOpponentState = {
          ...state.opponent,
          avatarToEnergyCount: 0,
          energyPile: opponentEnergy,
          usedEnergyPile: []
        };
        
        // Ensure the active avatar is untapped for the next turn
        if (updatedOpponentState.activeAvatar) {
          updatedOpponentState.activeAvatar = {
            ...updatedOpponentState.activeAvatar,
            isTapped: false
          };
        }
        
        // Ensure all reserve avatars are untapped too
        if (updatedOpponentState.reserveAvatars.length > 0) {
          updatedOpponentState.reserveAvatars = updatedOpponentState.reserveAvatars.map(avatar => ({
            ...avatar,
            isTapped: false
          }));
        }
        
        return { opponent: updatedOpponentState };
      });
      
      // Also directly make isTapped false in any existing avatar objects
      console.log("TURN CHANGE - Directly untapping opponent avatars");
      if (get().opponent.activeAvatar) {
        get().opponent.activeAvatar.isTapped = false;
      }
      get().opponent.reserveAvatars.forEach(avatar => {
        avatar.isTapped = false;
      });
      
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
    
    // Dispatch events for the UI to detect refresh phase
    console.log("Dispatching gamePhaseChanged and avatarReset events from endTurn function");
    document.dispatchEvent(new Event('gamePhaseChanged'));
    document.dispatchEvent(new Event('avatarReset'));
    
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
    
    // Quick spells can be played anytime when player has enough energy
    if (card.type === 'quickSpell') {
      if (!player.activeAvatar) {
        return false; // Need an active avatar to play quick spells
      }
      
      // Check if we have enough energy
      const energyCost = card.energyCost || [];
      return get().hasEnoughEnergy(energyCost, 'player');
    }
    
    // Main phases for regular play
    const isMainPhase = gamePhase === 'main1' || gamePhase === 'main2';
    
    // Regular cards can only be played in main phases on your turn
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
    
    // For quick spells, check type property with type guard
    const actionCard = card as ActionCard;
    if (actionCard.type === 'quickSpell' || actionCard.type === 'spell') {
      // This code branch only executes for ActionCards, not AvatarCards
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
    
    // Make sure we have enough total energy cards
    if (energyPile.length < energyCost.length) {
      return false;
    }
    
    // Track available energy by element
    const availableElements: {[key in ElementType]: number} = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      light: 0,
      dark: 0,
      neutral: 0
    };
    
    // Count all available energy cards by element
    energyPile.forEach(card => {
      if (card.element) {
        availableElements[card.element as ElementType]++;
      }
    });
    
    // Count required energy by type
    const requiredElements: {[key in ElementType]: number} = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      light: 0,
      dark: 0,
      neutral: 0
    };
    
    energyCost.forEach(element => {
      requiredElements[element]++;
    });
    
    // First check specific elements (fire, water, earth, air)
    const specificElements = ['fire', 'water', 'earth', 'air'] as ElementType[];
    let remainingNonSpecific = 0;
    
    // Check each specific element requirement
    for (const element of specificElements) {
      if (requiredElements[element] > 0) {
        // If we have this element type, use it
        const available = availableElements[element];
        const required = requiredElements[element];
        
        if (available >= required) {
          // We have enough specific energy
          availableElements[element] -= required;
        } else {
          // We need to use other cards for the missing energy
          const missing = required - available;
          remainingNonSpecific += missing;
          // Use what we have of this element
          availableElements[element] = 0;
        }
      }
    }
    
    // Add neutral energy requirement
    remainingNonSpecific += requiredElements.neutral;
    
    // Count remaining total energy
    const totalRemainingEnergy = Object.values(availableElements).reduce((sum, count) => sum + count, 0);
    
    // Check if we have enough total energy for the remaining non-specific requirements
    return totalRemainingEnergy >= remainingNonSpecific;
  },
  
  // Use energy to play a card
  useEnergy: (energyCost: ElementType[], player: Player) => {
    if (energyCost.length === 0) {
      return true; // No energy cost, nothing to do
    }
    
    console.log(`Using energy for ${player}:`, energyCost);
    
    // First check if we have enough energy
    if (!get().hasEnoughEnergy(energyCost, player)) {
      console.log("Not enough energy to use");
      return false;
    }
    
    set(state => {
      const playerState = player === 'player' ? state.player : state.opponent;
      const energyPile = [...playerState.energyPile];
      const usedEnergyPile = [...playerState.usedEnergyPile];
      
      // Count how many of each element we need
      const elementCounts: Partial<Record<ElementType, number>> = {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        neutral: 0,
        light: 0,
        dark: 0
      };
      
      // Count required elements
      energyCost.forEach(element => {
        elementCounts[element]++;
      });
      
      console.log("Required elements:", elementCounts);
      
      // Track which energy cards we've used
      const usedIndices: number[] = [];
      
      // First try to match specific elements
      const elements: ElementType[] = ['fire', 'water', 'earth', 'air'];
      elements.forEach(element => {
        let required = elementCounts[element];
        if (required > 0) {
          for (let i = 0; i < energyPile.length && required > 0; i++) {
            if (!usedIndices.includes(i) && energyPile[i].element === element) {
              usedIndices.push(i);
              required--;
            }
          }
          // Update how many we still need
          elementCounts[element] = required;
        }
      });
      
      // Then use any card for neutral and remaining specific elements
      let totalRemaining = 
        elementCounts.fire + 
        elementCounts.water + 
        elementCounts.earth + 
        elementCounts.air + 
        elementCounts.neutral;
      
      if (totalRemaining > 0) {
        // Use any remaining cards for neutral/unmatched elements
        for (let i = 0; i < energyPile.length && totalRemaining > 0; i++) {
          if (!usedIndices.includes(i)) {
            usedIndices.push(i);
            totalRemaining--;
          }
        }
      }
      
      // Double check we used the right number of cards
      if (usedIndices.length !== energyCost.length) {
        console.error(`Energy mismatch: used ${usedIndices.length} cards for ${energyCost.length} cost`);
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
    get().addLog(`${player === 'player' ? 'You' : 'Opponent'} used ${energyCost.length} energy.`);
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
          toast.error(`Your ${avatar.name} was defeated!`, { duration: 3000 });
          
          // Reduce health by 1 when avatar is defeated
          const newHealth = Math.max(0, state.player.health - 1);
          updatedState.player.health = newHealth;
          
          // Check if health is zero - game over
          if (newHealth <= 0) {
            updatedState.winner = 'opponent';
            get().addLog('You have lost! Your health has reached zero.');
            toast.error('Your health has reached zero. Game over!', { duration: 5000 });
            return updatedState;
          }
          
          // Always lose a life card when an avatar is defeated
          if (state.player.lifeCards.length === 0) {
            // No life cards left - game over immediately
            updatedState.winner = 'opponent';
            get().addLog('You have lost! You have no life cards left.');
            toast.error('You have no life cards left. Game over!', { duration: 5000 });
            return updatedState;
          }
          
          // Remove a life card and add to hand
          const lifeCards = [...state.player.lifeCards];
          const lostLifeCard = lifeCards.shift();
          
          // Update life cards list
          updatedState.player.lifeCards = lifeCards;
          
          if (lostLifeCard) {
            // Add the life card to player's hand
            updatedState.player.hand = [...state.player.hand, lostLifeCard];
            get().addLog(`Your health reduced to ${newHealth}. You lost a life card: ${lostLifeCard.name}! It has been added to your hand.`);
            toast.error(`Your health reduced to ${newHealth}. You lost a life card: ${lostLifeCard.name}!`, { duration: 5000 });
          }
          
          // Check if player has reserve avatars
          if (state.player.reserveAvatars.length === 0) {
            // No reserve avatars - game over immediately
            updatedState.winner = 'opponent';
            get().addLog('You have lost! You have no reserve avatars left.');
            toast.error('You have no reserve avatars. Game over!', { duration: 5000 });
          } else {
            // Has reserve avatars - prompt to select one
            if (state.currentPlayer === 'player') {
              toast.warning('You need to select a reserve avatar to become your new active avatar!', {
                duration: 5000
              });
              
              // Set a flag in the state to indicate the player needs to select a reserve
              updatedState.player.needsToSelectReserveAvatar = true;
            } else {
              // For AI opponent, automatically select the first reserve avatar
              const reserveAvatars = [...state.player.reserveAvatars];
              const newActiveAvatar = reserveAvatars.shift();
              
              if (newActiveAvatar) {
                updatedState.player.activeAvatar = newActiveAvatar;
                updatedState.player.reserveAvatars = reserveAvatars;
              }
              
              get().addLog(`Your ${newActiveAvatar?.name} has moved to the active position.`);
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
          toast.success(`Opponent's ${avatar.name} was defeated!`, { duration: 3000 });
          
          // Reduce health by 1 when avatar is defeated
          const newHealth = Math.max(0, state.opponent.health - 1);
          updatedState.opponent.health = newHealth;
          
          // Check if health is zero - game over
          if (newHealth <= 0) {
            updatedState.winner = 'player';
            get().addLog('You are victorious! Your opponent\'s health has reached zero.');
            toast.success('Opponent\'s health has reached zero. You win!', { duration: 5000 });
            return updatedState;
          }
          
          // Always lose a life card when an avatar is defeated
          if (state.opponent.lifeCards.length === 0) {
            // No life cards left - game over immediately
            updatedState.winner = 'player';
            get().addLog('You are victorious! Your opponent has no life cards left.');
            toast.success('Opponent has no life cards left. You win!', { duration: 5000 });
            return updatedState;
          }
          
          // Remove a life card and add to hand
          const lifeCards = [...state.opponent.lifeCards];
          const lostLifeCard = lifeCards.shift();
          
          // Update life cards list
          updatedState.opponent.lifeCards = lifeCards;
          
          if (lostLifeCard) {
            // Add the life card to opponent's hand
            updatedState.opponent.hand = [...state.opponent.hand, lostLifeCard];
            get().addLog(`Opponent's health reduced to ${newHealth}. They lost a life card: ${lostLifeCard.name}! It has been added to their hand.`);
            toast.success(`Opponent's health reduced to ${newHealth}. They lost a life card!`, { duration: 5000 });
          }
          
          // Check if opponent has reserve avatars
          if (state.opponent.reserveAvatars.length === 0) {
            // No reserve avatars - game over immediately
            updatedState.winner = 'player';
            get().addLog('You are victorious! Your opponent has no reserve avatars left.');
            toast.success('Opponent has no reserve avatars. You win!', { duration: 5000 });
          } else {
            // For AI opponent, automatically select the first reserve avatar
            const reserveAvatars = [...state.opponent.reserveAvatars];
            const newActiveAvatar = reserveAvatars.shift();
            
            if (newActiveAvatar) {
              updatedState.opponent.activeAvatar = newActiveAvatar;
              updatedState.opponent.reserveAvatars = reserveAvatars;
            }
            
            get().addLog(`Opponent's ${newActiveAvatar?.name} has moved to the active position.`);
            toast.info(`Opponent moved ${newActiveAvatar?.name} to the active position.`);
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
          // Find all playable spell cards in hand
          const playableSpells = opponent.hand
            .map((card, index) => ({ card, index }))
            .filter(item => 
              (item.card.type === 'spell' || item.card.type === 'quickSpell') && 
              get().hasEnoughEnergy(item.card.energyCost || [], 'opponent')
            );
          
          // Sort spells by priority (damage spells first, then utility)
          playableSpells.sort((a, b) => {
            // Prefer direct damage spells (check if card has a damage property)
            const aDamage = (a.card as any).damage || 0;
            const bDamage = (b.card as any).damage || 0;
            
            if (aDamage > bDamage) return -1;
            if (aDamage < bDamage) return 1;
            
            // Then prioritize by energy cost (higher cost = likely more powerful)
            const aEnergyCost = a.card.energyCost?.length || 0;
            const bEnergyCost = b.card.energyCost?.length || 0;
            
            return bEnergyCost - aEnergyCost;
          });
          
          // Play the highest priority spell if available
          if (playableSpells.length > 0) {
            const spellIndex = playableSpells[0].index;
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
        
        // Add energy if we have cards left - ONLY use avatar cards
        if (opponent.hand.length > 0 && opponent.avatarToEnergyCount < 1) {
          // Only use avatar cards for energy (following game rules)
          const avatarIndex = opponent.hand.findIndex(card => card.type === 'avatar');
          
          if (avatarIndex !== -1) {
            const avatarCard = opponent.hand[avatarIndex];
            const cardName = avatarCard.name;
            
            // Add to energy
            set(state => {
              const updatedHand = [...state.opponent.hand];
              updatedHand.splice(avatarIndex, 1);
              
              return {
                opponent: {
                  ...state.opponent,
                  hand: updatedHand,
                  energyPile: [...state.opponent.energyPile, avatarCard],
                  avatarToEnergyCount: state.opponent.avatarToEnergyCount + 1
                }
              };
            });
            
            get().addLog(`Opponent added ${cardName} to their energy pile.`);
            toast.info(`Opponent added an avatar card to their energy pile.`);
            
            // After adding energy, move to next phase
            setTimeout(() => get().nextPhase(), 1000);
            return;
          }
        }
        
        // If no other actions, move to battle phase
        setTimeout(() => get().nextPhase(), 1000);
        break;
        
      case 'battle':
        // Implement battle phase AI actions
        if (opponent.activeAvatar && !opponent.activeAvatar.isTapped) {
          // Check if AI has enough energy for skills
          const canUseSkill2 = opponent.activeAvatar.skill2 && 
            get().hasEnoughEnergy(opponent.activeAvatar.skill2.energyCost, 'opponent');
          
          const canUseSkill1 = get().hasEnoughEnergy(opponent.activeAvatar.skill1.energyCost, 'opponent');
          
          if (canUseSkill2) {
            // Use skill 2 if available (priority)
            get().useAvatarSkill('opponent', 2);
            
            // Log and notify
            toast.info(`Opponent used ${opponent.activeAvatar.name}'s ${opponent.activeAvatar.skill2.name} skill!`);
            
            // Move to the next phase after some delay
            setTimeout(() => get().nextPhase(), 1500);
            return;
          } else if (canUseSkill1) {
            // Use skill 1 as fallback
            get().useAvatarSkill('opponent', 1);
            
            // Log and notify
            toast.info(`Opponent used ${opponent.activeAvatar.name}'s ${opponent.activeAvatar.skill1.name} skill!`);
            
            // Move to the next phase after some delay
            setTimeout(() => get().nextPhase(), 1500);
            return;
          }
        }
        
        // If no skills were used, just move to the next phase
        toast.info("Opponent skips action in battle phase.");
        setTimeout(() => get().nextPhase(), 1000);
        break;
        
      case 'main2':
        // Similar logic to main1, but focused on using up remaining resources
        
        // Try to play a spell if we have enough energy
        if (opponent.activeAvatar) {
          // Find all playable spell cards in hand
          const playableSpells = opponent.hand
            .map((card, index) => ({ card, index }))
            .filter(item => 
              (item.card.type === 'spell' || item.card.type === 'quickSpell') && 
              get().hasEnoughEnergy(item.card.energyCost || [], 'opponent')
            );
          
          // Play a spell if available
          if (playableSpells.length > 0) {
            // Sort by energy cost to use up remaining energy
            playableSpells.sort((a, b) => {
              const aEnergyCost = a.card.energyCost?.length || 0;
              const bEnergyCost = b.card.energyCost?.length || 0;
              return bEnergyCost - aEnergyCost;
            });
            
            const spellIndex = playableSpells[0].index;
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
            
            // Apply spell effects (same as in main1)
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
            
            // Continue with other actions
            setTimeout(() => get().performAIActions(), 500);
            return;
          }
        }
        
        // Try to add energy if we didn't in main1
        if (opponent.hand.length > 0 && opponent.avatarToEnergyCount < 1) {
          // Find any avatar card to use as energy
          const avatarIndex = opponent.hand.findIndex(card => card.type === 'avatar');
          
          if (avatarIndex !== -1) {
            const avatarCard = opponent.hand[avatarIndex];
            
            // Add to energy
            set(state => {
              const updatedHand = [...state.opponent.hand];
              updatedHand.splice(avatarIndex, 1);
              
              return {
                opponent: {
                  ...state.opponent,
                  hand: updatedHand,
                  energyPile: [...state.opponent.energyPile, avatarCard],
                  avatarToEnergyCount: state.opponent.avatarToEnergyCount + 1
                }
              };
            });
            
            get().addLog(`Opponent added ${avatarCard.name} to their energy pile.`);
            toast.info(`Opponent added an avatar to their energy pile.`);
            
            // After adding energy, move to next phase
            setTimeout(() => get().nextPhase(), 1000);
            return;
          }
        }
        
        // If no actions taken, proceed to end phase
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