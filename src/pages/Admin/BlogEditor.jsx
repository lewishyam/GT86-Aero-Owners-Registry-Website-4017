import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiEye, FiUpload, FiTrash2, FiArrowLeft } = FiIcons;

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    cover_image_url: '',
    body: '',
    published: false
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchPost();
    }
  }, [id, isEdit]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts_gt86aero2024')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFormData(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && !isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `blog/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('owner_photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('owner_photos')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        cover_image_url: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({
      ...prev,
      cover_image_url: ''
    }));
  };

  const handleSave = async (publish = false) => {
    if (!formData.title || !formData.slug || !formData.body) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        published: publish || formData.published
      };

      let result;
      if (isEdit) {
        result = await supabase
          .from('blog_posts_gt86aero2024')
          .update(postData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('blog_posts_gt86aero2024')
          .insert([postData]);
      }

      if (result.error) throw result.error;

      alert(isEdit ? 'Post updated successfully!' : 'Post created successfully!');
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update your blog post' : 'Write a new blog post'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <SafeIcon icon={FiSave} className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <SafeIcon icon={FiEye} className="h-4 w-4" />
            <span>{saving ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter post title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="url-friendly-slug"
            />
            <p className="text-sm text-gray-500 mt-1">
              Will be accessible at: /blog/{formData.slug}
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            
            {formData.cover_image_url ? (
              <div className="space-y-3">
                <img 
                  src={formData.cover_image_url} 
                  alt="Cover" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={removeCoverImage}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  <span>Remove Image</span>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="cover-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="cover-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiUpload} className="h-5 w-5" />
                  <span>{uploading ? 'Uploading...' : 'Upload Cover Image'}</span>
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
              placeholder="Write your blog post content here... (Markdown supported)"
            />
          </div>

          {/* Published Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => handleInputChange('published', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 text-sm text-gray-700">
              Published (visible to public)
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogEditor;