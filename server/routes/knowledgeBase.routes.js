const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const supabase = require('../supabaseClient');
const logger = require('../utils/logger');

/**
 * GET /api/knowledge-base
 * List all knowledge base entries
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { subject, topic, source_type } = req.query;
    
    let query = supabase
      .from('question_sources')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (subject) query = query.eq('subject', subject);
    if (topic) query = query.ilike('topic', `%${topic}%`);
    if (source_type) query = query.eq('source_type', source_type);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get knowledge base error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/knowledge-base
 * Add new knowledge base entry
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { subject, topic, content, source_type, difficulty, metadata } = req.body;
    
    if (!subject || !topic || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Subject, topic, and content are required' 
      });
    }
    
    if (content.length < 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content must be at least 100 characters' 
      });
    }
    
    const { data, error } = await supabase
      .from('question_sources')
      .insert({
        subject,
        topic,
        content,
        source_type: source_type || 'textbook',
        difficulty: difficulty || 'medium',
        metadata: metadata || {},
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    logger.info('Knowledge base entry created', { id: data.id, subject, topic });
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Create knowledge base error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/knowledge-base/:id
 * Update knowledge base entry
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, topic, content, source_type, difficulty, is_active, metadata } = req.body;
    
    const updates = {};
    if (subject) updates.subject = subject;
    if (topic) updates.topic = topic;
    if (content) updates.content = content;
    if (source_type) updates.source_type = source_type;
    if (difficulty) updates.difficulty = difficulty;
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (metadata) updates.metadata = metadata;
    
    const { data, error } = await supabase
      .from('question_sources')
      .update(updates)
      .eq('id', id)
      .eq('created_by', req.user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entry not found or you do not have permission' 
      });
    }
    
    logger.info('Knowledge base entry updated', { id });
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Update knowledge base error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/knowledge-base/:id
 * Soft delete (deactivate) knowledge base entry
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('question_sources')
      .update({ is_active: false })
      .eq('id', id)
      .eq('created_by', req.user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entry not found or you do not have permission' 
      });
    }
    
    logger.info('Knowledge base entry deleted', { id });
    res.json({ success: true, message: 'Entry deactivated' });
  } catch (error) {
    logger.error('Delete knowledge base error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/knowledge-base/subjects
 * Get list of available subjects
 */
router.get('/subjects', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('question_sources')
      .select('subject')
      .eq('is_active', true);
    
    if (error) throw error;
    
    const subjects = [...new Set(data.map(item => item.subject))].sort();
    
    res.json({ success: true, data: subjects });
  } catch (error) {
    logger.error('Get subjects error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/knowledge-base/topics/:subject
 * Get topics for a subject
 */
router.get('/topics/:subject', authenticate, async (req, res) => {
  try {
    const { subject } = req.params;
    
    const { data, error } = await supabase
      .from('question_sources')
      .select('topic')
      .eq('subject', subject)
      .eq('is_active', true);
    
    if (error) throw error;
    
    const topics = [...new Set(data.map(item => item.topic))].sort();
    
    res.json({ success: true, data: topics });
  } catch (error) {
    logger.error('Get topics error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
