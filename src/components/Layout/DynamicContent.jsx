import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const DynamicContent = ({ contentKey, defaultValue = '', className = '' }) => {
  const [content, setContent] = useState(defaultValue);

  useEffect(() => {
    fetchContent();
  }, [contentKey]);

  const fetchContent = async () => {
    try {
      console.log('Fetching content for key:', contentKey);
      const { data, error } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', contentKey)
        .single();

      if (error) {
        console.error('Error fetching content:', error);
        return;
      }
      
      console.log('Content fetched:', data);
      setContent(data.value || defaultValue);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  if (!content) return null;

  return <span className={className}>{content}</span>;
};

export default DynamicContent;