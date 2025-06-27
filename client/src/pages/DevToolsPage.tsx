import React, { useState } from 'react';
import { useDeckStore } from '../game/stores/useDeckStore';
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

interface Expansion {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  cardCount: number;
}

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
  
  const cards = uniqueCards;
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'database' | 'edit' | 'expansion' | 'conditional'>('database');
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null);
  const [isEditingExpansion, setIsEditingExpansion] = useState(false);
  const [selectedExpansionFilter, setSelectedExpansionFilter] = useState<string>('all');
  
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
    cardCount: 0
  });

  const mockExpansions: Expansion[] = [
    {
      id: 'core-set',
      name: 'Core Set',
      description: 'The original Book of Spektrum card collection',
      releaseDate: '2024-01-15',
      cardCount: 150
    },
    {
      id: 'elemental-fury',
      name: 'Elemental Fury',
      description: 'Enhanced elemental powers and new avatar abilities',
      releaseDate: '2024-06-01',
      cardCount: 100
    },
    {
      id: 'shadows-awakening',
      name: 'Shadows Awakening',
      description: 'Mysterious new cards with powerful effects',
      releaseDate: '2024-09-15',
      cardCount: 80
    }
  ];

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
      toast.success(`${card.name} deleted`);
    }
  };

  const handleSaveCard = () => {
    if (!formData.name.trim()) {
      toast.error('Card name is required');
      return;
    }

    toast.success(selectedCard ? 'Card updated' : 'Card created');
    setIsEditing(false);
    setActiveTab('database');
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
      cardCount: 0
    });
  };

  const handleEditExpansion = (expansion: Expansion) => {
    setSelectedExpansion(expansion);
    setIsEditingExpansion(true);
    setExpansionForm({
      name: expansion.name,
      description: expansion.description,
      releaseDate: expansion.releaseDate,
      cardCount: expansion.cardCount
    });
  };

  const handleSaveExpansion = () => {
    if (!expansionForm.name.trim()) {
      toast.error('Expansion name is required');
      return;
    }
    toast.success(selectedExpansion ? 'Expansion updated' : 'Expansion created');
    setIsEditingExpansion(false);
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
                {mockExpansions.map(expansion => (
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
          <div className="bg-gray-800 rounded-lg p-2">
            <h3 className="text-md font-medium mb-2">
              {selectedCard ? 'Edit Card' : 'Create New Card'}
            </h3>
            
            {/* Compact Layout */}
            <div className="space-y-3">
              {/* Top Row - Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                      {mockExpansions.map(expansion => (
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
              </div>
              </div>

              {/* Skills Section - Full Width */}
              {formData.type === 'avatar' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Skill 1 - Takes 1 column */}
                  <div className="bg-gray-700 p-2 rounded">
                    <h3 className="font-medium mb-2 text-sm">Skill 1</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Name</label>
                          <input
                            type="text"
                            value={formData.skill1Name}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1Name: e.target.value }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Effect Type</label>
                          <select
                            value={formData.skill1EffectType}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1EffectType: e.target.value }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                          >
                            {skillEffectTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Damage</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.skill1Damage}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1Damage: parseInt(e.target.value) || 0 }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Type</label>
                          <select
                            value={formData.skill1Type}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill1Type: e.target.value as 'active' | 'passive' }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
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

                  {/* Skill 2 - Takes 2 columns (wider like expansions) */}
                  <div className="bg-gray-700 p-2 rounded lg:col-span-2">
                    <h3 className="font-medium mb-2 text-sm">Skill 2</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Name</label>
                          <input
                            type="text"
                            value={formData.skill2Name}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2Name: e.target.value }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Effect Type</label>
                          <select
                            value={formData.skill2EffectType}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2EffectType: e.target.value }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                          >
                            {skillEffectTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Damage</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.skill2Damage}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2Damage: parseInt(e.target.value) || 0 }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Type</label>
                          <select
                            value={formData.skill2Type}
                            onChange={(e) => setFormData(prev => ({ ...prev, skill2Type: e.target.value as 'active' | 'passive' }))}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
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
                {mockExpansions.map(expansion => (
                  <div key={expansion.id} className="bg-gray-700 p-4 rounded flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{expansion.name}</h3>
                      <p className="text-sm text-gray-300 mb-2">{expansion.description}</p>
                      <div className="text-xs text-gray-400">
                        Released: {expansion.releaseDate} | {expansion.cardCount} cards
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
                        onClick={() => toast.success(`${expansion.name} deleted`)}
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


      </div>

      <NavigationBar />
    </div>
  );
};

export default DevToolsPage;