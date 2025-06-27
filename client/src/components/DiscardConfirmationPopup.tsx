import React from 'react';
import { Card } from '../game/data/cardTypes';

interface DiscardConfirmationPopupProps {
  isOpen: boolean;
  card: Card | null;
  onConfirm: () => void;
  onCancel: () => void;
  bonusEffect?: string;
}

const DiscardConfirmationPopup: React.FC<DiscardConfirmationPopupProps> = ({
  isOpen,
  card,
  onConfirm,
  onCancel,
  bonusEffect
}) => {
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-4">
            Discard Card?
          </h3>
          
          {/* Card Display */}
          <div className="mb-4">
            <div className="bg-gray-700 rounded-lg p-3 mb-3">
              <div className="font-medium text-spektrum-orange mb-1">
                {card.name}
              </div>
              <div className="text-sm text-gray-300 mb-2">
                {card.description}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-300 mb-6">
            <p className="mb-3">
              This card has "you may discard" effect.
            </p>
            
            {bonusEffect && (
              <div className="bg-spektrum-orange bg-opacity-20 rounded-lg p-3 mb-3">
                <p className="text-spektrum-orange font-medium mb-1">
                  If you discard:
                </p>
                <p className="text-sm">
                  {bonusEffect}
                </p>
              </div>
            )}
            
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs">
                If you don't discard, the card will work normally.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Keep Card
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-spektrum-orange hover:bg-orange-600 text-spektrum-dark py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Discard for Bonus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscardConfirmationPopup;