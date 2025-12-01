const express = require('express');
const router = express.Router();
const { searchKnowledge, logChatHistory } = require('../services/searchService');

// POST /api/chat/query - Main chat endpoint
router.post('/query', (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Search knowledge base
    const matches = searchKnowledge(query);
    
    if (matches.length === 0) {
      const fallbackResponse = "I'm sorry, I don't have information about that. Please try rephrasing your question or contact your account manager for assistance.";
      logChatHistory(query, null, fallbackResponse);
      
      return res.json({
        answer: fallbackResponse,
        confidence: 'low',
        suggestions: [
          "What is the DIG blended rate?",
          "What are the approval thresholds?",
          "How do I calculate licensing costs?"
        ]
      });
    }
    
    // Return best match
    const bestMatch = matches[0];
    logChatHistory(query, bestMatch.id, bestMatch.answer);
    
    // Build response with context awareness if provided
    let answer = bestMatch.answer;
    if (context && context.totalCosts) {
      // Add contextual information about approvals
      const cooThreshold = context.cooThreshold || 100000;
      const ceoThreshold = context.ceoThreshold || 250000;
      
      if (query.toLowerCase().includes('approval') || query.toLowerCase().includes('threshold')) {
        const costs = parseFloat(context.totalCosts);
        if (costs >= ceoThreshold) {
          answer += `\n\nBased on your current deal (total costs: $${costs.toLocaleString()}), CEO approval will be required.`;
        } else if (costs >= cooThreshold) {
          answer += `\n\nBased on your current deal (total costs: $${costs.toLocaleString()}), COO approval will be required.`;
        } else {
          answer += `\n\nYour current deal (total costs: $${costs.toLocaleString()}) is below approval thresholds.`;
        }
      }
    }
    
    res.json({
      answer,
      confidence: bestMatch.score > 50 ? 'high' : bestMatch.score > 25 ? 'medium' : 'low',
      category: bestMatch.category,
      relatedQuestions: matches.slice(1, 3).map(m => JSON.parse(m.question_variants)[0])
    });
    
  } catch (error) {
    console.error('Chat query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/history - Get recent chat history
router.get('/history', (req, res) => {
  try {
    const { db } = require('../db/database');
    const limit = parseInt(req.query.limit) || 50;
    
    const history = db.prepare(`
      SELECT user_query, response, timestamp 
      FROM chat_history 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(limit);
    
    res.json(history);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chat/suggestions - Get quick action suggestions
router.get('/suggestions', (req, res) => {
  try {
    const { db } = require('../db/database');
    
    // Get one question from each category
    const suggestions = db.prepare(`
      SELECT DISTINCT category, question_variants
      FROM knowledge
      GROUP BY category
      LIMIT 4
    `).all();
    
    const formatted = suggestions.map(s => {
      const variants = JSON.parse(s.question_variants);
      return {
        category: s.category,
        question: variants[0]
      };
    });
    
    res.json(formatted);
  } catch (error) {
    console.error('Suggestions fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
