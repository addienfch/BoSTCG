import React, { useState, useEffect } from 'react';
import { Card, ElementType, RarityType } from '../game/data/cardTypes';
import NavigationBar from '../components/NavigationBar';
import BackButton from '../components/BackButton';
import { toast } from 'sonner';
import { useDeckStore } from '../game/stores/useDeckStore';

const DevToolsPage: React.FC = () => {
  const { cards } = useDeckStore();
  const [activeTab, setActiveTab] = useState<'database' | 'create'>('database');
  const [filterElement, setFilterElement] = useState<ElementType | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredCards = cards.filter(card => {
    const elementMatch = filterElement === 'all' || card.element === filterElement;
    const typeMatch = filterType === 'all' || card.type === filterType;
    return elementMatch && typeMatch;
  });

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
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              activeTab === 'create' 
                ? 'bg-spektrum-orange text-spektrum-dark' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Card
          </button>
        </div>

        {activeTab === 'database' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Card Database</h2>
              <p className="text-gray-400">Showing {filteredCards.length} of {cards.length} cards</p>
            </div>
            
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <select
                value={filterElement}
                onChange={(e) => setFilterElement(e.target.value as ElementType | 'all')}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                <option value="all">All Elements</option>
                <option value="fire">Fire</option>
                <option value="water">Water</option>
                <option value="ground">Ground</option>
                <option value="air">Air</option>
                <option value="neutral">Neutral</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                <option value="all">All Types</option>
                <option value="avatar">Avatar</option>
                <option value="spell">Spell</option>
                <option value="quickSpell">Quick Spell</option>
                <option value="ritualArmor">Ritual Armor</option>
                <option value="field">Field</option>
                <option value="equipment">Equipment</option>
                <option value="item">Item</option>
              </select>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredCards.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-8">
                  {cards.length === 0 ? 'No cards in database' : 'No cards match the current filters'}
                </div>
              )}
              
              {filteredCards.map((card) => (
                <div key={card.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{card.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      card.element === 'fire' ? 'bg-red-600' :
                      card.element === 'water' ? 'bg-blue-600' :
                      card.element === 'ground' ? 'bg-yellow-600' :
                      card.element === 'air' ? 'bg-purple-600' :
                      'bg-gray-600'
                    }`}>
                      {card.element}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-300 mb-2">
                    <div>Type: {card.type}</div>
                    {card.level && <div>Level: {card.level}</div>}
                    {card.health && <div>Health: {card.health}</div>}
                    {card.rarity && <div>Rarity: {card.rarity}</div>}
                  </div>
                  
                  {card.description && (
                    <p className="text-xs text-gray-400 truncate">{card.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Create New Card</h2>
            <p className="text-gray-400">Card creation functionality coming soon...</p>
          </div>
        )}
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default DevToolsPage;