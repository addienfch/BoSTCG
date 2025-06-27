import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../game/data/cardTypes';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';
import { 
  useBoosterVariantStore, 
  type BoosterPack, 
  type BoosterVariant 
} from '../game/stores/useBoosterVariantStore';

const BoosterSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpening, setIsOpening] = useState(false);
  
  // Get the selected pack from navigation state
  const selectedPack = location.state?.selectedPack as BoosterPack;
  
  // Use centralized variant store
  const {
    selectedVariant,
    setSelectedVariant,
    generatePackVariants,
    getVariantPrice,
    purchaseVariant
  } = useBoosterVariantStore();
  
  // Generate variants for the selected pack
  const packVariants = selectedPack ? generatePackVariants(selectedPack) : [];

  // Reset variant selection when pack changes
  useEffect(() => {
    if (selectedPack && (!selectedVariant || !selectedVariant.id.includes(selectedPack.id))) {
      setSelectedVariant(null);
    }
  }, [selectedPack, selectedVariant, setSelectedVariant]);

  if (!selectedPack) {
    navigate('/shop/booster');
    return null;
  }

  const handleVariantSelect = (variant: BoosterVariant) => {
    setSelectedVariant(variant);
  };

  const handleOpenPack = async () => {
    if (!selectedVariant) {
      toast.error('Please select a booster pack variant first!');
      return;
    }

    setIsOpening(true);
    
    try {
      // Use enhanced variant system for card generation
      const cards = await purchaseVariant(selectedVariant, selectedPack);
      const finalPrice = getVariantPrice(selectedPack.price, selectedVariant);
      
      toast.success(`Opened ${selectedVariant.name} for $${finalPrice}! Received ${cards.length} cards.`);
      
      // Navigate with enhanced data
      navigate('/shop/booster', {
        state: {
          openedCards: cards,
          packName: selectedVariant.name,
          packVariant: selectedVariant,
          purchasePrice: finalPrice
        }
      });
    } catch (error) {
      console.error('Failed to open pack:', error);
      toast.error('Failed to open pack. Please try again.');
      setIsOpening(false);
    }
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20">
      <NavigationBar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <BackButton to="/shop/booster" />
          <h1 className="text-2xl font-bold ml-4">Select {selectedPack.name}</h1>
        </div>

        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Choose Your Variant</h2>
          <p className="text-gray-400 text-sm">
            Each variant offers different rarity distributions and guaranteed cards. 
            Higher tier variants cost more but offer better cards and guarantees.
          </p>
        </div>

        {/* Pack Variants Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {packVariants.map((variant) => (
            <div
              key={variant.id}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                selectedVariant?.id === variant.id
                  ? 'ring-2 ring-spektrum-orange bg-gray-700'
                  : 'hover:bg-gray-700'
              }`}
              onClick={() => handleVariantSelect(variant)}
            >
              <div className="text-center">
                <div className="w-full h-24 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-3xl">{selectedPack.emoji}</span>
                </div>
                <h3 className="font-bold text-sm mb-1">{variant.rarity}</h3>
                <p className="text-xs text-gray-400 mb-2">{variant.subtitle}</p>
                <p className="text-xs text-gray-500 mb-2">{variant.description}</p>
                <div className="text-spektrum-orange font-semibold text-sm">
                  ${getVariantPrice(selectedPack.price, variant)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {variant.priceMultiplier}x base price
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Variant Details */}
        {selectedVariant && (
          <div className="mb-6 bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">Selected: {selectedVariant.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{selectedVariant.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-spektrum-orange font-semibold">
                  {selectedPack.cardCount} Cards • ${getVariantPrice(selectedPack.price, selectedVariant)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Guaranteed: {selectedVariant.guaranteedRarities.join(', ')}
              </div>
            </div>
            <div className="text-xs text-gray-600">
              <strong>Rarity Chances:</strong>
              <div className="grid grid-cols-5 gap-2 mt-1">
                {Object.entries(selectedVariant.rarityWeights).map(([rarity, weight]) => (
                  <div key={rarity} className="text-center">
                    <div className="font-semibold">{rarity}</div>
                    <div>{(weight * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/shop/booster')}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Booster Packs
          </button>
          
          <button
            onClick={handleOpenPack}
            disabled={!selectedVariant || isOpening}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex-1 ${
              !selectedVariant || isOpening
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-spektrum-orange text-black hover:bg-orange-600'
            }`}
          >
            {isOpening ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                Opening Pack...
              </span>
            ) : selectedVariant ? (
              `Open Pack for $${getVariantPrice(selectedPack.price, selectedVariant)}`
            ) : (
              'Select a Variant First'
            )}
          </button>
        </div>

        {/* Pack Opening Animation */}
        {isOpening && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">{selectedPack.emoji}</div>
              <h2 className="text-2xl font-bold mb-2">Opening Pack...</h2>
              <p className="text-gray-400">Generating your cards</p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-spektrum-orange border-t-transparent mx-auto"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoosterSelectionPage;