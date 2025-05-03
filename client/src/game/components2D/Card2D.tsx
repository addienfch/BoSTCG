import React, { useState } from 'react';
import { CardData } from '../components/Card';
import { toast } from 'sonner';

interface Card2DProps {
  card: CardData;
  isPlayable?: boolean;
  isInHand?: boolean;
  onClick?: () => void;
  onAction?: (action: string) => void;
  isDragging?: boolean;
  isTapped?: boolean;
}

const Card2D: React.FC<Card2DProps> = ({
  card,
  isPlayable = false,
  isInHand = false,
  onClick,
  onAction,
  isTapped = false
}) => {
  const [showActions, setShowActions] = useState(false);
  
  // Card dimensions
  const width = 160;
  const height = 220;
  
  // Element-based colors for avatars
  let cardColor = '#5b3089'; // Default color for action cards
  let cardColorHover = '#7340ab';
  
  if (card.type === 'avatar') {
    switch (card.element) {
      case 'fire':
        cardColor = '#c92626';
        cardColorHover = '#e83232';
        break;
      case 'water':
        cardColor = '#2671c9';
        cardColorHover = '#3285e8';
        break;
      case 'ground':
        cardColor = '#8c5e2a';
        cardColorHover = '#a6722f';
        break;
      case 'air':
        cardColor = '#26a4c9';
        cardColorHover = '#32c1e8';
        break;
      default:
        cardColor = '#6b6b6b'; // neutral color
        cardColorHover = '#848484';
    }
  } else {
    // Colors for action cards based on type
    switch (card.type) {
      case 'spell':
        cardColor = '#5b3089';
        cardColorHover = '#7340ab';
        break;
      case 'quickSpell':
        cardColor = '#892a80';
        cardColorHover = '#ab349e';
        break;
      case 'ritualArmor':
        cardColor = '#295c8a';
        cardColorHover = '#3273ad';
        break;
      case 'field':
        cardColor = '#2a8a53';
        cardColorHover = '#34ad67';
        break;
      case 'equipment':
        cardColor = '#8a892a';
        cardColorHover = '#adad34';
        break;
      case 'item':
        cardColor = '#8a5c2a';
        cardColorHover = '#ad7334';
        break;
    }
  }
  
  // Highlight color based on playability
  const borderColor = isPlayable ? '#f5d76a' : '#666666';
  
  const handleClick = () => {
    if (isPlayable && card.type === 'avatar' && isInHand) {
      setShowActions(!showActions);
    } else if (onClick) {
      onClick();
    }
  };
  
  const handleAction = (action: string) => {
    setShowActions(false);
    
    if (onAction) {
      onAction(action);
    } else {
      // Fallback notifications if no handler is provided
      switch(action) {
        case 'active':
          toast.success(`${card.name} will be played as active avatar`);
          break;
        case 'reserve':
          toast.success(`${card.name} will be played as reserve avatar`);
          break;
        case 'energy':
          toast.success(`${card.name} will be used as energy`);
          break;
      }
    }
  };
  
  return (
    <div 
      className="relative" 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        transform: isTapped ? 'rotate(15deg)' : 'none',
        transition: 'transform 0.3s ease'
      }}
    >
      {/* Card base */}
      <div 
        className="absolute inset-0 rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
        style={{ 
          backgroundColor: cardColor,
          border: `3px solid ${borderColor}`,
          opacity: isPlayable ? 1 : 0.7
        }}
        onClick={handleClick}
      >
        {/* Card name */}
        <div 
          className="absolute top-2 left-0 right-0 text-center font-bold text-white text-sm px-2"
        >
          {card.name}
        </div>
        
        {/* Card art */}
        <div 
          className="absolute top-8 left-3 right-3 h-24 bg-white bg-opacity-20 rounded"
        >
          {/* Placeholder for card art */}
        </div>
        
        {/* Card description */}
        <div 
          className="absolute bottom-12 left-3 right-3 text-center text-white text-xs"
        >
          {card.description.length > 60 
            ? card.description.substring(0, 60) + '...' 
            : card.description}
        </div>
        
        {/* Card stats */}
        {card.type === 'avatar' && (
          <>
            {/* Level */}
            <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{card.level || 1}</span>
            </div>
            
            {/* Health */}
            <div className="absolute bottom-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">{card.health || 0}</span>
            </div>
            
            {/* Skill 1 */}
            {card.skill1 && (
              <div className="absolute bottom-3 left-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">{card.skill1.damage}</span>
              </div>
            )}
            
            {/* Skill 2 */}
            {card.skill2 && (
              <div className="absolute bottom-3 left-12 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">{card.skill2.damage}</span>
              </div>
            )}
          </>
        )}
        
        {/* Energy cost for non-avatar cards */}
        {card.type !== 'avatar' && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">{card.energyCost || 0}</span>
          </div>
        )}
      </div>
      
      {/* Popup action menu for avatar cards */}
      {showActions && isPlayable && card.type === 'avatar' && isInHand && (
        <div 
          className="absolute -top-24 left-0 right-0 bg-black bg-opacity-90 rounded-lg p-2 z-50 border-2 border-yellow-400 shadow-xl"
          style={{ width: `${width + 40}px`, left: '-20px' }}
        >
          <div className="flex flex-col gap-2">
            <button 
              className="bg-red-600 text-white rounded p-1 text-xs font-bold hover:bg-red-700"
              onClick={() => handleAction('active')}
            >
              Place as Active Avatar
            </button>
            <button 
              className="bg-blue-600 text-white rounded p-1 text-xs font-bold hover:bg-blue-700"
              onClick={() => handleAction('reserve')}
            >
              Place as Reserve Avatar
            </button>
            <button 
              className="bg-amber-700 text-white rounded p-1 text-xs font-bold hover:bg-amber-800"
              onClick={() => handleAction('energy')}
            >
              Use as Energy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card2D;