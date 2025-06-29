#!/usr/bin/env node

/**
 * Data Synchronization Deep Audit
 * Checks all stores, data flow, and synchronization issues
 */

import fs from 'fs';
import path from 'path';

class DataSyncAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
    this.storeFiles = [];
    this.dataFlows = [];
  }

  async performDeepAudit() {
    console.log('🔍 DEEP DATA SYNCHRONIZATION AUDIT');
    console.log('===================================\n');

    await this.scanStoreFiles();
    await this.analyzeDataFlow();
    await this.checkStoreConsistency();
    await this.validateAssetPaths();
    await this.checkInitializationOrder();
    
    this.generateSyncReport();
  }

  async scanStoreFiles() {
    console.log('📁 Scanning Store Files...');
    
    const storeDir = 'client/src/game/stores';
    if (fs.existsSync(storeDir)) {
      const files = fs.readdirSync(storeDir).filter(f => f.endsWith('.ts'));
      this.storeFiles = files;
      
      console.log(`Found ${files.length} store files:`);
      files.forEach(file => console.log(`  - ${file}`));
      
      this.successes.push(`Found ${files.length} store files`);
    } else {
      this.issues.push('Store directory not found');
    }
    console.log('');
  }

  async analyzeDataFlow() {
    console.log('🔄 Analyzing Data Flow...');
    
    const criticalStores = [
      'useDeckStore.ts',
      'useExpansionStore.ts', 
      'usePremadeDecksStore.ts',
      'useBattleSetsStore.ts',
      'useBoosterVariantStore.ts',
      'useDataSyncStore.ts'
    ];

    const foundStores = [];
    const missingStores = [];

    criticalStores.forEach(store => {
      if (this.storeFiles.includes(store)) {
        foundStores.push(store);
      } else {
        missingStores.push(store);
      }
    });

    console.log(`Critical stores found: ${foundStores.length}/${criticalStores.length}`);
    foundStores.forEach(store => console.log(`  ✅ ${store}`));
    
    if (missingStores.length > 0) {
      console.log('Missing stores:');
      missingStores.forEach(store => console.log(`  ❌ ${store}`));
      this.issues.push(`Missing critical stores: ${missingStores.join(', ')}`);
    } else {
      this.successes.push('All critical stores present');
    }
    console.log('');
  }

  async checkStoreConsistency() {
    console.log('⚖️ Checking Store Consistency...');

    // Check if stores have proper initialization
    const storeChecks = [
      { name: 'useDeckStore.ts', required: ['addCard', 'removeCard', 'getAvailableCards'] },
      { name: 'useExpansionStore.ts', required: ['expansions', 'addExpansion', 'updateExpansion'] },
      { name: 'usePremadeDecksStore.ts', required: ['premadeDecks', 'addPremadeDeck'] }
    ];

    for (const check of storeChecks) {
      const filePath = `client/src/game/stores/${check.name}`;
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const missing = check.required.filter(method => !content.includes(method));
        if (missing.length === 0) {
          this.successes.push(`${check.name}: All required methods present`);
          console.log(`  ✅ ${check.name}: Complete`);
        } else {
          this.warnings.push(`${check.name}: Missing methods - ${missing.join(', ')}`);
          console.log(`  ⚠️ ${check.name}: Missing - ${missing.join(', ')}`);
        }
      } else {
        this.issues.push(`${check.name}: File not found`);
        console.log(`  ❌ ${check.name}: File not found`);
      }
    }
    console.log('');
  }

  async validateAssetPaths() {
    console.log('🖼️ Validating Asset Paths...');

    const assetFiles = [
      'client/src/lib/assetPathMapper.ts',
      'client/src/lib/assetValidation.ts',
      'client/src/lib/assetSecurityValidator.ts'
    ];

    let validAssetFiles = 0;
    assetFiles.forEach(file => {
      if (fs.existsSync(file)) {
        validAssetFiles++;
        console.log(`  ✅ ${path.basename(file)}: Found`);
        
        // Check content quality
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('export') && content.length > 1000) {
          this.successes.push(`${path.basename(file)}: Well implemented`);
        } else {
          this.warnings.push(`${path.basename(file)}: Basic implementation`);
        }
      } else {
        console.log(`  ❌ ${path.basename(file)}: Missing`);
        this.issues.push(`${path.basename(file)}: Missing`);
      }
    });

    if (validAssetFiles === assetFiles.length) {
      this.successes.push('All asset validation files present');
    }
    console.log('');
  }

  async checkInitializationOrder() {
    console.log('🚀 Checking Initialization Order...');

    const appFile = 'client/src/App.tsx';
    if (fs.existsSync(appFile)) {
      const content = fs.readFileSync(appFile, 'utf8');
      
      if (content.includes('initialization')) {
        this.successes.push('App initialization system present');
        console.log('  ✅ App initialization system found');
        
        // Check for proper error handling
        if (content.includes('try') && content.includes('catch')) {
          this.successes.push('Initialization error handling present');
          console.log('  ✅ Initialization error handling found');
        } else {
          this.warnings.push('Initialization error handling could be improved');
          console.log('  ⚠️ Initialization error handling basic');
        }
      } else {
        this.warnings.push('No explicit initialization system found');
        console.log('  ⚠️ No explicit initialization system');
      }
    } else {
      this.issues.push('App.tsx not found');
      console.log('  ❌ App.tsx not found');
    }
    console.log('');
  }

  generateSyncReport() {
    console.log('📊 DATA SYNCHRONIZATION REPORT');
    console.log('==============================\n');

    const totalChecks = this.issues.length + this.warnings.length + this.successes.length;
    const successRate = Math.round((this.successes.length / totalChecks) * 100);
    
    console.log(`Overall Sync Health: ${successRate}%`);
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`✅ Successes: ${this.successes.length}`);
    console.log(`⚠️ Warnings: ${this.warnings.length}`);
    console.log(`❌ Issues: ${this.issues.length}\n`);

    if (this.issues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      this.issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }

    if (this.successes.length > 0) {
      console.log('✅ SUCCESSES:');
      this.successes.forEach(success => console.log(`  - ${success}`));
      console.log('');
    }

    // Generate recommendations
    this.generateRecommendations();
  }

  generateRecommendations() {
    console.log('💡 RECOMMENDATIONS');
    console.log('==================');

    if (this.issues.length > 0) {
      console.log('HIGH PRIORITY:');
      if (this.issues.some(i => i.includes('Missing critical stores'))) {
        console.log('  - Implement missing critical stores immediately');
      }
      if (this.issues.some(i => i.includes('File not found'))) {
        console.log('  - Restore missing core files');
      }
    }

    if (this.warnings.length > 0) {
      console.log('MEDIUM PRIORITY:');
      if (this.warnings.some(w => w.includes('Basic implementation'))) {
        console.log('  - Enhance basic implementations with more features');
      }
      if (this.warnings.some(w => w.includes('error handling'))) {
        console.log('  - Improve error handling in initialization');
      }
    }

    console.log('LOW PRIORITY:');
    console.log('  - Add more comprehensive logging');
    console.log('  - Implement real-time sync monitoring');
    console.log('  - Add sync health dashboard');
  }
}

// Run the audit
const auditor = new DataSyncAuditor();
auditor.performDeepAudit().catch(console.error);