import React, { useState } from 'react';
import { Card } from '../game/data/cardTypes';
import { NavigationBar } from '../components/NavigationBar';
import BackButton from '../components/BackButton';
import { toast } from 'sonner';

const DevToolsPage: React.FC = () => {
  const [cards] = useState<Card[]>([]);

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Developer Tools</h1>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Card Database</h2>
          <p className="text-gray-400">Showing {cards.length} cards</p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-8">
                No cards in database
              </div>
            )}
          </div>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default DevToolsPage;