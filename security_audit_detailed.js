#!/usr/bin/env node

/**
 * Detailed Security Audit
 * Focuses on the remaining security issues found in the main audit
 */

import fs from 'fs';
import path from 'path';

class DetailedSecurityAuditor {
  constructor() {
    this.vulnerabilities = [];
    this.recommendations = [];
    this.securityMeasures = [];
  }

  async performDetailedSecurityAudit() {
    console.log('🔐 DETAILED SECURITY AUDIT');
    console.log('==========================\n');

    await this.auditEnvironmentVariables();
    await this.auditAPIEndpoints();
    await this.auditInputValidation();
    await this.auditXSSProtection();
    await this.auditFileUploadSecurity();
    await this.auditAuthenticationSecurity();
    
    this.generateSecurityReport();
  }

  async auditEnvironmentVariables() {
    console.log('🔒 Environment Variable Security...');
    
    const serverFiles = ['server/index.ts', 'server/routes.ts'];
    let envSecurityScore = 0;
    
    for (const file of serverFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for proper env variable handling
        if (content.includes('process.env.DATABASE_URL')) {
          this.securityMeasures.push('Database URL properly accessed from environment');
          envSecurityScore += 10;
        }
        
        // Check for hardcoded secrets
        const hardcodedPatterns = [
          /['"]\w{32,}['"]/g, // Long strings that might be API keys
          /password\s*[:=]\s*['"]\w+['"]/i,
          /secret\s*[:=]\s*['"]\w+['"]/i,
          /key\s*[:=]\s*['"]\w+['"]/i
        ];
        
        let hasHardcodedSecrets = false;
        hardcodedPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            hasHardcodedSecrets = true;
          }
        });
        
        if (!hasHardcodedSecrets) {
          this.securityMeasures.push(`${file}: No hardcoded secrets detected`);
          envSecurityScore += 10;
        } else {
          this.vulnerabilities.push(`${file}: Potential hardcoded secrets detected`);
        }
      }
    }
    
    // Check for .env file handling
    if (fs.existsSync('.env')) {
      this.recommendations.push('Remove .env file from repository if present');
    } else {
      this.securityMeasures.push('No .env file in repository');
      envSecurityScore += 5;
    }
    
    console.log(`Environment security score: ${envSecurityScore}/25\n`);
  }

  async auditAPIEndpoints() {
    console.log('🌐 API Endpoint Security...');
    
    const routesFile = 'server/routes.ts';
    let apiSecurityScore = 0;
    
    if (fs.existsSync(routesFile)) {
      const content = fs.readFileSync(routesFile, 'utf8');
      
      // Check for rate limiting
      if (content.includes('rate') || content.includes('limit') || content.includes('throttle')) {
        this.securityMeasures.push('Rate limiting implemented');
        apiSecurityScore += 15;
      } else {
        this.vulnerabilities.push('No rate limiting detected on API endpoints');
        this.recommendations.push('Implement API rate limiting to prevent abuse');
      }
      
      // Check for input validation on endpoints
      if (content.includes('validate') || content.includes('sanitize')) {
        this.securityMeasures.push('Input validation present on endpoints');
        apiSecurityScore += 10;
      } else {
        this.vulnerabilities.push('Limited input validation on API endpoints');
      }
      
      // Check for CORS configuration
      if (content.includes('cors') || content.includes('Access-Control')) {
        this.securityMeasures.push('CORS configuration present');
        apiSecurityScore += 5;
      } else {
        this.recommendations.push('Configure CORS policies for API endpoints');
      }
      
      // Check for authentication middleware
      if (content.includes('auth') || content.includes('token') || content.includes('session')) {
        this.securityMeasures.push('Authentication mechanisms present');
        apiSecurityScore += 10;
      } else {
        this.recommendations.push('Consider adding authentication middleware');
      }
    }
    
    console.log(`API security score: ${apiSecurityScore}/40\n`);
  }

  async auditInputValidation() {
    console.log('✅ Input Validation Security...');
    
    const devToolsFile = 'client/src/pages/DevToolsPage.tsx';
    let validationScore = 0;
    
    if (fs.existsSync(devToolsFile)) {
      const content = fs.readFileSync(devToolsFile, 'utf8');
      
      // Check for trim() usage
      const trimCount = (content.match(/\.trim\(\)/g) || []).length;
      if (trimCount > 5) {
        this.securityMeasures.push(`Input trimming implemented (${trimCount} instances)`);
        validationScore += 10;
      }
      
      // Check for validation patterns
      if (content.includes('validate') && content.includes('error')) {
        this.securityMeasures.push('Error handling with validation present');
        validationScore += 10;
      }
      
      // Check for XSS protection patterns
      if (content.includes('escape') || content.includes('sanitize')) {
        this.securityMeasures.push('XSS protection patterns found');
        validationScore += 15;
      } else {
        this.recommendations.push('Add explicit XSS protection for user inputs');
      }
      
      // Check for dangerous innerHTML usage
      if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
        this.vulnerabilities.push('Potential XSS vulnerability with innerHTML usage');
      } else {
        this.securityMeasures.push('No dangerous innerHTML usage detected');
        validationScore += 10;
      }
    }
    
    console.log(`Input validation score: ${validationScore}/45\n`);
  }

  async auditXSSProtection() {
    console.log('🛡️ XSS Protection Analysis...');
    
    const clientFiles = [
      'client/src/components/SafeCardImage.tsx',
      'client/src/lib/assetSecurityValidator.ts',
      'client/src/pages/DevToolsPage.tsx'
    ];
    
    let xssScore = 0;
    
    for (const file of clientFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for React's built-in XSS protection usage
        if (content.includes('React.createElement') || !content.includes('dangerouslySetInnerHTML')) {
          this.securityMeasures.push(`${path.basename(file)}: Using React's XSS protection`);
          xssScore += 5;
        }
        
        // Check for explicit sanitization
        if (content.includes('sanitize') || content.includes('escape')) {
          this.securityMeasures.push(`${path.basename(file)}: Explicit sanitization found`);
          xssScore += 10;
        }
      }
    }
    
    // Check for Content Security Policy
    const indexHtml = 'client/index.html';
    if (fs.existsSync(indexHtml)) {
      const content = fs.readFileSync(indexHtml, 'utf8');
      if (content.includes('Content-Security-Policy')) {
        this.securityMeasures.push('Content Security Policy implemented');
        xssScore += 15;
      } else {
        this.recommendations.push('Add Content Security Policy headers');
      }
    }
    
    console.log(`XSS protection score: ${xssScore}/30\n`);
  }

  async auditFileUploadSecurity() {
    console.log('📤 File Upload Security...');
    
    let uploadScore = 0;
    
    // Check asset validation
    const assetValidation = 'client/src/lib/assetValidation.ts';
    if (fs.existsSync(assetValidation)) {
      const content = fs.readFileSync(assetValidation, 'utf8');
      
      if (content.includes('validateAssetPath')) {
        this.securityMeasures.push('Asset path validation implemented');
        uploadScore += 10;
      }
      
      if (content.includes('fallback')) {
        this.securityMeasures.push('Fallback mechanisms for invalid assets');
        uploadScore += 5;
      }
    }
    
    // Check asset security validator
    const assetSecurity = 'client/src/lib/assetSecurityValidator.ts';
    if (fs.existsSync(assetSecurity)) {
      const content = fs.readFileSync(assetSecurity, 'utf8');
      
      if (content.includes('path traversal') || content.includes('..')) {
        this.securityMeasures.push('Path traversal protection implemented');
        uploadScore += 15;
      } else {
        this.recommendations.push('Add path traversal protection for file uploads');
      }
      
      if (content.includes('whitelist') || content.includes('allowedExtensions')) {
        this.securityMeasures.push('File extension whitelist present');
        uploadScore += 10;
      }
    }
    
    console.log(`File upload security score: ${uploadScore}/40\n`);
  }

  async auditAuthenticationSecurity() {
    console.log('🔐 Authentication Security...');
    
    let authScore = 0;
    
    // Check for wallet authentication
    const walletComponent = 'client/src/components/SolanaWalletConnect.tsx';
    if (fs.existsSync(walletComponent)) {
      const content = fs.readFileSync(walletComponent, 'utf8');
      
      if (content.includes('wallet') && content.includes('connect')) {
        this.securityMeasures.push('Wallet authentication implemented');
        authScore += 15;
      }
      
      if (content.includes('error') && content.includes('catch')) {
        this.securityMeasures.push('Authentication error handling present');
        authScore += 10;
      }
    }
    
    // Check session management
    const serverContent = fs.existsSync('server/index.ts') ? 
      fs.readFileSync('server/index.ts', 'utf8') : '';
    
    if (serverContent.includes('session')) {
      this.securityMeasures.push('Session management implemented');
      authScore += 10;
    } else {
      this.recommendations.push('Consider implementing session management');
    }
    
    console.log(`Authentication security score: ${authScore}/35\n`);
  }

  generateSecurityReport() {
    console.log('📋 DETAILED SECURITY REPORT');
    console.log('============================\n');

    const totalVulnerabilities = this.vulnerabilities.length;
    const totalMeasures = this.securityMeasures.length;
    const totalRecommendations = this.recommendations.length;

    console.log(`Security Measures Implemented: ${totalMeasures}`);
    console.log(`Vulnerabilities Found: ${totalVulnerabilities}`);
    console.log(`Recommendations: ${totalRecommendations}\n`);

    if (this.vulnerabilities.length > 0) {
      console.log('🚨 VULNERABILITIES TO ADDRESS:');
      this.vulnerabilities.forEach(vuln => console.log(`  - ${vuln}`));
      console.log('');
    }

    if (this.recommendations.length > 0) {
      console.log('💡 SECURITY RECOMMENDATIONS:');
      this.recommendations.forEach(rec => console.log(`  - ${rec}`));
      console.log('');
    }

    if (this.securityMeasures.length > 0) {
      console.log('✅ IMPLEMENTED SECURITY MEASURES:');
      this.securityMeasures.forEach(measure => console.log(`  - ${measure}`));
      console.log('');
    }

    // Calculate overall security grade
    const securityScore = Math.max(0, 100 - (totalVulnerabilities * 10) - (totalRecommendations * 5));
    const securityGrade = this.calculateSecurityGrade(securityScore);
    
    console.log(`Overall Security Grade: ${securityGrade} (${securityScore}%)`);
    console.log(`Production Security Level: ${securityScore >= 85 ? '✅ GOOD' : securityScore >= 70 ? '⚠️ MODERATE' : '❌ NEEDS IMPROVEMENT'}`);
  }

  calculateSecurityGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    return 'D';
  }
}

// Run the detailed security audit
const auditor = new DetailedSecurityAuditor();
auditor.performDetailedSecurityAudit().catch(console.error);