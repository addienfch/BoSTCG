import React, { useEffect } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { Card } from '../data/cardTypes';
import Card2D from './Card2D';
import { toast } from 'sonner';

interface GameBoard2DProps {
  onAction?: (action: string, data?: any) => void;
}

const GameBoard2D: React.FC<GameBoard2DProps> = ({ onAction }) => {
  const game = useGameStore();
  
  // Initialize the game
  useEffect(() => {
    game.initGame();
  }, []);
  
  // Handle card actions from the player's hand
  const handleCardAction = (card: Card, action: string) => {
    const cardIndex = game.player.hand.findIndex(c => c.id === card.id);
    if (cardIndex === -1) return;
    
    switch (action) {
      case 'active':
        game.playCard(cardIndex);
        break;
      case 'reserve':
        game.playCard(cardIndex);
        break;
      case 'energy':
        game.addToEnergyPile(cardIndex);
        break;
      case 'play':
        game.playCard(cardIndex);
        break;
      default:
        toast.error('Unknown action');
        break;
    }
  };
  
  // Handle avatar skill use
  const handleSkillUse = (skillIndex: 1 | 2) => {
    if (!game.player.activeAvatar) {
      toast.error('No active avatar to use skills!');
      return;
    }
    
    if (game.player.activeAvatar.isTapped) {
      toast.error('This avatar has already used a skill this turn!');
      return;
    }
    
    game.useAvatarSkill('player', skillIndex);
  };
  
  // Check if a card can be played (for UI indication)
  const isCardPlayable = (card: Card) => {
    return game.canPlayCard(card);
  };
  
  // Handle game phase advancement
  const handleNextPhase = () => {
    game.nextPhase();
  };
  
  // Current phase display text
  const phaseText = game.getPhaseText();
  
  // Determine if it's the player's turn
  const isPlayerTurn = game.currentPlayer === 'player';
  
  return (
    <div className="w-full h-full bg-gray-900 text-white p-4 relative">
      {/* Game header with phase and turn info */}
      <div className="mb-4 flex justify-between items-center bg-gray-800 p-2 rounded">
        <div>
          <span className="font-bold">Turn {game.turn}</span>
          <span className="ml-2 bg-blue-600 px-2 py-0.5 rounded text-xs">
            {phaseText}
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
        
        <div className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded">
          {/* Opponent Stats */}
          <div className="flex flex-col">
            <div className="text-xs">Deck: {game.opponent.deck.length}</div>
            <div className="text-xs">Hand: {game.opponent.hand.length}</div>
            <div className="text-xs">Life: {game.opponent.lifeCards.length}</div>
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
          
          {/* Opponent Energy */}
          <div className="flex flex-col">
            <div className="text-xs">Energy: {game.opponent.energyPile.length}</div>
            <div className="text-xs">Used: {game.opponent.usedEnergyPile.length}</div>
            <div className="text-xs">
              Reserve: {game.opponent.reserveAvatars.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game field */}
      <div className="mb-4">
        <h3 className="text-sm font-bold mb-1">Field</h3>
        <div className="flex justify-center gap-4 bg-gray-800 bg-opacity-30 p-4 rounded min-h-[100px]">
          {/* Field cards would go here */}
          <div className="border-2 border-dashed border-gray-600 rounded p-2 w-24 h-28 flex items-center justify-center">
            <span className="text-xs text-gray-400">Field Zone</span>
          </div>
          <div className="border-2 border-dashed border-gray-600 rounded p-2 w-24 h-28 flex items-center justify-center">
            <span className="text-xs text-gray-400">Field Zone</span>
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
            <div className="text-xs">
              Energy: {game.player.energyPile.length + game.player.usedEnergyPile.length}
              {game.player.usedEnergyPile.length > 0 && 
               ` (${game.player.usedEnergyPile.length} used)`}
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
            {game.player.reserveAvatars.map((avatar, index) => (
              <div key={index} className="text-xs mb-0.5 bg-blue-900 bg-opacity-50 px-1 py-0.5 rounded">
                {avatar.name} (HP: {avatar.health})
              </div>
            ))}
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
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
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
              onClick={() => game.initGame()}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard2D;