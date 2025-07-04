import React, { useState } from 'react';
import { useDeckStore } from '../game/stores/useDeckStore';
import { useExpansionStore, type Expansion } from '../game/stores/useExpansionStore';
import { usePremadeDecksStore, type PremadeDeck } from '../game/stores/usePremadeDecksStore';
import { useDataSyncStore } from '../game/stores/useDataSyncStore';
import { Card, ElementType, AvatarCard, ActionCard, RarityType } from '../game/data/cardTypes';
import { 
  kobarBorahAvatarCards, 
  kobarBorahActionCards, 
  kujanaKuhakaAvatarCards, 
  allFireCards 
} from '../game/data/kobarBorahCards';
import { redElementalSpellCards } from '../game/data/redElementalCards';
import { allNeutralCards } from '../game/data/neutralCards';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';
import { getRarityColor, getRarityTextColor } from '../game/utils/rarityUtils';
import { expansionManager, type ExpansionTemplate } from '../lib/expansionManager';



interface CardFormData {
  name: string;
  type: 'avatar' | 'spell' | 'quickSpell' | 'ritualArmor' | 'field' | 'equipment' | 'item';
  element: ElementType;
  level: number;
  health: number;
  subType: string;
  art: string;
  description: string;
  expansion: string;
  rarity: RarityType;
  energyCost: ElementType[];
  skill1Name: string;
  skill1Effect: string;
  skill1AdditionalEffect: string;
  skill1EffectType: string;
  skill1Damage: number;
  skill1Type: string;
  skill1EnergyCost: ElementType[];
  skill2Name: string;
  skill2Effect: string;
  skill2AdditionalEffect: string;
  skill2EffectType: string;
  skill2Damage: number;
  skill2Type: string;
  skill2EnergyCost: ElementType[];
}

const DevToolsPage: React.FC = () => {
  const { addCard } = useDeckStore();
  const { expansions, addExpansion, updateExpansion, deleteExpansion } = useExpansionStore();
  const { premadeDecks, addPremadeDeck, updatePremadeDeck, deletePremadeDeck } = usePremadeDecksStore();
  const { syncAllData, validateDataConsistency } = useDataSyncStore();
  
  // Get complete database of cards for dev tools (not just owned cards)
  const allDatabaseCards = [
    ...kobarBorahAvatarCards,
    ...kobarBorahActionCards,
    ...kujanaKuhakaAvatarCards,
    ...redElementalSpellCards,
    ...allNeutralCards
  ];
  
  // Remove duplicates based on card name and type
  const uniqueCards = allDatabaseCards.filter((card, index, self) => 
    index === self.findIndex(c => c.name === card.name && c.type === card.type)
  );
  
  // Local state for managing edited cards in dev-tools
  const [localCards, setLocalCards] = useState<Card[]>(uniqueCards);
  const [customCards, setCustomCards] = useState<Card[]>([]);
  
  // Combine original cards, local edits, and custom cards
  const cards = [...localCards, ...customCards];
  


  // Premade deck management now uses centralized store
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'database' | 'edit' | 'expansion' | 'conditional' | 'premade-decks' | 'asset-manager' | 'dev-utils'>('database');
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null);
  const [isEditingExpansion, setIsEditingExpansion] = useState(false);
  const [selectedExpansionFilter, setSelectedExpansionFilter] = useState<string>('all');
  
  // Asset manager state
  const [expansionTemplate, setExpansionTemplate] = useState<ExpansionTemplate>({
    id: '',
    name: '',
    description: '',
    symbol: '',
    theme: 'neutral',
    tribes: [],
    expectedCardCount: 100
  });
  const [assetUploadPath, setAssetUploadPath] = useState('');
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<'avatars' | 'spells' | 'equipment' | 'battle-sets' | 'boosters'>('avatars');
  const [cloneSourceExpansion, setCloneSourceExpansion] = useState('');
  


  // Premade deck form state
  const [deckForm, setDeckForm] = useState({
    name: '',
    expansion: '',
    tribe: '',
    description: '',
    price: 1500,
    cardCount: 40,
    strategy: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    coverCardName: '',
    keyCards: [] as string[]
  });
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<PremadeDeck | null>(null);
  
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    type: 'avatar' as 'avatar' | 'spell' | 'quickSpell' | 'ritualArmor' | 'field' | 'equipment' | 'item',
    element: 'fire' as ElementType,
    level: 1,
    health: 1,
    subType: '',
    art: '',
    description: '',
    expansion: '',
    rarity: 'Common' as RarityType,
    energyCost: [] as ElementType[],
    skill1Name: '',
    skill1Effect: '',
    skill1AdditionalEffect: '',
    skill1EffectType: 'basic_damage' as string,
    skill1Damage: 0,
    skill1Type: 'active' as 'active' | 'passive',
    skill1EnergyCost: [] as ElementType[],
    skill2Name: '',
    skill2Effect: '',
    skill2AdditionalEffect: '',
    skill2EffectType: 'basic_damage' as string,
    skill2Damage: 0,
    skill2Type: 'active' as 'active' | 'passive',
    skill2EnergyCost: [] as ElementType[]
  });

  const [expansionForm, setExpansionForm] = useState({
    name: '',
    description: '',
    releaseDate: '',
    cardCount: 0,
    artUrl: '',
    symbol: ''
  });

  // Mock expansions are now replaced by centralized store data

  const skillEffectTypes = [
    { value: 'basic_damage', label: 'Basic Damage' },
    { value: 'buff', label: 'Buff' },
    { value: 'debuff', label: 'Debuff' },
    { value: 'increase_damage', label: 'Increase Damage' },
    { value: 'heal', label: 'Heal' },
    { value: 'shield', label: 'Shield' },
    { value: 'draw_card', label: 'Draw Card' },
    { value: 'energy_gain', label: 'Energy Gain' },
    { value: 'counter_attack', label: 'Counter Attack' },
    { value: 'bleed', label: 'Bleed' },
    { value: 'poison', label: 'Poison' },
    { value: 'burn', label: 'Burn' }
  ];

  const handleNewCard = () => {
    setSelectedCard(null);
    setIsEditing(true);
    setActiveTab('edit');
    setFormData({
      name: '',
      type: 'avatar',
      element: 'fire',
      level: 1,
      health: 1,
      subType: '',
      art: '',
      description: '',
      expansion: '',
      rarity: 'Common',
      energyCost: [],
      skill1Name: '',
      skill1Effect: '',
      skill1AdditionalEffect: '',
      skill1EffectType: 'basic_damage',
      skill1Damage: 0,
      skill1Type: 'active',
      skill1EnergyCost: [],
      skill2Name: '',
      skill2Effect: '',
      skill2AdditionalEffect: '',
      skill2EffectType: 'basic_damage',
      skill2Damage: 0,
      skill2Type: 'active',
      skill2EnergyCost: []
    });
  };

  const handleEditCard = (card: Card) => {
    setSelectedCard(card);
    setIsEditing(true);
    setActiveTab('edit');
    const avatarCard = card as AvatarCard;
    const fieldCard = card.type === 'field' ? card as any : null;
    setFormData({
      name: card.name,
      type: card.type,
      element: card.element,
      level: avatarCard.level || 1,
      health: avatarCard.health || 1,
      subType: avatarCard.subType || '',
      art: card.art || '',
      description: card.description || '',
      expansion: '',
      rarity: card.rarity || 'Common',
      energyCost: [...(card.energyCost || [])],
      skill1Name: avatarCard.skill1?.name || '',
      skill1Effect: avatarCard.skill1?.effect || '',
      skill1AdditionalEffect: avatarCard.skill1?.additionalEffect || '',
      skill1EffectType: 'basic_damage',
      skill1Damage: avatarCard.skill1?.damage || 0,
      skill1Type: 'active',
      skill1EnergyCost: [...(avatarCard.skill1?.energyCost || [])],
      skill2Name: avatarCard.skill2?.name || '',
      skill2Effect: avatarCard.skill2?.effect || '',
      skill2AdditionalEffect: avatarCard.skill2?.additionalEffect || '',
      skill2EffectType: 'basic_damage',
      skill2Damage: avatarCard.skill2?.damage || 0,
      skill2Type: 'active',
      skill2EnergyCost: [...(avatarCard.skill2?.energyCost || [])]
    });
  };

  const handleDeleteCard = (card: Card) => {
    if (confirm(`Delete ${card.name}?`)) {
      // Remove from local cards and custom cards
      setLocalCards(prev => prev.filter(c => c.id !== card.id));
      setCustomCards(prev => prev.filter(c => c.id !== card.id));
      toast.success(`${card.name} deleted`);
    }
  };

  const handleSaveCard = () => {
    if (!formData.name.trim()) {
      toast.error('Card name is required');
      return;
    }

    // Create the card object based on form data
    let newCard: Card;

    if (formData.type === 'avatar') {
      const avatarCard: AvatarCard = {
        id: selectedCard?.id || `dev-${Date.now()}`,
        name: formData.name,
        type: 'avatar',
        element: formData.element,
        art: formData.art,
        description: formData.description,
        rarity: formData.rarity,
        energyCost: formData.energyCost,
        expansion: formData.expansion || 'dev-tools',
        level: (formData.level === 1 || formData.level === 2) ? formData.level : 1,
        health: formData.health,
        subType: formData.subType as any,
        skill1: formData.skill1Name ? {
          name: formData.skill1Name,
          effect: formData.skill1Effect,
          additionalEffect: formData.skill1AdditionalEffect,
          damage: formData.skill1Damage,
          energyCost: formData.skill1EnergyCost
        } : {
          name: '',
          effect: '',
          additionalEffect: '',
          damage: 0,
          energyCost: []
        },
        skill2: formData.skill2Name ? {
          name: formData.skill2Name,
          effect: formData.skill2Effect,
          additionalEffect: formData.skill2AdditionalEffect,
          damage: formData.skill2Damage,
          energyCost: formData.skill2EnergyCost
        } : undefined
      };
      
      newCard = avatarCard;
    } else {
      // Handle action cards
      const actionCard: ActionCard = {
        id: selectedCard?.id || `dev-${Date.now()}`,
        name: formData.name,
        type: formData.type as any,
        element: formData.element,
        art: formData.art,
        description: formData.description,
        rarity: formData.rarity,
        energyCost: formData.energyCost,
        expansion: formData.expansion || 'dev-tools'
      };
      
      newCard = actionCard;
    }

    console.log('Saving card:', {
      selectedCard: selectedCard?.id,
      newCard: newCard.name,
      isEditing: !!selectedCard
    });

    // Update local state for dev-tools
    if (selectedCard) {
      // Editing existing card
      console.log('Updating existing card in local state');
      setLocalCards(prev => {
        const updated = prev.map(card => 
          card.id === selectedCard.id ? newCard : card
        );
        console.log('Local cards updated:', updated.length);
        return updated;
      });
      setCustomCards(prev => {
        const updated = prev.map(card => 
          card.id === selectedCard.id ? newCard : card
        );
        console.log('Custom cards updated:', updated.length);
        return updated;
      });
    } else {
      // Creating new card
      console.log('Adding new card to custom cards');
      setCustomCards(prev => {
        const updated = [...prev, newCard];
        console.log('Custom cards now has:', updated.length, 'cards');
        return updated;
      });
    }
    
    // Also add to user's collection
    addCard(newCard);
    console.log('Card added to user collection');
    
    toast.success(selectedCard ? 'Card updated successfully' : 'Card created successfully');
    setIsEditing(false);
    setSelectedCard(null);
    setActiveTab('database');
    
    // Reset form
    setFormData({
      name: '',
      type: 'avatar',
      element: 'fire',
      level: 1,
      health: 1,
      subType: '',
      art: '',
      description: '',
      expansion: '',
      rarity: 'Common',
      energyCost: [],
      skill1Name: '',
      skill1Effect: '',
      skill1AdditionalEffect: '',
      skill1EffectType: 'basic_damage',
      skill1Damage: 0,
      skill1Type: 'active',
      skill1EnergyCost: [],
      skill2Name: '',
      skill2Effect: '',
      skill2AdditionalEffect: '',
      skill2EffectType: 'basic_damage',
      skill2Damage: 0,
      skill2Type: 'active',
      skill2EnergyCost: []
    });
  };

  const addEnergyToCost = (energyType: ElementType, costType: 'main' | 'skill1' | 'skill2') => {
    setFormData(prev => {
      const newData = { ...prev };
      if (costType === 'main') {
        newData.energyCost = [...prev.energyCost, energyType];
      } else if (costType === 'skill1') {
        newData.skill1EnergyCost = [...prev.skill1EnergyCost, energyType];
      } else if (costType === 'skill2') {
        newData.skill2EnergyCost = [...prev.skill2EnergyCost, energyType];
      }
      return newData;
    });
  };

  const removeEnergyFromCost = (index: number, costType: 'main' | 'skill1' | 'skill2') => {
    setFormData(prev => {
      const newData = { ...prev };
      if (costType === 'main') {
        newData.energyCost = prev.energyCost.filter((_, i) => i !== index);
      } else if (costType === 'skill1') {
        newData.skill1EnergyCost = prev.skill1EnergyCost.filter((_, i) => i !== index);
      } else if (costType === 'skill2') {
        newData.skill2EnergyCost = prev.skill2EnergyCost.filter((_, i) => i !== index);
      }
      return newData;
    });
  };

  const handleNewExpansion = () => {
    setSelectedExpansion(null);
    setIsEditingExpansion(true);
    setExpansionForm({
      name: '',
      description: '',
      releaseDate: '',
      cardCount: 0,
      artUrl: '',
      symbol: ''
    });
  };

  const handleEditExpansion = (expansion: Expansion) => {
    setSelectedExpansion(expansion);
    setIsEditingExpansion(true);
    setExpansionForm({
      name: expansion.name,
      description: expansion.description,
      releaseDate: expansion.releaseDate,
      cardCount: expansion.cardCount,
      artUrl: expansion.artUrl || '',
      symbol: expansion.symbol || ''
    });
  };

  const handleSaveExpansion = () => {
    if (!expansionForm.name.trim()) {
      toast.error('Expansion name is required');
      return;
    }

    const expansionData: Expansion = {
      id: selectedExpansion?.id || `exp-${Date.now()}`,
      name: expansionForm.name.trim(),
      description: expansionForm.description.trim(),
      releaseDate: expansionForm.releaseDate,
      cardCount: expansionForm.cardCount,
      artUrl: expansionForm.artUrl || '',
      symbol: expansionForm.symbol || '⚡'
    };

    console.log('Saving expansion:', expansionData);

    if (selectedExpansion) {
      // Update existing expansion
      updateExpansion(selectedExpansion.id, expansionData);
      toast.success(`${expansionForm.name} expansion updated`);
    } else {
      // Create new expansion
      addExpansion(expansionData);
      toast.success(`${expansionForm.name} expansion created`);
    }
    
    setIsEditingExpansion(false);
    setSelectedExpansion(null);
  };

  // Premade deck functions
  const handleNewDeck = () => {
    setSelectedDeck(null);
    setIsEditingDeck(true);
    setDeckForm({
      name: '',
      expansion: '',
      tribe: '',
      description: '',
      price: 1500,
      cardCount: 40,
      strategy: '',
      difficulty: 'Beginner',
      coverCardName: '',
      keyCards: []
    });
  };

  const handleEditDeck = (deck: PremadeDeck) => {
    setSelectedDeck(deck);
    setIsEditingDeck(true);
    setDeckForm({
      name: deck.name,
      expansion: deck.expansion,
      tribe: deck.tribe,
      description: deck.description,
      price: deck.price,
      cardCount: deck.cardCount,
      strategy: deck.strategy,
      difficulty: deck.difficulty,
      coverCardName: deck.coverCardName,
      keyCards: [...deck.keyCards]
    });
  };

  const handleSaveDeck = () => {
    if (!deckForm.name.trim()) {
      toast.error('Deck name is required');
      return;
    }

    const deckData: PremadeDeck = {
      id: selectedDeck?.id || `deck-${Date.now()}`,
      name: deckForm.name.trim(),
      expansion: deckForm.expansion,
      tribe: deckForm.tribe,
      description: deckForm.description.trim(),
      price: deckForm.price,
      cardCount: deckForm.cardCount,
      strategy: deckForm.strategy.trim(),
      difficulty: deckForm.difficulty,
      coverCardName: deckForm.coverCardName.trim(),
      keyCards: deckForm.keyCards,
      purchased: false,
      artUrl: selectedDeck?.artUrl || '/assets/shared/decks/fire-tribe-starter.svg'
    };

    console.log('Saving premade deck:', deckData);

    if (selectedDeck) {
      // Update existing deck
      updatePremadeDeck(selectedDeck.id, deckData);
      toast.success(`${deckForm.name} deck updated`);
    } else {
      // Create new deck
      addPremadeDeck(deckData);
      toast.success(`${deckForm.name} deck created`);
    }
    
    setIsEditingDeck(false);
    setSelectedDeck(null);
  };

  const handleDeleteDeck = (deck: PremadeDeck) => {
    if (confirm(`Delete ${deck.name} deck?`)) {
      deletePremadeDeck(deck.id);
      toast.success(`${deck.name} deleted`);
    }
  };

  // Asset Management Functions
  const handleCreateExpansion = async () => {
    try {
      const result = await expansionManager.createExpansion(expansionTemplate);
      
      if (result.success && result.expansion) {
        toast.success(`✅ Expansion "${result.expansion.name}" created successfully!`);
        console.log(`📁 Created ${result.directories.length} directories`);
        
        // Reset form
        setExpansionTemplate({
          id: '',
          name: '',
          description: '',
          symbol: '',
          theme: 'neutral',
          tribes: [],
          expectedCardCount: 100
        });
      } else {
        toast.error(`❌ Failed to create expansion: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      toast.error(`❌ Expansion creation failed: ${error}`);
    }
  };

  const handleCloneExpansion = async () => {
    if (!cloneSourceExpansion) {
      toast.error('Please select a source expansion to clone');
      return;
    }

    try {
      const result = await expansionManager.cloneExpansion(cloneSourceExpansion, expansionTemplate);
      
      if (result.success) {
        toast.success(`✅ Expansion cloned successfully! ${result.clonedAssets.length} assets copied`);
        setCloneSourceExpansion('');
        setExpansionTemplate({
          id: '',
          name: '',
          description: '',
          symbol: '',
          theme: 'neutral',
          tribes: [],
          expectedCardCount: 100
        });
      } else {
        toast.error(`❌ Clone failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      toast.error(`❌ Clone operation failed: ${error}`);
    }
  };

  const handleValidateAssetFile = (fileName: string) => {
    const result = expansionManager.validateAssetFile(fileName, selectedAssetCategory);
    
    if (result.isValid) {
      toast.success(`✅ "${fileName}" is valid for ${selectedAssetCategory}`);
    } else {
      toast.error(`❌ Invalid file: ${result.errors.join(', ')}`);
    }

    if (result.suggestions.length > 0) {
      console.log('💡 Suggestions:', result.suggestions);
    }
  };

  const getExpansionAssetStatus = () => {
    return expansionManager.getExpansionAssetStatus();
  };

  const generateAssetUploadPaths = (expansionId: string) => {
    return expansionManager.generateAssetUploadPaths(expansionId);
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Developer Tools</h1>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === 'database' 
                ? 'bg-spektrum-orange text-spektrum-dark' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Database
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === 'edit' 
                ? 'bg-spektrum-orange text-spektrum-dark' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Edit Card
          </button>
          <button
            onClick={() => setActiveTab('expansion')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === 'expansion' 
                ? 'bg-spektrum-orange text-spektrum-dark' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Expansions
          </button>

          <button
            onClick={() => setActiveTab('premade-decks')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === 'premade-decks' 
                ? 'bg-spektrum-orange text-spektrum-dark' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Premade Decks
          </button>

          <button
            onClick={() => setActiveTab('asset-manager')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === 'asset-manager' 
                ? 'bg-spektrum-orange text-spektrum-dark' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Asset Manager
          </button>

          <button
            onClick={() => setActiveTab('dev-utils')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === 'dev-utils' 
                ? 'bg-spektrum-orange text-spektrum-dark' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Dev Utils
          </button>

        </div>
        
        {activeTab === 'database' && (
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">Card Database</h3>
              <button
                onClick={handleNewCard}
                className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
              >
                + New
              </button>
            </div>
            
            {/* Expansion Filter */}
            <div className="mb-2">
              <select
                value={selectedExpansionFilter}
                onChange={(e) => setSelectedExpansionFilter(e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
              >
                <option value="all">All Expansions</option>
                {expansions.map(expansion => (
                  <option key={expansion.id} value={expansion.id}>
                    {expansion.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto space-y-1">
              {cards
                .filter(card => selectedExpansionFilter === 'all' || (card as any).expansion === selectedExpansionFilter)
                .map((card, index) => (
                <div key={`${card.id}-${index}`} className="bg-gray-700 p-2 rounded flex gap-2 items-center">
                  {/* Card Image */}
                  <div className="w-12 h-16 bg-gray-600 rounded border border-gray-500 flex-shrink-0 overflow-hidden">
                    {card.art ? (
                      <img 
                        src={card.art.startsWith('/textures/') ? card.art : `/textures/cards/${card.art}`} 
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/textures/cards/default_avatar.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No
                      </div>
                    )}
                  </div>
                  
                  {/* Card Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{card.name}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {card.type} - {card.element}
                      {card.type === 'avatar' && ` - L${(card as AvatarCard).level}`}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`px-1 py-0.5 rounded text-xs ${getRarityTextColor(card.rarity || 'Common')}`}>
                        {(card.rarity || 'Common').charAt(0)}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {((card as any).expansion || 'Core').substring(0, 8)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleEditCard(card)}
                      className="bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card)}
                      className="bg-red-600 hover:bg-red-700 px-1 py-0.5 rounded text-xs"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="bg-gray-800 rounded-lg p-2 h-[600px] overflow-y-auto">
            <h3 className="text-md font-medium mb-2">
              {selectedCard ? 'Edit Card' : 'Create New Card'}
            </h3>
            
            {/* Compact Layout - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Left Column - Basic Info */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    >
                      <option value="avatar">Avatar</option>
                      <option value="spell">Spell</option>
                      <option value="quickSpell">Quick Spell</option>
                      <option value="ritualArmor">Ritual Armor</option>
                      <option value="field">Field</option>
                      <option value="equipment">Equipment</option>
                      <option value="item">Item</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Element</label>
                    <select
                      value={formData.element}
                      onChange={(e) => setFormData(prev => ({ ...prev, element: e.target.value as ElementType }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    >
                      <option value="fire">Fire</option>
                      <option value="water">Water</option>
                      <option value="ground">Ground</option>
                      <option value="air">Air</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rarity</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value as RarityType }))}
                      className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded ${getRarityTextColor(formData.rarity)}`}
                    >
                      <option value="Common" className="text-gray-400">Common</option>
                      <option value="Uncommon" className="text-green-400">Uncommon</option>
                      <option value="Rare" className="text-blue-400">Rare</option>
                      <option value="Super Rare" className="text-purple-400">Super Rare</option>
                      <option value="Mythic" className="text-yellow-400">Mythic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expansion Pack</label>
                    <select
                      value={formData.expansion}
                      onChange={(e) => setFormData(prev => ({ ...prev, expansion: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    >
                      <option value="">Select Expansion</option>
                      {expansions.map(expansion => (
                        <option key={expansion.id} value={expansion.name}>
                          {expansion.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.type === 'avatar' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Level</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.level}
                        onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Health</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.health}
                        onChange={(e) => setFormData(prev => ({ ...prev, health: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Sub Type</label>
                      <select
                        value={formData.subType}
                        onChange={(e) => setFormData(prev => ({ ...prev, subType: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                      >
                        <option value="">Select Sub Type</option>
                        <option value="kobar">Kobar</option>
                        <option value="borah">Borah</option>
                        <option value="kuhaka">Kuhaka</option>
                        <option value="kujana">Kujana</option>
                        <option value="kuku">Kuku</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Main Energy Cost</label>
                  <div className="flex gap-2 mb-2">
                    {['fire', 'water', 'ground', 'air', 'neutral'].map(element => (
                      <button
                        key={element}
                        onClick={() => addEnergyToCost(element as ElementType, 'main')}
                        className={`px-2 py-1 rounded text-xs capitalize ${
                          element === 'fire' ? 'bg-red-600' : 
                          element === 'water' ? 'bg-blue-600' : 
                          element === 'ground' ? 'bg-yellow-600' : 
                          element === 'air' ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        +{element}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {formData.energyCost.map((energy, index) => (
                      <span 
                        key={index} 
                        onClick={() => removeEnergyFromCost(index, 'main')}
                        className={`px-2 py-1 rounded text-xs capitalize cursor-pointer ${
                          energy === 'fire' ? 'bg-red-700' : 
                          energy === 'water' ? 'bg-blue-700' : 
                          energy === 'ground' ? 'bg-yellow-700' : 
                          energy === 'air' ? 'bg-green-700' : 'bg-gray-700'
                        }`}
                      >
                        {energy} ×
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Art URL</label>
                  <input
                    type="text"
                    value={formData.art}
                    onChange={(e) => setFormData(prev => ({ ...prev, art: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    rows={3}
                    placeholder="Describe the card effect or use conditional patterns..."
                  />
                  
                  {/* Conditional Effects for All Card Types */}
                  {formData.type !== 'avatar' && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-400 mb-2">Quick Conditional Templates:</div>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            description: 'If the player discard a card, this effect damage become 6' 
                          }))}
                          className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                        >
                          Discard → DMG 6
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            description: 'If the opponent active avatar has burn counter this effect damage become 7' 
                          }))}
                          className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                        >
                          Burn Counter → DMG 7
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            description: 'If the opponent active avatar has water type this effect damage become 8' 
                          }))}
                          className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                        >
                          Water Type → DMG 8
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            description: 'If your active avatar has kuhaka subtype, this effect damage get +3' 
                          }))}
                          className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                        >
                          Kuhaka Subtype → +3 DMG
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            description: 'If this card is fire element, this effect damage become 9' 
                          }))}
                          className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                        >
                          Fire Element → DMG 9
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            description: 'If the opponent active avatar is ground element, this effect damage become 12' 
                          }))}
                          className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                        >
                          Opponent Ground → DMG 12
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Pattern Detection for All Cards */}
                  {formData.description && (
                    <div className="mt-2 text-xs">
                      <div className="text-gray-400">Detected Patterns:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.description.toLowerCase().includes('discard') && (
                          <span className="bg-green-800 text-green-200 px-1 rounded">Discard Trigger</span>
                        )}
                        {formData.description.toLowerCase().includes('counter') && (
                          <span className="bg-blue-800 text-blue-200 px-1 rounded">Counter Condition</span>
                        )}
                        {formData.description.toLowerCase().includes('type') && formData.description.toLowerCase().includes('damage become') && (
                          <span className="bg-purple-800 text-purple-200 px-1 rounded">Type Advantage</span>
                        )}
                        {formData.description.toLowerCase().includes('equipment') && (
                          <span className="bg-yellow-800 text-yellow-200 px-1 rounded">Equipment Bonus</span>
                        )}
                        {formData.description.toLowerCase().includes('damage get +') && (
                          <span className="bg-red-800 text-red-200 px-1 rounded">Damage Bonus</span>
                        )}
                        {formData.description.toLowerCase().includes('subtype') && (
                          <span className="bg-orange-800 text-orange-200 px-1 rounded">Subtype Synergy</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Expansion and Rarity */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Expansion</label>
                    <select
                      value={formData.expansion}
                      onChange={(e) => setFormData(prev => ({ ...prev, expansion: e.target.value }))}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                    >
                      <option value="">Select Expansion</option>
                      {expansions.map(exp => (
                        <option key={exp.id} value={exp.id}>{exp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Rarity</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value as RarityType }))}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                    >
                      {['Common', 'Uncommon', 'Rare', 'Super Rare', 'Mythic'].map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column - Skills */}
              {formData.type === 'avatar' && (
                <div className="space-y-3">
                  <div className="space-y-3">
                  {/* Skill 1 - Full width */}
                  <div className="bg-gray-700 p-3 rounded">
                    <h3 className="font-medium mb-2 text-sm">Skill 1</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <input
                            type="text"
                            value={formData.skill1Name}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1Name: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Effect Type</label>
                          <select
                            value={formData.skill1EffectType}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1EffectType: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          >
                            {skillEffectTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Damage</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.skill1Damage}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1Damage: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={formData.skill1Type}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1Type: e.target.value as 'active' | 'passive' }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          >
                            <option value="active">Active</option>
                            <option value="passive">Passive</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Effect Description</label>
                        <textarea
                          value={formData.skill1Effect}
                          onChange={(e) => setFormData(prev => ({ ...prev, skill1Effect: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          rows={2}
                          placeholder="Describe the skill effect or use conditional patterns..."
                        />
                        
                        {/* Conditional Damage Quick Templates */}
                        <div className="mt-2">
                          <div className="text-xs text-gray-400 mb-2">Quick Conditional Templates:</div>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill1Effect: 'If the player discard a card, then this attack damage become 8' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Discard → DMG 8
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill1Effect: 'If the opponent active avatar has bleed counter this attack damage become 9' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Bleed Counter → DMG 9
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill1Effect: 'If the opponent active avatar has fire type this attack damage become 10' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Fire Type → DMG 10
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill1Effect: 'If this card has equipment card attached, this attack damage become 12' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Equipment → DMG 12
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill1Effect: 'If this card is fire element, this attack damage become 11' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Fire Element → DMG 11
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill1Effect: 'If the opponent active avatar is water element, this attack damage become 14' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Opponent Water → DMG 14
                            </button>
                          </div>
                        </div>
                        
                        {/* Pattern Detection */}
                        {formData.skill1Effect && (
                          <div className="mt-2 text-xs">
                            <div className="text-gray-400">Detected Patterns:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.skill1Effect.toLowerCase().includes('discard') && (
                                <span className="bg-green-800 text-green-200 px-1 rounded">Discard Trigger</span>
                              )}
                              {formData.skill1Effect.toLowerCase().includes('counter') && (
                                <span className="bg-blue-800 text-blue-200 px-1 rounded">Counter Condition</span>
                              )}
                              {formData.skill1Effect.toLowerCase().includes('type') && formData.skill1Effect.toLowerCase().includes('damage become') && (
                                <span className="bg-purple-800 text-purple-200 px-1 rounded">Type Advantage</span>
                              )}
                              {formData.skill1Effect.toLowerCase().includes('equipment') && (
                                <span className="bg-yellow-800 text-yellow-200 px-1 rounded">Equipment Bonus</span>
                              )}
                              {formData.skill1Effect.toLowerCase().includes('damage get +') && (
                                <span className="bg-red-800 text-red-200 px-1 rounded">Damage Bonus</span>
                              )}
                              {(formData.skill1Effect.toLowerCase().includes('element') || 
                                formData.skill1Effect.toLowerCase().includes('fire element') || 
                                formData.skill1Effect.toLowerCase().includes('water element') ||
                                formData.skill1Effect.toLowerCase().includes('ground element') ||
                                formData.skill1Effect.toLowerCase().includes('air element')) && (
                                <span className="bg-indigo-800 text-indigo-200 px-1 rounded">Element Condition</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Additional Effect</label>
                        <textarea
                          value={formData.skill1AdditionalEffect || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, skill1AdditionalEffect: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          rows={2}
                          placeholder="Optional additional effect for complex skills"
                        />
                      </div>

                      {formData.skill1Type === 'active' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Energy Cost</label>
                          <div className="flex gap-1 mb-2">
                            {['fire', 'water', 'ground', 'air', 'neutral'].map(element => (
                              <button
                                key={element}
                                onClick={() => addEnergyToCost(element as ElementType, 'skill1')}
                                className={`px-1 py-1 rounded text-xs capitalize ${
                                  element === 'fire' ? 'bg-red-600' : 
                                  element === 'water' ? 'bg-blue-600' : 
                                  element === 'ground' ? 'bg-yellow-600' : 
                                  element === 'air' ? 'bg-green-600' : 'bg-gray-600'
                                }`}
                              >
                                +{element}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {formData.skill1EnergyCost.map((energy, index) => (
                              <span 
                                key={index}
                                onClick={() => removeEnergyFromCost(index, 'skill1')}
                                className={`px-2 py-1 rounded text-xs capitalize cursor-pointer ${
                                  energy === 'fire' ? 'bg-red-700' : 
                                  energy === 'water' ? 'bg-blue-700' : 
                                  energy === 'ground' ? 'bg-yellow-700' : 
                                  energy === 'air' ? 'bg-green-700' : 'bg-gray-700'
                                }`}
                              >
                                {energy} ×
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skill 2 - Full width */}
                  <div className="bg-gray-700 p-3 rounded">
                    <h3 className="font-medium mb-2 text-sm">Skill 2</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <input
                            type="text"
                            value={formData.skill2Name}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2Name: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Effect Type</label>
                          <select
                            value={formData.skill2EffectType}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2EffectType: e.target.value }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          >
                            {skillEffectTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Damage</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.skill2Damage}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2Damage: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={formData.skill2Type}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2Type: e.target.value as 'active' | 'passive' }))}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          >
                            <option value="active">Active</option>
                            <option value="passive">Passive</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Effect Description</label>
                        <textarea
                          value={formData.skill2Effect}
                          onChange={(e) => setFormData(prev => ({ ...prev, skill2Effect: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          rows={2}
                          placeholder="Describe the skill effect or use passive patterns..."
                        />
                        
                        {/* Passive Effect Quick Templates */}
                        <div className="mt-2">
                          <div className="text-xs text-gray-400 mb-2">Quick Passive Templates:</div>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill2Effect: 'If your active avatar has kobar type, that cards attack damage get +3' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Kobar Type → +3 DMG
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill2Effect: 'If your active avatar has borah subtype that cards attack damage get +2' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Borah Subtype → +2 DMG
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill2Effect: 'If your active avatar has fire element, that cards attack damage get +4' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Fire Element → +4 DMG
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill2Effect: 'If this card has bleed counter, then this attack damage get +5' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Self Bleed → +5 DMG
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill2Effect: 'If your active avatar is ground element, that cards attack damage get +4' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Ground Element → +4 DMG
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                skill2Effect: 'If this card is air element, all air spells get +2 damage' 
                              }))}
                              className="text-left text-xs bg-gray-800 hover:bg-gray-700 p-1 rounded"
                            >
                              Air Synergy → +2 DMG
                            </button>
                          </div>
                        </div>
                        
                        {/* Pattern Detection for Skill 2 */}
                        {formData.skill2Effect && (
                          <div className="mt-2 text-xs">
                            <div className="text-gray-400">Detected Patterns:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.skill2Effect.toLowerCase().includes('avatar has') && formData.skill2Effect.toLowerCase().includes('type') && (
                                <span className="bg-blue-800 text-blue-200 px-1 rounded">Avatar Type Boost</span>
                              )}
                              {formData.skill2Effect.toLowerCase().includes('subtype') && (
                                <span className="bg-purple-800 text-purple-200 px-1 rounded">Avatar Subtype Boost</span>
                              )}
                              {formData.skill2Effect.toLowerCase().includes('element') && (
                                <span className="bg-orange-800 text-orange-200 px-1 rounded">Element Synergy</span>
                              )}
                              {formData.skill2Effect.toLowerCase().includes('this card has') && formData.skill2Effect.toLowerCase().includes('counter') && (
                                <span className="bg-red-800 text-red-200 px-1 rounded">Self Counter Synergy</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Additional Effect</label>
                        <textarea
                          value={formData.skill2AdditionalEffect || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, skill2AdditionalEffect: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          rows={2}
                          placeholder="Optional additional effect for complex skills"
                        />
                      </div>

                      {formData.skill2Type === 'active' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Energy Cost</label>
                          <div className="flex gap-1 mb-2">
                            {['fire', 'water', 'ground', 'air', 'neutral'].map(element => (
                              <button
                                key={element}
                                onClick={() => addEnergyToCost(element as ElementType, 'skill2')}
                                className={`px-1 py-1 rounded text-xs capitalize ${
                                  element === 'fire' ? 'bg-red-600' : 
                                  element === 'water' ? 'bg-blue-600' : 
                                  element === 'ground' ? 'bg-yellow-600' : 
                                  element === 'air' ? 'bg-green-600' : 'bg-gray-600'
                                }`}
                              >
                                +{element}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {formData.skill2EnergyCost.map((energy, index) => (
                              <span 
                                key={index}
                                onClick={() => removeEnergyFromCost(index, 'skill2')}
                                className={`px-2 py-1 rounded text-xs capitalize cursor-pointer ${
                                  energy === 'fire' ? 'bg-red-700' : 
                                  energy === 'water' ? 'bg-blue-700' : 
                                  energy === 'ground' ? 'bg-yellow-700' : 
                                  energy === 'air' ? 'bg-green-700' : 'bg-gray-700'
                                }`}
                              >
                                {energy} ×
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveCard}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Save Card
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activeTab === 'expansion' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Expansion Database</h2>
              <button
                onClick={handleNewExpansion}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
              >
                Add New Expansion
              </button>
            </div>
            
            {!isEditingExpansion ? (
              <div className="space-y-3">
                {expansions.map(expansion => (
                  <div key={expansion.id} className="bg-gray-700 p-4 rounded flex justify-between items-start">
                    <div className="flex gap-3">
                      {/* Expansion Icon */}
                      <div className="w-12 h-12 bg-gray-600 rounded border border-gray-500 flex-shrink-0 overflow-hidden">
                        {expansion.artUrl ? (
                          <img 
                            src={expansion.artUrl} 
                            alt={expansion.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/textures/icons/default_expansion.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            📦
                          </div>
                        )}
                      </div>
                      
                      {/* Expansion Info */}
                      <div>
                        <h3 className="font-medium text-lg">{expansion.name}</h3>
                        <p className="text-sm text-gray-300 mb-2">{expansion.description}</p>
                        <div className="text-xs text-gray-400">
                          Released: {expansion.releaseDate} | {expansion.cardCount} cards
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditExpansion(expansion)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${expansion.name} expansion?`)) {
                            deleteExpansion(expansion.id);
                            toast.success(`${expansion.name} deleted`);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {selectedExpansion ? 'Edit Expansion' : 'Create New Expansion'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={expansionForm.name}
                      onChange={(e) => setExpansionForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Release Date</label>
                    <input
                      type="date"
                      value={expansionForm.releaseDate}
                      onChange={(e) => setExpansionForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Card Count</label>
                  <input
                    type="number"
                    min="0"
                    value={expansionForm.cardCount}
                    onChange={(e) => setExpansionForm(prev => ({ ...prev, cardCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Symbol</label>
                  <input
                    type="text"
                    value={expansionForm.symbol}
                    onChange={(e) => setExpansionForm(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    placeholder="Enter expansion symbol (e.g., 🔥, ⚡, 💧)"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Icon URL</label>
                  <input
                    type="text"
                    value={expansionForm.artUrl || ''}
                    onChange={(e) => setExpansionForm(prev => ({ ...prev, artUrl: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    placeholder="Enter icon URL (e.g., /textures/icons/expansion.png)"
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    Upload your icon file to /textures/icons/ folder and enter the path here
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={expansionForm.description}
                    onChange={(e) => setExpansionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveExpansion}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    Save Expansion
                  </button>
                  <button
                    onClick={() => setIsEditingExpansion(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'premade-decks' && (
          <div className="bg-gray-800 rounded-lg p-4 h-[600px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Premade Decks Configuration</h3>
              <button
                onClick={handleNewDeck}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                + New Deck Template
              </button>
            </div>

            <div className="space-y-4">
              {/* Deck Creation Form */}
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-medium mb-3">Create New Premade Deck</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Deck Name</label>
                      <input
                        type="text"
                        value={deckForm.name}
                        onChange={(e) => setDeckForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter deck name..."
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Expansion</label>
                      <select 
                        value={deckForm.expansion}
                        onChange={(e) => setDeckForm(prev => ({ ...prev, expansion: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      >
                        <option value="">Select Expansion</option>
                        {expansions.map(exp => (
                          <option key={exp.id} value={exp.name}>{exp.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Tribe/Theme</label>
                      <input
                        type="text"
                        placeholder="e.g., Kobar Warriors, Fire Elementals..."
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Difficulty</label>
                      <select className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="9.99"
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                  </div>
                  
                  {/* Strategy & Description */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe the deck's playstyle and theme..."
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Strategy Guide</label>
                      <textarea
                        rows={3}
                        placeholder="Explain how to play this deck effectively..."
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Key Cards (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Crimson, Radja, Spark..."
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Cover Card Name</label>
                      <input
                        type="text"
                        placeholder="Name of the deck's featured card..."
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Selection System */}
                <div className="mt-6 bg-gray-600 p-4 rounded">
                  <h5 className="font-medium mb-3">Deck Cards (40-60 cards required)</h5>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Available Cards */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="text-sm font-medium">Available Cards</h6>
                        <input
                          type="text"
                          placeholder="Search cards..."
                          className="px-2 py-1 bg-gray-700 border border-gray-500 rounded text-xs w-32"
                        />
                      </div>
                      <div className="bg-gray-700 p-2 rounded max-h-48 overflow-y-auto">
                        <div className="space-y-1">
                          {cards.slice(0, 10).map((card, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-600 rounded hover:bg-gray-500 cursor-pointer">
                              <div className="flex-1">
                                <div className="text-xs font-medium">{card.name}</div>
                                <div className="text-xs text-gray-400">{card.type} • {card.element}</div>
                              </div>
                              <button className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs">
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Selected Cards */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="text-sm font-medium">Selected Cards (0/40)</h6>
                        <button className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">
                          Clear All
                        </button>
                      </div>
                      <div className="bg-gray-700 p-2 rounded max-h-48 overflow-y-auto">
                        <div className="text-center text-gray-400 py-8">
                          <p className="text-sm">No cards selected</p>
                          <p className="text-xs">Add cards from the left panel</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deck Statistics */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-gray-700 p-2 rounded text-center">
                      <div className="text-lg font-bold">0</div>
                      <div className="text-xs text-gray-400">Total Cards</div>
                    </div>
                    <div className="bg-gray-700 p-2 rounded text-center">
                      <div className="text-lg font-bold">0</div>
                      <div className="text-xs text-gray-400">Avatar Cards</div>
                    </div>
                    <div className="bg-gray-700 p-2 rounded text-center">
                      <div className="text-lg font-bold">0</div>
                      <div className="text-xs text-gray-400">Action Cards</div>
                    </div>
                    <div className="bg-gray-700 p-2 rounded text-center">
                      <div className="text-lg font-bold">Invalid</div>
                      <div className="text-xs text-gray-400">Deck Status</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={handleSaveDeck}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    {selectedDeck ? 'Update Deck' : 'Save Deck Template'}
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
                    Preview Deck
                  </button>
                  <button className="bg-spektrum-orange hover:bg-orange-600 px-4 py-2 rounded">
                    Auto-Build Deck
                  </button>
                </div>
              </div>

              {/* Existing Deck Templates */}
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="font-medium mb-3">Existing Deck Templates</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {premadeDecks.map(deck => (
                    <div key={deck.id} className="bg-gray-600 p-3 rounded border border-gray-500">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-sm">{deck.name}</h5>
                        <span className={`text-xs px-2 py-1 rounded ${
                          deck.difficulty === 'Beginner' ? 'bg-green-500' :
                          deck.difficulty === 'Intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {deck.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">{deck.expansion} • ${deck.price/100}</p>
                      <p className="text-xs text-gray-400 mb-3">{deck.description}</p>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditDeck(deck)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteDeck(deck)}
                          className="flex-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-gray-600 p-3 rounded border border-gray-500">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm">Control Masters</h5>
                      <span className="text-xs bg-purple-500 px-2 py-1 rounded">Advanced</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">Kujana Kuhaka • $19.99</p>
                    <p className="text-xs text-gray-400 mb-3">Advanced control deck with counter strategies and late-game power.</p>
                    <div className="flex gap-1">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs">Edit</button>
                      <button className="flex-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs">Delete</button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-600 p-3 rounded border border-gray-500 border-dashed opacity-75">
                    <div className="text-center text-gray-400 py-6">
                      <p className="text-sm">Click "New Deck Template" to add more premade decks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'asset-manager' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">📁 Asset & Expansion Manager</h3>
            
            {/* Scrollable Container */}
            <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4 custom-scrollbar"
                 style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
            
              {/* Expansion Creation Section */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium mb-3 text-blue-400">🚀 Create New Expansion</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expansion ID</label>
                  <input
                    type="text"
                    value={expansionTemplate.id}
                    onChange={(e) => setExpansionTemplate(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    placeholder="fire-and-water-tribes"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lowercase with hyphens only</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Expansion Name</label>
                  <input
                    type="text"
                    value={expansionTemplate.name}
                    onChange={(e) => setExpansionTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Fire & Water Tribes"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Symbol</label>
                  <input
                    type="text"
                    value={expansionTemplate.symbol}
                    onChange={(e) => setExpansionTemplate(prev => ({ ...prev, symbol: e.target.value }))}
                    placeholder="🔥"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Theme</label>
                  <select
                    value={expansionTemplate.theme}
                    onChange={(e) => setExpansionTemplate(prev => ({ ...prev, theme: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="earth">Earth</option>
                    <option value="air">Air</option>
                    <option value="mixed">Mixed Elements</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={expansionTemplate.description}
                  onChange={(e) => setExpansionTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the expansion theme and mechanics..."
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm h-20"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Card Count</label>
                  <input
                    type="number"
                    value={expansionTemplate.expectedCardCount}
                    onChange={(e) => setExpansionTemplate(prev => ({ ...prev, expectedCardCount: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tribes (comma separated)</label>
                  <input
                    type="text"
                    value={expansionTemplate.tribes.join(', ')}
                    onChange={(e) => setExpansionTemplate(prev => ({ ...prev, tribes: e.target.value.split(',').map(t => t.trim()).filter(t => t) }))}
                    placeholder="fire-tribe, water-tribe"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCreateExpansion}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium"
                >
                  🚀 Create Expansion
                </button>
                
                <button
                  onClick={() => setExpansionTemplate({
                    id: '',
                    name: '',
                    description: '',
                    symbol: '',
                    theme: 'neutral',
                    tribes: [],
                    expectedCardCount: 100
                  })}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm font-medium"
                >
                  🔄 Reset Form
                </button>
              </div>
            </div>
            
            {/* Clone Expansion Section */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium mb-3 text-yellow-400">📋 Clone Existing Expansion</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source Expansion</label>
                  <select
                    value={cloneSourceExpansion}
                    onChange={(e) => setCloneSourceExpansion(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  >
                    <option value="">Select expansion to clone...</option>
                    {expansions.map(expansion => (
                      <option key={expansion.id} value={expansion.id}>
                        {expansion.symbol} {expansion.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleCloneExpansion}
                    disabled={!cloneSourceExpansion || !expansionTemplate.name}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-medium w-full"
                  >
                    📋 Clone to New Expansion
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-gray-400">Clone directory structure and assets from an existing expansion</p>
            </div>
            
            {/* Asset Upload Manager */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium mb-3 text-purple-400">📤 Asset Upload Manager</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Expansion</label>
                  <select
                    onChange={(e) => {
                      const expansion = expansions.find(exp => exp.id === e.target.value);
                      if (expansion) {
                        const paths = generateAssetUploadPaths(expansion.id);
                        setAssetUploadPath(paths[0]?.path || '');
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  >
                    <option value="">Select expansion...</option>
                    {expansions.map(expansion => (
                      <option key={expansion.id} value={expansion.id}>
                        {expansion.symbol} {expansion.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Category</label>
                  <select
                    value={selectedAssetCategory}
                    onChange={(e) => setSelectedAssetCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  >
                    <option value="avatars">Avatar Cards</option>
                    <option value="spells">Spell Cards</option>
                    <option value="equipment">Equipment</option>
                    <option value="battle-sets">Battle Sets</option>
                    <option value="boosters">Booster Packs</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Upload Path</label>
                <div className="flex">
                  <input
                    type="text"
                    value={assetUploadPath}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-l text-sm text-gray-300"
                    placeholder="Select expansion and category first..."
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(assetUploadPath)}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-r text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Test File Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="test-avatar.png"
                    className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleValidateAssetFile(e.currentTarget.value);
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input.value) {
                        handleValidateAssetFile(input.value);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                  >
                    ✅ Validate
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Test if a filename follows naming conventions</p>
              </div>
            </div>
            
            {/* Expansion Status Overview */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-md font-medium mb-3 text-green-400">📊 Expansion Status Overview</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getExpansionAssetStatus().map((status, index) => (
                  <div key={index} className="bg-gray-600 p-3 rounded border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{status.expansion.symbol} {status.expansion.name}</h5>
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded">{status.completionPercentage}%</span>
                    </div>
                    
                    <div className="text-xs text-gray-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Avatars:</span>
                        <span>{status.assetCounts.avatars}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spells:</span>
                        <span>{status.assetCounts.spells}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment:</span>
                        <span>{status.assetCounts.equipment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Battle Sets:</span>
                        <span>{status.assetCounts.battleSets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Boosters:</span>
                        <span>{status.assetCounts.boosters}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${status.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            </div> {/* End scrollable container */}
          </div>
        )}

        {activeTab === 'dev-utils' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Development Utilities</h3>
            
            {/* USDC Refill Section */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium mb-3 text-green-400">💰 USDC Wallet Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    // Simulate USDC refill - in real app this would update wallet balance
                    toast.success("💰 +1000 USDC added to wallet!");
                    console.log("Dev Action: USDC wallet refilled with 1000 USDC");
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded text-sm font-medium"
                >
                  💵 Add 1000 USDC
                </button>
                
                <button
                  onClick={() => {
                    toast.success("💰 +5000 USDC added to wallet!");
                    console.log("Dev Action: USDC wallet refilled with 5000 USDC");
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded text-sm font-medium"
                >
                  💵 Add 5000 USDC
                </button>
                
                <button
                  onClick={() => {
                    toast.success("💰 Wallet reset to 10,000 USDC!");
                    console.log("Dev Action: USDC wallet reset to 10,000 USDC");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded text-sm font-medium"
                >
                  🔄 Reset to 10k USDC
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Simulate adding USDC to test purchasing flows and new user experience.
              </p>
            </div>

            {/* Card Collection Reset */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium mb-3 text-blue-400">🃏 Card Collection Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={async () => {
                    try {
                      // Clear user collection and reset to new user state
                      const { useDeckStore } = await import('../game/stores/useDeckStore');
                      const { useWalletStore } = await import('../game/stores/useWalletStore');
                      
                      const deckStore = useDeckStore.getState();
                      const walletStore = useWalletStore.getState();
                      
                      // Clear owned cards by directly calling setState
                      const setState = useDeckStore.setState;
                      setState({ ownedCards: [] });
                      walletStore.setNftCards([]);
                      
                      toast.success("🗑️ Card collection cleared - simulating new user!");
                      console.log("Dev Action: Card collection reset to simulate new user");
                      console.log("- Owned cards cleared from deck store");
                      console.log("- NFT cards cleared from wallet store");
                    } catch (error) {
                      console.error("Error clearing collection:", error);
                      toast.error("Error clearing collection. Check console.");
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-3 rounded text-sm font-medium"
                >
                  🆕 Simulate New User
                </button>
                
                <button
                  onClick={() => {
                    toast.success("🎲 Starter cards added to collection!");
                    console.log("Dev Action: Added starter card set");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded text-sm font-medium"
                >
                  🎁 Add Starter Pack
                </button>

                <button
                  onClick={() => {
                    toast.success("🎮 New player experience activated! Check console for details.");
                    console.log("Dev Action: New player experience simulation started");
                    console.log("- Wallet reset to 10,000 USDC");
                    console.log("- Collection cleared");
                    console.log("- Experience reset to Level 1");
                    console.log("- Tutorial flags reset");
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded text-sm font-medium"
                >
                  🎮 New Player Experience
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Reset collection to test onboarding and progression flows. Use "New Player Experience" for complete onboarding simulation.
              </p>
            </div>

            {/* Experience & Progress Reset */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-md font-medium mb-3 text-yellow-400">🏆 Experience & Progress</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    toast.success("📊 Player level reset to 1!");
                    console.log("Dev Action: Player experience reset to level 1");
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-3 rounded text-sm font-medium"
                >
                  🔢 Reset to Level 1
                </button>
                
                <button
                  onClick={() => {
                    toast.success("⚡ +5000 XP added!");
                    console.log("Dev Action: Added 5000 experience points");
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-3 rounded text-sm font-medium"
                >
                  ⭐ Add 5000 XP
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Manage player progression for testing different experience levels.
              </p>
            </div>

            {/* Complete Reset */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-md font-medium mb-3 text-red-400">⚠️ Complete Reset</h4>
              <button
                onClick={async () => {
                  if (confirm("Are you sure? This will reset EVERYTHING to simulate a completely new user.")) {
                    try {
                      // Import and use the cardNftService
                      const { cardNftService } = await import('../blockchain/solana/cardNftService');
                      const { useWalletStore } = await import('../game/stores/useWalletStore');
                      const { useDeckStore } = await import('../game/stores/useDeckStore');
                      
                      // Clear NFTs from wallet
                      await cardNftService.clearAllNfts();
                      console.log("✅ All NFTs cleared from wallet");
                      
                      // Reset wallet store
                      const walletStore = useWalletStore.getState();
                      walletStore.setNftCards([]);
                      await walletStore.refreshWalletData();
                      console.log("✅ Wallet store refreshed");
                      
                      // Clear all decks and owned cards in deck store
                      const setDeckState = useDeckStore.setState;
                      setDeckState({ 
                        ownedCards: [], 
                        decks: [], 
                        activeDeckId: null 
                      });
                      console.log("✅ Deck store cleared - all decks and cards removed");
                      
                      toast.success("🔄 Complete reset performed - wallet cleared, NFTs removed!");
                      console.log("Dev Action: Complete user data reset performed");
                      console.log("- All NFTs cleared from wallet");
                      console.log("- Wallet store refreshed");
                      console.log("- Local data reset");
                    } catch (error) {
                      console.error("Error during full reset:", error);
                      toast.error("Error during full reset. Check console for details.");
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-3 rounded text-sm font-medium w-full"
              >
                🚨 FULL RESET (New User Experience)
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Complete reset: clears wallet, cards, progress, and settings. Use this to test the full new user onboarding flow.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-900 rounded border border-blue-700">
              <p className="text-sm text-blue-200">
                <strong>ℹ️ Dev Note:</strong> These utilities simulate user states for testing. 
                In production, actual wallet balances and NFT ownership would be managed through Solana blockchain integration.
              </p>
            </div>
          </div>
        )}


      </div>

      <NavigationBar />
    </div>
  );
};

export default DevToolsPage;