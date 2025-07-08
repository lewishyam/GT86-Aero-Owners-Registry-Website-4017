import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import RichTextEditor from '../../components/RichTextEditor';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiEye, FiUpload, FiTrash2, FiArrowLeft, FiPlus, FiX } = FiIcons;

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    cover_image_url: '',
    body: '',
    published: false,
    meta_title: '',
    meta_description: '',
    meta_tags: []
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchPost();
    }
  }, [id, isEdit]);

  const fetchPost = async () => {
    try {
      console.log('Fetching blog post with ID:', id);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      console.log('Blog post fetched:', data);
      setFormData({
        ...data,
        meta_tags: data.meta_tags || []
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === 'title' && !isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }

    // Auto-generate meta_title from title if not set
    if (field === 'title' && !formData.meta_title) {
      setFormData(prev => ({ ...prev, meta_title: value }));
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

      setFormData(prev => ({ ...prev, cover_image_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const removeCoverImage = () => {
    setFormData(prev => ({ ...prev, cover_image_url: '' }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.meta_tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, meta_tags: [...prev.meta_tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, meta_tags: prev.meta_tags.filter(tag => tag !== tagToRemove) }));
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
      console.log('Saving blog post:', postData);

      if (isEdit) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('blog_posts')
          .insert([postData]);
      }

      if (result.error) throw result.error;
      
      console.log('Blog post saved successfully:', result);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <RichTextEditor
                  value={formData.body}
                  onChange={(value) => handleInputChange('body', value)}
                  placeholder="Write your blog post content here..."
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Image</h3>
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
          </motion.div>

          {/* SEO Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="SEO title for search engines"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Brief description for search engines"
                />
              </div>

              {/* Meta Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.meta_tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <SafeIcon icon={FiX} className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Publish Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h3>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;