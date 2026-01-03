import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function UploadTextbook() {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    content: '',
    source_type: 'textbook',
    difficulty: 'medium'
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/knowledge-base`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRecentUploads(response.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent uploads:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.content.length < 100) {
      setMessage({ text: 'Content must be at least 100 characters', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/knowledge-base`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage({ text: '✅ Content uploaded successfully!', type: 'success' });
        setFormData({ subject: '', topic: '', content: '', source_type: 'textbook', difficulty: 'medium' });
        loadRecent();
      }
    } catch (error) {
      setMessage({ text: '❌ ' + (error.response?.data?.error || 'Upload failed'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '10px' }}>📚 Upload Textbook Content</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Add content to the knowledge base for AI question generation
      </p>

      {message.text && (
        <div style={{
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            placeholder="e.g., Mathematics, Physics, English"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Topic *</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            required
            placeholder="e.g., Algebra, Mechanics, Grammar"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Textbook Content * (minimum 100 characters)
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            placeholder="Paste your textbook content, syllabus, or study notes here..."
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '200px', fontFamily: 'inherit' }}
          />
          <div style={{ textAlign: 'right', color: '#666', fontSize: '12px', marginTop: '5px' }}>
            {formData.content.length} characters
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Source Type</label>
          <select
            value={formData.source_type}
            onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          >
            <option value="textbook">Textbook</option>
            <option value="syllabus">Syllabus</option>
            <option value="past_questions">Past Questions</option>
            <option value="notes">Notes</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Difficulty Level</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          {loading ? 'Uploading...' : 'Upload Content'}
        </button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h2>📖 Recent Uploads</h2>
        {recentUploads.map((item) => (
          <div key={item.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '10px', background: 'white' }}>
            <h3 style={{ marginBottom: '5px' }}>{item.subject} - {item.topic}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>{item.content.substring(0, 150)}...</p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
              {item.source_type} | {item.difficulty} | {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
