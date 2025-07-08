import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiCode } = FiIcons;

const CodeSnippets = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [formData, setFormData] = useState({
    location: 'head',
    content: '',
    enabled: true
  });

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const { data, error } = await supabase
        .from('site_snippets_gt86aero2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSnippets(data || []);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      alert('Please enter snippet content');
      return;
    }

    try {
      let result;
      if (editingSnippet) {
        result = await supabase
          .from('site_snippets_gt86aero2024')
          .update(formData)
          .eq('id', editingSnippet.id);
      } else {
        result = await supabase
          .from('site_snippets_gt86aero2024')
          .insert([formData]);
      }

      if (result.error) throw result.error;

      setFormData({ location: 'head', content: '', enabled: true });
      setEditingSnippet(null);
      fetchSnippets();
      
      alert(editingSnippet ? 'Snippet updated successfully!' : 'Snippet created successfully!');
    } catch (error) {
      console.error('Error saving snippet:', error);
      alert('Error saving snippet');
    }
  };

  const editSnippet = (snippet) => {
    setEditingSnippet(snippet);
    setFormData({
      location: snippet.location,
      content: snippet.content,
      enabled: snippet.enabled
    });
  };

  const cancelEdit = () => {
    setEditingSnippet(null);
    setFormData({ location: 'head', content: '', enabled: true });
  };

  const toggleEnabled = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('site_snippets_gt86aero2024')
        .update({ enabled: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setSnippets(snippets.map(snippet => 
        snippet.id === id ? { ...snippet, enabled: !currentStatus } : snippet
      ));
    } catch (error) {
      console.error('Error updating snippet:', error);
      alert('Error updating snippet status');
    }
  };

  const deleteSnippet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      const { error } = await supabase
        .from('site_snippets_gt86aero2024')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSnippets(snippets.filter(snippet => snippet.id !== id));
    } catch (error) {
      console.error('Error deleting snippet:', error);
      alert('Error deleting snippet');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Code Snippets</h1>
        <p className="text-gray-600 mt-1">Manage custom code injection for your site</p>
      </div>

      {/* Add/Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editingSnippet ? 'Edit Snippet' : 'Add New Snippet'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Injection Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="head">Head Section</option>
                <option value="body">Body Section</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
                Enabled
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
              placeholder="Enter your HTML, CSS, or JavaScript code here..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {editingSnippet ? 'Update Snippet' : 'Add Snippet'}
            </button>
            {editingSnippet && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Snippets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Snippets</h3>
        </div>

        {snippets.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiCode} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No code snippets yet</h3>
            <p className="text-gray-600">Add your first code snippet to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {snippets.map((snippet) => (
              <div key={snippet.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        snippet.location === 'head' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {snippet.location === 'head' ? 'Head' : 'Body'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        snippet.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {snippet.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <pre className="bg-gray-50 p-3 rounded-lg text-sm font-mono overflow-x-auto max-h-32 overflow-y-auto">
                      {snippet.content}
                    </pre>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => editSnippet(snippet)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit Snippet"
                    >
                      <SafeIcon icon={FiEdit} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleEnabled(snippet.id, snippet.enabled)}
                      className="text-green-600 hover:text-green-700"
                      title={snippet.enabled ? 'Disable' : 'Enable'}
                    >
                      <SafeIcon icon={snippet.enabled ? FiEyeOff : FiEye} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSnippet(snippet.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete Snippet"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CodeSnippets;