import React from 'react';
import Card2D from './Card2D';
import { useCardGame } from '../stores/useCardGame';
import { toast } from 'sonner';

const Hand2D: React.FC = () => {
  const { 
    playerHand, 
    currentPlayer, 
    gamePhase, 
    selectCard, 
    playCard, 
    setEnergyCard 
  } = useCardGame();
  
  // Check if a card is playable based on game state
  const isCardPlayable = (index: number) => {
    const card = playerHand[index];
    
    // Can only play cards during main phases and on player's turn
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      return false;
    }
    
    // Avatar cards can always be played (either as avatar or energy)
    if (card.type === 'avatar') {
      return true;
    }
    
    // For action cards, check energy cost
    return (card.energyCost || 0) <= playerHand.length; // This is a simplified check
  };
  
  // Handle card action from popup menu
  const handleCardAction = (index: number, action: string) => {
    const card = playerHand[index];
    
    switch(action) {
      case 'active':
        playCard(index);
        toast.success(`${card.name} played as active avatar`);
        break;
      case 'reserve':
        playCard(index, 'reserve');
        toast.success(`${card.name} placed in reserve`);
        break;
      case 'energy':
        setEnergyCard(index);
        toast.success(`${card.name} used as energy`);
        break;
    }
  };
  
  return (
    <div className="p-2 rounded-lg bg-gray-800 bg-opacity-50">
      <div className="text-white text-center text-sm mb-2 font-bold">Your Hand ({playerHand.length})</div>
      
      <div className="flex justify-center flex-wrap gap-2">
        {playerHand.map((card, index) => (
          <div key={`hand-${card.id}`} className="transform hover:scale-105 transition-transform">
            <Card2D 
              card={card}
              isPlayable={isCardPlayable(index)}
              isInHand={true}
              onClick={() => selectCard(index)}
              onAction={(action) => handleCardAction(index, action)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hand2D;