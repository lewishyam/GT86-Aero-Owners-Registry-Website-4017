import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiUpload, FiTrash2 } = FiIcons;

const SiteSettings = () => {
  const { settings, updateSetting, refreshSettings } = useSiteSettings();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, favicon: false });

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = type === 'favicon' ? 1024 * 1024 : 2 * 1024 * 1024; // 1MB for favicon, 2MB for logo

    if (file.size > maxSize) {
      alert(`File must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      console.log(`Uploading ${type} file:`, file.name);
      const fileName = `site/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage
        .from('owner_photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('owner_photos')
        .getPublicUrl(fileName);

      const settingKey = type === 'logo' ? 'site_logo_url' : 'favicon_url';
      setFormData(prev => ({ ...prev, [settingKey]: publicUrl }));
      
      // Auto-save uploaded files
      console.log(`Auto-saving ${type} URL:`, publicUrl);
      await updateSetting(settingKey, publicUrl);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Error uploading ${type}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeFile = async (type) => {
    const settingKey = type === 'logo' ? 'site_logo_url' : 'favicon_url';
    console.log(`Removing ${type}`);
    setFormData(prev => ({ ...prev, [settingKey]: '' }));
    await updateSetting(settingKey, '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving site settings:', formData);
      const updates = Object.entries(formData).filter(([key, value]) => settings[key] !== value);
      
      for (const [key, value] of updates) {
        console.log(`Updating setting: ${key} = ${value}`);
        await updateSetting(key, value);
      }
      
      await refreshSettings();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600 mt-1">Manage your site's content and branding</p>
      </div>

      {/* Site Identity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Site Identity</h2>
        <div className="space-y-6">
          {/* Site Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Title
            </label>
            <input
              type="text"
              value={formData.site_title || ''}
              onChange={(e) => handleInputChange('site_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="GT86 Aero Owners Club - The Definitive Registry"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description (SEO)
            </label>
            <textarea
              value={formData.meta_description || ''}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="The exclusive community for Toyota GT86 Aero owners..."
            />
          </div>

          {/* Site Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Logo
            </label>
            {formData.site_logo_url ? (
              <div className="flex items-center space-x-4">
                <img
                  src={formData.site_logo_url}
                  alt="Site Logo"
                  className="h-16 w-16 object-contain bg-gray-50 rounded-lg p-2"
                />
                <button
                  onClick={() => removeFile('logo')}
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
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                  id="logo-upload"
                  disabled={uploading.logo}
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiUpload} className="h-5 w-5" />
                  <span>{uploading.logo ? 'Uploading...' : 'Upload Logo'}</span>
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
              </div>
            )}
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            {formData.favicon_url ? (
              <div className="flex items-center space-x-4">
                <img
                  src={formData.favicon_url}
                  alt="Favicon"
                  className="h-8 w-8 object-contain bg-gray-50 rounded p-1"
                />
                <button
                  onClick={() => removeFile('favicon')}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  <span>Remove Favicon</span>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'favicon')}
                  className="hidden"
                  id="favicon-upload"
                  disabled={uploading.favicon}
                />
                <label
                  htmlFor="favicon-upload"
                  className="cursor-pointer inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiUpload} className="h-5 w-5" />
                  <span>{uploading.favicon ? 'Uploading...' : 'Upload Favicon'}</span>
                </label>
                <p className="text-sm text-gray-500 mt-2">ICO, PNG up to 1MB</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Homepage Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Homepage Content</h2>
        <div className="space-y-6">
          {/* Main Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Heading
            </label>
            <input
              type="text"
              value={formData.homepage_main_heading || ''}
              onChange={(e) => handleInputChange('homepage_main_heading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="GT86 Aero Owners Club"
            />
          </div>

          {/* Sub Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Heading
            </label>
            <input
              type="text"
              value={formData.homepage_sub_heading || ''}
              onChange={(e) => handleInputChange('homepage_sub_heading', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="The Definitive Registry for Toyota GT86 Aero Owners"
            />
          </div>

          {/* Homepage Tagline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homepage Tagline
            </label>
            <input
              type="text"
              value={formData.homepage_tagline || ''}
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
              value={formData.homepage_intro || ''}
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
              value={formData.hero_cta || ''}
              onChange={(e) => handleInputChange('hero_cta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Register Your Aero"
            />
          </div>

          {/* Footer Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Text
            </label>
            <input
              type="text"
              value={formData.footer_text || ''}
              onChange={(e) => handleInputChange('footer_text', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Made with ❤️ for the GT86 Aero community"
            />
          </div>
        </div>
      </motion.div>

      {/* Footer Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Footer Stats Section</h2>
        <div className="space-y-6">
          {/* Stats Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stats Section Title
            </label>
            <input
              type="text"
              value={formData.footer_stats_title || ''}
              onChange={(e) => handleInputChange('footer_stats_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Registry Stats"
            />
          </div>

          {/* Production Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Statistics Line
            </label>
            <input
              type="text"
              value={formData.footer_stats_production || ''}
              onChange={(e) => handleInputChange('footer_stats_production', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="~200 UK Aeros produced"
            />
          </div>

          {/* Years Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Years Line
            </label>
            <input
              type="text"
              value={formData.footer_stats_years || ''}
              onChange={(e) => handleInputChange('footer_stats_years', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="2015-2016 model years"
            />
          </div>

          {/* Global Registry Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registry Scope Line
            </label>
            <input
              type="text"
              value={formData.footer_stats_global || ''}
              onChange={(e) => handleInputChange('footer_stats_global', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Global registry"
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
};

export default SiteSettings;