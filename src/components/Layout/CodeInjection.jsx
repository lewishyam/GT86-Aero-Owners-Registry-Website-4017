import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const CodeInjection = ({ location }) => {
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    fetchSnippets();
  }, [location]);

  const fetchSnippets = async () => {
    try {
      console.log('Fetching code snippets for location:', location);
      const { data, error } = await supabase
        .from('site_snippets')
        .select('content')
        .eq('location', location)
        .eq('enabled', true);

      if (error) throw error;
      console.log('Code snippets fetched:', data);
      setSnippets(data || []);
    } catch (error) {
      console.error('Error fetching code snippets:', error);
    }
  };

  if (snippets.length === 0) return null;

  return (
    <>
      {snippets.map((snippet, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: snippet.content }} />
      ))}
    </>
  );
};

export default CodeInjection;