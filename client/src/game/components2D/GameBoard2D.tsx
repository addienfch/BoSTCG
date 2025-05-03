import React from 'react';
import Card2D from './Card2D';
import { CardData } from '../components/Card';
import { useCardGame } from '../stores/useCardGame';

const GameBoard2D: React.FC = () => {
  // Get game state from store
  const { 
    playerHand, 
    playerActiveAvatar, 
    playerReserveAvatars,
    playerEnergyPile,
    playerFieldCards,
    playerLifeCards,
    
    opponentActiveAvatar,
    opponentReserveAvatars,
    opponentEnergyPile,
    opponentFieldCards,
    opponentLifeCards,
    
    currentPlayer,
    gamePhase,
    
    // Actions
    playCard,
    selectCard,
    setEnergyCard
  } = useCardGame();
  
  // Check if a card is playable
  const isCardPlayable = (card: CardData) => {
    // Can only play cards during main phases and on player's turn
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      return false;
    }
    
    // Avatar cards can always be played (either as avatar or energy)
    if (card.type === 'avatar') {
      return true;
    }
    
    // For action cards, check if player has enough energy
    return (card.energyCost || 0) <= playerEnergyPile.length;
  };
  
  // Handle card action selection from popup
  const handleCardAction = (index: number, action: string) => {
    const card = playerHand[index];
    
    switch(action) {
      case 'active':
        // Logic to play as active avatar
        playCard(index);
        break;
      case 'reserve':
        // Logic to play as reserve avatar
        playCard(index, 'reserve');
        break;
      case 'energy':
        // Logic to use as energy
        setEnergyCard(index);
        break;
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col p-4 bg-gradient-to-b from-slate-900 to-slate-800 overflow-auto">
      {/* Game status */}
      <div className="p-2 text-center text-white bg-slate-700 rounded-lg shadow-lg mb-4">
        <div className="font-bold">
          {currentPlayer === 'player' ? 'Your Turn' : "Opponent's Turn"}
        </div>
        <div className="text-sm">
          Phase: {gamePhase.charAt(0).toUpperCase() + gamePhase.slice(1)}
        </div>
      </div>
      
      {/* Opponent area */}
      <div className="flex flex-col p-2 bg-blue-900 bg-opacity-25 rounded-lg mb-4">
        <div className="text-white text-center mb-2 font-bold">Opponent</div>
        
        {/* Opponent stats */}
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-yellow-600 text-white px-2 py-1 rounded-lg mr-2">
              Energy: {opponentEnergyPile.length}
            </div>
            <div className="bg-purple-600 text-white px-2 py-1 rounded-lg">
              Life Cards: {opponentLifeCards.length}
            </div>
          </div>
          <div className="bg-red-600 text-white px-2 py-1 rounded-lg">
            Hand: {playerHand.length} cards
          </div>
        </div>
        
        {/* Opponent reserve avatars */}
        <div className="flex mb-2 justify-center gap-2">
          {opponentReserveAvatars.map((avatar, index) => (
            <div key={`opponent-reserve-${index}`} className="transform scale-75">
              <Card2D 
                card={avatar} 
                isPlayable={false}
              />
            </div>
          ))}
        </div>
        
        {/* Opponent active avatar */}
        <div className="flex justify-center mb-2">
          {opponentActiveAvatar && (
            <Card2D 
              card={opponentActiveAvatar} 
              isPlayable={false}
              isTapped={opponentActiveAvatar.tapped}
            />
          )}
        </div>
        
        {/* Opponent field cards */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {opponentFieldCards.map((card, index) => (
            <div key={`opponent-field-${index}`} className="transform scale-90">
              <Card2D 
                card={card} 
                isPlayable={false}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Battlefield divider */}
      <div className="h-4 border-t-2 border-b-2 border-white border-opacity-20 my-2 flex justify-center items-center">
        <span className="bg-slate-800 px-4 text-white text-xs">BATTLEFIELD</span>
      </div>
      
      {/* Player area */}
      <div className="flex flex-col p-2 bg-red-900 bg-opacity-25 rounded-lg mb-4">
        {/* Player field cards */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {playerFieldCards.map((card, index) => (
            <div key={`player-field-${index}`} className="transform scale-90">
              <Card2D 
                card={card} 
                isPlayable={currentPlayer === 'player'}
              />
            </div>
          ))}
        </div>
        
        {/* Player active avatar */}
        <div className="flex justify-center mb-2">
          {playerActiveAvatar && (
            <Card2D 
              card={playerActiveAvatar} 
              isPlayable={currentPlayer === 'player'}
              isTapped={playerActiveAvatar.tapped}
            />
          )}
        </div>
        
        {/* Player reserve avatars */}
        <div className="flex mb-2 justify-center gap-2">
          {playerReserveAvatars.map((avatar, index) => (
            <div key={`player-reserve-${index}`} className="transform scale-75">
              <Card2D 
                card={avatar} 
                isPlayable={currentPlayer === 'player'}
                isTapped={avatar.tapped}
              />
            </div>
          ))}
        </div>
        
        {/* Player stats */}
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-yellow-600 text-white px-2 py-1 rounded-lg mr-2">
              Energy: {playerEnergyPile.length}
            </div>
            <div className="bg-purple-600 text-white px-2 py-1 rounded-lg">
              Life Cards: {playerLifeCards.length}
            </div>
          </div>
          <div className="bg-green-600 text-white px-2 py-1 rounded-lg">
            Your Turn: {currentPlayer === 'player' ? 'YES' : 'NO'}
          </div>
        </div>
        
        <div className="text-white text-center mb-2 font-bold">Your Battlefield</div>
      </div>
      
      {/* Player hand */}
      <div className="flex justify-center gap-2 overflow-x-auto p-4 bg-black bg-opacity-30 rounded-lg">
        {playerHand.map((card, index) => (
          <Card2D 
            key={`hand-${index}`}
            card={card} 
            isPlayable={isCardPlayable(card)}
            isInHand={true}
            onClick={() => selectCard(index)}
            onAction={(action) => handleCardAction(index, action)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard2D;