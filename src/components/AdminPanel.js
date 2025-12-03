import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, BarChart3 } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api`;
const ADMIN_TOKEN = 'dev-admin-token-12345'; // TODO: Replace with Entra ID

export default function AdminPanel() {
  const [knowledge, setKnowledge] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [formData, setFormData] = useState({
    question_variants: [''],
    answer: '',
    keywords: [''],
    category: 'pricing'
  });

  useEffect(() => {
    fetchKnowledge();
    fetchAnalytics();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/knowledge`, {
        headers: { 'x-admin-token': ADMIN_TOKEN }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch knowledge:', response.status, response.statusText);
        setKnowledge([]);
        return;
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setKnowledge(data);
      } else {
        console.error('Invalid knowledge data format:', data);
        setKnowledge([]);
      }
    } catch (error) {
      console.error('Failed to fetch knowledge:', error);
      setKnowledge([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: { 'x-admin-token': ADMIN_TOKEN }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = editingEntry
      ? `${API_URL}/admin/knowledge/${editingEntry.id}`
      : `${API_URL}/admin/knowledge`;
    
    const method = editingEntry ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({
          ...formData,
          question_variants: formData.question_variants.filter(q => q.trim()),
          keywords: formData.keywords.filter(k => k.trim())
        })
      });

      if (response.ok) {
        await fetchKnowledge();
        resetForm();
        alert(editingEntry ? 'Entry updated!' : 'Entry created!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      question_variants: entry.question_variants,
      answer: entry.answer,
      keywords: entry.keywords,
      category: entry.category
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': ADMIN_TOKEN }
      });

      if (response.ok) {
        await fetchKnowledge();
        alert('Entry deleted!');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete entry');
    }
  };

  const resetForm = () => {
    setFormData({
      question_variants: [''],
      answer: '',
      keywords: [''],
      category: 'pricing'
    });
    setIsEditing(false);
    setEditingEntry(null);
  };

  const addField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Knowledge Base Admin</h1>
              <p className="text-slate-600">Manage RORAC Assistant responses</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Add New'}
              </button>
            </div>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && analytics && (
            <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold mb-4">Usage Analytics</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-slate-600">Total Queries</div>
                  <div className="text-2xl font-bold">{analytics.totalQueries}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-slate-600">Top Query</div>
                  <div className="text-sm font-semibold">{analytics.topQueries[0]?.user_query || 'N/A'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-slate-600">Unmatched</div>
                  <div className="text-2xl font-bold">{analytics.unmatchedQueries.length}</div>
                </div>
              </div>
              {analytics.unmatchedQueries.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Unmatched Queries (Add to KB!):</h4>
                  <ul className="space-y-1 text-sm">
                    {analytics.unmatchedQueries.slice(0, 5).map((q, i) => (
                      <li key={i} className="text-slate-700">• {q.user_query}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="mb-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-xl font-bold mb-4">{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Variants</label>
                  {formData.question_variants.map((q, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => updateField('question_variants', i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                        placeholder="e.g., What is the DIG rate?"
                        required={i === 0}
                      />
                      {formData.question_variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField('question_variants', i)}
                          className="text-red-600 px-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addField('question_variants')}
                    className="text-sm text-green-600 hover:underline"
                  >
                    + Add variant
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Answer</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24"
                    placeholder="The response users will see..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Keywords</label>
                  {formData.keywords.map((k, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={k}
                        onChange={(e) => updateField('keywords', i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                        placeholder="e.g., rate, pricing"
                        required={i === 0}
                      />
                      {formData.keywords.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField('keywords', i)}
                          className="text-red-600 px-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addField('keywords')}
                    className="text-sm text-green-600 hover:underline"
                  >
                    + Add keyword
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="pricing">Pricing</option>
                    <option value="process">Process</option>
                    <option value="howto">How-To</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Knowledge List */}
        <div className="space-y-4">
          {knowledge.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{entry.category}</span>
                    <span className="text-xs text-slate-500">ID: {entry.id}</span>
                  </div>
                  <div className="font-semibold text-slate-800 mb-2">
                    {entry.question_variants[0]}
                  </div>
                  {entry.question_variants.length > 1 && (
                    <div className="text-sm text-slate-600 mb-2">
                      +{entry.question_variants.length - 1} more variants
                    </div>
                  )}
                  <p className="text-slate-700 mb-3">{entry.answer}</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.keywords.map((k, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
