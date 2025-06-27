import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '../game/data/cardTypes';
import SafeCardImage from './SafeCardImage';

interface VirtualizedCardListProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  itemHeight?: number;
  containerHeight?: number;
  itemsPerRow?: number;
  className?: string;
}

const VirtualizedCardList: React.FC<VirtualizedCardListProps> = ({
  cards,
  onCardClick,
  itemHeight = 200,
  containerHeight = 600,
  itemsPerRow = 4,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible items based on scroll position
  const visibleItems = useMemo(() => {
    const rowHeight = itemHeight + 16; // Include gap
    const totalRows = Math.ceil(cards.length / itemsPerRow);
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(startRow + visibleRows + 2, totalRows); // +2 for buffer

    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(endRow * itemsPerRow, cards.length);

    const visibleCards = cards.slice(startIndex, endIndex);
    
    return {
      startRow,
      visibleCards,
      startIndex,
      endIndex,
      totalHeight: totalRows * rowHeight
    };
  }, [cards, scrollTop, containerHeight, itemHeight, itemsPerRow]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const handleCardClick = useCallback((card: Card) => {
    if (onCardClick) {
      onCardClick(card);
    }
  }, [onCardClick]);

  if (cards.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ height: containerHeight }}>
        <div className="text-gray-400 text-center">
          <div className="text-2xl mb-2">📋</div>
          <div>No cards available</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${className} overflow-auto`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: visibleItems.totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: visibleItems.startRow * (itemHeight + 16),
            width: '100%'
          }}
        >
          <div className={`grid grid-cols-${itemsPerRow} gap-4`}>
            {visibleItems.visibleCards.map((card, index) => (
              <VirtualizedCardItem
                key={`${card.id}-${visibleItems.startIndex + index}`}
                card={card}
                height={itemHeight}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface VirtualizedCardItemProps {
  card: Card;
  height: number;
  onClick: () => void;
}

const VirtualizedCardItem: React.FC<VirtualizedCardItemProps> = React.memo(({ 
  card, 
  height, 
  onClick 
}) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg border-2 border-gray-600 hover:border-blue-500 cursor-pointer transition-all duration-200"
      style={{ height }}
      onClick={onClick}
    >
      <div className="p-2 h-full flex flex-col">
        <SafeCardImage
          src={card.art}
          alt={card.name}
          className="w-full flex-1 object-cover rounded mb-2"
          fallbackClassName="w-full flex-1 rounded mb-2"
        />
        <div className="text-white text-sm font-medium truncate">
          {card.name}
        </div>
        <div className="text-gray-400 text-xs">
          {card.element} • {card.rarity}
        </div>
      </div>
    </div>
  );
});

VirtualizedCardItem.displayName = 'VirtualizedCardItem';

export default VirtualizedCardList;