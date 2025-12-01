const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { verifyAzureToken, requireAdmin: requireAdminRole, legacyAuth } = require('../middleware/auth');

// Auth middleware: Try Azure token first, fall back to legacy for development
function requireAdmin(req, res, next) {
  // Check if using legacy x-admin-token header
  if (req.headers['x-admin-token']) {
    return legacyAuth(req, res, next);
  }
  
  // Otherwise use Azure token
  verifyAzureToken(req, res, (err) => {
    if (err) return next(err);
    requireAdminRole(req, res, next);
  });
}

// GET /api/admin/knowledge - List all knowledge entries
router.get('/knowledge', requireAdmin, (req, res) => {
  try {
    const entries = db.prepare('SELECT * FROM knowledge ORDER BY created_at DESC').all();
    
    // Parse JSON fields for easier consumption
    const formatted = entries.map(entry => ({
      ...entry,
      question_variants: JSON.parse(entry.question_variants),
      keywords: JSON.parse(entry.keywords)
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Knowledge list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/knowledge/:id - Get single knowledge entry
router.get('/knowledge/:id', requireAdmin, (req, res) => {
  try {
    const entry = db.prepare('SELECT * FROM knowledge WHERE id = ?').get(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    res.json({
      ...entry,
      question_variants: JSON.parse(entry.question_variants),
      keywords: JSON.parse(entry.keywords)
    });
  } catch (error) {
    console.error('Knowledge get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/knowledge - Create new knowledge entry
router.post('/knowledge', requireAdmin, (req, res) => {
  try {
    const { question_variants, answer, keywords, category, created_by } = req.body;
    
    if (!question_variants || !answer || !keywords || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const insert = db.prepare(`
      INSERT INTO knowledge (question_variants, answer, keywords, category, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(
      JSON.stringify(question_variants),
      answer,
      JSON.stringify(keywords),
      category,
      created_by || 'admin'
    );
    
    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Knowledge entry created successfully'
    });
  } catch (error) {
    console.error('Knowledge create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/knowledge/:id - Update knowledge entry
router.put('/knowledge/:id', requireAdmin, (req, res) => {
  try {
    const { question_variants, answer, keywords, category } = req.body;
    
    const update = db.prepare(`
      UPDATE knowledge 
      SET question_variants = ?, 
          answer = ?, 
          keywords = ?, 
          category = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(
      JSON.stringify(question_variants),
      answer,
      JSON.stringify(keywords),
      category,
      req.params.id
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    res.json({ message: 'Knowledge entry updated successfully' });
  } catch (error) {
    console.error('Knowledge update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/knowledge/:id - Delete knowledge entry
router.delete('/knowledge/:id', requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM knowledge WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Knowledge entry not found' });
    }
    
    res.json({ message: 'Knowledge entry deleted successfully' });
  } catch (error) {
    console.error('Knowledge delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/analytics - Get usage analytics
router.get('/analytics', requireAdmin, (req, res) => {
  try {
    const totalQueries = db.prepare('SELECT COUNT(*) as count FROM chat_history').get();
    const recentQueries = db.prepare(`
      SELECT user_query, COUNT(*) as frequency
      FROM chat_history
      GROUP BY user_query
      ORDER BY frequency DESC
      LIMIT 10
    `).all();
    
    const unmatchedQueries = db.prepare(`
      SELECT user_query, timestamp
      FROM chat_history
      WHERE matched_question_id IS NULL
      ORDER BY timestamp DESC
      LIMIT 20
    `).all();
    
    res.json({
      totalQueries: totalQueries.count,
      topQueries: recentQueries,
      unmatchedQueries
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
