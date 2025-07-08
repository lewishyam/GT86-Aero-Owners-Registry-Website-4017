import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiUpload, FiTrash2 } = FiIcons;

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    homepage_tagline: '',
    homepage_intro: '',
    hero_cta: '',
    site_logo_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content_gt86aero2024')
        .select('*')
        .in('key', ['homepage_tagline', 'homepage_intro', 'hero_cta', 'site_logo_url']);

      if (error) throw error;

      const settingsObj = {};
      data.forEach(item => {
        settingsObj[item.key] = item.value || '';
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `site/logo-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('owner_photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('owner_photos')
        .getPublicUrl(fileName);

      setSettings(prev => ({
        ...prev,
        site_logo_url: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({
      ...prev,
      site_logo_url: ''
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content_gt86aero2024')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-1">Manage your site's content and branding</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Homepage Content</h2>
        
        <div className="space-y-6">
          {/* Homepage Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homepage Tagline
            </label>
            <input
              type="text"
              value={settings.homepage_tagline}
              onChange={(e) => handleInputChange('homepage_tagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="The main tagline shown on the homepage"
            />
          </div>

          {/* Homepage Intro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homepage Introduction
            </label>
            <textarea
              value={settings.homepage_intro}
              onChange={(e) => handleInputChange('homepage_intro', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="The introduction text shown below the tagline"
            />
          </div>

          {/* Hero CTA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Call-to-Action Button Text
            </label>
            <input
              type="text"
              value={settings.hero_cta}
              onChange={(e) => handleInputChange('hero_cta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Text for the main action button"
            />
          </div>

          {/* Site Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Logo
            </label>
            
            {settings.site_logo_url ? (
              <div className="flex items-center space-x-4">
                <img 
                  src={settings.site_logo_url} 
                  alt="Site Logo" 
                  className="h-16 w-16 object-contain bg-gray-50 rounded-lg p-2"
                />
                <button
                  onClick={removeLogo}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  <span>Remove Logo</span>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiUpload} className="h-5 w-5" />
                  <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <SafeIcon icon={FiSave} className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteSettings;