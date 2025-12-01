const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'knowledge.db');
const db = new Database(dbPath);

function initDatabase() {
  // Knowledge base table
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_variants TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT NOT NULL,
      category TEXT NOT NULL,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat history table (optional, for analytics)
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_query TEXT NOT NULL,
      matched_question_id INTEGER,
      response TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (matched_question_id) REFERENCES knowledge(id)
    )
  `);

  console.log('Database initialized');

  // Seed initial data if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM knowledge').get();
  if (count.count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const insert = db.prepare(`
    INSERT INTO knowledge (question_variants, answer, keywords, category)
    VALUES (?, ?, ?, ?)
  `);

  const sampleData = [
    {
      questions: JSON.stringify([
        "What is the DIG blended rate?",
        "DIG team rate",
        "How much does DIG charge?",
        "DIG hourly rate"
      ]),
      answer: "The DIG (Digital Innovation Group) blended rate is $150/hour.",
      keywords: JSON.stringify(["DIG", "blended rate", "rate", "hourly", "team"]),
      category: "pricing"
    },
    {
      questions: JSON.stringify([
        "What is the maintenance cost?",
        "How much is maintenance?",
        "Annual maintenance cost",
        "Ongoing maintenance pricing"
      ]),
      answer: "Maintenance costs vary by system complexity. Typical annual maintenance ranges from $10,000-$50,000 depending on the scope. Please consult with your account manager for specific estimates.",
      keywords: JSON.stringify(["maintenance", "cost", "annual", "ongoing", "support"]),
      category: "pricing"
    },
    {
      questions: JSON.stringify([
        "What are the approval thresholds?",
        "When do I need COO approval?",
        "When do I need CEO approval?",
        "Approval requirements"
      ]),
      answer: "COO approval is required for deals with total costs exceeding $100,000. CEO approval is required for deals exceeding $250,000. These thresholds can be customized in the calculator settings.",
      keywords: JSON.stringify(["approval", "threshold", "COO", "CEO", "requirements"]),
      category: "process"
    },
    {
      questions: JSON.stringify([
        "How do I calculate licensing costs?",
        "What goes into licensing?",
        "License pricing"
      ]),
      answer: "Licensing costs include: Base cost ($/month) + (Cost per user × Number of users) × Loan term in months. Enter these values in the Licensing Costs section of the calculator.",
      keywords: JSON.stringify(["licensing", "license", "cost", "calculate", "pricing"]),
      category: "howto"
    }
  ];

  sampleData.forEach(data => {
    insert.run(data.questions, data.answer, data.keywords, data.category);
  });

  console.log('Sample knowledge data seeded');
}

module.exports = { db, initDatabase };
