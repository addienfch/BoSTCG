import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AvatarCard, ActionCard, Card as CardType, ElementType } from '../data/cardTypes';
import { useAudio } from '../../lib/stores/useAudio';
import { toast } from 'sonner';
import PreviewButton from './PreviewButton';
import { getFixedCardImagePath, handleCardImageError } from '../utils/cardImageFixer';

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
  counters?: { damage?: number; bleed?: number; shield?: number };
}

const CardPreview = ({ 
  card, 
  onClose, 
  damageCounter = 0 
}: { 
  card: CardType | any; 
  onClose: () => void; 
  damageCounter?: number;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute top-2 right-2 text-white bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
          onClick={onClose}
        >
          ✕
        </button>
        
        <div className="p-4">
          <div className="mb-4 rounded-lg overflow-hidden">
            {card.art && (
              <img 
                src={getFixedCardImagePath(card)} 
                alt={card.name} 
                className="w-full object-cover" 
                onError={(e) => handleCardImageError(e, card)}
              />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{card.name}</h3>
          
          <div className="flex justify-between mb-2">
            <div className="text-gray-300">
              {card.type.charAt(0).toUpperCase() + card.type.slice(1)} • {card.element}
              {card.type === 'avatar' && ` • Lv${(card as AvatarCard).level}`}
            </div>
            
            {card.energyCost && Array.isArray(card.energyCost) && (
              <div className="flex items-center gap-1">
                {card.energyCost.map((energy: ElementType, i: number) => (
                  <div 
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      energy === 'fire' ? 'bg-red-500' : 
                      energy === 'water' ? 'bg-blue-500' : 
                      energy === 'air' ? 'bg-cyan-300' : 
                      energy === 'earth' ? 'bg-amber-700' : 
                      energy === 'neutral' ? 'bg-gray-400' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {card.type === 'avatar' && (
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <div>Base Health: {(card as AvatarCard).health}</div>
                {damageCounter > 0 && (
                  <div className="text-red-500 font-bold">
                    Current HP: {Math.max(0, (card as AvatarCard).health - damageCounter)}
                  </div>
                )}
              </div>
              
              {(card as AvatarCard).skill1 && (
                <div className="mt-3 p-2 bg-gray-700 rounded">
                  <div className="font-medium">{(card as AvatarCard).skill1.name}</div>
                  <div className="text-xs text-gray-300 mb-1">
                    Energy: {(card as AvatarCard).skill1.energyCost.map(e => 
                      e.charAt(0).toUpperCase() + e.slice(1)
                    ).join(', ')}
                  </div>
                  <div>Damage: {(card as AvatarCard).skill1.damage}</div>
                  <div className="text-xs mt-1">{(card as AvatarCard).skill1.effect}</div>
                </div>
              )}
              
              {(card as AvatarCard).skill2 && (
                <div className="mt-2 p-2 bg-gray-700 rounded">
                  <div className="font-medium">{(card as AvatarCard).skill2?.name || ''}</div>
                  <div className="text-xs text-gray-300 mb-1">
                    Energy: {(card as AvatarCard).skill2?.energyCost?.map(e => 
                      e.charAt(0).toUpperCase() + e.slice(1)
                    ).join(', ') || ''}
                  </div>
                  <div>Damage: {(card as AvatarCard).skill2?.damage || 0}</div>
                  <div className="text-xs mt-1">{(card as AvatarCard).skill2?.effect || ''}</div>
                </div>
              )}
            </div>
          )}
          
          {(card.type === 'spell' || card.type === 'quickSpell' || card.type === 'ritualArmor' || card.type === 'equipment') && (
            <div className="mb-3 p-2 bg-gray-700 rounded">
              <div className="text-gray-100">{card.description}</div>
            </div>
          )}
          
          <div className="text-gray-400 text-xs mt-3">
            Card ID: {card.id}
          </div>
        </div>
      </div>
    </div>
  );
};

const Card2D: React.FC<Card2DProps> = ({
  card,
  isPlayable = false,
  isInHand = false,
  onClick,
  onAction,
  isDragging = false,
  isTapped = false,
  counters
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const playHitSound = useAudio(state => state.playHit);
  const playCard = useAudio(state => state.playCard);
  const cardRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
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
  
  // Update menu position when showActions changes
  useEffect(() => {
    if (showActions && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      
      // Position the menu at the center-right of the card
      setMenuPosition({
        top: rect.top + window.scrollY,
        left: rect.right + 10 + window.scrollX // 10px offset from card
      });
    }
  }, [showActions]);
  
  // State to force visual refresh of avatar cards
  const [visualRefreshCounter, setVisualRefreshCounter] = useState(0);
  
  // Monitor for game phase changes to ensure avatars reset their visual state
  useEffect(() => {
    // Access global game state if available
    const gameStore = window.gameStore;
    if (gameStore && card.type === 'avatar') {
      // Create a cleanup function that runs when component unmounts or refreshes
      const checkPhase = () => {
        console.log("Card2D detected phase change event for:", card.name);
        
        // Force component to re-render by updating the counter state
        setVisualRefreshCounter(prev => prev + 1);
      };
      
      // Handler for specific avatar reset event
      const handleAvatarReset = () => {
        console.log("Card2D received avatarReset event for:", card.name);
        
        // During refresh phase, avatars should be explicitly untapped regardless of their current state
        // This ensures all avatars are properly reset for the next turn
        if (cardRef.current) {
          // Always untap the card during refresh phase
          cardRef.current.style.transform = 'rotate(0deg)';
          console.log("Applied direct reset to card element for", card.name);
        }
        
        // Also update the counter for a full re-render
        setVisualRefreshCounter(prev => prev + 1);
      };
      
      // Set up listeners for both events
      document.addEventListener('gamePhaseChanged', checkPhase);
      document.addEventListener('avatarReset', handleAvatarReset);
      
      return () => {
        document.removeEventListener('gamePhaseChanged', checkPhase);
        document.removeEventListener('avatarReset', handleAvatarReset);
      };
    }
  }, [card]);
  
  // Reset the card transform when isTapped changes or forced refresh occurs
  useEffect(() => {
    if (card.type === 'avatar' && cardRef.current) {
      console.log(`Avatar ${card.name} visual state refresh. isTapped:`, isTapped, "refresh count:", visualRefreshCounter);
      
      // Apply visual transform based on isTapped state
      const cardElement = cardRef.current;
      
      if (isTapped) {
        // Apply tapped visual effect (rotated 90 degrees)
        cardElement.style.transform = 'rotate(90deg)';
      } else {
        // Reset to untapped state (no rotation)
        cardElement.style.transform = 'rotate(0deg)';
      }
    }
  }, [isTapped, visualRefreshCounter, card.name, card.type]);

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
    } else {
      // Show card preview for any other case
      setShowPreview(true);
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
        {/* Level indicator removed */}
        
        {/* Skill 1 */}
        {avatarCard.skill1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            {renderEnergyCost(avatarCard.skill1.energyCost)}
          </div>
        )}
        
        {/* Current HP indicator */}
        {((avatarCard.counters?.damage || 0) > 0 || (card as any).damageCounter > 0 || (counters?.damage || 0) > 0) && (
          <div className="absolute top-1/3 right-2 text-white text-[11px] font-bold px-2 py-0.5 bg-green-700 bg-opacity-80 rounded-full flex items-center justify-center min-w-[20px]">
            {Math.max(0, avatarCard.health - (avatarCard.counters?.damage || (card as any).damageCounter || counters?.damage || 0))}
          </div>
        )}
        
        {/* Bleed counter if any */}
        {(avatarCard.counters?.bleed || 0) > 0 && (
          <div className="absolute top-1/2 right-2 text-white text-[11px] font-bold px-2 py-0.5 bg-purple-700 bg-opacity-80 rounded-full flex items-center justify-center min-w-[20px]">
            B{avatarCard.counters?.bleed}
          </div>
        )}
        
        {/* Shield counter if any */}
        {(avatarCard.counters?.shield || 0) > 0 && (
          <div className="absolute bottom-1/3 right-2 text-white text-[11px] font-bold px-2 py-0.5 bg-blue-700 bg-opacity-80 rounded-full flex items-center justify-center min-w-[20px]">
            S{avatarCard.counters?.shield}
          </div>
        )}
      </>
    );
  };
  
  const renderActionContent = () => {
    const actionCard = card as ActionCard;
    const isQuickSpell = actionCard.type === 'quickSpell';
    
    return (
      <>
        {/* Energy cost for action cards */}
        <div className="absolute top-2 right-2">
          {renderEnergyCost(actionCard.energyCost)}
        </div>
        
        {/* Removed Quick Spell Indicator */}
      </>
    );
  };
  
  return (
    <>
      {/* Card Preview Modal */}
      {showPreview && createPortal(
        <CardPreview 
          card={card} 
          onClose={() => setShowPreview(false)} 
          damageCounter={
            card.type === 'avatar' ? 
              (card as AvatarCard).counters?.damage || 
              (card as any).damageCounter || 
              (counters?.damage || 0) : 0
          }
        />,
        document.body
      )}
      
      <div 
        ref={cardRef}
        className="relative" 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          transform: isTapped ? 'rotate(90deg)' : 'rotate(0deg)', // Explicit rotation for resetting
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-in-out',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Card base */}
        <div 
          className={`absolute inset-0 cursor-pointer ${isDragging ? 'scale-105' : 'hover:scale-105'} transition-transform`}
          style={{ 
            backgroundColor: 'transparent',
            opacity: isPlayable ? 1 : 0.7
          }}
          onClick={handleClick}
        >
          {/* Card name with background for better readability */}
          <div className="absolute top-2 left-0 right-0 text-center text-white text-sm font-bold px-2">
            {card.name}
          </div>
          
          {/* Preview Button for reserve avatars */}
          {!isInHand && card.type === 'avatar' && (
            <div className="absolute top-1 right-1 z-10">
              <PreviewButton onClick={() => setShowPreview(true)} />
            </div>
          )}
          
          {/* Card art - full size */}
          <div 
            className="absolute inset-0"
          >
            {card.art ? (
              <img 
                src={getFixedCardImagePath(card)} 
                alt={card.name} 
                className="h-full w-full object-cover" 
                onError={(e) => handleCardImageError(e, card)}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white text-opacity-70 text-xs">
                [Card Art]
              </div>
            )}
          </div>
          
          {/* Card type with background for better readability */}
          <div className="absolute bottom-12 left-0 right-0 text-center py-0.5 text-white text-[10px] font-bold">
            <span className="bg-black bg-opacity-50 px-2 py-0.5 rounded">
              {card.type === 'avatar' 
                ? (card as AvatarCard).subType 
                    ? (card as AvatarCard).subType.charAt(0).toUpperCase() + (card as AvatarCard).subType.slice(1)
                    : 'Avatar'
                : card.type.charAt(0).toUpperCase() + card.type.slice(1)}
            </span>
          </div>
          
          {/* Removed description/skills section */}
          
          {/* Render card type specific content */}
          {card.type === 'avatar' ? renderAvatarContent() : renderActionContent()}
        </div>
      </div>

      {/* Action menu in portal (always on top) */}
      {showActions && isPlayable && isInHand && document.body && createPortal(
        <div 
          className="fixed bg-black bg-opacity-95 rounded-lg p-3 border-2 border-yellow-400 shadow-xl"
          style={{
            top: `${menuPosition.top}px`, // Position beside the card
            left: `${menuPosition.left + 10}px`, // 10px to the right of the card
            width: `${width + 40}px`,
            zIndex: 9999999, // Ultra high z-index
          }}
        >
          <div className="relative">
            {/* Close button in top right */}
            <button 
              className="absolute -right-2 -top-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700"
              onClick={() => setShowActions(false)}
            >
              ✕
            </button>
            
            {/* Card action title */}
            <div className="text-white text-xs font-bold mb-2 text-center border-b border-gray-600 pb-1">
              {card.name}
            </div>
            
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
        </div>,
        document.body
      )}
      
      {/* Card Preview Modal */}
      {showPreview && createPortal(
        <CardPreview 
          card={card} 
          onClose={() => setShowPreview(false)}
          damageCounter={(counters?.damage || 0)}
        />,
        document.body
      )}
    </>
  );
};

export default Card2D;