import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, ElementType, AvatarCard, ActionCard, RarityType } from '../game/data/cardTypes';
import { useDeckStore } from '../game/stores/useDeckStore';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

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
  const { getAvailableCards } = useDeckStore();
  const cards = getAvailableCards();

  // State management
  const [activeTab, setActiveTab] = useState<'database' | 'edit' | 'expansion' | 'conditional' | 'premade-decks'>('database');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedExpansionFilter, setSelectedExpansionFilter] = useState<string>('all');
  
  // Mock expansions
  const mockExpansions: Expansion[] = [
    { id: 'core', name: 'Core Set', description: 'Basic set', releaseDate: '2024-01-01', cardCount: 100 },
    { id: 'fire', name: 'Fire Expansion', description: 'Fire themed cards', releaseDate: '2024-06-01', cardCount: 80 },
    { id: 'water', name: 'Water Expansion', description: 'Water themed cards', releaseDate: '2024-09-01', cardCount: 75 }
  ];

  // Form data
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    type: 'avatar',
    element: 'fire',
    level: 1,
    health: 3,
    subType: '',
    art: '',
    description: '',
    expansion: 'core',
    rarity: 'Common',
    energyCost: [],
    skill1Name: '',
    skill1Effect: '',
    skill1AdditionalEffect: '',
    skill1EffectType: 'damage',
    skill1Damage: 0,
    skill1Type: 'active',
    skill1EnergyCost: [],
    skill2Name: '',
    skill2Effect: '',
    skill2AdditionalEffect: '',
    skill2EffectType: 'damage',
    skill2Damage: 0,
    skill2Type: 'active',
    skill2EnergyCost: []
  });

  // Skill effect types
  const skillEffectTypes = [
    { value: 'damage', label: 'Damage' },
    { value: 'heal', label: 'Heal' },
    { value: 'buff', label: 'Buff' },
    { value: 'debuff', label: 'Debuff' },
    { value: 'special', label: 'Special' }
  ];

  const handleNewCard = () => {
    setSelectedCard(null);
    setFormData({
      name: '',
      type: 'avatar',
      element: 'fire',
      level: 1,
      health: 3,
      subType: '',
      art: '',
      description: '',
      expansion: 'core',
      rarity: 'Common',
      energyCost: [],
      skill1Name: '',
      skill1Effect: '',
      skill1AdditionalEffect: '',
      skill1EffectType: 'damage',
      skill1Damage: 0,
      skill1Type: 'active',
      skill1EnergyCost: [],
      skill2Name: '',
      skill2Effect: '',
      skill2AdditionalEffect: '',
      skill2EffectType: 'damage',
      skill2Damage: 0,
      skill2Type: 'active',
      skill2EnergyCost: []
    });
    setActiveTab('edit');
  };

  const handleEditCard = (card: Card) => {
    setSelectedCard(card);
    setFormData({
      name: card.name,
      type: card.type,
      element: card.element,
      level: card.type === 'avatar' ? (card as AvatarCard).level : 1,
      health: card.type === 'avatar' ? (card as AvatarCard).health : 1,
      subType: (card as any).subType || '',
      art: card.art,
      description: card.description,
      expansion: (card as any).expansion || 'core',
      rarity: card.rarity || 'Common',
      energyCost: card.energyCost,
      skill1Name: card.type === 'avatar' ? (card as AvatarCard).skills[0]?.name || '' : '',
      skill1Effect: card.type === 'avatar' ? (card as AvatarCard).skills[0]?.effect || '' : '',
      skill1AdditionalEffect: card.type === 'avatar' ? (card as AvatarCard).skills[0]?.additionalEffect || '' : '',
      skill1EffectType: 'damage',
      skill1Damage: card.type === 'avatar' ? (card as AvatarCard).skills[0]?.damage || 0 : 0,
      skill1Type: card.type === 'avatar' ? (card as AvatarCard).skills[0]?.type || 'active' : 'active',
      skill1EnergyCost: card.type === 'avatar' ? (card as AvatarCard).skills[0]?.energyCost || [] : [],
      skill2Name: card.type === 'avatar' ? (card as AvatarCard).skills[1]?.name || '' : '',
      skill2Effect: card.type === 'avatar' ? (card as AvatarCard).skills[1]?.effect || '' : '',
      skill2AdditionalEffect: card.type === 'avatar' ? (card as AvatarCard).skills[1]?.additionalEffect || '' : '',
      skill2EffectType: 'damage',
      skill2Damage: card.type === 'avatar' ? (card as AvatarCard).skills[1]?.damage || 0 : 0,
      skill2Type: card.type === 'avatar' ? (card as AvatarCard).skills[1]?.type || 'active' : 'active',
      skill2EnergyCost: card.type === 'avatar' ? (card as AvatarCard).skills[1]?.energyCost || [] : []
    });
    setActiveTab('edit');
  };

  const handleDeleteCard = (card: Card) => {
    toast.success(`${card.name} deleted`);
  };

  const handleSaveCard = () => {
    if (!formData.name.trim()) {
      toast.error('Card name is required');
      return;
    }
    toast.success(selectedCard ? 'Card updated' : 'Card created');
    setActiveTab('database');
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-600 text-white';
      case 'Uncommon': return 'bg-green-600 text-white';
      case 'Rare': return 'bg-blue-600 text-white';
      case 'Super Rare': return 'bg-purple-600 text-white';
      case 'Mythic': return 'bg-orange-600 text-black';
      default: return 'bg-gray-600 text-white';
    }
  };

  const addEnergyToCost = (energyType: ElementType, costType: 'main' | 'skill1' | 'skill2') => {
    if (costType === 'main') {
      setFormData(prev => ({ ...prev, energyCost: [...prev.energyCost, energyType] }));
    } else if (costType === 'skill1') {
      setFormData(prev => ({ ...prev, skill1EnergyCost: [...prev.skill1EnergyCost, energyType] }));
    } else {
      setFormData(prev => ({ ...prev, skill2EnergyCost: [...prev.skill2EnergyCost, energyType] }));
    }
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
        </div>
        
        {/* Database Tab */}
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

        {/* Edit Card Tab */}
        {activeTab === 'edit' && (
          <div className="bg-gray-800 rounded-lg p-2">
            <h3 className="text-md font-medium mb-2">
              {selectedCard ? 'Edit Card' : 'Create New Card'}
            </h3>
            
            {/* Scrollable Content */}
            <div className="max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Left Column - Basic Info */}
                <div className="space-y-2">
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
                  <div>
                    <label className="block text-xs font-medium mb-1">Element</label>
                    <select
                      value={formData.element}
                      onChange={(e) => setFormData(prev => ({ ...prev, element: e.target.value as ElementType }))}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    >
                      <option value="fire">Fire</option>
                      <option value="water">Water</option>
                      <option value="ground">Ground</option>
                      <option value="air">Air</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Rarity</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData(prev => ({ ...prev, rarity: e.target.value as RarityType }))}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    >
                      <option value="Common">Common</option>
                      <option value="Uncommon">Uncommon</option>
                      <option value="Rare">Rare</option>
                      <option value="Super Rare">Super Rare</option>
                      <option value="Mythic">Mythic</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Skills */}
                <div className="space-y-3">
                  {/* Skill 1 */}
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
                      <div>
                        <label className="block text-sm font-medium mb-1">Effect Description</label>
                        <textarea
                          value={formData.skill1Effect}
                          onChange={(e) => setFormData(prev => ({ ...prev, skill1Effect: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          rows={2}
                          placeholder="Describe the skill effect..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skill 2 */}
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
                      <div>
                        <label className="block text-sm font-medium mb-1">Effect Description</label>
                        <textarea
                          value={formData.skill2Effect}
                          onChange={(e) => setFormData(prev => ({ ...prev, skill2Effect: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          rows={2}
                          placeholder="Describe the skill effect..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
          </div>
        )}

        {/* Expansions Tab */}
        {activeTab === 'expansion' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Expansion Database</h2>
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
                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs">
                      Edit
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premade Decks Tab */}
        {activeTab === 'premade-decks' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Premade Decks Configuration</h3>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">
                + New Deck Template
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[600px] overflow-y-auto">
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
                          placeholder="Enter deck name..."
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Expansion</label>
                        <select className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded">
                          {mockExpansions.map(expansion => (
                            <option key={expansion.id} value={expansion.id}>
                              {expansion.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Tribe</label>
                        <select className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded">
                          <option value="kobar">Kobar</option>
                          <option value="borah">Borah</option>
                          <option value="kuhaka">Kuhaka</option>
                          <option value="kujana">Kujana</option>
                          <option value="kuku">Kuku</option>
                        </select>
                      </div>
                    </div>

                    {/* Deck Configuration */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          placeholder="Describe the deck strategy..."
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">
                      Create Deck Template
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm">
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Existing Templates */}
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="font-medium mb-3">Existing Deck Templates</h4>
                  <div className="bg-gray-600 p-3 rounded border border-gray-500 border-dashed opacity-75">
                    <div className="text-center text-gray-400 py-6">
                      <p className="text-sm">Click "New Deck Template" to add premade decks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default DevToolsPage;