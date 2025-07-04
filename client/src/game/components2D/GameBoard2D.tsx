import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { useGameMode } from '../stores/useGameMode';
import Card2D from './Card2D';
import { toast } from 'sonner';
import { AvatarCard, Card } from '../data/cardTypes';
import { SimpleGameAI, AIGameState } from '../ai/SimpleGameAI';
import { useNavigate } from 'react-router-dom';
import { processGameEffect, processBleedDamage } from '../utils/gameEffectProcessor';
import DiscardConfirmationPopup from '../../components/DiscardConfirmationPopup';
import SafeCardImage from '../../components/SafeCardImage';

// Card Preview Component
const CardPreview = ({ 
  card, 
  onClose 
}: { 
  card: Card; 
  onClose: () => void; 
}) => {
  // For avatar cards, get the damage counter
  const damageCounter = card.type === 'avatar' ? (card as AvatarCard).counters?.damage || 0 : 0;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button 
          className="absolute top-2 right-2 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
          onClick={onClose}
        >
          ✕
        </button>
        
        <div className="p-4">
          <div className="mb-4 rounded-lg overflow-hidden">
            {card.art && (
              <SafeCardImage src={card.art} alt={card.name} className="w-full object-cover" />
            )}
          </div>
          
          <div className="text-white">
            <h2 className="text-xl font-bold mb-2">{card.name}</h2>
            <div className="mb-2">
              <span className="inline-block bg-gray-700 px-2 py-1 rounded mr-2">
                {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
              </span>
              <span className="inline-block bg-gray-700 px-2 py-1 rounded">
                {card.element.charAt(0).toUpperCase() + card.element.slice(1)}
              </span>
            </div>
            
            {card.type === 'avatar' && (
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <span>Level: {(card as AvatarCard).level}</span>
                  <span className="text-green-500">
                    HP: {(card as AvatarCard).health - damageCounter}/{(card as AvatarCard).health}
                  </span>
                </div>
                {damageCounter > 0 && (
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{ width: `${((card as AvatarCard).health - damageCounter) / (card as AvatarCard).health * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-gray-300 mb-4">{card.description || "No description available."}</p>
            
            {card.energyCost && card.energyCost.length > 0 && (
              <div className="mb-2">
                <span>Energy Cost: </span>
                {card.energyCost.map((energy, index) => (
                  <span 
                    key={index}
                    className={`inline-block w-5 h-5 rounded-full mx-0.5 ${
                      energy === 'fire' ? 'bg-red-500' : 
                      energy === 'water' ? 'bg-blue-500' : 
                      energy === 'ground' ? 'bg-amber-700' : 
                      energy === 'air' ? 'bg-cyan-300' : 
                      'bg-gray-400'
                    }`}
                  ></span>
                ))}
              </div>
            )}
            
            {card.type === 'avatar' && (
              <div className="mt-4 space-y-2">
                <div className="p-2 bg-gray-700 rounded">
                  <h3 className="font-bold">Skill 1: {(card as AvatarCard).skill1.name}</h3>
                  <p className="text-xs">{(card as AvatarCard).skill1.effect}</p>
                  <div className="mt-1 text-sm">Damage: {(card as AvatarCard).skill1.damage}</div>
                </div>
                
                {(card as AvatarCard).skill2 && (
                  <div className="p-2 bg-gray-700 rounded">
                    <h3 className="font-bold">Skill 2: {(card as AvatarCard).skill2?.name || 'Unknown'}</h3>
                    <p className="text-xs">{(card as AvatarCard).skill2?.effect || ''}</p>
                    <div className="mt-1 text-sm">Damage: {(card as AvatarCard).skill2?.damage || 0}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameBoard2DProps {
  onAction?: (action: string, data?: any) => void;
}

const GameBoard2D: React.FC<GameBoard2DProps> = ({ onAction }) => {
  // Get game state from store
  const game = useGameStore();
  // Get the navigate function from react-router
  const navigate = useNavigate();
  
  // State for preview card
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [discardCard, setDiscardCard] = useState<Card | null>(null);
  const [showEvolutionSelector, setShowEvolutionSelector] = useState(false);
  const [evolutionCard, setEvolutionCard] = useState<Card | null>(null);
  const [evolvableAvatars, setEvolvableAvatars] = useState<Array<{avatar: AvatarCard, location: 'active' | number}>>([]);
  
  // Game log auto-scroll ref
  const gameLogRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll game log when new messages are added
  useEffect(() => {
    if (gameLogRef.current) {
      gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight;
    }
  }, [game.logs]);
  
  // Handle evolution selection
  const handleEvolutionSelection = (targetLocation: 'active' | number) => {
    if (evolutionCard) {
      const handIndex = game.player.hand.findIndex(c => c.id === evolutionCard.id);
      game.evolveAvatar(handIndex, targetLocation);
      setShowEvolutionSelector(false);
      setEvolutionCard(null);
      setEvolvableAvatars([]);
    }
  };
  
  // Determine if a card is playable (can be placed on the field)
  const isCardPlayable = (card: Card) => {
    // Check game phase and energy requirements
    const { player, gamePhase, currentPlayer } = game;
    
    // Special handling for the setup phase
    if (gamePhase === 'setup' && currentPlayer === 'player') {
      // During setup phase, only level 1 avatars can be played if player has no active avatar
      return card.type === 'avatar' && (card as AvatarCard).level === 1 && player.activeAvatar === null;
    }
    
    // Special case for quick spells - they can be played during opponent's turn or ANY phase (including battle phase)
    if (card.type === 'quickSpell') {
      // Quick spells only need an active avatar and enough energy - ignore current phase or turn
      return player.activeAvatar !== null && game.hasEnoughEnergy(card.energyCost || [], 'player');
    }
    
    // For regular cards, only allow during player's main phases or recheck phase (for discarding)
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2' && gamePhase !== 'recheck')) {
      return false;
    }
    
    // During recheck phase, cards are "playable" only for discarding if hand size > 8
    if (gamePhase === 'recheck') {
      return player.hand.length > 8;
    }
    
    // Energy requirements vary by card type
    if (card.type === 'avatar') {
      // Avatars are always "playable" because they can be placed as active, reserve, or energy
      // The specific placement logic is handled in the action handlers
      return true;
    } else {
      // All other card types (spell, ritualArmor, field, equipment, item)
      // They all require an active avatar
      if (!player.activeAvatar) {
        return false;
      }
      
      // Check if player has enough energy
      return game.hasEnoughEnergy(card.energyCost || [], 'player');
    }
  };
  
  // Function to handle discard card action
  const handleDiscardCard = (card: Card) => {
    setDiscardCard(card);
    setShowDiscardModal(true);
  };

  // Function to confirm discard
  const confirmDiscard = () => {
    if (discardCard) {
      const index = game.player.hand.findIndex(c => c.id === discardCard.id);
      if (index !== -1) {
        // Remove card from hand and add to graveyard
        const updatedHand = [...game.player.hand];
        const removedCard = updatedHand.splice(index, 1)[0];
        
        // Update the game state directly
        game.player.hand = updatedHand;
        game.player.graveyard.push(removedCard);
        
        game.addLog(`${discardCard.name} discarded.`);
        toast.success(`${discardCard.name} discarded`);
      }
    }
    setDiscardCard(null);
    setShowDiscardModal(false);
  };

  // Function to handle card actions with effect processing
  const handleCardAction = (card: Card, action: string) => {
    console.log(action, card);
    
    // Process bleed damage at start of turn
    if (action === 'startTurn' && game.player.activeAvatar) {
      processBleedDamage(game.player.activeAvatar, (update) => {
        // Apply the update to game state
        Object.assign(game.player, update.player || {});
      }, 'player');
    }
    
    if (action === 'startOpponentTurn' && game.opponent.activeAvatar) {
      processBleedDamage(game.opponent.activeAvatar, (update) => {
        // Apply the update to game state
        Object.assign(game.opponent, update.opponent || {});
      }, 'opponent');
    }
    
    // Handle discard action for end turn scenarios, hand limit, or recheck phase
    const shouldHandleAsDiscard = action === 'discard' || 
      (action === 'toEnergy' && (game.player.needsToDiscardCards || 
        (game.gamePhase === 'recheck' && game.currentPlayer === 'player' && game.player.hand.length > 8)));
    
    if (shouldHandleAsDiscard) {
      // If player needs to discard cards or is in recheck phase, handle it through the special discard function
      if (game.player.needsToDiscardCards || 
          (game.gamePhase === 'recheck' && game.currentPlayer === 'player' && game.player.hand.length > 8)) {
        const cardIndex = game.player.hand.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          game.discardCardForHandLimit(cardIndex);
        }
        return;
      } else {
        handleDiscardCard(card);
        return;
      }
    }
    
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
      // Handle quick spells specially to allow them to be played during opponent's turn
      if (card.type === 'quickSpell') {
        // Check if player has an active avatar and enough energy
        if (!game.player.activeAvatar) {
          toast.error("You need an active avatar to play quick spells!");
          return;
        }
        
        // Check energy requirements
        if (!game.hasEnoughEnergy(card.energyCost || [], 'player')) {
          toast.error("Not enough energy to play this quick spell!");
          return;
        }
        
        // Play the quick spell card even during opponent's turn
        game.playCard(index);
        toast.success(`You played quick spell: ${card.name}!`);
      } else {
        // For regular cards, check if it's player's turn and proper phase
        if (game.currentPlayer !== 'player' || (game.gamePhase !== 'main1' && game.gamePhase !== 'main2')) {
          toast.error("You can only play regular cards during your Main Phases!");
          return;
        }
        
        // Play non-avatar cards normally
        game.playCard(index);
      }
      
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
        // Find all matching level 1 avatars that can be evolved
        const evolvableReserveAvatars = game.player.reserveAvatars
          .map((avatar, index) => ({ avatar, location: index as number }))
          .filter(({ avatar }) => avatar.subType === avatarCard.subType && avatar.level === 1);
        
        if (evolvableReserveAvatars.length === 0) {
          toast.error(`You need a level 1 ${avatarCard.subType} avatar in reserve to upgrade to level 2!`);
          return;
        }
        
        if (evolvableReserveAvatars.length === 1) {
          // Only one option, evolve directly
          const targetLocation = evolvableReserveAvatars[0].location;
          game.evolveAvatar(index, targetLocation);
        } else {
          // Multiple options, show selector
          setEvolutionCard(card);
          setEvolvableAvatars(evolvableReserveAvatars);
          setShowEvolutionSelector(true);
        }
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
      // Check if it's main phase and player's turn for avatar energy placement
      if (game.currentPlayer !== 'player' || (game.gamePhase !== 'main1' && game.gamePhase !== 'main2')) {
        toast.error("You can only place cards in energy during your Main Phases!");
        return;
      }

      // Only avatar cards can be placed in energy
      if (card.type !== 'avatar') {
        toast.error("Only avatar cards can be placed in the energy pile!");
        return;
      }

      // Check if already added avatar to energy this turn (regardless of reserve count)
      if (game.player.avatarToEnergyCount >= 1) {
        toast.error("You can only put 1 Avatar card into energy per turn!");
        return;
      }

      // Move card to energy pile
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
    
    // Get the skill to check its energy cost (ensuring null safety)
    if (skillNumber === 2 && !game.player.activeAvatar.skill2) {
      toast.error("This avatar doesn't have a second skill!");
      return;
    }
    
    // Now we know the selected skill exists
    const skill = skillNumber === 1 
      ? game.player.activeAvatar.skill1 
      : game.player.activeAvatar.skill2!;
    
    // Ensure energyCost is always an array
    const energyCost = skill.energyCost || [];
    
    // Check energy requirements first
    if (!game.hasEnoughEnergy(energyCost, 'player')) {
      toast.error(`Not enough energy to use this skill. You need: ${energyCost.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ') || 'None'}`);
      return;
    }
    
    // Log energy requirements
    console.log(`Using skill ${skillNumber}. Energy cost:`, energyCost);
    
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
  
  // Set up a timer for auto-advancing at end phase
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // If it's player's turn and we're in the end phase, set up a timeout to auto-advance
    if (game.currentPlayer === 'player' && game.gamePhase === 'end') {
      timeoutId = setTimeout(() => {
        // Check if we're still in the end phase (user might have advanced manually)
        if (game.currentPlayer === 'player' && game.gamePhase === 'end') {
          toast.info("Auto-advancing to next phase...");
          game.nextPhase();
        }
      }, 3000); // 3 seconds timeout
      
      // Display a toast to notify the player
      toast.info("End phase - auto-advancing in 3 seconds...", { duration: 3000 });
    }
    
    // Clean up the timeout when the component unmounts or phase changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [game.currentPlayer, game.gamePhase]);
  
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
  
  // Monitor for end-of-turn discard requirements
  React.useEffect(() => {
    if (game.player.needsToDiscardCards && game.player.hand.length > 8) {
      toast.error(`You have ${game.player.hand.length} cards! Click on ${game.player.hand.length - 8} cards to discard them before ending your turn.`);
    }
  }, [game.player.needsToDiscardCards, game.player.hand.length]);

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
              playerAvatar.counters = playerAvatar.counters || { 
                damage: 0, bleed: 0, shield: 0, burn: 0, freeze: 0, poison: 0, stun: 0 
              };
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
              game.player.activeAvatar.counters = game.player.activeAvatar.counters || { 
                damage: 0, bleed: 0, shield: 0, burn: 0, freeze: 0, poison: 0, stun: 0 
              };
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
      {/* Show card preview modal if a card is selected */}
      {previewCard && (
        <CardPreview card={previewCard} onClose={() => setPreviewCard(null)} />
      )}
      
      {/* Show selected card preview modal (for opponent reserves) */}
      {selectedCard && (
        <CardPreview card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
      
      {/* Game header with phase and turn info */}
      <div className="mb-4 flex justify-between items-center bg-gray-800 p-2 rounded">
        <div>
          <span className="font-bold">Turn {game.turn}</span>
          <span className="ml-2 bg-blue-600 px-2 py-0.5 rounded text-xs">
            {phaseText}
          </span>
          
          {/* Quick Spell indicator */}
          {game.currentPlayer === 'opponent' && 
           game.player.hand.some(card => card.type === 'quickSpell' && game.hasEnoughEnergy(card.energyCost || [], 'player')) && (
            <span className="ml-2 bg-purple-700 px-2 py-0.5 rounded text-xs animate-pulse" 
                  title="You have Quick Spells that can be played right now!">
              <span className="mr-1">⚡</span>
              Quick Spells Available
            </span>
          )}
          
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
              {game.opponent && game.opponent.hand ? game.opponent.hand.map((_, index) => (
                <div 
                  key={`opponent-hand-${index}`}
                  className="w-10 h-14 bg-red-900 border border-red-700 rounded-md shadow-md transform transition-transform hover:translate-y-[-5px]"
                  style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                />
              )) : null}
              {(!game.opponent || !game.opponent.hand || game.opponent.hand.length === 0) && (
                <div className="text-gray-400 text-xs">
                  No cards in hand
                </div>
              )}
            </div>
          </div>
        
          <div className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded">
            {/* Opponent Stats */}
            <div className="flex flex-col">
              <div className="text-xs">Deck: {game.opponent && game.opponent.deck ? game.opponent.deck.length : 0}</div>
              <div className="text-xs">Hand: {game.opponent && game.opponent.hand ? game.opponent.hand.length : 0}</div>
              <div className="text-xs">Life: {game.opponent && game.opponent.lifeCards ? game.opponent.lifeCards.length : 0}</div>
              <div className="text-xs flex flex-col">
                <span>Energy: {game.opponent && game.opponent.energyPile ? game.opponent.energyPile.length : 0} available</span>
                {game.opponent && game.opponent.usedEnergyPile && game.opponent.usedEnergyPile.length > 0 && 
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
                {game.opponent && game.opponent.energyPile && game.opponent.energyPile.length > 0 && (
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
              {showOpponentEnergyPopup && game.opponent && game.opponent.energyPile && game.opponent.energyPile.length > 0 && (
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
                            card.element === 'ground' ? 'bg-amber-800' : 
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
              <div className="text-xs mb-1">Reserves: {game.opponent && game.opponent.reserveAvatars ? game.opponent.reserveAvatars.length : 0}/2</div>
              {game.opponent && game.opponent.reserveAvatars && game.opponent.reserveAvatars.length > 0 ? (
                game.opponent.reserveAvatars.map((avatar, index) => (
                  <div 
                    key={index} 
                    className="text-xs mb-0.5 bg-red-900 bg-opacity-50 px-1 py-0.5 rounded flex justify-between cursor-pointer hover:bg-red-800"
                    onClick={() => setSelectedCard(avatar)}
                  >
                    <span>{avatar.name}</span>
                    <span className="font-bold text-yellow-400">HP: {avatar.health - (avatar.counters?.damage || 0)}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">No reserve avatars</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game field - reduced size */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold">Field</h3>
          {game.player.fieldCards.length > 0 && (
            <button 
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
              onClick={() => setPreviewCard(game.player.fieldCards[0])}
            >
              Preview
            </button>
          )}
        </div>
        <div className="flex justify-center bg-gray-800 bg-opacity-30 p-2 rounded min-h-[60px]">
          {/* Display field card if available - compact size */}
          <div className="w-20 h-12 flex items-center justify-center">
            {game.player.fieldCards.length > 0 ? (
              <div className="text-xs text-center bg-purple-900 bg-opacity-70 p-1 rounded border border-purple-500">
                <div className="font-bold truncate">{game.player.fieldCards[0].name}</div>
                <div className="text-[10px] text-gray-300">{game.player.fieldCards[0].type}</div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-600 rounded p-1 w-full h-full flex items-center justify-center">
                <span className="text-[10px] text-gray-400">Field</span>
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
                            card.element === 'ground' ? 'bg-amber-800' : 
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
                            card.element === 'ground' ? 'bg-amber-800' : 
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
                            card.element === 'ground' ? 'bg-amber-800' : 
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
                                card.element === 'ground' ? 'bg-amber-800' : 
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
                      className={`text-[8px] px-1 py-0.5 rounded-sm ${
                        game.hasEnoughEnergy(game.player.activeAvatar.skill1.energyCost || [], 'player') 
                          ? 'bg-red-600 hover:bg-red-500 text-white' 
                          : 'bg-red-900 text-gray-300 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSkillUse(1);
                      }}
                      title={`Energy cost: ${(game.player.activeAvatar.skill1.energyCost || []).map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ') || 'None'}`}
                    >
                      {game.player.activeAvatar.skill1.name} [{(game.player.activeAvatar.skill1.energyCost || []).length}]
                    </button>
                    {game.player.activeAvatar.skill2 && (
                      <button 
                        className={`text-[8px] px-1 py-0.5 rounded-sm ${
                          game.hasEnoughEnergy(game.player.activeAvatar.skill2.energyCost || [], 'player') 
                            ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                            : 'bg-purple-900 text-gray-300 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSkillUse(2);
                        }}
                        title={`Energy cost: ${(game.player.activeAvatar.skill2.energyCost || []).map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ') || 'None'}`}
                      >
                        {game.player.activeAvatar.skill2.name} [{(game.player.activeAvatar.skill2.energyCost || []).length}]
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
                <div 
                  key={index} 
                  className="text-xs mb-0.5 bg-blue-900 bg-opacity-50 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-800"
                  onClick={(e) => {
                    // Prevent action from triggering
                    e.stopPropagation();
                    // Add card preview functionality
                    setPreviewCard(avatar);
                  }}
                >
                  {avatar.name} (HP: {avatar.health - (avatar.counters?.damage || 0)})
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
            <div 
              key={card.id} 
              className="shrink-0" 
              style={{ width: '80px' }}
              title={card.type === 'quickSpell' ? 
                "Quick Spells can be played during ANY phase, including your opponent's turn!" : 
                isCardPlayable(card) ? 
                  "This card is playable" : 
                  "This card can only be played during your main phases"
              }
            >
              <Card2D 
                card={card} 
                isPlayable={isCardPlayable(card)}
                isInHand={true}
                onClick={() => {
                  // Show card preview when clicked directly
                  setPreviewCard(card);
                }}
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
      <div ref={gameLogRef} className="mt-4 bg-black bg-opacity-50 p-2 rounded h-32 overflow-y-auto">
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
          disabled={!isPlayerTurn}
        >
          End Turn
        </button>
      </div>
      
      {/* Discard Card Modal */}
      {showDiscardModal && discardCard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg text-center max-w-md">
            <h2 className="text-xl font-bold mb-2">Discard Card</h2>
            <p className="mb-4">
              You have more than 8 cards. Discard {discardCard.name}?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                onClick={confirmDiscard}
              >
                Discard
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                onClick={() => setShowDiscardModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Evolution Selection Modal */}
      {showEvolutionSelector && evolutionCard && evolvableAvatars.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Choose Avatar to Evolve</h2>
              <p className="text-sm text-gray-300">
                Select which avatar you want to evolve with {evolutionCard.name}
              </p>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {evolvableAvatars.map(({ avatar, location }, index) => (
                  <div
                    key={`evolution-${avatar.id}-${location}`}
                    className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleEvolutionSelection(location)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{avatar.name}</div>
                        <div className="text-sm text-gray-300">
                          Level {avatar.level} • HP: {avatar.health - (avatar.counters?.damage || 0)}/{avatar.health}
                          {(avatar.counters?.damage || 0) > 0 && (
                            <span className="text-red-400 ml-2">
                              ({avatar.counters?.damage} damage)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {location === 'active' ? 'Active Avatar' : `Reserve Position ${(location as number) + 1}`}
                        </div>
                      </div>
                      <div className="text-blue-400 text-sm">
                        Click to Evolve
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
                onClick={() => {
                  setShowEvolutionSelector(false);
                  setEvolutionCard(null);
                  setEvolvableAvatars([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Popup */}
      <DiscardConfirmationPopup
        isOpen={game.discardConfirmation.isOpen}
        card={game.discardConfirmation.card}
        onConfirm={game.confirmDiscard}
        onCancel={game.cancelDiscard}
        bonusEffect={game.discardConfirmation.bonusEffect || undefined}
      />
    </div>
  );
};

export default GameBoard2D;