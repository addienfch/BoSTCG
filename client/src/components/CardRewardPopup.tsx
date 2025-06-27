import React, { useState } from 'react';
import { Card } from '../game/data/cardTypes';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

interface CardRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  cards: Card[];
  onMintCards?: () => Promise<void>;
  showMintButton?: boolean;
}

const CardRewardPopup: React.FC<CardRewardPopupProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  cards,
  onMintCards,
  showMintButton = false
}) => {
  const [isMinting, setIsMinting] = useState(false);

  if (!isOpen) return null;

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-yellow-500 text-black';
      case 'epic': return 'bg-purple-500 text-white';
      case 'rare': return 'bg-blue-500 text-white';
      case 'common': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'text-red-400';
      case 'water': return 'text-blue-400';
      case 'ground': return 'text-yellow-600';
      case 'air': return 'text-cyan-400';
      case 'neutral': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const handleMint = async () => {
    if (!onMintCards) return;
    
    setIsMinting(true);
    try {
      await onMintCards();
    } catch (error) {
      console.error('Error minting cards:', error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-spektrum-orange max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-spektrum-orange to-orange-600 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-orange-100 text-sm">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-orange-700"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="text-center mb-6">
            <p className="text-gray-300 text-lg">
              You received <span className="font-bold text-spektrum-orange">{cards.length}</span> cards!
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="bg-gray-800 rounded-lg p-4 border border-gray-600 hover:border-spektrum-orange transition-colors"
              >
                <div className="aspect-[3/4] bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {card.art ? (
                    <img
                      src={card.art}
                      alt={card.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="text-center text-gray-400 hidden">
                    <div className="text-2xl mb-1">🃏</div>
                    <p className="text-xs">{card.type}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-sm truncate">{card.name}</h3>
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      Lv.{(card as any).level || 1}
                    </Badge>
                    <Badge 
                      className={`text-xs ${getRarityColor(card.rarity)}`}
                    >
                      {card.rarity || 'Common'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${getElementColor(card.element)}`}>
                      {card.element.toUpperCase()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {card.type}
                    </Badge>
                  </div>
                  
                  {card.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="text-gray-300 text-sm">
              🎉 All cards automatically minted as cNFTs and added to your wallet
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} className="bg-spektrum-orange hover:bg-orange-600">
                View Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardRewardPopup;