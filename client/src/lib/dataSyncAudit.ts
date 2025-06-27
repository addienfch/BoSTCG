import { useDeckStore } from '../game/stores/useDeckStore';
import { useExpansionStore } from '../game/stores/useExpansionStore';
import { usePremadeDecksStore } from '../game/stores/usePremadeDecksStore';
import { useBoosterVariantStore } from '../game/stores/useBoosterVariantStore';
import { useBattleSetsStore } from '../game/stores/useBattleSetsStore';
import { cardNftService } from '../blockchain/solana/cardNftService';

export interface DataSyncReport {
  status: 'SYNCED' | 'PARTIAL' | 'BROKEN' | 'EMPTY';
  count: number;
  issues: string[];
  source: string;
}

export interface ComprehensiveDataAudit {
  cards: DataSyncReport;
  decks: DataSyncReport;
  expansions: DataSyncReport;
  premadeDecks: DataSyncReport;
  boosterVariants: DataSyncReport;
  battleSets: DataSyncReport;
  walletSync: DataSyncReport;
  devToolsSync: DataSyncReport;
  overall: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
}

/**
 * Comprehensive data synchronization audit
 */
export class DataSyncAuditor {
  async performFullAudit(): Promise<ComprehensiveDataAudit> {
    const audit: ComprehensiveDataAudit = {
      cards: await this.auditCards(),
      decks: await this.auditDecks(),
      expansions: await this.auditExpansions(),
      premadeDecks: await this.auditPremadeDecks(),
      boosterVariants: await this.auditBoosterVariants(),
      battleSets: await this.auditBattleSets(),
      walletSync: await this.auditWalletSync(),
      devToolsSync: await this.auditDevToolsSync(),
      overall: 'HEALTHY'
    };

    // Determine overall health
    const reports = [audit.cards, audit.decks, audit.expansions, audit.premadeDecks, 
                    audit.boosterVariants, audit.battleSets, audit.walletSync, audit.devToolsSync];
    
    if (reports.some(r => r.status === 'BROKEN')) {
      audit.overall = 'CRITICAL';
    } else if (reports.some(r => r.status === 'PARTIAL' || r.status === 'EMPTY')) {
      audit.overall = 'NEEDS_ATTENTION';
    }

    return audit;
  }

  private async auditCards(): Promise<DataSyncReport> {
    try {
      const deckStore = useDeckStore.getState();
      const baseCards = deckStore.getAvailableCards();
      const cnftCards = await deckStore.getAvailableCardsWithCNFTs();
      
      const issues: string[] = [];
      
      if (baseCards.length === 0) {
        issues.push('No base cards loaded');
      }
      
      if (cnftCards.length < baseCards.length) {
        issues.push('cNFT sync incomplete');
      }

      // Check for duplicate cards by name
      const cardNames = new Set();
      const duplicates = cnftCards.filter(card => {
        if (cardNames.has(card.name)) return true;
        cardNames.add(card.name);
        return false;
      });

      if (duplicates.length > 0) {
        issues.push(`${duplicates.length} duplicate cards found`);
      }

      return {
        status: issues.length === 0 ? 'SYNCED' : issues.length < 3 ? 'PARTIAL' : 'BROKEN',
        count: cnftCards.length,
        issues,
        source: 'useDeckStore + cNFT service'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'useDeckStore'
      };
    }
  }

  private async auditDecks(): Promise<DataSyncReport> {
    try {
      const deckStore = useDeckStore.getState();
      const decks = deckStore.decks;
      const activeDeck = deckStore.activeDeckId;
      
      const issues: string[] = [];
      
      if (decks.length === 0) {
        issues.push('No user decks created');
      }

      if (activeDeck && !decks.find(d => d.id === activeDeck)) {
        issues.push('Active deck ID references non-existent deck');
      }

      // Check deck validity
      const invalidDecks = decks.filter(deck => 
        deck.cards.length < 40 || deck.cards.length > 60
      );

      if (invalidDecks.length > 0) {
        issues.push(`${invalidDecks.length} invalid deck sizes`);
      }

      return {
        status: issues.length === 0 ? 'SYNCED' : issues.length < 3 ? 'PARTIAL' : 'BROKEN',
        count: decks.length,
        issues,
        source: 'useDeckStore'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'useDeckStore'
      };
    }
  }

  private async auditExpansions(): Promise<DataSyncReport> {
    try {
      const expansionStore = useExpansionStore.getState();
      const expansions = expansionStore.expansions;
      
      const issues: string[] = [];
      
      if (expansions.length === 0) {
        issues.push('No expansions loaded');
      }

      // Check for required expansions
      const requiredExpansions = ['Kobar', 'Kuhaka', 'Spektrum Core'];
      const missing = requiredExpansions.filter(name => 
        !expansions.find(exp => exp.name === name)
      );

      if (missing.length > 0) {
        issues.push(`Missing core expansions: ${missing.join(', ')}`);
      }

      return {
        status: issues.length === 0 ? 'SYNCED' : issues.length < 2 ? 'PARTIAL' : 'BROKEN',
        count: expansions.length,
        issues,
        source: 'useExpansionStore'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'useExpansionStore'
      };
    }
  }

  private async auditPremadeDecks(): Promise<DataSyncReport> {
    try {
      const premadeStore = usePremadeDecksStore.getState();
      const premadeDecks = premadeStore.premadeDecks;
      
      const issues: string[] = [];
      
      if (premadeDecks.length === 0) {
        issues.push('No premade decks available');
      }

      // Check deck completeness
      const incompleteDecks = premadeDecks.filter(deck => 
        !deck.cardDistribution || Object.keys(deck.cardDistribution).length === 0
      );

      if (incompleteDecks.length > 0) {
        issues.push(`${incompleteDecks.length} incomplete premade decks`);
      }

      return {
        status: issues.length === 0 ? 'SYNCED' : issues.length < 2 ? 'PARTIAL' : 'BROKEN',
        count: premadeDecks.length,
        issues,
        source: 'usePremadeDecksStore'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'usePremadeDecksStore'
      };
    }
  }

  private async auditBoosterVariants(): Promise<DataSyncReport> {
    try {
      const variantStore = useBoosterVariantStore.getState();
      const variants = variantStore.variants;
      
      const issues: string[] = [];
      
      if (variants.length === 0) {
        issues.push('No booster variants loaded');
      }

      // Check for required variants
      const requiredTypes = ['common', 'rare', 'legendary'];
      const missing = requiredTypes.filter(type => 
        !variants.find(v => v.type === type)
      );

      if (missing.length > 0) {
        issues.push(`Missing variant types: ${missing.join(', ')}`);
      }

      return {
        status: issues.length === 0 ? 'SYNCED' : issues.length < 2 ? 'PARTIAL' : 'BROKEN',
        count: variants.length,
        issues,
        source: 'useBoosterVariantStore'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'useBoosterVariantStore'
      };
    }
  }

  private async auditBattleSets(): Promise<DataSyncReport> {
    try {
      const battleSetsStore = useBattleSetsStore.getState();
      const battleSets = battleSetsStore.battleSets;
      
      const issues: string[] = [];
      
      if (battleSets.length === 0) {
        issues.push('No battle sets available');
      }

      if (battleSets.length < 10) {
        issues.push('Insufficient battle set variety');
      }

      return {
        status: issues.length === 0 ? 'SYNCED' : 'PARTIAL',
        count: battleSets.length,
        issues,
        source: 'useBattleSetsStore'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'useBattleSetsStore'
      };
    }
  }

  private async auditWalletSync(): Promise<DataSyncReport> {
    try {
      const isConnected = cardNftService.isWalletConnected();
      const ownedCards = cardNftService.getOwnedCardIds();
      
      const issues: string[] = [];
      
      if (!isConnected) {
        issues.push('Wallet not connected');
      }

      if (isConnected && ownedCards.length === 0) {
        issues.push('No owned cNFTs found');
      }

      return {
        status: isConnected ? (ownedCards.length > 0 ? 'SYNCED' : 'EMPTY') : 'BROKEN',
        count: ownedCards.length,
        issues,
        source: 'cardNftService'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'cardNftService'
      };
    }
  }

  private async auditDevToolsSync(): Promise<DataSyncReport> {
    try {
      const deckStore = useDeckStore.getState();
      const expansionStore = useExpansionStore.getState();
      const premadeStore = usePremadeDecksStore.getState();
      
      const issues: string[] = [];
      
      // Check if dev-tools can access all stores
      const hasCards = deckStore.getAvailableCards().length > 0;
      const hasExpansions = expansionStore.expansions.length > 0;
      const hasPremade = premadeStore.premadeDecks.length > 0;
      
      if (!hasCards) issues.push('Dev-tools cannot access cards');
      if (!hasExpansions) issues.push('Dev-tools cannot access expansions');
      if (!hasPremade) issues.push('Dev-tools cannot access premade decks');

      return {
        status: issues.length === 0 ? 'SYNCED' : issues.length < 2 ? 'PARTIAL' : 'BROKEN',
        count: hasCards && hasExpansions && hasPremade ? 3 : issues.length,
        issues,
        source: 'Cross-store integration'
      };
    } catch (error) {
      return {
        status: 'BROKEN',
        count: 0,
        issues: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: 'Dev-tools integration'
      };
    }
  }

  generateReport(audit: ComprehensiveDataAudit): string {
    let report = `COMPREHENSIVE DATA SYNCHRONIZATION AUDIT\n`;
    report += `=========================================\n`;
    report += `Overall Status: ${audit.overall}\n\n`;

    const sections = [
      { name: 'Cards System', data: audit.cards },
      { name: 'User Decks', data: audit.decks },
      { name: 'Expansions', data: audit.expansions },
      { name: 'Premade Decks', data: audit.premadeDecks },
      { name: 'Booster Variants', data: audit.boosterVariants },
      { name: 'Battle Sets', data: audit.battleSets },
      { name: 'Wallet Sync', data: audit.walletSync },
      { name: 'Dev-Tools Sync', data: audit.devToolsSync }
    ];

    sections.forEach(section => {
      const statusIcon = section.data.status === 'SYNCED' ? '✅' : 
                        section.data.status === 'PARTIAL' ? '⚠️' : 
                        section.data.status === 'EMPTY' ? '📭' : '❌';
      
      report += `${statusIcon} ${section.name}: ${section.data.status}\n`;
      report += `   Count: ${section.data.count}\n`;
      report += `   Source: ${section.data.source}\n`;
      
      if (section.data.issues.length > 0) {
        report += `   Issues:\n`;
        section.data.issues.forEach(issue => {
          report += `     - ${issue}\n`;
        });
      }
      report += `\n`;
    });

    return report;
  }
}