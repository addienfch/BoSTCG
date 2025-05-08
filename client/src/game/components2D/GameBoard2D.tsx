import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useGameMode } from '../stores/useGameMode';
import Card2D from './Card2D';
import { toast } from 'sonner';
import { AvatarCard, Card } from '../data/cardTypes';
import { SimpleGameAI, AIGameState } from '../ai/SimpleGameAI';
import { useNavigate } from 'react-router-dom';

interface GameBoard2DProps {
  onAction?: (action: string, data?: any) => void;
}

const GameBoard2D: React.FC<GameBoard2DProps> = ({ onAction }) => {
  // Get game state from store
  const game = useGameStore();
  // Get the navigate function from react-router
  const navigate = useNavigate();
  
  // Determine if a card is playable (can be placed on the field)
  const isCardPlayable = (card: Card) => {
    // Check game phase and energy requirements
    const { player, gamePhase, currentPlayer } = game;
    
    // Special handling for the setup phase
    if (gamePhase === 'setup' && currentPlayer === 'player') {
      // During setup phase, only level 1 avatars can be played if player has no active avatar
      return card.type === 'avatar' && (card as AvatarCard).level === 1 && player.activeAvatar === null;
    }
    
    // For regular phases
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      return false;
    }
    
    // Energy requirements vary by card type
    if (card.type === 'avatar') {
      // Avatars can only be played if player has no active avatar or reserve slots
      if (player.activeAvatar === null || player.reserveAvatars.length < 2) {
        return true;
      }
      return false;
    } else if (card.type === 'spell' || card.type === 'quickSpell') {
      // Spells require an active avatar
      if (!player.activeAvatar) {
        return false;
      }
      
      // Check if player has enough energy
      return game.hasEnoughEnergy(card.energyCost || [], 'player');
    }
    
    return false;
  };
  
  // Function to handle card actions
  const handleCardAction = (card: Card, action: string) => {
    console.log(action, card);
    
    // Special handling for setup phase
    if (game.gamePhase === 'setup') {
      // During setup phase, only allow placing level 1 avatars as active
      if (action !== 'active' && action !== 'play') {
        toast.error("You can only place level 1 avatars as active during the Setup Phase!");
        return;
      }
      
      if (card.type !== 'avatar' || (card as AvatarCard).level !== 1) {
        toast.error("You can only place level 1 avatars during the Setup Phase!");
        return;
      }
      
      if (game.player.activeAvatar !== null) {
        toast.error("You already have an active avatar! Click 'Next Phase' to continue.");
        return;
      }
      
      // Find the card index
      const index = game.player.hand.findIndex(c => c.id === card.id);
      if (index === -1) {
        toast.error("Card not found in your hand!");
        return;
      }
      
      // Create a copy of the hand
      const updatedHand = [...game.player.hand];
      
      // Get the avatar card
      const avatarCard = updatedHand[index] as AvatarCard;
      
      // Remove from hand
      updatedHand.splice(index, 1);
      
      // Set as active avatar with turn tracking
      avatarCard.turnPlayed = game.turn;
      
      // Update game state
      game.player.hand = updatedHand;
      game.player.activeAvatar = avatarCard;
      
      game.addLog(`Setup: You played ${card.name} as your active avatar.`);
      toast.success(`${card.name} placed as active avatar. Click 'Next Phase' to continue.`);
      return;
    }
    
    // Common validation for regular phases
    if (game.currentPlayer !== 'player' || (game.gamePhase !== 'main1' && game.gamePhase !== 'main2')) {
      toast.error("You can only perform actions during your Main Phases!");
      return;
    }
    
    // Find the card index
    const index = game.player.hand.findIndex(c => c.id === card.id);
    if (index === -1) {
      toast.error("Card not found in your hand!");
      return;
    }
    
    if (action === 'play') {
      // Play non-avatar cards
      game.playCard(index);
      
    } else if (action === 'active') {
      // Place as active avatar
      if (card.type !== 'avatar') {
        toast.error("Only avatar cards can be placed as active avatar!");
        return;
      }
      
      // Get the avatar card for type checking
      const avatarCard = card as AvatarCard;
      
      // Check if trying to place a level 2 avatar
      if (avatarCard.level === 2) {
        // Check if there's an active avatar to upgrade
        if (!game.player.activeAvatar) {
          toast.error("You need a level 1 active avatar to upgrade to level 2!");
          return;
        }
        
        // Check if the active avatar is of the same subType
        if (game.player.activeAvatar.subType !== avatarCard.subType) {
          toast.error(`You can only upgrade to a level 2 ${avatarCard.subType} avatar from a level 1 ${avatarCard.subType} avatar!`);
          return;
        }
        
        // Check if the current active avatar is already level 2
        if (game.player.activeAvatar.level === 2) {
          toast.error("You cannot replace a level 2 avatar with another level 2 avatar!");
          return;
        }
        
        // Check if the avatar has been in play for at least one turn
        if (game.player.activeAvatar.turnPlayed !== undefined && 
            game.turn <= game.player.activeAvatar.turnPlayed) {
          toast.error("You need to wait at least one turn before upgrading your avatar!");
          return;
        }
        
        // Perform upgrade - move current active avatar to graveyard
        game.player.graveyard.push(game.player.activeAvatar);
        
        // Remove the level 2 card from hand
        const updatedHand = [...game.player.hand];
        const cardIndex = updatedHand.findIndex(c => c.id === card.id);
        updatedHand.splice(cardIndex, 1);
        game.player.hand = updatedHand;
        
        // Set the new active avatar
        avatarCard.turnPlayed = game.turn;
        game.player.activeAvatar = avatarCard;
        
        game.addLog(`${game.player.activeAvatar.name} upgraded to ${avatarCard.name}.`);
        toast.success(`${avatarCard.name} placed as active avatar!`);
      } else {
        // Normal level 1 avatar placement
        if (game.player.activeAvatar !== null) {
          toast.error("You already have an active avatar!");
          return;
        }
        
        // This uses the playCard implementation specifically for avatars
        // Track which turn the avatar was played
        const avatarFromHand = game.player.hand.find(c => c.id === card.id) as AvatarCard;
        if (avatarFromHand) {
          avatarFromHand.turnPlayed = game.turn;
        }
        
        game.playCard(index);
        toast.success(`${card.name} placed as active avatar!`);
      }
    } else if (action === 'reserve') {
      // Place as reserve avatar
      if (card.type !== 'avatar') {
        toast.error("Only avatar cards can be placed in reserve!");
        return;
      }
      
      // Get the avatar card for type checking
      const avatarCard = card as AvatarCard;
      
      // Check if trying to place a level 2 avatar in reserve
      if (avatarCard.level === 2) {
        // Check if there's a matching level 1 avatar to upgrade
        const matchingReserveIndex = game.player.reserveAvatars.findIndex(
          a => a.subType === avatarCard.subType && a.level === 1
        );
        
        if (matchingReserveIndex === -1) {
          toast.error(`You need a level 1 ${avatarCard.subType} avatar in reserve to upgrade to level 2!`);
          return;
        }
        
        // Check if the reserve avatar to be upgraded is already level 2
        const reserveToUpgrade = game.player.reserveAvatars[matchingReserveIndex];
        if (reserveToUpgrade.level === 2) {
          toast.error("You cannot replace a level 2 avatar with another level 2 avatar!");
          return;
        }
        
        // Check if the avatar has been in play for at least one turn
        if (reserveToUpgrade.turnPlayed !== undefined && 
            game.turn <= reserveToUpgrade.turnPlayed) {
          toast.error("You need to wait at least one turn before upgrading your reserve avatar!");
          return;
        }
        
        // Perform upgrade - move matching reserve avatar to graveyard
        game.player.graveyard.push(reserveToUpgrade);
        
        // Remove the level 2 card from hand
        const updatedHand = [...game.player.hand];
        const cardIndex = updatedHand.findIndex(c => c.id === card.id);
        updatedHand.splice(cardIndex, 1);
        game.player.hand = updatedHand;
        
        // Replace the upgraded reserve avatar
        avatarCard.turnPlayed = game.turn;
        game.player.reserveAvatars[matchingReserveIndex] = avatarCard;
        
        game.addLog(`${reserveToUpgrade.name} in reserve upgraded to ${avatarCard.name}.`);
        toast.success(`${avatarCard.name} placed in reserve!`);
      } else {
        // Normal level 1 avatar placement
        if (game.player.reserveAvatars.length >= 2) {
          toast.error("You already have the maximum number of reserve avatars (2)!");
          return;
        }
        
        // Use the game store's internal methods to handle this
        const updatedHand = [...game.player.hand];
        const cardIndex = updatedHand.findIndex(c => c.id === card.id);
        
        if (cardIndex !== -1) {
          // Remove the card from hand
          const avatarCard = updatedHand.splice(cardIndex, 1)[0] as AvatarCard;
          
          // Track which turn the avatar was played
          avatarCard.turnPlayed = game.turn;
          
          // Update the game state
          game.player.hand = updatedHand;
          game.player.reserveAvatars.push(avatarCard);
          
          // Log the action
          game.addLog(`${card.name} placed in reserve.`);
          toast.success(`${card.name} placed in reserve!`);
        }
      }
      
    } else if (action === 'toEnergy') {
      // Only limit avatar cards to energy pile - one per turn
      if (card.type === 'avatar' && game.player.avatarToEnergyCount >= 1) {
        toast.error("You can only put 1 Avatar card into energy per turn!");
        return;
      }

      // No limit on other card types - all cards can be moved to energy
      game.moveCardToEnergy(index);
      toast.success(`${card.name} added to your energy pile`);
    }
  };
  
  // Function to handle skill usage
  const handleSkillUse = (skillNumber: 1 | 2) => {
    if (!game.player.activeAvatar) {
      toast.error("You need an active avatar to use skills!");
      return;
    }
    
    // Add debug logging to track avatar state
    console.log('Avatar state when using skill:', {
      name: game.player.activeAvatar.name,
      isTapped: game.player.activeAvatar.isTapped,
      turnPlayed: game.player.activeAvatar.turnPlayed,
      currentTurn: game.turn
    });
    
    // Note: Each avatar can use skills once per battle phase, regardless of when they were played
    
    // Check if the skill exists
    if (skillNumber === 2 && !game.player.activeAvatar.skill2) {
      toast.error("This avatar doesn't have a second skill!");
      return;
    }
    
    // Handle skill use logic
    // Third parameter is target (optional)
    game.useAvatarSkill('player', skillNumber, undefined);
  };
  
  // Function to handle selecting a reserve avatar when active avatar dies
  const handleSelectReserveAvatar = (reserveIndex: number) => {
    // Make sure the index is valid and player needs to select a reserve avatar
    if (!game.player.needsToSelectReserveAvatar || 
        reserveIndex < 0 || 
        reserveIndex >= game.player.reserveAvatars.length) {
      return;
    }
    
    // Get the selected reserve avatar
    const reserveAvatars = [...game.player.reserveAvatars];
    const selectedAvatar = reserveAvatars[reserveIndex];
    
    // Remove it from reserves
    reserveAvatars.splice(reserveIndex, 1);
    
    // Update the game state with the selected avatar as active
    game.player.activeAvatar = selectedAvatar;
    game.player.reserveAvatars = reserveAvatars;
    game.player.needsToSelectReserveAvatar = false;
    
    // Log the action
    game.addLog(`${selectedAvatar.name} has moved to the active position.`);
    toast.success(`${selectedAvatar.name} is now your active avatar!`, { duration: 3000 });
    
    // Check for any defeated avatars (just in case)
    game.checkDefeatedAvatars();
  };
  
  // Function to handle phase progression
  const handleNextPhase = () => {
    if (game.currentPlayer === 'player') {
      // Before changing the phase, get the current phase
      const currentPhase = game.gamePhase;
      
      // Change the phase
      game.nextPhase();
      
      // After changing the phase, dispatch an event to notify components
      const newPhase = game.gamePhase;
      console.log(`Phase changed from ${currentPhase} to ${newPhase}`);
      
      // Only dispatch the event when entering refresh phase
      if (newPhase === 'refresh') {
        console.log('Dispatching gamePhaseChanged event for reset');
        const phaseChangeEvent = new Event('gamePhaseChanged');
        document.dispatchEvent(phaseChangeEvent);
      }
    }
  };
  
  // Current phase display text
  const phaseText = game.getPhaseText();
  
  // Get game mode information
  const gameMode = useGameMode();
  
  // Determine if it's the player's turn
  const isPlayerTurn = game.currentPlayer === 'player';
  
  // State for energy pile popup
  const [showEnergyPopup, setShowEnergyPopup] = React.useState(false);
  const [showUsedEnergyPopup, setShowUsedEnergyPopup] = React.useState(false);
  const [showOpponentEnergyPopup, setShowOpponentEnergyPopup] = React.useState(false);
  
  // Create an AI reference
  const aiRef = useRef<SimpleGameAI | null>(null);
  
  // Initialize the game once on mount
  React.useEffect(() => {
    // Initialize game state
    game.initGame();
    
    // Log message about hand limit
    game.addLog('Hand limit is 8 cards. If you have more, you must discard at the end of your turn.');
    
    // If in AI mode, create the AI instance
    if (String(gameMode.mode) === 'vs-ai') {
      // Create adapter for game state to AI interface
      const aiGameState: AIGameState = {
        currentPlayer: game.currentPlayer,
        gamePhase: game.gamePhase,
        turn: game.turn,
        
        player: {
          activeAvatar: game.player.activeAvatar,
          reserveAvatars: game.player.reserveAvatars,
          energyPile: game.player.energyPile,
          hand: game.player.hand,
          fieldCards: game.player.fieldCards,
          health: game.player.health,
          lifeCards: game.player.lifeCards,
          graveyard: game.player.graveyard,
          usedEnergyPile: game.player.usedEnergyPile,
        },
        
        opponent: {
          activeAvatar: game.opponent.activeAvatar,
          reserveAvatars: game.opponent.reserveAvatars,
          energyPile: game.opponent.energyPile,
          hand: game.opponent.hand,
          fieldCards: game.opponent.fieldCards,
          avatarToEnergyCount: game.opponent.avatarToEnergyCount,
          health: game.opponent.health,
          lifeCards: game.opponent.lifeCards,
          graveyard: game.opponent.graveyard,
          usedEnergyPile: game.opponent.usedEnergyPile,
        },
        
        // Functions to pass to AI
        moveCardToEnergy: (index: number) => {
          // If opponent has no cards, return
          if (index < 0 || index >= game.opponent.hand.length) {
            return;
          }
          
          // Get the card
          const card = game.opponent.hand[index];
          
          // Check if the card is an avatar - only avatar cards can be added to energy
          if (card.type !== 'avatar') {
            return; // AI should know only avatars can be placed as energy
          }

          // Check if we've already added an avatar to energy this turn
          if (game.opponent.avatarToEnergyCount >= 1) {
            return; // AI should know this rule already
          }
          
          // Move the card to opponent's energy
          const updatedHand = [...game.opponent.hand];
          updatedHand.splice(index, 1);
          
          // Update opponent state
          game.opponent.hand = updatedHand;
          game.opponent.energyPile.push(card);
          game.opponent.avatarToEnergyCount++;
          
          game.addLog(`Opponent added ${card.name} to their energy pile.`);
        },
        
        playAsActiveAvatar: (index: number) => {
          if (index < 0 || index >= game.opponent.hand.length) {
            return;
          }
          
          // Get the card
          const card = game.opponent.hand[index];
          
          // Make sure it's an avatar
          if (card.type !== 'avatar') {
            return;
          }
          
          // Make sure there's no active avatar
          if (game.opponent.activeAvatar !== null) {
            return;
          }
          
          // Move card from hand to active avatar
          const updatedHand = [...game.opponent.hand];
          updatedHand.splice(index, 1);
          
          // Add turn played tracking
          const avatarCard = card as AvatarCard;
          avatarCard.turnPlayed = game.turn;
          
          // Update opponent state
          game.opponent.hand = updatedHand;
          game.opponent.activeAvatar = avatarCard;
          
          game.addLog(`Opponent played ${card.name} as their active avatar.`);
        },
        
        playAsReserveAvatar: (index: number) => {
          if (index < 0 || index >= game.opponent.hand.length) {
            return;
          }
          
          // Get the card
          const card = game.opponent.hand[index];
          
          // Make sure it's an avatar
          if (card.type !== 'avatar') {
            return;
          }
          
          // Make sure there's room in reserves
          if (game.opponent.reserveAvatars.length >= 2) {
            return;
          }
          
          // Move card from hand to reserves
          const updatedHand = [...game.opponent.hand];
          updatedHand.splice(index, 1);
          
          // Add turn played tracking
          const avatarCard = card as AvatarCard;
          avatarCard.turnPlayed = game.turn;
          
          // Update opponent state
          game.opponent.hand = updatedHand;
          game.opponent.reserveAvatars.push(avatarCard);
          
          game.addLog(`Opponent placed ${card.name} in their reserve.`);
        },
        
        playSpell: (index: number) => {
          if (index < 0 || index >= game.opponent.hand.length) {
            return;
          }
          
          // Get the card
          const card = game.opponent.hand[index];
          
          // Make sure it's a spell
          if (card.type !== 'spell' && card.type !== 'quickSpell') {
            return;
          }
          
          // Check energy requirements
          if (!game.hasEnoughEnergy(card.energyCost || [], 'opponent')) {
            return;
          }
          
          // Use energy
          if (game.useEnergy(card.energyCost || [], 'opponent')) {
            // Remove card from hand
            const updatedHand = [...game.opponent.hand];
            updatedHand.splice(index, 1);
            
            // Update opponent state
            game.opponent.hand = updatedHand;
            game.opponent.graveyard.push(card);
            
            game.addLog(`Opponent played ${card.name}.`);
            
            // Handle spell effect (simplified for now)
            if (card.name === 'Burn Ball' && game.player.activeAvatar) {
              // Apply damage to player's avatar
              const playerAvatar = game.player.activeAvatar;
              const damage = 2; // Burn Ball does 2 damage
              
              // Add damage counter
              playerAvatar.counters = playerAvatar.counters || { damage: 0, bleed: 0, shield: 0 };
              playerAvatar.counters.damage += damage;
              
              game.addLog(`Burn Ball deals ${damage} damage to your avatar!`);
              game.checkDefeatedAvatars();
            }
          }
        },
        
        useAvatarSkill: (skillNumber: 1 | 2) => {
          // Make sure opponent has an active avatar
          if (!game.opponent.activeAvatar) {
            return;
          }
          
          // Check if avatar can use skills (not tapped)
          if (game.opponent.activeAvatar.isTapped) {
            return;
          }
          
          // Get the skill
          const skill = skillNumber === 1 
            ? game.opponent.activeAvatar.skill1
            : game.opponent.activeAvatar.skill2;
          
          // Make sure the skill exists (skill2 might not)
          if (!skill) {
            return;
          }
          
          // Check energy requirements
          if (!game.hasEnoughEnergy(skill.energyCost, 'opponent')) {
            return;
          }
          
          // Use energy
          if (game.useEnergy(skill.energyCost, 'opponent')) {
            // Apply skill effect
            const damage = skill.damage || 0;
            
            // Apply damage to player's avatar if it exists
            if (game.player.activeAvatar && damage > 0) {
              // Add damage counter
              game.player.activeAvatar.counters = game.player.activeAvatar.counters || { damage: 0, bleed: 0, shield: 0 };
              game.player.activeAvatar.counters.damage += damage;
              
              game.addLog(`Opponent used ${skill.name}, dealing ${damage} damage to your avatar!`);
              
              // Mark avatar as tapped (used)
              game.opponent.activeAvatar.isTapped = true;
              
              // Check for defeated avatars
              game.checkDefeatedAvatars();
            } else {
              game.addLog(`Opponent used ${skill.name}!`);
              game.opponent.activeAvatar.isTapped = true;
            }
          }
        },
        
        nextPhase: () => {
          game.nextPhase();
        },
        
        hasEnoughEnergy: (energyCost: string[]) => {
          return game.hasEnoughEnergy(energyCost as any, 'opponent');
        },
        
        addLog: (message: string) => {
          game.addLog(message);
        }
      };
      
      // Create AI and store in ref
      aiRef.current = new SimpleGameAI(aiGameState);
    }
  }, []);
  
  // Check for hand size limit at the end of the turn
  React.useEffect(() => {
    if (game.gamePhase === 'end' && game.currentPlayer === 'player' && game.player.hand.length > 8) {
      // Need to discard cards
      const cardsToDiscard = game.player.hand.length - 8;
      if (cardsToDiscard > 0) {
        toast.error(`You must discard ${cardsToDiscard} card${cardsToDiscard > 1 ? 's' : ''} to meet the 8 card hand limit!`);
        
        // Force the player to discard before ending turn
        // (This should be handled by the UI, but for now we'll auto-discard)
        for (let i = 0; i < cardsToDiscard; i++) {
          // Discard from the end of the hand to the graveyard
          const handLength = game.player.hand.length;
          if (handLength > 8) {
            const card = game.player.hand[handLength - 1];
            game.discardCard(handLength - 1, 'player');
            game.addLog(`Discarded ${card.name} due to hand size limit.`);
          }
        }
      }
    }
  }, [game.gamePhase, game.currentPlayer]);
  
  // AI opponent logic - watch for change in current player and game phase
  React.useEffect(() => {
    // Only run AI logic if we're in vs-ai mode and it's the opponent's turn
    if (
      String(gameMode.mode) === 'vs-ai' && 
      game.currentPlayer === 'opponent' && 
      aiRef.current
    ) {
      // Make sure the AI has the latest game state
      const aiGameState: AIGameState = {
        currentPlayer: game.currentPlayer,
        gamePhase: game.gamePhase,
        turn: game.turn,
        
        player: {
          activeAvatar: game.player.activeAvatar,
          reserveAvatars: game.player.reserveAvatars,
          energyPile: game.player.energyPile,
          hand: game.player.hand,
          fieldCards: game.player.fieldCards,
          health: game.player.health,
          lifeCards: game.player.lifeCards,
          graveyard: game.player.graveyard,
          usedEnergyPile: game.player.usedEnergyPile,
        },
        
        opponent: {
          activeAvatar: game.opponent.activeAvatar,
          reserveAvatars: game.opponent.reserveAvatars,
          energyPile: game.opponent.energyPile,
          hand: game.opponent.hand,
          fieldCards: game.opponent.fieldCards,
          avatarToEnergyCount: game.opponent.avatarToEnergyCount,
          health: game.opponent.health,
          lifeCards: game.opponent.lifeCards,
          graveyard: game.opponent.graveyard,
          usedEnergyPile: game.opponent.usedEnergyPile,
        },
        
        // Use the same functions defined earlier
        moveCardToEnergy: aiRef.current.gameState.moveCardToEnergy,
        playAsActiveAvatar: aiRef.current.gameState.playAsActiveAvatar,
        playAsReserveAvatar: aiRef.current.gameState.playAsReserveAvatar,
        playSpell: aiRef.current.gameState.playSpell,
        useAvatarSkill: aiRef.current.gameState.useAvatarSkill,
        nextPhase: aiRef.current.gameState.nextPhase,
        hasEnoughEnergy: aiRef.current.gameState.hasEnoughEnergy,
        addLog: aiRef.current.gameState.addLog
      };
      
      // Update AI state
      aiRef.current.gameState = aiGameState;
      
      // Make AI move
      aiRef.current.makeMove();
    }
  }, [game.currentPlayer, game.gamePhase, game.turn]);
  
  return (
    <div className="w-full h-full bg-gray-900 text-white p-4 relative">
      {/* Game header with phase and turn info */}
      <div className="mb-4 flex justify-between items-center bg-gray-800 p-2 rounded">
        <div>
          <span className="font-bold">Turn {game.turn}</span>
          <span className="ml-2 bg-blue-600 px-2 py-0.5 rounded text-xs">
            {phaseText}
          </span>
          
          {/* Game mode indicator */}
          <span className="ml-2 px-2 py-0.5 rounded text-xs" 
                style={{
                  backgroundColor: 
                    String(gameMode.mode) === "vs-ai" ? '#8B0000' : 
                    String(gameMode.mode) === "practice" ? '#006400' : 
                    String(gameMode.mode) === "online" ? '#4169E1' : '#555'
                }}>
            {String(gameMode.mode) === "vs-ai" ? 'VS AI' : 
             String(gameMode.mode) === "practice" ? 'Practice' : 
             String(gameMode.mode) === "online" ? 'Online' : 'Unknown Mode'}
          </span>
          
          {/* Player name */}
          <span className="ml-2 text-gray-300 text-xs">
            {gameMode.playerName || 'Player'}
          </span>
        </div>
        <div>
          {isPlayerTurn ? (
            <button 
              className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-sm"
              onClick={handleNextPhase}
            >
              Next Phase
            </button>
          ) : (
            <span className="bg-red-600 px-2 py-0.5 rounded text-xs">
              Opponent's Turn
            </span>
          )}
        </div>
      </div>
      
      {/* Opponent's board */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-1">Opponent</h3>
        
        <div className="flex flex-col">
          {/* Opponent Hand Display */}
          <div className="bg-gray-800 bg-opacity-30 p-2 rounded mb-2 flex justify-center">
            <div className="flex relative">
              {game.opponent.hand.map((_, index) => (
                <div 
                  key={`opponent-hand-${index}`}
                  className="w-10 h-14 bg-red-900 border border-red-700 rounded-md shadow-md transform transition-transform hover:translate-y-[-5px]"
                  style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                />
              ))}
              {game.opponent.hand.length === 0 && (
                <div className="text-gray-400 text-xs">
                  No cards in hand
                </div>
              )}
            </div>
          </div>
        
          <div className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded">
            {/* Opponent Stats */}
            <div className="flex flex-col">
              <div className="text-xs">Deck: {game.opponent.deck.length}</div>
              <div className="text-xs">Hand: {game.opponent.hand.length}</div>
              <div className="text-xs">Life: {game.opponent.lifeCards.length}</div>
              <div className="text-xs flex flex-col">
                <span>Energy: {game.opponent.energyPile.length} available</span>
                {game.opponent.usedEnergyPile.length > 0 && 
                  <span className="text-gray-400 text-[10px]">(+ {game.opponent.usedEnergyPile.length} used)</span>
                }
              </div>
            </div>
            
            {/* Opponent Energy Display */}
            <div 
              className="flex flex-col mr-4 relative"
              onMouseEnter={() => setShowOpponentEnergyPopup(true)}
              onMouseLeave={() => setShowOpponentEnergyPopup(false)}
            >
              <div className="flex items-center gap-1">
                {game.opponent.energyPile.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 max-w-[100px] cursor-help">
                    {/* Show energy count by element type */}
                    {Object.entries(
                      game.opponent.energyPile.reduce((acc, card) => {
                        acc[card.element] = (acc[card.element] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([element, count]) => (
                      <div 
                        key={`opp-energy-${element}`} 
                        className="text-[10px] px-1 rounded flex items-center gap-0.5"
                        title={`${count} ${element} energy`}
                      >
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            element === 'fire' ? 'bg-red-500' : 
                            element === 'water' ? 'bg-blue-500' : 
                            element === 'earth' ? 'bg-amber-800' : 
                            element === 'air' ? 'bg-cyan-300' : 
                            'bg-gray-400'
                          }`}
                        />
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Energy Pile Popup */}
              {showOpponentEnergyPopup && game.opponent.energyPile.length > 0 && (
                <div className="absolute -top-2 left-0 transform -translate-y-full z-50 bg-gray-900 bg-opacity-95 border border-amber-600 rounded p-2 shadow-lg w-60">
                  <h4 className="text-xs font-bold mb-1 text-amber-400">Opponent's Energy Pile</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {game.opponent.energyPile.map((card, index) => (
                      <div 
                        key={`energy-detail-${card.id}-${index}`}
                        className="text-xs mb-1 flex items-center gap-1 border-b border-gray-700 pb-1"
                      >
                        <div 
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            card.element === 'fire' ? 'bg-red-500' : 
                            card.element === 'water' ? 'bg-blue-500' : 
                            card.element === 'earth' ? 'bg-amber-800' : 
                            card.element === 'air' ? 'bg-cyan-300' : 
                            'bg-gray-400'
                          }`}
                        />
                        <span className="truncate">{card.name}</span>
                        <span className="text-gray-400 ml-auto">{card.element}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Opponent Avatar */}
            <div className="w-1/4">
              {game.opponent.activeAvatar ? (
                <div className="transform rotate-180">
                  <Card2D 
                    card={game.opponent.activeAvatar} 
                    isPlayable={false}
                    isTapped={game.opponent.activeAvatar.isTapped}
                  />
                </div>
              ) : (
                <div className="h-32 border-2 border-dashed border-red-800 rounded flex items-center justify-center">
                  <span className="text-xs text-red-400">No Avatar</span>
                </div>
              )}
            </div>
            
            {/* Opponent Reserves */}
            <div className="flex flex-col">
              <div className="text-xs mb-1">Reserves: {game.opponent.reserveAvatars.length}/2</div>
              {game.opponent.reserveAvatars.map((avatar, index) => (
                <div key={index} className="text-xs mb-0.5 bg-red-900 bg-opacity-50 px-1 py-0.5 rounded">
                  {avatar.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game field */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-1">Field</h3>
        <div className="flex justify-center bg-gray-800 bg-opacity-30 p-4 rounded min-h-[100px]">
          {/* Display field card if available - only show one placement */}
          <div className="w-36 h-48 flex items-center justify-center">
            {game.player.fieldCards.length > 0 ? (
              <Card2D 
                card={game.player.fieldCards[0]} 
                isPlayable={false}
              />
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-2 w-full h-full flex items-center justify-center">
                <span className="text-xs text-gray-400">Field Zone</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Player's board */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-1">Your Board</h3>
        <div className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded">
          {/* Player Stats */}
          <div className="flex flex-col">
            <div className="text-xs">Deck: {game.player.deck.length}</div>
            <div className="text-xs">Life: {game.player.lifeCards.length}</div>
            <div className="text-xs flex flex-col">
              <span>Energy: {game.player.energyPile.length} available</span>
              {game.player.usedEnergyPile.length > 0 && 
                <span className="text-gray-400 text-[10px]">(+ {game.player.usedEnergyPile.length} used)</span>
              }
            </div>
          </div>
          
          {/* Energy Display */}
          <div className="flex flex-col mr-4 relative">
            <span className="text-xs font-semibold mb-1">Energy Pile:</span>
            <div 
              className="relative"
              onMouseEnter={() => setShowEnergyPopup(true)}
              onMouseLeave={() => setShowEnergyPopup(false)}
            >
              <div className="flex items-center gap-1">
                {game.player.energyPile.length > 0 ? (
                  <div className="flex flex-wrap gap-0.5 max-w-[150px] cursor-help">
                    {game.player.energyPile.map((card, index) => (
                      <div 
                        key={`energy-${card.id}-${index}`} 
                        className="w-5 h-5 rounded-full border border-amber-500 flex items-center justify-center"
                        title={`${card.name} (${card.element})`}
                      >
                        <div 
                          className={`w-3 h-3 rounded-full ${
                            card.element === 'fire' ? 'bg-red-500' : 
                            card.element === 'water' ? 'bg-blue-500' : 
                            card.element === 'earth' ? 'bg-amber-800' : 
                            card.element === 'air' ? 'bg-cyan-300' : 
                            'bg-gray-400'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400">Empty</span>
                )}
              </div>
              
              {/* Energy Pile Popup */}
              {showEnergyPopup && game.player.energyPile.length > 0 && (
                <div className="absolute -top-2 left-0 transform -translate-y-full z-50 bg-gray-900 bg-opacity-95 border border-blue-600 rounded p-2 shadow-lg w-60">
                  <h4 className="text-xs font-bold mb-1 text-blue-400">Your Energy Pile</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {game.player.energyPile.map((card, index) => (
                      <div 
                        key={`energy-detail-${card.id}-${index}`}
                        className="text-xs mb-1 flex items-center gap-1 border-b border-gray-700 pb-1"
                      >
                        <div 
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            card.element === 'fire' ? 'bg-red-500' : 
                            card.element === 'water' ? 'bg-blue-500' : 
                            card.element === 'earth' ? 'bg-amber-800' : 
                            card.element === 'air' ? 'bg-cyan-300' : 
                            'bg-gray-400'
                          }`}
                        />
                        <span className="truncate">{card.name}</span>
                        <span className="text-gray-400 ml-auto">{card.element}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div 
              className="relative"
              onMouseEnter={() => setShowUsedEnergyPopup(true)}
              onMouseLeave={() => setShowUsedEnergyPopup(false)}
            >
              {game.player.usedEnergyPile.length > 0 && (
                <>
                  <span className="text-xs font-semibold mt-1 mb-1 text-gray-400">Used Energy:</span>
                  <div className="flex flex-wrap gap-0.5 max-w-[150px] cursor-help">
                    {game.player.usedEnergyPile.map((card, index) => (
                      <div 
                        key={`used-energy-${card.id}-${index}`} 
                        className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center opacity-50"
                        title={`${card.name} (${card.element})`}
                      >
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            card.element === 'fire' ? 'bg-red-500' : 
                            card.element === 'water' ? 'bg-blue-500' : 
                            card.element === 'earth' ? 'bg-amber-800' : 
                            card.element === 'air' ? 'bg-cyan-300' : 
                            'bg-gray-400'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Used Energy Pile Popup */}
                  {showUsedEnergyPopup && (
                    <div className="absolute -top-2 left-0 transform -translate-y-full z-50 bg-gray-900 bg-opacity-95 border border-gray-600 rounded p-2 shadow-lg w-60">
                      <h4 className="text-xs font-bold mb-1 text-gray-400">Your Used Energy</h4>
                      <div className="max-h-40 overflow-y-auto">
                        {game.player.usedEnergyPile.map((card, index) => (
                          <div 
                            key={`used-energy-detail-${card.id}-${index}`}
                            className="text-xs mb-1 flex items-center gap-1 border-b border-gray-700 pb-1"
                          >
                            <div 
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                card.element === 'fire' ? 'bg-red-500' : 
                                card.element === 'water' ? 'bg-blue-500' : 
                                card.element === 'earth' ? 'bg-amber-800' : 
                                card.element === 'air' ? 'bg-cyan-300' : 
                                'bg-gray-400'
                              }`}
                            />
                            <span className="truncate">{card.name}</span>
                            <span className="text-gray-400 ml-auto">{card.element}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Player Avatar */}
          <div className="w-1/4">
            {game.player.activeAvatar ? (
              <div 
                className="cursor-pointer relative"
                onClick={() => onAction?.('selectAvatar', game.player.activeAvatar)}
              >
                <Card2D 
                  card={game.player.activeAvatar} 
                  isPlayable={true}
                  isTapped={game.player.activeAvatar.isTapped}
                />
                
                {/* Skill buttons */}
                {isPlayerTurn && game.gamePhase === 'battle' && !game.player.activeAvatar.isTapped && (
                  <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1">
                    <button 
                      className="text-[8px] px-1 py-0.5 bg-red-600 text-white rounded-sm hover:bg-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSkillUse(1);
                      }}
                    >
                      Use Skill 1
                    </button>
                    {game.player.activeAvatar.skill2 && (
                      <button 
                        className="text-[8px] px-1 py-0.5 bg-purple-600 text-white rounded-sm hover:bg-purple-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSkillUse(2);
                        }}
                      >
                        Use Skill 2
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-32 border-2 border-dashed border-blue-800 rounded flex items-center justify-center">
                <span className="text-xs text-blue-400">No Avatar</span>
              </div>
            )}
          </div>
          
          {/* Reserve Avatars */}
          <div className="flex flex-col">
            <div className="text-xs mb-1">Reserves: {game.player.reserveAvatars.length}/2</div>
            {/* Check if player needs to select a reserve avatar */}
            {game.player.needsToSelectReserveAvatar ? (
              <div className="bg-yellow-800 bg-opacity-50 p-1 rounded mb-1">
                <div className="text-xs text-yellow-300 font-bold mb-1">Select a reserve avatar:</div>
                {game.player.reserveAvatars.map((avatar, index) => (
                  <div 
                    key={index} 
                    className="text-xs mb-0.5 bg-yellow-900 hover:bg-yellow-700 px-1 py-1 rounded cursor-pointer transition-colors"
                    onClick={() => handleSelectReserveAvatar(index)}
                  >
                    {avatar.name} (HP: {avatar.health})
                  </div>
                ))}
              </div>
            ) : (
              // Normal display of reserve avatars
              game.player.reserveAvatars.map((avatar, index) => (
                <div key={index} className="text-xs mb-0.5 bg-blue-900 bg-opacity-50 px-1 py-0.5 rounded">
                  {avatar.name} (HP: {avatar.health})
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Player's hand */}
      <div>
        <h3 className="text-sm font-bold mb-1">Your Hand ({game.player.hand.length})</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 bg-gray-800 bg-opacity-30 p-2 rounded min-h-[120px]">
          {game.player.hand.map((card, index) => (
            <div key={card.id} className="shrink-0" style={{ width: '80px' }}>
              <Card2D 
                card={card} 
                isPlayable={isCardPlayable(card)}
                isInHand={true}
                onClick={() => onAction?.('selectCard', card)}
                onAction={(action) => handleCardAction(card, action)}
              />
            </div>
          ))}
          {game.player.hand.length === 0 && (
            <div className="text-gray-400 text-xs flex items-center justify-center w-full">
              Your hand is empty
            </div>
          )}
        </div>
      </div>
      
      {/* Game logs */}
      <div className="mt-4 bg-black bg-opacity-50 p-2 rounded h-32 overflow-y-auto">
        <h3 className="text-xs font-bold mb-1">Game Log</h3>
        {game.logs.map((log, index) => (
          <div key={index} className="text-xs text-gray-300 mb-0.5">
            {log}
          </div>
        ))}
      </div>
      
      {/* Game controls */}
      <div className="mt-4 flex justify-center gap-2">
        <button 
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
          onClick={() => game.drawCard('player')}
          disabled={!isPlayerTurn || game.gamePhase !== 'draw'}
        >
          Draw Card
        </button>
        <button 
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
          onClick={handleNextPhase}
          disabled={!isPlayerTurn}
        >
          Next Phase
        </button>
        <button 
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          onClick={() => game.endTurn()}
          disabled={!isPlayerTurn || game.gamePhase !== 'end'}
        >
          End Turn
        </button>
      </div>
      
      {/* Game winner notification */}
      {game.winner && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-purple-900 p-4 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-2">
              {game.winner === 'player' ? 'You Win!' : 'You Lose!'}
            </h2>
            <p className="mb-4">
              {game.winner === 'player' 
                ? 'Congratulations! You defeated your opponent!' 
                : 'Better luck next time!'}
            </p>
            <button
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard2D;