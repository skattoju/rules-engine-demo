#!/usr/bin/env node

const RuleEngineService = require('./rule-engine-service');
const path = require('path');

async function main() {
  console.log('🚀 Natural Language Credit Card Transaction Rules Engine');
  console.log('=====================================================');
  console.log('🤖 Powered by Ollama LLM for Natural Language Processing\n');

  // Initialize the service
  const csvPath = path.join(__dirname, 'data.csv');
  const service = new RuleEngineService(csvPath);

  console.log('Initializing service...');
  const initResult = await service.initialize();
  
  if (!initResult.success) {
    console.error('❌ Failed to initialize:', initResult.error);
    console.log('\n💡 Quick Fix:');
    console.log('1. Install Ollama: https://ollama.ai/');
    console.log('2. Pull a model: ollama pull llama3.2');
    console.log('3. Ensure Ollama is running: ollama serve');
    process.exit(1);
  }

  console.log('✅ Service initialized successfully');
  console.log(`📊 Loaded ${initResult.transactionCount} transactions`);
  console.log(`🤖 Ollama LLM ready for natural language processing\n`);

  // Show dataset overview
  console.log('📈 Dataset Overview:');
  const stats = service.getStatistics();
  console.log(`- Total transactions: ${stats.totalTransactions}`);
  console.log(`- Amount range: $${stats.amountStats.min.toFixed(2)} - $${stats.amountStats.max.toFixed(2)}`);
  console.log(`- Average amount: $${stats.amountStats.average.toFixed(2)}`);
  console.log(`- Categories: ${stats.categories.slice(0, 5).join(', ')}...`);
  console.log(`- Fraud transactions: ${stats.fraudCount}\n`);

  // Demonstrate the natural language processing flow
  const demoQueries = [
    "show me transactions with amount less than 10 dollars",
    "find transactions where category is food_dining"
  ];

  console.log('🔍 Natural Language Query Demo:');
  console.log('='.repeat(50));

  for (const query of demoQueries) {
    console.log(`\n🗣️  Query: "${query}"`);
    console.log('⏳ Processing...');
    
    const result = await service.processQuery(query);
    
    if (result.success) {
      service.displayResults(result);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
    
    console.log('\n' + '─'.repeat(80));
  }

  // Interactive mode (if running directly)
  if (require.main === module) {
    console.log('\n🎮 Interactive Natural Language Mode');
    console.log('====================================');
    console.log('🗣️  Enter your questions in plain English!');
    console.log('💡 Type "help" for examples, "stats" for data info, or "exit" to quit.\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuery = () => {
      rl.question('💬 Ask: ', async (input) => {
        const query = input.trim();
        
        if (query.toLowerCase() === 'exit') {
          console.log('👋 Thank you for using the Natural Language Transaction Engine!');
          rl.close();
          return;
        }
        
        if (query.toLowerCase() === 'help') {
          console.log('\n📚 Try these natural language queries:');
          service.getExampleQueries().forEach((example, index) => {
            console.log(`  ${index + 1}. ${example}`);
          });
          console.log();
          askQuery();
          return;
        }
        
        if (query.toLowerCase() === 'stats') {
          const stats = service.getStatistics();
          console.log('\n📊 Dataset Information:');
          console.log(`- Total transactions: ${stats.totalTransactions}`);
          console.log(`- Amount range: $${stats.amountStats.min} - $${stats.amountStats.max}`);
          console.log(`- Categories: ${stats.categories.join(', ')}`);
          console.log(`- Natural Language Processing: Enabled ✅`);
          console.log(`- Ollama Integration: Active 🤖`);
          console.log();
          askQuery();
          return;
        }
        
        if (query) {
          console.log(`\n🤖 Processing: "${query}"`);
          console.log('⏳ Generating rule and analyzing data...\n');
          
          const result = await service.processQuery(query);
          
          if (result.success) {
            service.displayResults(result);
          } else {
            console.log(`❌ Error: ${result.error}`);
            if (result.helpMessage) {
              console.log(`💡 ${result.helpMessage}`);
            }
          }
        }
        
        console.log('\n' + '─'.repeat(60));
        askQuery();
      });
    };
    
    askQuery();
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RuleEngineService }; 