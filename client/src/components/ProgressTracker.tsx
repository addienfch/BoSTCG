import React, { useState, useEffect } from 'react';
import { Card } from '../game/data/cardTypes';
import { useDeckStore } from '../game/stores/useDeckStore';
import { cardNftService } from '../blockchain/solana/cardNftService';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ProgressTrackerProps {
  className?: string;
}

interface PlayerProgress {
  walletConnected: boolean;
  totalCards: number;
  uniqueCards: number;
  completedDecks: number;
  mintedNFTs: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ className = '' }) => {
  const { ownedCards, decks } = useDeckStore();
  const [progress, setProgress] = useState<PlayerProgress>({
    walletConnected: false,
    totalCards: 0,
    uniqueCards: 0,
    completedDecks: 0,
    mintedNFTs: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 100
  });

  useEffect(() => {
    const updateProgress = async () => {
      try {
        // Check wallet status
        const walletStatus = await cardNftService.getWalletStatus();
        
        // Calculate card stats
        const totalCards = ownedCards.length;
        const uniqueCardNames = new Set(ownedCards.map(card => card.name));
        const uniqueCards = uniqueCardNames.size;
        
        // Calculate completed decks (minimum 40 cards)
        const completedDecks = decks.filter((deck: any) => deck.cards.length >= 40).length;
        
        // Mock NFT count (in real implementation, this would query the blockchain)
        const mintedNFTs = walletStatus.connected ? Math.floor(totalCards * 0.3) : 0;
        
        // Calculate level and experience based on activities
        const baseExp = totalCards * 2 + uniqueCards * 5 + completedDecks * 20 + mintedNFTs * 10;
        const level = Math.floor(baseExp / 100) + 1;
        const experience = baseExp % 100;
        const nextLevelExp = 100;

        setProgress({
          walletConnected: walletStatus.connected,
          totalCards,
          uniqueCards,
          completedDecks,
          mintedNFTs,
          level,
          experience,
          nextLevelExp
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    };

    updateProgress();
    // Update progress every 30 seconds
    const interval = setInterval(updateProgress, 30000);
    return () => clearInterval(interval);
  }, [ownedCards, savedDecks]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-spektrum-orange';
  };

  const achievements = [
    {
      name: 'Collector',
      description: 'Own 50+ cards',
      achieved: progress.totalCards >= 50,
      progress: Math.min(progress.totalCards / 50 * 100, 100)
    },
    {
      name: 'Strategist',
      description: 'Build 3+ decks',
      achieved: progress.completedDecks >= 3,
      progress: Math.min(progress.completedDecks / 3 * 100, 100)
    },
    {
      name: 'NFT Master',
      description: 'Mint 10+ NFTs',
      achieved: progress.mintedNFTs >= 10,
      progress: Math.min(progress.mintedNFTs / 10 * 100, 100)
    },
    {
      name: 'Variety Player',
      description: 'Collect 25+ unique cards',
      achieved: progress.uniqueCards >= 25,
      progress: Math.min(progress.uniqueCards / 25 * 100, 100)
    }
  ];

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-600 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Your Progress</h3>
        <div className="flex items-center space-x-2">
          <Badge 
            className={`text-xs ${progress.walletConnected ? 'bg-green-500' : 'bg-gray-500'}`}
          >
            {progress.walletConnected ? '🟢 Wallet Connected' : '🔴 Wallet Disconnected'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Level {progress.level}
          </Badge>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Level {progress.level}</span>
          <span>{progress.experience}/{progress.nextLevelExp} XP</span>
        </div>
        <Progress 
          value={progress.experience} 
          max={progress.nextLevelExp}
          className="h-2"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-spektrum-orange">{progress.totalCards}</div>
          <div className="text-xs text-gray-300">Total Cards</div>
        </div>
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{progress.uniqueCards}</div>
          <div className="text-xs text-gray-300">Unique Cards</div>
        </div>
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{progress.completedDecks}</div>
          <div className="text-xs text-gray-300">Complete Decks</div>
        </div>
        <div className="bg-gray-700 rounded p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{progress.mintedNFTs}</div>
          <div className="text-xs text-gray-300">Minted NFTs</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Achievements</h4>
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-gray-700 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white flex items-center">
                  {achievement.achieved ? '✅' : '⏳'} {achievement.name}
                </span>
                <span className="text-xs text-gray-300">
                  {achievement.progress.toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-1">{achievement.description}</div>
              <Progress 
                value={achievement.progress} 
                max={100}
                className="h-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;