import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState({
    homepage_tagline: '',
    homepage_intro: '',
    hero_cta: '',
    site_logo_url: '',
    favicon_url: '',
    meta_description: '',
    site_title: '',
    homepage_main_heading: '',
    homepage_sub_heading: '',
    footer_text: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Fetching site settings');
      const { data, error } = await supabase
        .from('site_content')
        .select('*');

      if (error) throw error;
      
      console.log('Site settings fetched:', data);
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

  const updateSetting = async (key, value) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  };

  return { settings, loading, updateSetting, refreshSettings: fetchSettings };
};