const natural = require('natural');
const { db } = require('../db/database');

// Tokenizer and stemmer for better matching
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Synonyms for common terms
const synonyms = {
  'cost': ['price', 'pricing', 'rate', 'fee', 'charge'],
  'rate': ['cost', 'price', 'pricing'],
  'team': ['group', 'department'],
  'maintenance': ['support', 'ongoing', 'upkeep'],
  'approval': ['authorization', 'sign-off', 'permission'],
};

function expandWithSynonyms(word) {
  const lower = word.toLowerCase();
  const synList = [lower];
  
  // Check if word is a key
  if (synonyms[lower]) {
    synList.push(...synonyms[lower]);
  }
  
  // Check if word is a value in any synonym list
  for (const [key, values] of Object.entries(synonyms)) {
    if (values.includes(lower)) {
      synList.push(key);
      synList.push(...values);
    }
  }
  
  return [...new Set(synList)];
}

function extractKeywords(query) {
  const tokens = tokenizer.tokenize(query.toLowerCase());
  const keywords = [];
  
  tokens.forEach(token => {
    const stemmed = stemmer.stem(token);
    keywords.push(stemmed);
    
    // Add synonyms
    const syns = expandWithSynonyms(token);
    syns.forEach(syn => keywords.push(stemmer.stem(syn)));
  });
  
  return [...new Set(keywords)];
}

function calculateMatchScore(userKeywords, knowledgeKeywords, questionVariants, userQuery) {
  let score = 0;
  
  // Parse stored keywords
  const dbKeywords = JSON.parse(knowledgeKeywords).map(k => 
    stemmer.stem(k.toLowerCase())
  );
  
  // Parse question variants
  const variants = JSON.parse(questionVariants);
  
  // Keyword matching (most important)
  userKeywords.forEach(uk => {
    if (dbKeywords.includes(uk)) {
      score += 10;
    }
  });
  
  // Exact phrase matching in variants (bonus)
  const lowerQuery = userQuery.toLowerCase();
  variants.forEach(variant => {
    if (variant.toLowerCase().includes(lowerQuery)) {
      score += 50; // High bonus for exact match
    } else {
      // Partial matching
      const variantTokens = tokenizer.tokenize(variant.toLowerCase());
      const matchingTokens = variantTokens.filter(vt => 
        userKeywords.includes(stemmer.stem(vt))
      );
      score += matchingTokens.length * 5;
    }
  });
  
  return score;
}

function searchKnowledge(query, threshold = 10) {
  const userKeywords = extractKeywords(query);
  
  // Get all knowledge entries
  const allKnowledge = db.prepare('SELECT * FROM knowledge').all();
  
  // Score each entry
  const scored = allKnowledge.map(entry => ({
    ...entry,
    score: calculateMatchScore(
      userKeywords,
      entry.keywords,
      entry.question_variants,
      query
    )
  }));
  
  // Filter and sort by score
  const matches = scored
    .filter(entry => entry.score >= threshold)
    .sort((a, b) => b.score - a.score);
  
  return matches;
}

function logChatHistory(userQuery, matchedQuestionId, response) {
  const insert = db.prepare(`
    INSERT INTO chat_history (user_query, matched_question_id, response)
    VALUES (?, ?, ?)
  `);
  
  insert.run(userQuery, matchedQuestionId, response);
}

module.exports = {
  searchKnowledge,
  logChatHistory
};
