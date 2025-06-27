import React from 'react';
import { X } from 'lucide-react';

interface DiscardChoicePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
  cardName: string;
  discardPrompt: string;
  bonusEffect: string;
  normalEffect: string;
}

const DiscardChoicePopup: React.FC<DiscardChoicePopupProps> = ({
  isOpen,
  onClose,
  onYes,
  onNo,
  cardName,
  discardPrompt,
  bonusEffect,
  normalEffect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-600 max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{cardName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-3">{discardPrompt}</p>
            
            <div className="space-y-3">
              <div className="bg-green-900/30 border border-green-700 rounded p-3">
                <h4 className="text-green-400 font-medium text-sm mb-1">If you choose YES:</h4>
                <p className="text-green-300 text-sm">{bonusEffect}</p>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-700 rounded p-3">
                <h4 className="text-blue-400 font-medium text-sm mb-1">If you choose NO:</h4>
                <p className="text-blue-300 text-sm">{normalEffect}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onNo}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              No
            </button>
            <button
              onClick={onYes}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscardChoicePopup;