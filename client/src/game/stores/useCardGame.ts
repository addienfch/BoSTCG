import { create } from 'zustand';
import { CardData } from '../components/Card';
import { getInitialDeck, shuffleDeck } from '../data/cards';
import { calculateDamage, checkWinner, handleSpellEffect } from '../utils/gameLogic';
import { toast } from 'sonner';

// Define the types for our game state
export type Player = 'player' | 'opponent';
export type GamePhase = 'draw' | 'play' | 'attack' | 'end';

// Creatures on the field need additional properties
export interface FieldCard extends CardData {
  tapped: boolean; // Whether the creature has attacked this turn
  damage: number; // Accumulated damage
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
  playerField: FieldCard[];
  mana: number;
  maxMana: number;
  
  // Opponent state
  opponentHealth: number;
  opponentDeck: CardData[];
  opponentHand: CardData[];
  opponentField: FieldCard[];
  opponentMana: number;
  opponentMaxMana: number;
  
  // Selection state
  selectedCreature: number | null;
  
  // Actions
  startGame: () => void;
  drawCard: () => void;
  playCard: (handIndex: number) => void;
  selectCreature: (fieldIndex: number) => void;
  attackCreature: (attackerIndex: number, defenderIndex: number) => void;
  attackPlayer: (attackerIndex: number) => void;
  endTurn: () => void;
  processPhase: () => void;
}

export const useCardGame = create<CardGameState>((set, get) => ({
  // Initial state
  currentPlayer: 'player',
  gamePhase: 'draw',
  turn: 1,
  winner: null,
  
  playerHealth: 20,
  playerDeck: [],
  playerHand: [],
  playerField: [],
  mana: 1,
  maxMana: 1,
  
  opponentHealth: 20,
  opponentDeck: [],
  opponentHand: [],
  opponentField: [],
  opponentMana: 1,
  opponentMaxMana: 1,
  
  selectedCreature: null,
  
  // Start a new game
  startGame: () => {
    const playerDeck = shuffleDeck(getInitialDeck('player'));
    const opponentDeck = shuffleDeck(getInitialDeck('opponent'));
    
    // Give each player a starting hand of 3 cards
    const playerHand = playerDeck.splice(0, 3);
    const opponentHand = opponentDeck.splice(0, 3);
    
    set({
      currentPlayer: 'player',
      gamePhase: 'draw',
      turn: 1,
      winner: null,
      
      playerHealth: 20,
      playerDeck,
      playerHand,
      playerField: [],
      mana: 1,
      maxMana: 1,
      
      opponentHealth: 20,
      opponentDeck,
      opponentHand,
      opponentField: [],
      opponentMana: 1,
      opponentMaxMana: 1,
      
      selectedCreature: null,
    });
  },
  
  // Draw a card from the deck
  drawCard: () => {
    const { currentPlayer, playerDeck, playerHand, opponentDeck, opponentHand } = get();
    
    if (currentPlayer === 'player') {
      if (playerDeck.length === 0) {
        // Player loses if they can't draw
        set({ winner: 'opponent' });
        return;
      }
      
      const [newCard, ...remainingDeck] = playerDeck;
      set({ 
        playerDeck: remainingDeck, 
        playerHand: [...playerHand, newCard],
        gamePhase: 'play'
      });
      
      toast.success(`Drew ${newCard.name}`);
    } else {
      if (opponentDeck.length === 0) {
        // Opponent loses if they can't draw
        set({ winner: 'player' });
        return;
      }
      
      const [newCard, ...remainingDeck] = opponentDeck;
      set({ 
        opponentDeck: remainingDeck, 
        opponentHand: [...opponentHand, newCard],
        gamePhase: 'play'
      });
    }
  },
  
  // Play a card from hand
  playCard: (handIndex: number) => {
    const { 
      currentPlayer, 
      playerHand, 
      playerField, 
      opponentHand, 
      opponentField,
      mana,
      opponentMana
    } = get();
    
    if (currentPlayer === 'player') {
      const card = playerHand[handIndex];
      
      // Check if player has enough mana
      if (card.cost > mana) {
        toast.error('Not enough mana!');
        return;
      }
      
      // Remove card from hand
      const newHand = [...playerHand];
      newHand.splice(handIndex, 1);
      
      // If it's a creature, add to field
      if (card.type === 'creature') {
        const fieldCard: FieldCard = {
          ...card,
          tapped: true, // Can't attack on the turn it's played
          damage: 0
        };
        
        set({ 
          playerHand: newHand, 
          playerField: [...playerField, fieldCard],
          mana: mana - card.cost
        });
        
        toast.success(`Played ${card.name}`);
      } 
      // If it's a spell, resolve effect immediately
      else if (card.type === 'spell') {
        const updatedState = handleSpellEffect(card, get());
        set({ 
          ...updatedState,
          playerHand: newHand,
          mana: mana - card.cost
        });
        
        toast.success(`Cast ${card.name}`);
      }
    } else {
      // Opponent's turn
      const card = opponentHand[handIndex];
      
      // Check if opponent has enough mana
      if (card.cost > opponentMana) {
        return;
      }
      
      // Remove card from hand
      const newHand = [...opponentHand];
      newHand.splice(handIndex, 1);
      
      // If it's a creature, add to field
      if (card.type === 'creature') {
        const fieldCard: FieldCard = {
          ...card,
          tapped: true, // Can't attack on the turn it's played
          damage: 0
        };
        
        set({ 
          opponentHand: newHand, 
          opponentField: [...opponentField, fieldCard],
          opponentMana: opponentMana - card.cost
        });
        
        toast.info(`Opponent played ${card.name}`);
      } 
      // If it's a spell, resolve effect immediately
      else if (card.type === 'spell') {
        const updatedState = handleSpellEffect(card, get());
        set({ 
          ...updatedState,
          opponentHand: newHand,
          opponentMana: opponentMana - card.cost
        });
        
        toast.info(`Opponent cast ${card.name}`);
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
      maxMana, 
      opponentMaxMana,
      playerField, 
      opponentField 
    } = get();
    
    if (currentPlayer === 'player') {
      // Untap opponent's creatures
      const newOpponentField = opponentField.map(card => ({
        ...card,
        tapped: false
      }));
      
      // Increment opponent's mana to a maximum of 10
      const newOpponentMaxMana = Math.min(opponentMaxMana + 1, 10);
      
      set({ 
        currentPlayer: 'opponent', 
        gamePhase: 'draw',
        opponentField: newOpponentField,
        opponentMana: newOpponentMaxMana,
        opponentMaxMana: newOpponentMaxMana
      });
      
      // Simulate opponent's turn after a short delay
      setTimeout(() => {
        get().simulateOpponentTurn();
      }, 1000);
    } else {
      // Untap player's creatures
      const newPlayerField = playerField.map(card => ({
        ...card,
        tapped: false
      }));
      
      // Increment player's mana to a maximum of 10
      const newMaxMana = Math.min(maxMana + 1, 10);
      
      set({ 
        currentPlayer: 'player', 
        gamePhase: 'draw',
        turn: turn + 1,
        playerField: newPlayerField,
        mana: newMaxMana,
        maxMana: newMaxMana,
      });
    }
  },
  
  // Process the current phase and move to the next one
  processPhase: () => {
    const { gamePhase, currentPlayer } = get();
    
    if (currentPlayer !== 'player') {
      return;
    }
    
    switch (gamePhase) {
      case 'draw':
        get().drawCard();
        break;
      case 'play':
        set({ gamePhase: 'attack' });
        break;
      case 'attack':
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
