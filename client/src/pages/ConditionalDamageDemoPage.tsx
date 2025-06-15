import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { conditionalDamageCards, getConditionalCardsByType } from '../game/data/conditionalDamageCards';
import { calculateEnhancedDamage } from '../game/utils/enhancedDamageCalculator';
import { AvatarCard } from '../game/data/cardTypes';
import { toast } from 'sonner';

const ConditionalDamageDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<AvatarCard | null>(null);
  const [gameState, setGameState] = useState({
    playerActiveAvatar: null as AvatarCard | null,
    opponentActiveAvatar: null as AvatarCard | null,
    playerHand: [] as any[],
    playerGraveyard: [] as any[],
    turn: 1
  });
  const [testResults, setTestResults] = useState<Array<{
    condition: string;
    baseDamage: number;
    enhancedDamage: number;
    triggered: boolean;
  }>>([]);

  const testScenarios = [
    {
      name: 'Discard Trigger',
      description: 'Player discards a card to trigger enhanced damage',
      setup: () => {
        const card = getConditionalCardsByType('discard')[0];
        setGameState(prev => ({
          ...prev,
          playerActiveAvatar: card,
          playerGraveyard: [{ id: 'discarded-1', name: 'Test Card' }]
        }));
        return card;
      }
    },
    {
      name: 'Opponent Counter',
      description: 'Opponent has bleed counter for bonus damage',
      setup: () => {
        const card = getConditionalCardsByType('counter')[0];
        const opponent = {
          ...card,
          id: 'opponent-avatar',
          counters: { bleed: 2, damage: 0, shield: 0, burn: 0, freeze: 0, poison: 0, stun: 0 }
        };
        setGameState(prev => ({
          ...prev,
          playerActiveAvatar: card,
          opponentActiveAvatar: opponent
        }));
        return card;
      }
    },
    {
      name: 'Type Advantage',
      description: 'Opponent has fire type for water attack bonus',
      setup: () => {
        const card = getConditionalCardsByType('type')[0];
        const opponent = {
          ...card,
          id: 'opponent-avatar',
          element: 'fire' as const,
          type: 'fire'
        };
        setGameState(prev => ({
          ...prev,
          playerActiveAvatar: card,
          opponentActiveAvatar: opponent
        }));
        return card;
      }
    },
    {
      name: 'Equipment Bonus',
      description: 'Avatar has equipment attached for damage boost',
      setup: () => {
        const card = getConditionalCardsByType('equipment')[0];
        const cardWithEquipment = {
          ...card,
          attachedEquipment: [{ id: 'sword-1', name: 'Iron Sword', type: 'equipment' as const }]
        };
        setGameState(prev => ({
          ...prev,
          playerActiveAvatar: cardWithEquipment
        }));
        return cardWithEquipment;
      }
    },
    {
      name: 'Passive Boost',
      description: 'Active avatar provides damage bonus to other cards',
      setup: () => {
        const card = getConditionalCardsByType('passive')[0];
        setGameState(prev => ({
          ...prev,
          playerActiveAvatar: card
        }));
        return card;
      }
    }
  ];

  const runTest = (scenario: any) => {
    const card = scenario.setup();
    if (!card) return;

    setSelectedCard(card);
    
    // Test each skill
    const results: any[] = [];
    
    [card.skill1, card.skill2].forEach((skill, index) => {
      if (!skill) return;
      
      const baseDamage = skill.damage;
      const enhancedDamage = calculateEnhancedDamage(card, skill, baseDamage, gameState);
      const triggered = enhancedDamage !== baseDamage;
      
      results.push({
        condition: `${card.name} - ${skill.name}`,
        baseDamage,
        enhancedDamage,
        triggered
      });
    });
    
    setTestResults(results);
    
    if (results.some(r => r.triggered)) {
      toast.success(`Conditional damage triggered! ${scenario.name} working correctly.`);
    } else {
      toast.info(`No conditions met for ${scenario.name}. Check setup requirements.`);
    }
  };

  const resetTest = () => {
    setSelectedCard(null);
    setTestResults([]);
    setGameState({
      playerActiveAvatar: null,
      opponentActiveAvatar: null,
      playerHand: [],
      playerGraveyard: [],
      turn: 1
    });
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light p-4">
      <BackButton to="/dev-tools" />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Conditional Damage System Demo
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Scenarios */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Scenarios</h2>
            
            <div className="space-y-3">
              {testScenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-4">
                  <h3 className="font-bold text-spektrum-orange">{scenario.name}</h3>
                  <p className="text-sm text-gray-300 mb-3">{scenario.description}</p>
                  <button
                    onClick={() => runTest(scenario)}
                    className="bg-spektrum-orange text-spektrum-dark px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors"
                  >
                    Run Test
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={resetTest}
              className="w-full mt-4 bg-gray-600 text-white px-4 py-2 rounded font-medium hover:bg-gray-700 transition-colors"
            >
              Reset All Tests
            </button>
          </div>
          
          {/* Results Display */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            
            {selectedCard ? (
              <div className="space-y-4">
                <div className="border border-gray-600 rounded-lg p-4">
                  <h3 className="font-bold text-spektrum-orange">{selectedCard.name}</h3>
                  <p className="text-sm text-gray-300">Element: {selectedCard.element}</p>
                  <p className="text-sm text-gray-300">Type: {selectedCard.subType}</p>
                  <p className="text-sm text-gray-300">Health: {selectedCard.health}</p>
                </div>
                
                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold">Damage Calculations:</h4>
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border ${
                          result.triggered 
                            ? 'border-green-500 bg-green-900/20' 
                            : 'border-gray-600 bg-gray-900/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{result.condition}</span>
                          <span className={result.triggered ? 'text-green-400' : 'text-gray-400'}>
                            {result.baseDamage} → {result.enhancedDamage}
                          </span>
                        </div>
                        {result.triggered && (
                          <p className="text-xs text-green-400 mt-1">
                            ✓ Condition triggered! +{result.enhancedDamage - result.baseDamage} bonus damage
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Run a test scenario to see results
              </p>
            )}
          </div>
        </div>
        
        {/* Example Cards Display */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Example Conditional Damage Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conditionalDamageCards.map((card, index) => (
              <div key={index} className="border border-gray-600 rounded-lg p-4">
                <h3 className="font-bold text-spektrum-orange">{card.name}</h3>
                <p className="text-sm text-gray-300 mb-2">{card.element} • {card.subType}</p>
                
                <div className="space-y-2">
                  <div className="bg-gray-900 p-2 rounded">
                    <p className="text-xs font-medium">{card.skill1.name}</p>
                    <p className="text-xs text-gray-400">{card.skill1.effect}</p>
                  </div>
                  {card.skill2 && (
                    <div className="bg-gray-900 p-2 rounded">
                      <p className="text-xs font-medium">{card.skill2.name}</p>
                      <p className="text-xs text-gray-400">{card.skill2.effect}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Documentation */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Conditional Damage Mechanics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-spektrum-orange mb-2">Conditional Triggers</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Discard Trigger:</strong> "If the player discard a card, then this attack damage become X"</li>
                <li>• <strong>Opponent Counter:</strong> "If the opponent active avatar has -bleed counter- this attack damage become X"</li>
                <li>• <strong>Type Matching:</strong> "If the opponent active avatar has Y type this attack damage become X"</li>
                <li>• <strong>Subtype Matching:</strong> "If the opponent active avatar has Y subtype this attack damage become X"</li>
                <li>• <strong>Equipment Attached:</strong> "If this card has equipment card attached, this attack damage become X"</li>
                <li>• <strong>Self Counter:</strong> "If this card has bleed counter, then this attack damage get +X"</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-spektrum-orange mb-2">Passive Effects</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Avatar Type Boost:</strong> "If your active avatar has Y type, that cards attack damage get +X"</li>
                <li>• <strong>Avatar Subtype Boost:</strong> "If your active avatar has Y subtype that cards attack damage get +X"</li>
                <li>• Passive effects apply to all qualifying attacks</li>
                <li>• Multiple passive effects can stack</li>
                <li>• Passive effects are checked before conditional triggers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionalDamageDemoPage;