// Comprehensive store testing script
console.log('=== COMPREHENSIVE STORE TEST ===');

// Test 1: Check if stores are accessible
try {
  console.log('✓ Testing store accessibility...');
  
  // This will be run in browser console to test store states
  const tests = [
    'useExpansionStore.getState().expansions.length',
    'useDeckStore.getState().ownedCards.length', 
    'usePremadeDecksStore.getState().premadeDecks.length',
    'useBattleSetsStore.getState().battleSets.length',
    'usePackTierStore.getState().packTiers.length',
    'useWalletStore.getState().isConnected'
  ];
  
  console.log('Store tests ready for browser console execution');
  console.log('Run these commands in browser dev tools:');
  tests.forEach(test => console.log(`  ${test}`));
  
} catch (error) {
  console.error('Store test setup failed:', error);
}

console.log('=== END STORE TEST ===');