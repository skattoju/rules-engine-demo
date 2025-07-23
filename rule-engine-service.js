const { Engine } = require('json-rules-engine');
const OllamaIntegration = require('./ollama-integration');
const CSVProcessor = require('./csv-processor');

class RuleEngineService {
  constructor(csvFilePath) {
    this.csvProcessor = new CSVProcessor(csvFilePath);
    this.ollama = new OllamaIntegration();
    this.engine = new Engine();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Load CSV data
      await this.csvProcessor.loadTransactions();
      
      // Check if Ollama is available (required now)
      const ollamaAvailable = await this.ollama.isAvailable();
      console.log('Ollama available:', ollamaAvailable);
      
      if (!ollamaAvailable) {
        return {
          success: false,
          error: 'Ollama is required but not available. Please ensure Ollama is running on http://localhost:11434 and the model is available.'
        };
      }
      
      this.isInitialized = true;
      return {
        success: true,
        message: 'Rule engine service initialized successfully',
        ollamaAvailable,
        transactionCount: this.csvProcessor.getTransactions().length
      };
    } catch (error) {
      console.error('Failed to initialize service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processQuery(naturalLanguageQuery) {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Service not initialized. Call initialize() first.'
      };
    }

    console.log('\n=== Processing Natural Language Query ===');
    console.log('Query:', naturalLanguageQuery);

    // Step 1: Generate JSON rule using Ollama (no fallback)
    console.log('🤖 Generating JSON rule using Ollama...');
    const ruleResult = await this.ollama.generateRule(naturalLanguageQuery);

    if (!ruleResult.success) {
      return {
        success: false,
        error: ruleResult.error,
        helpMessage: 'Please ensure Ollama is running and try queries like: "show me transactions with amount less than 10" or "find transactions where category is food_dining"'
      };
    }

    console.log('✅ JSON rule generated successfully');

    // Step 2: Apply the rule to filter transactions
    console.log('🔍 Applying rule to transaction data...');
    const filteredTransactions = await this.applyRule(ruleResult.rule);

    // Step 3: Generate natural language summary
    console.log('📝 Generating natural language summary...');
    const summaryResult = await this.ollama.generateResultSummary(
      naturalLanguageQuery, 
      filteredTransactions, 
      this.csvProcessor.getTransactions().length,
      ruleResult.rule
    );

    const finalSummary = summaryResult.success 
      ? summaryResult.summary 
      : summaryResult.fallbackSummary || 'Summary generation failed.';

    return {
      success: true,
      query: naturalLanguageQuery,
      generatedRule: ruleResult.rule,
      matchedTransactions: filteredTransactions,
      results: {
        matchCount: filteredTransactions.length,
        totalTransactions: this.csvProcessor.getTransactions().length,
        matchPercentage: ((filteredTransactions.length / this.csvProcessor.getTransactions().length) * 100).toFixed(1)
      },
      summary: finalSummary,
      source: 'ollama'
    };
  }

  async applyRule(jsonRule) {
    const engine = new Engine();
    engine.addRule(jsonRule);

    const transactions = this.csvProcessor.getTransactions();
    const matchedTransactions = [];

    console.log(`Applying rule to ${transactions.length} transactions...`);

    for (const transaction of transactions) {
      try {
        const { events } = await engine.run(transaction);
        if (events.length > 0) {
          matchedTransactions.push({
            ...transaction,
            _matchedEvents: events
          });
        }
      } catch (error) {
        console.error('Error applying rule to transaction:', error.message);
        // Continue with other transactions
      }
    }

    console.log(`Found ${matchedTransactions.length} matching transactions`);
    return matchedTransactions;
  }

  // Enhanced display of results
  displayResults(result) {
    if (!result.success) {
      console.log('❌ Query failed:', result.error);
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 QUERY RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📋 Original Query: "${result.query}"`);
    
    console.log('\n🔧 Generated JSON Rule:');
    console.log(JSON.stringify(result.generatedRule, null, 2));
    
    console.log(`\n📊 Results Summary:`);
    console.log(`- Matched Transactions: ${result.results.matchCount}`);
    console.log(`- Total Transactions: ${result.results.totalTransactions}`);
    console.log(`- Match Percentage: ${result.results.matchPercentage}%`);
    
    if (result.matchedTransactions.length > 0) {
      console.log('\n💳 Matched Transactions:');
      result.matchedTransactions.forEach((transaction, index) => {
        console.log(`\n${index + 1}. Transaction ID: ${transaction.transactionId}`);
        console.log(`   Amount: $${transaction.amt.toFixed(2)}`);
        console.log(`   Merchant: ${transaction.merchant}`);
        console.log(`   Category: ${transaction.category}`);
        console.log(`   Date: ${transaction.timestamp}`);
        console.log(`   Location: ${transaction.city}, ${transaction.state}`);
        if (transaction.isFraud === 1) {
          console.log('   ⚠️  FRAUD ALERT');
        }
      });
    } else {
      console.log('\n❌ No transactions matched the criteria.');
    }
    
    console.log('\n🤖 Natural Language Summary:');
    console.log('─'.repeat(50));
    console.log(result.summary);
    console.log('─'.repeat(50));
  }

  // Test the service with example queries
  async runTests() {
    console.log('\n=== Running Enhanced Natural Language Tests ===');
    
    const testQueries = [
      "show me transactions with amount less than 10 dollars",
      "find transactions where category is food_dining", 
      "transactions over 100 dollars",
      "show me fraud transactions"
    ];

    const results = [];

    for (const query of testQueries) {
      console.log(`\n\nTesting: "${query}"`);
      console.log('─'.repeat(60));
      
      const result = await this.processQuery(query);
      results.push({
        query,
        success: result.success,
        matchCount: result.success ? result.results.matchCount : 0,
        error: result.error
      });
      
      if (result.success) {
        this.displayResults(result);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    }

    return results;
  }

  // Get service statistics
  getStatistics() {
    if (!this.isInitialized) {
      return { error: 'Service not initialized' };
    }

    return {
      ...this.csvProcessor.getStatistics(),
      ollamaRequired: true,
      naturalLanguageInputOutput: true
    };
  }

  // Validate a JSON rule
  validateRule(jsonRule) {
    try {
      const engine = new Engine();
      engine.addRule(jsonRule);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }

  // Get example queries for help
  getExampleQueries() {
    return [
      "show me transactions with amount less than 10 dollars",
      "find transactions where category is food_dining",
      "transactions over 100 dollars",
      "show me transactions in California",
      "find fraud transactions",
      "show me transactions at Starbucks",
      "transactions between 50 and 100 dollars",
      "show me travel category transactions"
    ];
  }
}

module.exports = RuleEngineService; 