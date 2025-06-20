// AI Integration Test Script for SubmittalAI Pro
// Tests all AI functionality including error handling and fallback scenarios

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: {
    analyze: '/api/ai/analyze',
    analyzeEnhanced: '/api/ai/analyze-enhanced',
    status: '/api/ai/status',
  },
  // Mock document data for testing
  mockDocument: {
    id: 'test-doc-123',
    filename: 'Test Construction Submittal.pdf',
    file_type: 'application/pdf',
    extracted_text: `CONSTRUCTION SUBMITTAL

PRODUCT: Fire-Rated Door Assembly
MANUFACTURER: ABC Door Company
MODEL: FRD-90-A

SPECIFICATIONS:
- Fire Rating: 90 minutes
- Material: Steel frame, mineral core
- Hardware: UL Listed lockset
- Installation: Per manufacturer specifications

CERTIFICATIONS:
- UL Listed for 90-minute fire rating
- Meets NFPA 80 requirements
- ADA compliant hardware

TESTING REPORTS:
- Fire test report UL-R1234
- Hardware cycling test report

This submittal is for review and approval for use in the new office building project.`,
  },
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// Utility functions
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : '❌';
  console.log(`[${timestamp}] ${statusIcon} ${testName} - ${status}`);
  if (details) console.log(`   Details: ${details}`);
  
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({ testName, details });
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test functions
async function testHealthChecks() {
  console.log('\n🔍 Testing API Health Checks...');
  
  // Test basic analyze endpoint
  const analyzeHealth = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyze}`, {
    method: 'GET'
  });
  
  if (analyzeHealth.success && analyzeHealth.data.status === 'healthy') {
    logTest('Basic Analyze Endpoint Health', 'PASS', 'API is responding correctly');
  } else {
    logTest('Basic Analyze Endpoint Health', 'FAIL', `Status: ${analyzeHealth.status}, Error: ${analyzeHealth.error || 'Unknown'}`);
  }
  
  // Test enhanced analyze endpoint
  const enhancedHealth = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyzeEnhanced}`, {
    method: 'GET'
  });
  
  if (enhancedHealth.success && enhancedHealth.data.status === 'healthy') {
    logTest('Enhanced Analyze Endpoint Health', 'PASS', 'Enhanced API is responding correctly');
  } else {
    logTest('Enhanced Analyze Endpoint Health', 'FAIL', `Status: ${enhancedHealth.status}, Error: ${enhancedHealth.error || 'Unknown'}`);
  }
}

async function testBasicAnalysis() {
  console.log('\n🔬 Testing Basic Analysis Functionality...');
  
  const analysisRequest = {
    documentId: TEST_CONFIG.mockDocument.id,
    analysisType: 'review',
    customPrompt: 'Focus on fire safety compliance',
  };
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyze}`, {
    method: 'POST',
    body: JSON.stringify(analysisRequest),
  });
  
  if (result.success) {
    logTest('Basic Analysis Request', 'PASS', `Analysis completed with ID: ${result.data.analysisId || 'N/A'}`);
    
    // Validate response structure
    if (result.data.metadata && result.data.metadata.model) {
      logTest('Basic Analysis Response Structure', 'PASS', `Model used: ${result.data.metadata.model}`);
    } else {
      logTest('Basic Analysis Response Structure', 'FAIL', 'Missing metadata or model information');
    }
  } else {
    logTest('Basic Analysis Request', 'FAIL', `Error: ${result.error || result.data?.error || 'Unknown'}`);
  }
}

async function testEnhancedAnalysis() {
  console.log('\n🚀 Testing Enhanced Analysis Functionality...');
  
  const enhancedRequest = {
    documentId: TEST_CONFIG.mockDocument.id,
    analysisType: 'compliance',
    complexity: 'comprehensive',
    priority: 'high',
    projectContext: {
      projectType: 'commercial',
      buildingCodes: ['IBC 2021', 'NFPA 80'],
      jurisdiction: 'Los Angeles County',
      projectPhase: 'construction',
    },
    focusAreas: ['fire safety', 'code compliance', 'accessibility'],
    customCriteria: 'Ensure all fire-rated assemblies meet local requirements',
  };
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyzeEnhanced}`, {
    method: 'POST',
    body: JSON.stringify(enhancedRequest),
  });
  
  if (result.success) {
    logTest('Enhanced Analysis Request', 'PASS', `Enhanced analysis completed with ID: ${result.data.analysisId || 'N/A'}`);
    
    // Validate enhanced response structure
    if (result.data.metadata && result.data.metadata.enhanced === true) {
      logTest('Enhanced Analysis Features', 'PASS', `Processing time: ${result.data.metadata.processingTime || 'N/A'}ms`);
    } else {
      logTest('Enhanced Analysis Features', 'FAIL', 'Enhanced analysis not properly marked or processed');
    }
  } else {
    logTest('Enhanced Analysis Request', 'FAIL', `Error: ${result.error || result.data?.error || 'Unknown'}`);
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling Scenarios...');
  
  // Test missing document ID
  const missingDocResult = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyze}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  
  if (!missingDocResult.success && missingDocResult.status === 400) {
    logTest('Missing Document ID Error', 'PASS', 'Correctly rejected request with missing document ID');
  } else {
    logTest('Missing Document ID Error', 'FAIL', 'Should reject requests without document ID');
  }
  
  // Test invalid analysis type
  const invalidTypeResult = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyzeEnhanced}`, {
    method: 'POST',
    body: JSON.stringify({
      documentId: 'test-id',
      analysisType: 'invalid-type',
    }),
  });
  
  // This should either succeed with fallback or fail gracefully
  if (invalidTypeResult.success || (invalidTypeResult.status >= 400 && invalidTypeResult.status < 500)) {
    logTest('Invalid Analysis Type Handling', 'PASS', 'Handled invalid analysis type appropriately');
  } else {
    logTest('Invalid Analysis Type Handling', 'FAIL', 'Should handle invalid analysis types gracefully');
  }
  
  // Test authentication requirement
  const noAuthResult = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyze}`, {
    method: 'POST',
    headers: {
      'Authorization': '', // Remove auth header
    },
    body: JSON.stringify({ documentId: 'test-id' }),
  });
  
  if (!noAuthResult.success && noAuthResult.status === 401) {
    logTest('Authentication Requirement', 'PASS', 'Correctly requires authentication');
  } else {
    logTest('Authentication Requirement', 'FAIL', 'Should require authentication for AI analysis');
  }
}

async function testModelFallback() {
  console.log('\n🔄 Testing Model Fallback Logic...');
  
  // Test with preferred model specification
  const modelRequest = {
    documentId: TEST_CONFIG.mockDocument.id,
    analysisType: 'review',
    model: 'anthropic/claude-3.5-sonnet:beta', // Preferred model
  };
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyze}`, {
    method: 'POST',
    body: JSON.stringify(modelRequest),
  });
  
  if (result.success && result.data.metadata) {
    const usedModel = result.data.metadata.model;
    logTest('Model Selection Logic', 'PASS', `Used model: ${usedModel}`);
    
    // Check if it's one of the supported models
    const supportedModels = [
      'anthropic/claude-3.5-sonnet:beta',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3-haiku:beta'
    ];
    
    if (supportedModels.includes(usedModel)) {
      logTest('Model Fallback System', 'PASS', 'Used a supported model');
    } else {
      logTest('Model Fallback System', 'FAIL', `Unknown model used: ${usedModel}`);
    }
  } else {
    logTest('Model Selection Logic', 'FAIL', 'Could not test model selection');
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting (Basic Check)...');
  
  // Make multiple rapid requests to test rate limiting
  const rapidRequests = [];
  for (let i = 0; i < 5; i++) {
    rapidRequests.push(
      makeRequest(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.endpoints.analyze}`, {
        method: 'GET'
      })
    );
  }
  
  try {
    const results = await Promise.all(rapidRequests);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount > 0) {
      logTest('Rate Limiting Response', 'PASS', `${successCount}/5 requests succeeded - rate limiting may be configured`);
    } else {
      logTest('Rate Limiting Response', 'FAIL', 'All requests failed - check API availability');
    }
  } catch (error) {
    logTest('Rate Limiting Test', 'FAIL', `Error during rapid requests: ${error.message}`);
  }
}

async function generateTestReport() {
  console.log('\n📊 Test Results Summary');
  console.log('=' * 50);
  console.log(`✅ Tests Passed: ${testResults.passed}`);
  console.log(`❌ Tests Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 Failed Test Details:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.testName}: ${error.details}`);
    });
  }
  
  // Write results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1),
    },
    errors: testResults.errors,
  };
  
  try {
    fs.writeFileSync(
      path.join(__dirname, 'ai-integration-test-results.json'),
      JSON.stringify(reportData, null, 2)
    );
    console.log('\n📄 Test results saved to: ai-integration-test-results.json');
  } catch (error) {
    console.log(`\n⚠️  Could not save test results: ${error.message}`);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting AI Integration Tests for SubmittalAI Pro');
  console.log('=' * 60);
  
  try {
    await testHealthChecks();
    await testBasicAnalysis();
    await testEnhancedAnalysis();
    await testErrorHandling();
    await testModelFallback();
    await testRateLimiting();
    
    await generateTestReport();
    
    console.log('\n🎉 All tests completed!');
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Check if running directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, TEST_CONFIG }; 