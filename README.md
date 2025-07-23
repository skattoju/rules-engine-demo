# Credit Card Transaction Rules Engine Demo

A natural language to JSON rules engine for filtering credit card transactions. This demo allows you to use plain English to generate rules that can be applied by [json-rules-engine](https://github.com/CacheControl/json-rules-engine) to filter transaction data.

## 🚀 Features

- **Natural Language Processing**: Convert queries like "show me transactions with amount less than 10" into JSON rules
- **Dual Processing Modes**: 
  - Basic regex-based parser for simple queries
  - LLM-powered processing using Ollama for complex queries
- **JSON Rules Engine Integration**: Generated rules work directly with json-rules-engine
- **CSV Data Processing**: Loads and processes credit card transaction data
- **Interactive CLI**: Test queries in real-time
- **Comprehensive Field Mapping**: Maps CSV columns to meaningful field names

## 📋 Requirements

- Node.js 14+ 
- npm or yarn
- (Optional) [Ollama](https://ollama.ai/) with Llama model for enhanced NLP

## 🛠️ Installation

1. Clone or create the project directory:
```bash
mkdir credit-card-rules-demo
cd credit-card-rules-demo
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Install and set up Ollama:
```bash
# Install Ollama (visit https://ollama.ai/ for instructions)
# Pull a model (e.g., Llama 3.2)
ollama pull llama3.2
```

## 📊 Data Format

The system expects CSV data with the following structure (your `data.csv`):
- **Column 0**: Transaction ID
- **Column 1**: Timestamp
- **Column 2**: Card Number
- **Column 3**: Merchant
- **Column 4**: Category
- **Column 5**: Amount (amt) - The main field for filtering
- **Column 6**: First Name
- **Column 7**: Last Name
- And more... (see `field-mapping.js` for complete mapping)

## 🚀 Usage

### Basic Usage

```bash
node index.js
```

This will:
1. Load your transaction data
2. Run example queries
3. Enter interactive mode for testing

### Example Queries

The system supports various natural language formats:

```javascript
// Simple comparisons
"show me transactions with amount less than 10"
"amt > 100"
"amount >= 50"

// Category filtering  
"transactions where category is food_dining"
"category equals travel"

// Fraud detection
"fraud transactions"
"fraudulent transactions"

// Location-based
"show me transactions with state is CA"
"transactions where city is New York"
```

### Programmatic Usage

```javascript
const RuleEngineService = require('./rule-engine-service');

async function example() {
  const service = new RuleEngineService('./data.csv');
  await service.initialize();
  
  const result = await service.processQuery("amount less than 10");
  
  if (result.success) {
    console.log('Generated Rule:', result.generatedRule);
    console.log('Matches:', result.results.matchCount);
  }
}
```

## 🏗️ Architecture

### Components

1. **`field-mapping.js`**: Maps CSV columns to field names and handles aliases
2. **`natural-language-parser.js`**: Basic regex-based query parser
3. **`ollama-integration.js`**: LLM-powered rule generation using Ollama
4. **`csv-processor.js`**: Loads and processes transaction data
5. **`rule-engine-service.js`**: Main service coordinating all components
6. **`index.js`**: CLI interface and demo runner

### Processing Flow

```
Natural Language Query
         ↓
    [Try Ollama LLM]
         ↓
  [Fallback to Regex Parser]
         ↓
    JSON Rule Generated
         ↓
   Applied to Transactions
         ↓
    Filtered Results
```

## 📝 Generated JSON Rules

The system generates rules compatible with json-rules-engine:

```json
{
  "conditions": {
    "all": [
      {
        "fact": "amt",
        "operator": "lessThan",
        "value": 10
      }
    ]
  },
  "event": {
    "type": "transaction-match",
    "params": {
      "message": "Transaction matches criteria: amt lessThan 10"
    }
  }
}
```

## 🔧 Configuration

### Field Aliases

The system recognizes common aliases:
- `amount`, `price`, `cost` → `amt`
- `store`, `shop`, `business` → `merchant`
- `fraud`, `fraudulent` → `isFraud`

### Operators

Supported operators:
- `less than`, `<`, `lt` → `lessThan`
- `greater than`, `>`, `gt` → `greaterThan`
- `equal to`, `equals`, `is`, `=` → `equal`
- `not equal`, `!=` → `notEqual`
- And more...

### Ollama Configuration

To use different models or endpoints:

```javascript
const ollama = new OllamaIntegration('http://localhost:11434');
ollama.setModel('llama3.2'); // or your preferred model
```

## 🧪 Testing

Run the built-in tests:

```javascript
const service = new RuleEngineService('./data.csv');
await service.initialize();
const testResults = await service.runTests();
```

## 📚 API Reference

### RuleEngineService

#### `initialize()`
Loads CSV data and checks Ollama availability.

#### `processQuery(query, useOllama = true)`
Processes a natural language query and returns filtered results.

#### `getStatistics()`
Returns dataset statistics and available fields.

#### `validateRule(jsonRule)`
Validates a JSON rule format.

### NaturalLanguageParser

#### `parseQuery(query)`
Parses natural language using regex patterns.

#### `getExampleQueries()`
Returns list of supported query formats.

### OllamaIntegration

#### `generateRule(query)`
Uses LLM to generate JSON rules from natural language.

#### `isAvailable()`
Checks if Ollama service is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Projects

- [json-rules-engine](https://github.com/CacheControl/json-rules-engine) - The underlying rules engine
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [json-rule-editor](https://github.com/vinzdeveloper/json-rule-editor) - Visual rule editor

## 🐛 Troubleshooting

### Common Issues

1. **CSV Loading Errors**: Ensure your CSV file matches the expected format
2. **Ollama Connection**: Check if Ollama is running on `http://localhost:11434`
3. **Rule Generation Failures**: Try simpler query formats or check example queries

### Debug Mode

Enable debug logging:
```bash
DEBUG=* node index.js
```

## 📈 Performance

- Basic parser: ~1ms per query
- Ollama integration: ~500-2000ms per query (depending on model)
- Rule application: ~10-50ms per 1000 transactions

For production use, consider caching generated rules and using the basic parser for simple queries. 