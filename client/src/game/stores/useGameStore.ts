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
  
  // Selection helpers
  selectCard: (handIndex: number) => void;
  selectTarget: (targetId: string) => void;
  
  // Log helpers
  addLog: (message: string) => void;
}

// Helper function to initialize a deck
const initializeDeck = (isPlayer: boolean): Card[] => {
  // For now, just use the fire cards
  const avatars = fireAvatarCards.filter(card => card.level === 1);
  const actions = fireActionCards;
  
  // Create a simple deck: 60% avatars, 40% spells
  // Normally would be customized by the player
  const deck: Card[] = [];
  
  // Add 8 copies of level 1 avatars (2 of each for 4 types)
  avatars.forEach(avatar => {
    deck.push({...avatar, id: `${avatar.id}-1`});
    deck.push({...avatar, id: `${avatar.id}-2`});
  });
  
  // Add 4 copies of each action card
  actions.forEach(action => {
    for (let i = 0; i < 4; i++) {
      deck.push({...action, id: `${action.id}-${i+1}`});
    }
  });
  
  // Also add 1 copy of each level 2 avatar for testing purposes
  // In a real game, level 2 avatars would be evolved from level 1
  if (isPlayer) {
    const level2Avatars = fireAvatarCards.filter(card => card.level === 2);
    level2Avatars.forEach(avatar => {
      deck.push({...avatar, id: `${avatar.id}-1`});
    });
  }
  
  return deck;
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
    graveyard: []
  };
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
      gamePhase: 'refresh',
      turn: 1,
      winner: null,
      player: initPlayerState(true),
      opponent: initPlayerState(false),
      selectedCard: null,
      selectedTarget: null,
      logs: ['Game started! Draw your cards and select your active avatar.']
    }));
    
    // Draw initial cards for both players
    get().drawCard('player', 6);
    get().drawCard('opponent', 6);
    
    // Set up life cards
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
    
    // Can only play cards during your turn and in the main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      toast.error("You can only play cards during your Main Phases!");
      return;
    }
    
    if (handIndex < 0 || handIndex >= player.hand.length) {
      toast.error("Invalid card selection!");
      return;
    }
    
    const card = player.hand[handIndex];
    
    // Check if the card can be played
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
            
            return {
              player: {
                ...state.player,
                hand: updatedHand,
                activeAvatar: card as AvatarCard
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
            
            return {
              player: {
                ...state.player,
                hand: updatedHand,
                reserveAvatars: [...state.player.reserveAvatars, card as AvatarCard]
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
          
        case 'ritualArmor':
        case 'equipment':
        case 'field':
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
    const { player, currentPlayer, gamePhase } = get();
    
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
    
    // Only Avatar cards can be used as energy
    if (card.type !== 'avatar') {
      toast.error("Only Avatar cards can be used as energy!");
      return;
    }
    
    // Remove from hand and add to energy pile
    set(state => {
      const updatedHand = [...state.player.hand];
      updatedHand.splice(handIndex, 1);
      
      return {
        player: {
          ...state.player,
          hand: updatedHand,
          energyPile: [...state.player.energyPile, card]
        }
      };
    });
    
    get().addLog(`You added ${card.name} to your energy pile.`);
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
    const { gamePhase, currentPlayer } = get();
    
    // Determine the next phase based on current phase
    let nextPhase: GamePhase = 'refresh';
    
    switch (gamePhase) {
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
    
    // Check for hand size limit (10) and discard excess cards
    set(state => {
      const playerState = currentPlayer === 'player' ? state.player : state.opponent;
      
      if (playerState.hand.length > 10) {
        // Need to discard down to 10 cards
        const cardsToDiscard = playerState.hand.length - 10;
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
    
    // Switch players
    const nextPlayer = currentPlayer === 'player' ? 'opponent' : 'player';
    const newTurn = nextPlayer === 'player' ? turn + 1 : turn;
    
    set({
      currentPlayer: nextPlayer,
      turn: newTurn,
      gamePhase: 'refresh'
    });
    
    get().addLog(`End of turn ${turn}. It's now ${nextPlayer === 'player' ? 'your' : 'opponent\'s'} turn.`);
  },
  
  // Helper function to get text description of current phase
  getPhaseText: () => {
    const { gamePhase, currentPlayer } = get();
    const playerText = currentPlayer === 'player' ? 'Your' : 'Opponent\'s';
    
    switch (gamePhase) {
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
    const { currentPlayer, gamePhase } = get();
    
    // Can only play cards during your turn
    if (currentPlayer !== 'player') {
      return false;
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
  }
}));