import { create } from 'zustand';
import { CardData } from '../components/Card';
import { getInitialDeck, shuffleDeck } from '../data/cards';
import { calculateDamage, checkWinner, handleSpellEffect } from '../utils/gameLogic';
import { useGameStore } from './useGameStore';
import { toast } from 'sonner';

// Define the types for our game state
export type Player = 'player' | 'opponent';
export type GamePhase = 'refresh' | 'draw' | 'main1' | 'battle' | 'damage' | 'main2' | 'end';

// Avatar cards in play need additional properties to track state
export interface AvatarInPlay extends CardData {
  tapped: boolean; // Whether the avatar has used a skill this turn
  damageCounter: number; // Accumulated damage
  bleedCounter: number; // Bleeding effect counters
  shieldCounter: number; // Shield counters for damage reduction
  attachedCards: CardData[]; // Cards attached to this avatar (equipment, ritual armor)
}

interface CardGameState {
  // Game state
  currentPlayer: Player;
  gamePhase: GamePhase;
  turn: number;
  winner: Player | null;
  
  // Player state
  playerHealth: number;
  playerDeck: CardData[];
  playerHand: CardData[];
  playerEnergyPile: CardData[]; // Energy pile (avatar cards used as energy)
  playerActiveAvatar: AvatarInPlay | null; // Active avatar in play
  playerReserveAvatars: AvatarInPlay[]; // Reserve avatars ready to switch in
  playerFieldCards: CardData[]; // Field cards in play
  playerLifeCards: CardData[]; // Life cards (when depleted, player loses)
  playerGraveyard: CardData[]; // Discarded cards
  
  // Opponent state
  opponentHealth: number;
  opponentDeck: CardData[];
  opponentHand: CardData[];
  opponentEnergyPile: CardData[]; // Energy pile (avatar cards used as energy)
  opponentActiveAvatar: AvatarInPlay | null; // Active avatar in play
  opponentReserveAvatars: AvatarInPlay[]; // Reserve avatars ready to switch in
  opponentFieldCards: CardData[]; // Field cards in play
  opponentLifeCards: CardData[]; // Life cards (when depleted, opponent loses)
  opponentGraveyard: CardData[]; // Discarded cards
  
  // Selection state
  selectedCard: number | null; // Index of selected card in hand
  selectedTarget: string | null; // Target identifier (e.g., 'opponent-avatar', 'player-avatar-0')
  
  // Actions
  startGame: () => void;
  drawCard: () => void;
  playCard: (handIndex: number, target?: string) => void;
  selectCard: (handIndex: number) => void;
  selectTarget: (targetId: string) => void;
  useAvatarSkill: (skillIndex: 1 | 2, target: string) => void;
  setEnergyCard: (handIndex: number) => void; // Use card as energy
  switchAvatar: (reserveIndex: number) => void; // Switch active avatar
  endPhase: () => void; // End current phase and move to next
  endTurn: () => void; // End turn and give control to opponent
}

export const useCardGame = create<CardGameState>((set, get) => ({
  // Initial state
  currentPlayer: 'player',
  gamePhase: 'refresh',
  turn: 1,
  winner: null,
  
  // Player state
  playerHealth: 20,
  playerDeck: [],
  playerHand: [],
  playerEnergyPile: [],
  playerActiveAvatar: null,
  playerReserveAvatars: [],
  playerFieldCards: [],
  playerLifeCards: [],
  playerGraveyard: [],
  
  // Opponent state
  opponentHealth: 20,
  opponentDeck: [],
  opponentHand: [],
  opponentEnergyPile: [],
  opponentActiveAvatar: null,
  opponentReserveAvatars: [],
  opponentFieldCards: [],
  opponentLifeCards: [],
  opponentGraveyard: [],
  
  // Selection state
  selectedCard: null,
  selectedTarget: null,
  
  // Start a new game
  startGame: () => {
    // Initialize decks for both players
    const playerDeck = shuffleDeck(getInitialDeck('player'));
    const opponentDeck = shuffleDeck(getInitialDeck('opponent'));
    
    // Set up life cards (exactly 4 cards for each player)
    const playerLifeCards = playerDeck.splice(0, 4);
    const opponentLifeCards = opponentDeck.splice(0, 4);
    
    // Draw 5 cards for starting hands
    const playerHand = playerDeck.splice(0, 5);
    const opponentHand = opponentDeck.splice(0, 5);
    
    // Random coin flip to determine first player
    const randomStart = Math.random() >= 0.5 ? 'player' : 'opponent';
    
    set({
      currentPlayer: randomStart,
      gamePhase: 'refresh',
      turn: 1,
      winner: null,
      
      // Player state
      playerHealth: 30,
      playerDeck,
      playerHand,
      playerEnergyPile: [],
      playerActiveAvatar: null,
      playerReserveAvatars: [],
      playerFieldCards: [],
      playerLifeCards,
      playerGraveyard: [],
      
      // Opponent state
      opponentHealth: 30,
      opponentDeck,
      opponentHand,
      opponentEnergyPile: [],
      opponentActiveAvatar: null,
      opponentReserveAvatars: [],
      opponentFieldCards: [],
      opponentLifeCards,
      opponentGraveyard: [],
      
      // Selection state
      selectedCard: null,
      selectedTarget: null,
    });
    
    const firstPlayerMessage = randomStart === 'player' ? 'You go first!' : 'Opponent goes first!';
    toast.success(`Game started! ${firstPlayerMessage} Each player has 4 life cards and 5 cards in hand.`);
  },
  
  // Draw a card from the deck
  drawCard: () => {
    const { currentPlayer, playerDeck, playerHand, opponentDeck, opponentHand, gamePhase } = get();
    
    if (currentPlayer === 'player') {
      if (playerDeck.length === 0) {
        // If player can't draw, check life cards
        if (get().playerLifeCards.length > 0) {
          // Move a life card to deck and shuffle
          const lifeCards = [...get().playerLifeCards];
          const lifeCard = lifeCards.pop();
          
          if (lifeCard) {
            set({
              playerLifeCards: lifeCards,
              playerDeck: [lifeCard]
            });
            toast.info('Your deck is empty. One life card moved to deck.');
            
            // Now draw the card
            set({
              playerDeck: [],
              playerHand: [...playerHand, lifeCard]
            });
            toast.success(`Drew ${lifeCard.name}`);
          }
        } else {
          // No life cards and no deck - player loses
          set({ winner: 'opponent' });
          toast.error('You have no cards left in your deck or life cards. You lose!');
          return;
        }
      } else {
        // Normal draw
        const [newCard, ...remainingDeck] = playerDeck;
        // Add a property to the card to mark it as newly drawn for animation
        const newCardWithAnimation = {
          ...newCard,
          isBeingDrawn: true // This will be used by the Hand component to animate the card
        };
        
        set({ 
          playerDeck: remainingDeck, 
          playerHand: [...playerHand, newCardWithAnimation]
        });
        
        toast.success(`Drew ${newCard.name}`);
      }
      
      // Only advance phase if in draw phase
      if (gamePhase === 'draw') {
        set({ gamePhase: 'main1' });
      }
    } else {
      // Opponent's turn
      if (opponentDeck.length === 0) {
        // If opponent can't draw, check life cards
        if (get().opponentLifeCards.length > 0) {
          // Move a life card to deck and shuffle
          const lifeCards = [...get().opponentLifeCards];
          const lifeCard = lifeCards.pop();
          
          if (lifeCard) {
            set({
              opponentLifeCards: lifeCards,
              opponentDeck: [],
              opponentHand: [...opponentHand, lifeCard]
            });
            toast.info('Opponent\'s deck is empty. One life card moved to hand.');
          }
        } else {
          // No life cards and no deck - opponent loses
          set({ winner: 'player' });
          toast.success('Opponent has no cards left. You win!');
          return;
        }
      } else {
        // Normal draw
        const [newCard, ...remainingDeck] = opponentDeck;
        // Add animation for opponent card draw as well
        const newCardWithAnimation = {
          ...newCard,
          isBeingDrawn: true
        };
        
        set({ 
          opponentDeck: remainingDeck, 
          opponentHand: [...opponentHand, newCardWithAnimation]
        });
        
        toast.info('Opponent drew a card.');
      }
      
      // Only advance phase if in draw phase
      if (gamePhase === 'draw') {
        set({ gamePhase: 'main1' });
      }
    }
  },
  
  // Play a card from hand
  playCard: (handIndex: number, target?: string) => {
    const { 
      currentPlayer, 
      playerHand, 
      playerEnergyPile,
      playerActiveAvatar,
      playerReserveAvatars,
      playerFieldCards,
      opponentHand, 
      opponentActiveAvatar,
      opponentReserveAvatars,
      opponentFieldCards,
      gamePhase
    } = get();
    
    // Can only play cards during main phases
    if (currentPlayer === 'player' && gamePhase !== 'main1' && gamePhase !== 'main2') {
      toast.error('You can only play cards during your main phases.');
      return;
    }
    
    if (currentPlayer === 'player') {
      const card = playerHand[handIndex];
      
      // Check if player has enough energy for action cards
      if (card.type !== 'avatar' && (card.energyCost || 0) > playerEnergyPile.length) {
        toast.error(`Not enough energy! This card needs ${card.energyCost} energy.`);
        return;
      }
      
      // Remove card from hand
      const newHand = [...playerHand];
      newHand.splice(handIndex, 1);
      
      // Handle based on card type
      if (card.type === 'avatar') {
        // If no active avatar, make this the active avatar
        if (!playerActiveAvatar) {
          const avatarCard: AvatarInPlay = {
            ...card,
            tapped: false, // Can use skills this turn since it was just played
            damageCounter: 0,
            bleedCounter: 0,
            shieldCounter: 0,
            attachedCards: []
          };
          
          set({
            playerHand: newHand,
            playerActiveAvatar: avatarCard,
            selectedCard: null,
            selectedTarget: null
          });
          
          toast.success(`${card.name} is now your active avatar!`);
        } 
        // Otherwise add to reserve avatars
        else {
          const avatarCard: AvatarInPlay = {
            ...card,
            tapped: false,
            damageCounter: 0,
            bleedCounter: 0,
            shieldCounter: 0,
            attachedCards: []
          };
          
          set({
            playerHand: newHand,
            playerReserveAvatars: [...playerReserveAvatars, avatarCard],
            selectedCard: null,
            selectedTarget: null
          });
          
          toast.success(`${card.name} added to your reserve avatars.`);
        }
      }
      // Handle field cards
      else if (card.type === 'field') {
        // Use energy
        const newEnergyPile = [...playerEnergyPile];
        const usedEnergy = newEnergyPile.splice(0, card.energyCost || 0);
        
        // Add to field cards
        set({
          playerHand: newHand,
          playerEnergyPile: newEnergyPile,
          playerFieldCards: [...playerFieldCards, card],
          playerGraveyard: [...get().playerGraveyard, ...usedEnergy],
          selectedCard: null,
          selectedTarget: null
        });
        
        toast.success(`Played field card: ${card.name}`);
      }
      // Handle equipment cards
      else if (card.type === 'equipment' && playerActiveAvatar && target === 'player-avatar') {
        // Use energy
        const newEnergyPile = [...playerEnergyPile];
        const usedEnergy = newEnergyPile.splice(0, card.energyCost || 0);
        
        // Attach to active avatar
        const updatedAvatar = {
          ...playerActiveAvatar,
          attachedCards: [...playerActiveAvatar.attachedCards, card]
        };
        
        set({
          playerHand: newHand,
          playerEnergyPile: newEnergyPile,
          playerActiveAvatar: updatedAvatar,
          playerGraveyard: [...get().playerGraveyard, ...usedEnergy],
          selectedCard: null,
          selectedTarget: null
        });
        
        toast.success(`Equipped ${card.name} to ${playerActiveAvatar.name}`);
      }
      // Handle ritual armor
      else if (card.type === 'ritualArmor' && playerActiveAvatar && target === 'player-avatar') {
        // Use energy
        const newEnergyPile = [...playerEnergyPile];
        const usedEnergy = newEnergyPile.splice(0, card.energyCost || 0);
        
        // Add shield counters to avatar
        const updatedAvatar = {
          ...playerActiveAvatar,
          shieldCounter: playerActiveAvatar.shieldCounter + 2, // Standard amount
          attachedCards: [...playerActiveAvatar.attachedCards, card]
        };
        
        set({
          playerHand: newHand,
          playerEnergyPile: newEnergyPile,
          playerActiveAvatar: updatedAvatar,
          playerGraveyard: [...get().playerGraveyard, ...usedEnergy],
          selectedCard: null,
          selectedTarget: null
        });
        
        toast.success(`Added ritual armor ${card.name} to ${playerActiveAvatar.name}`);
      }
      // Handle spells and quick spells
      else if ((card.type === 'spell' || card.type === 'quickSpell') && target) {
        // Use energy
        const newEnergyPile = [...playerEnergyPile];
        const usedEnergy = newEnergyPile.splice(0, card.energyCost || 0);
        
        // Apply spell effect based on target
        if (target === 'opponent-avatar' && opponentActiveAvatar) {
          // Deal damage to opponent's avatar (simple effect for now)
          const updatedOpponentAvatar = {
            ...opponentActiveAvatar,
            damageCounter: opponentActiveAvatar.damageCounter + 2 // Standard damage
          };
          
          set({
            playerHand: newHand,
            playerEnergyPile: newEnergyPile,
            opponentActiveAvatar: updatedOpponentAvatar,
            playerGraveyard: [...get().playerGraveyard, ...usedEnergy, card], // Spells go to graveyard
            selectedCard: null,
            selectedTarget: null
          });
          
          toast.success(`${card.name} dealt 2 damage to opponent's ${opponentActiveAvatar.name}!`);
        }
        else if (target === 'player-avatar' && playerActiveAvatar) {
          // Heal player's avatar (simple effect for now)
          const updatedPlayerAvatar = {
            ...playerActiveAvatar,
            damageCounter: Math.max(0, playerActiveAvatar.damageCounter - 3) // Heal 3 damage
          };
          
          set({
            playerHand: newHand,
            playerEnergyPile: newEnergyPile,
            playerActiveAvatar: updatedPlayerAvatar,
            playerGraveyard: [...get().playerGraveyard, ...usedEnergy, card], // Spells go to graveyard
            selectedCard: null,
            selectedTarget: null
          });
          
          toast.success(`${card.name} healed 3 damage from ${playerActiveAvatar.name}!`);
        }
      }
      // Handle items
      else if (card.type === 'item') {
        // Items typically don't need targets and have special effects
        // For a sample energy crystal item
        if (card.effect === 'add_energy') {
          set({
            playerHand: newHand,
            playerEnergyPile: [...playerEnergyPile, card], // Use the card itself as energy
            selectedCard: null,
            selectedTarget: null
          });
          
          toast.success(`Used ${card.name} to add 1 energy.`);
        } else {
          // Other item effects would go here
          set({
            playerHand: newHand,
            playerGraveyard: [...get().playerGraveyard, card],
            selectedCard: null,
            selectedTarget: null
          });
          
          toast.success(`Used item: ${card.name}`);
        }
      }
      else {
        // Invalid play (no target or wrong type)
        toast.error('This card needs a valid target.');
        return;
      }
    } 
    else {
      // Basic opponent AI card playing logic
      // This would be expanded with more sophisticated rules based on card types
      const card = opponentHand[handIndex];
      
      // Remove card from hand
      const newHand = [...opponentHand];
      newHand.splice(handIndex, 1);
      
      // Simple opponent logic - prioritize playing avatars
      if (card.type === 'avatar') {
        if (!opponentActiveAvatar) {
          // Make this the active avatar
          const avatarCard: AvatarInPlay = {
            ...card,
            tapped: false,
            damageCounter: 0,
            bleedCounter: 0,
            shieldCounter: 0,
            attachedCards: []
          };
          
          set({
            opponentHand: newHand,
            opponentActiveAvatar: avatarCard
          });
          
          toast.info(`Opponent played ${card.name} as active avatar.`);
        } else {
          // Add to reserve
          const avatarCard: AvatarInPlay = {
            ...card,
            tapped: false,
            damageCounter: 0,
            bleedCounter: 0,
            shieldCounter: 0,
            attachedCards: []
          };
          
          set({
            opponentHand: newHand,
            opponentReserveAvatars: [...opponentReserveAvatars, avatarCard]
          });
          
          toast.info(`Opponent added ${card.name} to reserve avatars.`);
        }
      } else {
        // For now, just discard other card types in AI
        set({
          opponentHand: newHand,
          opponentGraveyard: [...get().opponentGraveyard, card]
        });
        
        toast.info(`Opponent played ${card.name}.`);
      }
    }
  },
  
  // Select a creature to attack with
  selectCreature: (fieldIndex: number) => {
    const { playerField, currentPlayer, gamePhase } = get();
    
    // Can only select creatures during attack phase and on player's turn
    if (currentPlayer === 'player' && gamePhase === 'attack') {
      const creature = playerField[fieldIndex];
      
      // Can't attack with a tapped creature
      if (creature.tapped) {
        toast.error('This creature has already attacked this turn');
        return;
      }
      
      set({ selectedCreature: fieldIndex });
    }
  },
  
  // Attack another creature
  attackCreature: (attackerIndex: number, defenderIndex: number) => {
    const { 
      playerField, 
      opponentField, 
      currentPlayer, 
      gamePhase 
    } = get();
    
    // Make sure it's the attack phase and player's turn
    if (currentPlayer !== 'player' || gamePhase !== 'attack') {
      return;
    }
    
    const attacker = playerField[attackerIndex];
    const defender = opponentField[defenderIndex];
    
    if (!attacker || !defender) {
      return;
    }
    
    // Calculate damage
    const [updatedAttacker, updatedDefender, attackerDied, defenderDied] = 
      calculateDamage(attacker, defender);
    
    // Update the fields
    const newPlayerField = [...playerField];
    const newOpponentField = [...opponentField];
    
    // Tap the attacker
    newPlayerField[attackerIndex] = {
      ...updatedAttacker,
      tapped: true
    };
    
    // Update or remove the defender
    if (defenderDied) {
      newOpponentField.splice(defenderIndex, 1);
      toast.success(`${defender.name} was destroyed!`);
    } else {
      newOpponentField[defenderIndex] = updatedDefender;
    }
    
    // Remove the attacker if it died
    if (attackerDied) {
      newPlayerField.splice(attackerIndex, 1);
      toast.error(`${attacker.name} was destroyed!`);
    }
    
    set({ 
      playerField: newPlayerField, 
      opponentField: newOpponentField,
      selectedCreature: null
    });
  },
  
  // Attack the opponent directly
  attackPlayer: (attackerIndex: number) => {
    const { 
      playerField, 
      opponentHealth, 
      currentPlayer, 
      gamePhase 
    } = get();
    
    // Make sure it's the attack phase and player's turn
    if (currentPlayer !== 'player' || gamePhase !== 'attack') {
      return;
    }
    
    const attacker = playerField[attackerIndex];
    
    if (!attacker) {
      return;
    }
    
    // Deal damage to opponent
    const newOpponentHealth = opponentHealth - (attacker.attack || 0);
    
    // Update the attacker
    const newPlayerField = [...playerField];
    newPlayerField[attackerIndex] = {
      ...attacker,
      tapped: true
    };
    
    set({ 
      playerField: newPlayerField, 
      opponentHealth: newOpponentHealth,
      selectedCreature: null
    });
    
    toast.success(`Dealt ${attacker.attack} damage to opponent`);
    
    // Check if this attack won the game
    const winner = checkWinner(get().playerHealth, newOpponentHealth);
    if (winner) {
      set({ winner });
    }
  },
  
  // End current turn and start next turn
  endTurn: () => {
    const { 
      currentPlayer, 
      turn, 
      playerActiveAvatar,
      opponentActiveAvatar
    } = get();
    
    if (currentPlayer === 'player') {
      // Start opponent's turn
      set({ 
        currentPlayer: 'opponent', 
        gamePhase: 'refresh'
      });
      
      // Untap opponent's active avatar if one exists
      if (opponentActiveAvatar) {
        set({
          opponentActiveAvatar: {
            ...opponentActiveAvatar,
            tapped: false
          }
        });
      }
      
      // Simulate opponent's turn after a short delay
      setTimeout(() => {
        // Draw phase
        get().drawCard();
        
        // Main phase - play a card if possible (simplified AI)
        setTimeout(() => {
          // Simple algorithm: If no active avatar, play first avatar in hand if any
          const opponentHand = get().opponentHand;
          const avatarCardIndex = opponentHand.findIndex(card => card.type === 'avatar');
          
          if (avatarCardIndex !== -1 && !get().opponentActiveAvatar) {
            get().playCard(avatarCardIndex);
          }
          
          // End turn after brief delay
          setTimeout(() => {
            // Start player's turn
            set({ 
              currentPlayer: 'player', 
              gamePhase: 'refresh',
              turn: turn + 1
            });
            
            toast.info('Your turn. Begin with refresh phase.');
          }, 1000);
        }, 1000);
      }, 1000);
    } else {
      // Start player's turn
      set({ 
        currentPlayer: 'player', 
        gamePhase: 'refresh',
        turn: turn + 1
      });
      
      toast.info('Your turn. Begin with refresh phase.');
    }
  },
  
  // Select a card from hand
  selectCard: (handIndex: number) => {
    const { currentPlayer, playerHand, gamePhase } = get();
    
    // Can only select cards during main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      return;
    }
    
    set({ selectedCard: handIndex });
    toast.info(`Selected ${playerHand[handIndex].name}. Now choose a target.`);
  },
  
  // Select a target for a card or skill
  selectTarget: (targetId: string) => {
    const { selectedCard, currentPlayer, playerHand, gamePhase } = get();
    
    // Must have a card selected first
    if (selectedCard === null) {
      toast.error('Select a card first before choosing a target.');
      return;
    }
    
    // Can only select targets during main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      return;
    }
    
    set({ selectedTarget: targetId });
    
    // Automatically play the card to the selected target
    get().playCard(selectedCard as number, targetId);
  },
  
  // Use avatar skill
  useAvatarSkill: (skillIndex: 1 | 2, target: string) => {
    const { 
      currentPlayer, 
      gamePhase, 
      playerActiveAvatar, 
      opponentActiveAvatar,
      playerEnergyPile 
    } = get();
    
    // Can only use skills during main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      toast.error('You can only use skills during your main phases.');
      return;
    }
    
    // Must have an active avatar
    if (!playerActiveAvatar) {
      toast.error('You need an active avatar to use skills.');
      return;
    }
    
    // Avatar must not be tapped
    if (playerActiveAvatar.tapped) {
      toast.error('This avatar has already used a skill this turn.');
      return;
    }
    
    // Get the appropriate skill
    const skill = skillIndex === 1 ? playerActiveAvatar.skill1 : playerActiveAvatar.skill2;
    
    // Check if skill exists
    if (!skill) {
      toast.error(`This avatar doesn't have skill ${skillIndex}.`);
      return;
    }
    
    // Check if player has enough energy
    if (playerEnergyPile.length < skill.energyCost) {
      toast.error(`Not enough energy. Need ${skill.energyCost} energy cards.`);
      return;
    }
    
    // Use the energy
    const newEnergyPile = [...playerEnergyPile];
    const usedEnergy = newEnergyPile.splice(0, skill.energyCost);
    
    // Move used energy to graveyard
    const newGraveyard = [...get().playerGraveyard, ...usedEnergy];
    
    // Apply skill effect based on target
    if (target === 'opponent-avatar' && opponentActiveAvatar) {
      // Deal damage to opponent's avatar
      const updatedOpponentAvatar = {
        ...opponentActiveAvatar,
        damageCounter: opponentActiveAvatar.damageCounter + skill.damage
      };
      
      // Check if opponent's avatar is defeated
      if (updatedOpponentAvatar.damageCounter >= (updatedOpponentAvatar.health || 0)) {
        // Avatar is defeated, move it to graveyard
        const newOpponentGraveyard = [...get().opponentGraveyard, opponentActiveAvatar];
        
        // Move a life card to opponent's hand if available
        let newOpponentLifeCards = [...get().opponentLifeCards];
        let updatedOpponentHand = [...get().opponentHand];
        
        if (newOpponentLifeCards.length > 0) {
          const lifeCard = newOpponentLifeCards.pop();
          if (lifeCard) {
            updatedOpponentHand.push(lifeCard);
          }
        }
        
        // If no life cards left, player wins
        if (newOpponentLifeCards.length === 0) {
          set({ winner: 'player' });
          toast.success('You win! Your opponent has no more life cards.');
        }
        
        set({
          playerActiveAvatar: {
            ...playerActiveAvatar,
            tapped: true
          },
          playerEnergyPile: newEnergyPile,
          playerGraveyard: newGraveyard,
          opponentActiveAvatar: null,
          opponentGraveyard: newOpponentGraveyard,
          opponentLifeCards: newOpponentLifeCards,
          opponentHand: updatedOpponentHand,
          selectedCard: null,
          selectedTarget: null
        });
        
        toast.success(`${skill.name} defeated opponent's ${opponentActiveAvatar.name}!`);
      } else {
        // Avatar survives, update its state
        set({
          playerActiveAvatar: {
            ...playerActiveAvatar,
            tapped: true
          },
          playerEnergyPile: newEnergyPile,
          playerGraveyard: newGraveyard,
          opponentActiveAvatar: updatedOpponentAvatar,
          selectedCard: null,
          selectedTarget: null
        });
        
        toast.success(`${skill.name} dealt ${skill.damage} damage to opponent's ${opponentActiveAvatar.name}!`);
      }
    }
  },
  
  // Set a card from hand as energy
  setEnergyCard: (handIndex: number) => {
    const gameStore = useGameStore.getState();
    gameStore.addToEnergyPile(handIndex);
  },
  
  // Switch to a different avatar from reserves
  switchAvatar: (reserveIndex: number) => {
    const { 
      currentPlayer, 
      gamePhase, 
      playerReserveAvatars, 
      playerActiveAvatar,
      playerEnergyPile 
    } = get();
    
    // Can only switch avatars during main phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      toast.error('You can only switch avatars during your main phases.');
      return;
    }
    
    // Check if player has enough energy (costs 1 energy to switch)
    if (playerEnergyPile.length < 1) {
      toast.error('Not enough energy. Need 1 energy card to switch avatars.');
      return;
    }
    
    // Get the new active avatar
    const newActiveAvatar = playerReserveAvatars[reserveIndex];
    
    // Update reserve avatars list
    const newReserveAvatars = [...playerReserveAvatars];
    newReserveAvatars.splice(reserveIndex, 1);
    
    // If there was an active avatar, add it to reserves
    if (playerActiveAvatar) {
      newReserveAvatars.push(playerActiveAvatar);
    }
    
    // Use 1 energy card
    const newEnergyPile = [...playerEnergyPile];
    const usedEnergy = newEnergyPile.splice(0, 1);
    
    // Move used energy to graveyard
    const newGraveyard = [...get().playerGraveyard, ...usedEnergy];
    
    set({
      playerActiveAvatar: newActiveAvatar,
      playerReserveAvatars: newReserveAvatars,
      playerEnergyPile: newEnergyPile,
      playerGraveyard: newGraveyard,
      selectedCard: null,
      selectedTarget: null
    });
    
    toast.success(`Switched to ${newActiveAvatar.name}!`);
  },
  
  // End the current phase and move to the next
  endPhase: () => {
    const { gamePhase, currentPlayer } = get();
    
    if (currentPlayer !== 'player') {
      return;
    }
    
    // Phase progression
    switch (gamePhase) {
      case 'refresh':
        // Untap avatar
        if (get().playerActiveAvatar) {
          set({
            playerActiveAvatar: {
              ...get().playerActiveAvatar!,
              tapped: false
            }
          });
        }
        set({ gamePhase: 'draw' });
        toast.info('Draw Phase: Draw a card from your deck.');
        break;
        
      case 'draw':
        get().drawCard();
        set({ gamePhase: 'main1' });
        toast.info('Main Phase 1: Play cards or use avatar skills.');
        break;
        
      case 'main1':
        set({ gamePhase: 'battle' });
        toast.info('Battle Phase: Attack with your active avatar.');
        break;
        
      case 'battle':
        set({ gamePhase: 'damage' });
        toast.info('Damage Phase: Resolve damage from the battle.');
        break;
        
      case 'damage':
        set({ gamePhase: 'main2' });
        toast.info('Main Phase 2: Play more cards or use skills.');
        break;
        
      case 'main2':
        set({ gamePhase: 'end' });
        toast.info('End Phase: End your turn.');
        break;
        
      case 'end':
        get().endTurn();
        break;
        
      default:
        break;
    }
  },
  
  // Simulate the opponent's turn
  simulateOpponentTurn: () => {
    const { 
      opponentHand, 
      opponentField, 
      playerField, 
      playerHealth,
      opponentMana
    } = get();
    
    // Draw a card
    get().drawCard();
    
    // Play cards if possible
    setTimeout(() => {
      // Simple AI - play the first playable card
      const playableCardIndex = opponentHand.findIndex(card => card.cost <= opponentMana);
      
      if (playableCardIndex !== -1) {
        get().playCard(playableCardIndex);
      }
      
      // Move to attack phase
      setTimeout(() => {
        // Attack with all creatures
        const attackers = [...opponentField].filter(card => !card.tapped);
        
        attackers.forEach((attacker, index) => {
          setTimeout(() => {
            // If player has creatures, attack them first
            if (playerField.length > 0) {
              // Simple AI - attack the weakest creature
              const weakestCreatureIndex = playerField
                .map((card, index) => ({ index, power: card.health || 0 }))
                .sort((a, b) => a.power - b.power)[0]?.index || 0;
              
              // Simulate an attack from opponent
              get().simulateOpponentAttack(index, weakestCreatureIndex);
            } else {
              // Attack player directly
              get().simulateOpponentAttackPlayer(index);
            }
          }, index * 500); // Stagger attacks for visual effect
        });
        
        // End opponent's turn after attacks
        setTimeout(() => {
          get().endTurn();
        }, attackers.length * 500 + 500);
      }, 1000);
    }, 1000);
  },
  
  // Simulate opponent attacking a creature
  simulateOpponentAttack: (attackerIndex: number, defenderIndex: number) => {
    const { 
      playerField, 
      opponentField
    } = get();
    
    const attacker = opponentField[attackerIndex];
    const defender = playerField[defenderIndex];
    
    if (!attacker || !defender) {
      return;
    }
    
    // Calculate damage
    const [updatedAttacker, updatedDefender, attackerDied, defenderDied] = 
      calculateDamage(attacker, defender);
    
    // Update the fields
    const newOpponentField = [...opponentField];
    const newPlayerField = [...playerField];
    
    // Tap the attacker
    newOpponentField[attackerIndex] = {
      ...updatedAttacker,
      tapped: true
    };
    
    // Update or remove the defender
    if (defenderDied) {
      newPlayerField.splice(defenderIndex, 1);
      toast.error(`Your ${defender.name} was destroyed!`);
    } else {
      newPlayerField[defenderIndex] = updatedDefender;
    }
    
    // Remove the attacker if it died
    if (attackerDied) {
      newOpponentField.splice(attackerIndex, 1);
      toast.success(`Opponent's ${attacker.name} was destroyed!`);
    }
    
    set({ 
      opponentField: newOpponentField, 
      playerField: newPlayerField
    });
  },
  
  // Simulate opponent attacking the player directly
  simulateOpponentAttackPlayer: (attackerIndex: number) => {
    const { 
      opponentField, 
      playerHealth 
    } = get();
    
    const attacker = opponentField[attackerIndex];
    
    if (!attacker) {
      return;
    }
    
    // Deal damage to player
    const newPlayerHealth = playerHealth - (attacker.attack || 0);
    
    // Update the attacker
    const newOpponentField = [...opponentField];
    newOpponentField[attackerIndex] = {
      ...attacker,
      tapped: true
    };
    
    set({ 
      opponentField: newOpponentField, 
      playerHealth: newPlayerHealth
    });
    
    toast.error(`Took ${attacker.attack} damage from opponent's ${attacker.name}`);
    
    // Check if this attack won the game
    const winner = checkWinner(newPlayerHealth, get().opponentHealth);
    if (winner) {
      set({ winner });
    }
  }
}));
