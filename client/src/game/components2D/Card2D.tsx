import React, { useState } from 'react';
import { AvatarCard, ActionCard, Card as CardType, ElementType } from '../data/cardTypes';
import { useAudio } from '../../lib/stores/useAudio';
import { toast } from 'sonner';

// Declare the gameStore property on window
declare global {
  interface Window {
    gameStore?: any;
  }
}

// Accept either our new Card type or the legacy CardData type
interface Card2DProps {
  card: CardType | any;
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
  isDragging = false,
  isTapped = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const playHitSound = useAudio(state => state.playHit);
  const playCard = useAudio(state => state.playCard);
  
  // Card dimensions - smaller for mobile view
  const width = 120;
  const height = 168;
  
  // Helper to display energy cost icons
  const renderEnergyCost = (energyCost?: ElementType[] | number) => {
    // Handle number format from old card data
    if (typeof energyCost === 'number') {
      return (
        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">{energyCost}</span>
        </div>
      );
    }
    
    if (!energyCost || energyCost.length === 0) return null;
    
    // Count energy by type
    const energyCount: Record<ElementType, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      light: 0,
      dark: 0,
      neutral: 0
    };
    
    // Make sure we're dealing with an array before forEach
    if (Array.isArray(energyCost)) {
      energyCost.forEach(type => {
        energyCount[type]++;
      });
    }
    return (
      <div className="flex gap-0.5">
        {energyCount.fire > 0 && (
          <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-[8px]">
            {energyCount.fire}
          </div>
        )}
        {energyCount.water > 0 && (
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px]">
            {energyCount.water}
          </div>
        )}
        {energyCount.earth > 0 && (
          <div className="w-4 h-4 bg-amber-800 rounded-full flex items-center justify-center text-white text-[8px]">
            {energyCount.earth}
          </div>
        )}
        {energyCount.air > 0 && (
          <div className="w-4 h-4 bg-cyan-300 rounded-full flex items-center justify-center text-black text-[8px]">
            {energyCount.air}
          </div>
        )}
        {energyCount.neutral > 0 && (
          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-black text-[8px]">
            {energyCount.neutral}
          </div>
        )}
      </div>
    );
  };
  
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
      case 'earth':
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
    if (isPlayable && isInHand) {
      // During setup phase, automatically place level 1 avatars as active
      if (card.type === 'avatar' && (card as AvatarCard).level === 1) {
        const gameStore = window.gameStore; // Access global game state
        if (gameStore && gameStore.gamePhase === 'setup' && gameStore.currentPlayer === 'player') {
          handleAction('active'); // Directly place as active avatar
          return;
        }
      }
      
      // For normal game phases, show action menu
      setShowActions(!showActions);
    } else if (onClick) {
      onClick();
    }
  };
  
  const handleAction = (action: string) => {
    setShowActions(false);
    // Don't play sound automatically to avoid autoplay errors
    
    if (onAction) {
      // This ensures both "energy" and "toEnergy" work 
      const normalizedAction = action === 'energy' ? 'toEnergy' : action;
      onAction(normalizedAction);
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
        case 'toEnergy':
          toast.success(`${card.name} will be used as energy`);
          break;
        case 'play':
          toast.success(`${card.name} will be played to the field`);
          break;
      }
    }
  };
  
  const getElementIcon = () => {
    switch (card.element) {
      case 'fire':
        return (
          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🔥</span>
          </div>
        );
      case 'water':
        return (
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">💧</span>
          </div>
        );
      case 'earth':
        return (
          <div className="w-5 h-5 bg-amber-800 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🌋</span>
          </div>
        );
      case 'air':
        return (
          <div className="w-5 h-5 bg-cyan-300 rounded-full flex items-center justify-center">
            <span className="text-black text-xs">💨</span>
          </div>
        );
      case 'neutral':
        return (
          <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-black text-xs">⭐</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const renderAvatarContent = () => {
    const avatarCard = card as AvatarCard;
    return (
      <>
        {/* Level and Subtype */}
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="bg-yellow-500 rounded-md px-1 text-[9px] font-bold text-white">
            LVL {avatarCard.level}
          </div>
        </div>
        
        {/* Health */}
        <div className="absolute bottom-2 right-2 bg-gray-700 rounded-md px-1 py-0.5 text-[10px] font-bold text-white">
          HP {avatarCard.health || (card as any).health || 0}
        </div>
        
        {/* Skill 1 */}
        {avatarCard.skill1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            {renderEnergyCost(avatarCard.skill1.energyCost)}
            <div className="bg-red-700 rounded-md px-1 py-0.5 text-[10px] font-bold text-white">
              {avatarCard.skill1.damage}
            </div>
          </div>
        )}
        
        {/* Damage counter if any */}
        {avatarCard.counters && avatarCard.counters.damage > 0 && (
          <div className="absolute top-7 right-2 bg-red-600 text-white text-[10px] font-bold px-1 rounded-full">
            {avatarCard.counters.damage}
          </div>
        )}
        
        {/* Bleed counter if any */}
        {avatarCard.counters && avatarCard.counters.bleed > 0 && (
          <div className="absolute top-12 right-2 bg-purple-600 text-white text-[10px] font-bold px-1 rounded-full">
            B{avatarCard.counters.bleed}
          </div>
        )}
        
        {/* Shield counter if any */}
        {avatarCard.counters && avatarCard.counters.shield > 0 && (
          <div className="absolute top-17 right-2 bg-blue-600 text-white text-[10px] font-bold px-1 rounded-full">
            S{avatarCard.counters.shield}
          </div>
        )}
        
        {/* Handle damage counter for legacy card format */}
        {(card as any).damageCounter > 0 && (
          <div className="absolute top-7 right-2 bg-red-600 text-white text-[10px] font-bold px-1 rounded-full">
            {(card as any).damageCounter}
          </div>
        )}
      </>
    );
  };
  
  const renderActionContent = () => {
    const actionCard = card as ActionCard;
    return (
      <>
        {/* Energy cost for action cards */}
        <div className="absolute top-2 right-2">
          {renderEnergyCost(actionCard.energyCost)}
        </div>
      </>
    );
  };
  
  return (
    <div 
      className="relative" 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        transform: isTapped ? 'rotate(90deg) translateY(0px) translateX(0px)' : 'none',
        transformOrigin: 'center center',
        transition: 'all 0.3s ease',
        position: 'relative',
        zIndex: isTapped ? 10 : 1
      }}
    >
      {/* Card base */}
      <div 
        className={`absolute inset-0 rounded-lg shadow-lg cursor-pointer ${isDragging ? 'scale-105' : 'hover:scale-105'} transition-transform`}
        style={{ 
          backgroundColor: cardColor,
          border: `3px solid ${borderColor}`,
          opacity: isPlayable ? 1 : 0.7
        }}
        onClick={handleClick}
      >
        {/* Card name */}
        <div 
          className="absolute top-2 left-0 right-0 text-center font-bold text-white text-xs px-2 flex items-center justify-center gap-1"
        >
          {getElementIcon()}
          <span>{card.name}</span>
        </div>
        
        {/* Card art */}
        <div 
          className="absolute top-9 left-2 right-2 h-20 bg-black bg-opacity-30 rounded overflow-hidden"
        >
          {card.art ? (
            <img src={card.art} alt={card.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white text-opacity-70 text-xs">
              [Card Art]
            </div>
          )}
        </div>
        
        {/* Card type */}
        <div className="absolute top-[116px] left-2 right-2 text-center bg-black bg-opacity-70 py-0.5 px-1 rounded text-white text-[9px]">
          {card.type === 'avatar' 
            ? `Avatar - ${(card as AvatarCard).subType ? 
              ((card as AvatarCard).subType.charAt(0).toUpperCase() + (card as AvatarCard).subType.slice(1)) 
              : 'Unknown'}`
            : card.type.charAt(0).toUpperCase() + card.type.slice(1)}
        </div>
        
        {/* Card description/skills */}
        <div 
          className="absolute top-[132px] left-2 right-2 text-white text-[8px] bg-black bg-opacity-50 p-1 rounded h-[28px] overflow-hidden"
        >
          {card.type === 'avatar' ? (
            <>
              {(card as AvatarCard).skill1?.name || ''} {(card as AvatarCard).skill1?.damage || ''} 
              {(card as AvatarCard).skill1?.damage ? 'dmg' : ''}
              {(card as AvatarCard).skill1?.effect && (
                <> | {((card as AvatarCard).skill1.effect?.length || 0) > 35 
                  ? (card as AvatarCard).skill1.effect?.substring(0, 35) + '...' 
                  : (card as AvatarCard).skill1.effect}</>
              )}
            </>
          ) : (
            <>
              {card.description && card.description.length > 40
                ? card.description.substring(0, 40) + '...' 
                : card.description}
            </>
          )}
        </div>
        
        {/* Render card type specific content */}
        {card.type === 'avatar' ? renderAvatarContent() : renderActionContent()}
      </div>
      
      {/* Action menu for all cards */}
      {showActions && isPlayable && isInHand && (
        <div 
          className="absolute left-full top-0 bg-black bg-opacity-90 rounded-lg p-2 z-50 border-2 border-yellow-400 shadow-xl ml-2"
          style={{ width: `${width + 20}px` }}
        >
          <div className="flex flex-col gap-2">
            {/* Avatar-specific actions */}
            {card.type === 'avatar' && (
              <>
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
              </>
            )}
            
            {/* Play action for non-avatar cards */}
            {card.type !== 'avatar' && (
              <button 
                className="bg-green-600 text-white rounded p-1 text-xs font-bold hover:bg-green-700"
                onClick={() => handleAction('play')}
              >
                Play Card
              </button>
            )}
            
            {/* Energy option for all cards */}
            <button 
              className="bg-amber-700 text-white rounded p-1 text-xs font-bold hover:bg-amber-800"
              onClick={() => handleAction('toEnergy')}
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