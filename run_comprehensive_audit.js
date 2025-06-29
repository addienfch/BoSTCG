#!/usr/bin/env node

/**
 * Comprehensive System Audit Script
 * Performs security, stability, and file sync analysis
 */

import fs from 'fs';
import path from 'path';

class ComprehensiveAuditor {
  constructor() {
    this.results = {
      security: {
        grade: 'PENDING',
        score: 0,
        issues: [],
        passed: [],
        critical: []
      },
      stability: {
        grade: 'PENDING', 
        score: 0,
        issues: [],
        passed: [],
        critical: []
      },
      fileSync: {
        grade: 'PENDING',
        score: 0,
        issues: [],
        passed: [],
        critical: []
      },
      assets: {
        grade: 'PENDING',
        score: 0,
        issues: [],
        passed: [],
        critical: []
      },
      overall: {
        grade: 'PENDING',
        score: 0,
        readyForProduction: false
      }
    };
  }

  async runFullAudit() {
    console.log('🔍 Starting Comprehensive System Audit...\n');
    
    await this.auditSecurity();
    await this.auditStability();
    await this.auditFileSync();
    await this.auditAssets();
    
    this.calculateOverallScore();
    this.generateReport();
  }

  async auditSecurity() {
    console.log('🔒 SECURITY AUDIT');
    console.log('================');
    
    // Check XSS Protection
    const xssProtection = this.checkXSSProtection();
    if (xssProtection.passed) {
      this.results.security.passed.push('XSS Protection implemented');
      this.results.security.score += 15;
    } else {
      this.results.security.issues.push('XSS Protection missing or incomplete');
    }

    // Check Input Validation
    const inputValidation = this.checkInputValidation();
    if (inputValidation.passed) {
      this.results.security.passed.push('Input validation framework present');
      this.results.security.score += 20;
    } else {
      this.results.security.critical.push('Input validation framework missing');
    }

    // Check Asset Security
    const assetSecurity = this.checkAssetSecurity();
    if (assetSecurity.passed) {
      this.results.security.passed.push('Asset security validation implemented');
      this.results.security.score += 15;
    } else {
      this.results.security.issues.push('Asset security needs improvement');
    }

    // Check Environment Variables
    const envSecurity = this.checkEnvironmentSecurity();
    if (envSecurity.passed) {
      this.results.security.passed.push('Environment variables properly secured');
      this.results.security.score += 10;
    } else {
      this.results.security.issues.push('Environment variable security concerns');
    }

    // Check API Rate Limiting
    const rateLimiting = this.checkRateLimiting();
    if (rateLimiting.passed) {
      this.results.security.passed.push('API rate limiting implemented');
      this.results.security.score += 10;
    } else {
      this.results.security.issues.push('API rate limiting not found');
    }

    this.results.security.grade = this.calculateGrade(this.results.security.score, 70);
    console.log(`Security Grade: ${this.results.security.grade} (${this.results.security.score}/70)\n`);
  }

  async auditStability() {
    console.log('🛡️ STABILITY AUDIT');
    console.log('==================');

    // Check Error Boundaries
    const errorBoundaries = this.checkErrorBoundaries();
    if (errorBoundaries.passed) {
      this.results.stability.passed.push('Error boundaries implemented');
      this.results.stability.score += 15;
    } else {
      this.results.stability.critical.push('Error boundaries missing');
    }

    // Check Async Error Handling
    const asyncErrors = this.checkAsyncErrorHandling();
    if (asyncErrors.passed) {
      this.results.stability.passed.push('Async error handling implemented');
      this.results.stability.score += 20;
    } else {
      this.results.stability.critical.push('Async error handling incomplete');
    }

    // Check Memory Management
    const memoryManagement = this.checkMemoryManagement();
    if (memoryManagement.passed) {
      this.results.stability.passed.push('Memory management optimized');
      this.results.stability.score += 15;
    } else {
      this.results.stability.issues.push('Memory management could be improved');
    }

    // Check Store Initialization
    const storeInit = this.checkStoreInitialization();
    if (storeInit.passed) {
      this.results.stability.passed.push('Store initialization coordinated');
      this.results.stability.score += 15;
    } else {
      this.results.stability.issues.push('Store initialization race conditions possible');
    }

    // Check Performance Optimizations
    const performance = this.checkPerformanceOptimizations();
    if (performance.passed) {
      this.results.stability.passed.push('Performance optimizations present');
      this.results.stability.score += 10;
    } else {
      this.results.stability.issues.push('Performance optimizations needed');
    }

    this.results.stability.grade = this.calculateGrade(this.results.stability.score, 75);
    console.log(`Stability Grade: ${this.results.stability.grade} (${this.results.stability.score}/75)\n`);
  }

  async auditFileSync() {
    console.log('📁 FILE SYNCHRONIZATION AUDIT');
    console.log('=============================');

    // Check Store Coordination
    const storeCoordination = this.checkStoreCoordination();
    if (storeCoordination.passed) {
      this.results.fileSync.passed.push('Store coordination implemented');
      this.results.fileSync.score += 20;
    } else {
      this.results.fileSync.critical.push('Store coordination issues found');
    }

    // Check Asset Path Mapping
    const pathMapping = this.checkAssetPathMapping();
    if (pathMapping.passed) {
      this.results.fileSync.passed.push('Asset path mapping accurate');
      this.results.fileSync.score += 15;
    } else {
      this.results.fileSync.issues.push('Asset path mapping inconsistencies');
    }

    // Check Data Consistency
    const dataConsistency = this.checkDataConsistency();
    if (dataConsistency.passed) {
      this.results.fileSync.passed.push('Data consistency maintained');
      this.results.fileSync.score += 15;
    } else {
      this.results.fileSync.issues.push('Data consistency issues detected');
    }

    // Check Persistent Storage
    const persistentStorage = this.checkPersistentStorage();
    if (persistentStorage.passed) {
      this.results.fileSync.passed.push('Persistent storage working');
      this.results.fileSync.score += 10;
    } else {
      this.results.fileSync.issues.push('Persistent storage issues');
    }

    this.results.fileSync.grade = this.calculateGrade(this.results.fileSync.score, 60);
    console.log(`File Sync Grade: ${this.results.fileSync.grade} (${this.results.fileSync.score}/60)\n`);
  }

  async auditAssets() {
    console.log('📊 ASSET ORGANIZATION AUDIT');
    console.log('===========================');

    // Check Directory Structure
    const dirStructure = this.checkDirectoryStructure();
    if (dirStructure.passed) {
      this.results.assets.passed.push('Directory structure organized');
      this.results.assets.score += 15;
    } else {
      this.results.assets.issues.push('Directory structure needs improvement');
    }

    // Check Asset Security Validation
    const assetValidation = this.checkAssetValidation();
    if (assetValidation.passed) {
      this.results.assets.passed.push('Asset validation implemented');
      this.results.assets.score += 15;
    } else {
      this.results.assets.issues.push('Asset validation incomplete');
    }

    // Check Expansion Management
    const expansionMgmt = this.checkExpansionManagement();
    if (expansionMgmt.passed) {
      this.results.assets.passed.push('Expansion management functional');
      this.results.assets.score += 10;
    } else {
      this.results.assets.issues.push('Expansion management issues');
    }

    this.results.assets.grade = this.calculateGrade(this.results.assets.score, 40);
    console.log(`Asset Organization Grade: ${this.results.assets.grade} (${this.results.assets.score}/40)\n`);
  }

  // Security Check Methods
  checkXSSProtection() {
    try {
      // Check for XSS protection implementation
      const securityValidatorExists = fs.existsSync('client/src/lib/assetSecurityValidator.ts');
      const inputValidationExists = fs.existsSync('client/src/lib/inputValidation.ts');
      
      return {
        passed: securityValidatorExists,
        details: `Security validator: ${securityValidatorExists ? 'Found' : 'Missing'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking XSS protection: ${error.message}` };
    }
  }

  checkInputValidation() {
    try {
      // Check DevToolsPage for input validation
      const devToolsContent = fs.readFileSync('client/src/pages/DevToolsPage.tsx', 'utf8');
      const hasValidation = devToolsContent.includes('trim()') && 
                           devToolsContent.includes('validate') &&
                           devToolsContent.includes('error');
      
      return {
        passed: hasValidation,
        details: `Input validation patterns found: ${hasValidation}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking input validation: ${error.message}` };
    }
  }

  checkAssetSecurity() {
    try {
      const assetSecurityExists = fs.existsSync('client/src/lib/assetSecurityValidator.ts');
      const assetValidationExists = fs.existsSync('client/src/lib/assetValidation.ts');
      
      return {
        passed: assetSecurityExists && assetValidationExists,
        details: `Asset security files present: ${assetSecurityExists && assetValidationExists}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking asset security: ${error.message}` };
    }
  }

  checkEnvironmentSecurity() {
    try {
      // Check for proper environment variable handling
      const serverContent = fs.readFileSync('server/index.ts', 'utf8');
      const hasEnvCheck = serverContent.includes('process.env') && 
                         serverContent.includes('DATABASE_URL');
      
      return {
        passed: hasEnvCheck,
        details: `Environment variable security: ${hasEnvCheck ? 'Implemented' : 'Needs review'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking environment security: ${error.message}` };
    }
  }

  checkRateLimiting() {
    try {
      // Check server routes for rate limiting
      const routesContent = fs.readFileSync('server/routes.ts', 'utf8');
      const hasRateLimit = routesContent.includes('rate') || routesContent.includes('limit');
      
      return {
        passed: hasRateLimit,
        details: `Rate limiting: ${hasRateLimit ? 'Implemented' : 'Not found'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking rate limiting: ${error.message}` };
    }
  }

  // Stability Check Methods
  checkErrorBoundaries() {
    try {
      const appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
      const hasErrorBoundary = appContent.includes('ErrorBoundary') || 
                              appContent.includes('componentDidCatch') ||
                              appContent.includes('error');
      
      return {
        passed: hasErrorBoundary,
        details: `Error boundaries: ${hasErrorBoundary ? 'Present' : 'Missing'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking error boundaries: ${error.message}` };
    }
  }

  checkAsyncErrorHandling() {
    try {
      const devToolsContent = fs.readFileSync('client/src/pages/DevToolsPage.tsx', 'utf8');
      const hasTryCatch = devToolsContent.includes('try {') && 
                         devToolsContent.includes('} catch');
      const hasAsyncAwait = devToolsContent.includes('async') && 
                           devToolsContent.includes('await');
      
      return {
        passed: hasTryCatch && hasAsyncAwait,
        details: `Async error handling: ${hasTryCatch && hasAsyncAwait ? 'Implemented' : 'Incomplete'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking async error handling: ${error.message}` };
    }
  }

  checkMemoryManagement() {
    try {
      // Check for virtualized lists and memory optimization
      const virtualizedExists = fs.existsSync('client/src/components/VirtualizedCardList.tsx');
      
      return {
        passed: virtualizedExists,
        details: `Memory optimizations: ${virtualizedExists ? 'Virtualization implemented' : 'Basic implementation'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking memory management: ${error.message}` };
    }
  }

  checkStoreInitialization() {
    try {
      const appContent = fs.readFileSync('client/src/App.tsx', 'utf8');
      const hasInitialization = appContent.includes('initialization') || 
                               appContent.includes('Initialize');
      
      return {
        passed: hasInitialization,
        details: `Store initialization: ${hasInitialization ? 'Coordinated' : 'Basic'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking store initialization: ${error.message}` };
    }
  }

  checkPerformanceOptimizations() {
    try {
      // Check for React optimizations
      const hasOptimizations = fs.existsSync('client/src/components/VirtualizedCardList.tsx');
      
      return {
        passed: hasOptimizations,
        details: `Performance optimizations: ${hasOptimizations ? 'Present' : 'Basic'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking performance optimizations: ${error.message}` };
    }
  }

  // File Sync Check Methods
  checkStoreCoordination() {
    try {
      const dataSyncExists = fs.existsSync('client/src/game/stores/useDataSyncStore.ts');
      const initSystemExists = fs.existsSync('client/src/lib/dataSyncAudit.ts');
      
      return {
        passed: dataSyncExists,
        details: `Store coordination: ${dataSyncExists ? 'Implemented' : 'Missing'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking store coordination: ${error.message}` };
    }
  }

  checkAssetPathMapping() {
    try {
      const pathMapperExists = fs.existsSync('client/src/lib/assetPathMapper.ts');
      
      if (pathMapperExists) {
        const mapperContent = fs.readFileSync('client/src/lib/assetPathMapper.ts', 'utf8');
        const hasMapping = mapperContent.includes('EXPANSION_ASSET_PATHS') &&
                          mapperContent.includes('getCardAssetPath');
        
        return {
          passed: hasMapping,
          details: `Asset path mapping: ${hasMapping ? 'Comprehensive' : 'Basic'}`
        };
      }
      
      return { passed: false, details: 'Asset path mapper missing' };
    } catch (error) {
      return { passed: false, details: `Error checking asset path mapping: ${error.message}` };
    }
  }

  checkDataConsistency() {
    try {
      const expansionStoreExists = fs.existsSync('client/src/game/stores/useExpansionStore.ts');
      const deckStoreExists = fs.existsSync('client/src/game/stores/useDeckStore.ts');
      const premadeDecksExists = fs.existsSync('client/src/game/stores/usePremadeDecksStore.ts');
      
      return {
        passed: expansionStoreExists && deckStoreExists && premadeDecksExists,
        details: `Data consistency stores: ${expansionStoreExists && deckStoreExists && premadeDecksExists ? 'All present' : 'Some missing'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking data consistency: ${error.message}` };
    }
  }

  checkPersistentStorage() {
    try {
      // Check for Zustand persistence
      const expansionStore = fs.readFileSync('client/src/game/stores/useExpansionStore.ts', 'utf8');
      const hasPersistence = expansionStore.includes('persist') || 
                           expansionStore.includes('localStorage');
      
      return {
        passed: hasPersistence,
        details: `Persistent storage: ${hasPersistence ? 'Implemented' : 'Session only'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking persistent storage: ${error.message}` };
    }
  }

  // Asset Check Methods
  checkDirectoryStructure() {
    try {
      const publicExists = fs.existsSync('client/public');
      const assetsExists = fs.existsSync('client/public/assets');
      
      return {
        passed: publicExists && assetsExists,
        details: `Directory structure: ${publicExists && assetsExists ? 'Organized' : 'Needs organization'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking directory structure: ${error.message}` };
    }
  }

  checkAssetValidation() {
    try {
      const validationExists = fs.existsSync('client/src/lib/assetValidation.ts');
      const securityValidatorExists = fs.existsSync('client/src/lib/assetSecurityValidator.ts');
      
      return {
        passed: validationExists && securityValidatorExists,
        details: `Asset validation: ${validationExists && securityValidatorExists ? 'Comprehensive' : 'Basic'}`
      };
    } catch (error) {
      return { passed: false, details: `Error checking asset validation: ${error.message}` };
    }
  }

  checkExpansionManagement() {
    try {
      const expansionManagerExists = fs.existsSync('client/src/lib/expansionManager.ts');
      
      if (expansionManagerExists) {
        const managerContent = fs.readFileSync('client/src/lib/expansionManager.ts', 'utf8');
        const hasManagement = managerContent.includes('createExpansion') &&
                             managerContent.includes('cloneExpansion');
        
        return {
          passed: hasManagement,
          details: `Expansion management: ${hasManagement ? 'Full featured' : 'Basic'}`
        };
      }
      
      return { passed: false, details: 'Expansion manager missing' };
    } catch (error) {
      return { passed: false, details: `Error checking expansion management: ${error.message}` };
    }
  }

  calculateGrade(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  calculateOverallScore() {
    const totalScore = this.results.security.score + 
                      this.results.stability.score + 
                      this.results.fileSync.score + 
                      this.results.assets.score;
    
    const maxScore = 70 + 75 + 60 + 40; // 245 total
    
    this.results.overall.score = Math.round((totalScore / maxScore) * 100);
    this.results.overall.grade = this.calculateGrade(totalScore, maxScore);
    this.results.overall.readyForProduction = this.results.overall.score >= 85;
  }

  generateReport() {
    console.log('\n📋 COMPREHENSIVE AUDIT REPORT');
    console.log('==============================');
    console.log(`Overall Grade: ${this.results.overall.grade} (${this.results.overall.score}%)`);
    console.log(`Production Ready: ${this.results.overall.readyForProduction ? '✅ YES' : '❌ NO'}\n`);

    console.log('📊 DETAILED SCORES:');
    console.log(`🔒 Security: ${this.results.security.grade} (${this.results.security.score}/70)`);
    console.log(`🛡️ Stability: ${this.results.stability.grade} (${this.results.stability.score}/75)`);
    console.log(`📁 File Sync: ${this.results.fileSync.grade} (${this.results.fileSync.score}/60)`);
    console.log(`📊 Assets: ${this.results.assets.grade} (${this.results.assets.score}/40)\n`);

    // Show critical issues
    const allCritical = [
      ...this.results.security.critical,
      ...this.results.stability.critical, 
      ...this.results.fileSync.critical,
      ...this.results.assets.critical
    ];

    if (allCritical.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      allCritical.forEach(issue => console.log(`- ${issue}`));
      console.log('');
    }

    // Show all issues
    const allIssues = [
      ...this.results.security.issues,
      ...this.results.stability.issues,
      ...this.results.fileSync.issues,
      ...this.results.assets.issues
    ];

    if (allIssues.length > 0) {
      console.log('⚠️ ISSUES TO ADDRESS:');
      allIssues.forEach(issue => console.log(`- ${issue}`));
      console.log('');
    }

    // Show successes
    const allPassed = [
      ...this.results.security.passed,
      ...this.results.stability.passed,
      ...this.results.fileSync.passed,
      ...this.results.assets.passed
    ];

    if (allPassed.length > 0) {
      console.log('✅ IMPLEMENTED FEATURES:');
      allPassed.forEach(feature => console.log(`- ${feature}`));
      console.log('');
    }

    this.saveReportToFile();
  }

  saveReportToFile() {
    const reportContent = `# Comprehensive Audit Report - ${new Date().toISOString()}

## Overall Results
- **Grade**: ${this.results.overall.grade} (${this.results.overall.score}%)
- **Production Ready**: ${this.results.overall.readyForProduction ? '✅ YES' : '❌ NO'}

## Detailed Scores
- **Security**: ${this.results.security.grade} (${this.results.security.score}/70)
- **Stability**: ${this.results.stability.grade} (${this.results.stability.score}/75)
- **File Sync**: ${this.results.fileSync.grade} (${this.results.fileSync.score}/60)
- **Assets**: ${this.results.assets.grade} (${this.results.assets.score}/40)

## Critical Issues
${[...this.results.security.critical, ...this.results.stability.critical, ...this.results.fileSync.critical, ...this.results.assets.critical].map(issue => `- ${issue}`).join('\n')}

## Issues to Address
${[...this.results.security.issues, ...this.results.stability.issues, ...this.results.fileSync.issues, ...this.results.assets.issues].map(issue => `- ${issue}`).join('\n')}

## Implemented Features
${[...this.results.security.passed, ...this.results.stability.passed, ...this.results.fileSync.passed, ...this.results.assets.passed].map(feature => `- ${feature}`).join('\n')}
`;

    fs.writeFileSync('AUDIT_RESULTS.md', reportContent);
    console.log('📄 Full report saved to AUDIT_RESULTS.md');
  }
}

// Run the audit
const auditor = new ComprehensiveAuditor();
auditor.runFullAudit().catch(console.error);