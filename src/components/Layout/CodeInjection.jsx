import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const CodeInjection = ({ location }) => {
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    fetchSnippets();
  }, [location]);

  const fetchSnippets = async () => {
    try {
      const { data, error } = await supabase
        .from('site_snippets_gt86aero2024')
        .select('content')
        .eq('location', location)
        .eq('enabled', true);

      if (error) throw error;
      setSnippets(data || []);
    } catch (error) {
      console.error('Error fetching code snippets:', error);
    }
  };

  if (snippets.length === 0) return null;

  return (
    <>
      {snippets.map((snippet, index) => (
        <div
          key={index}
          dangerouslySetInnerHTML={{ __html: snippet.content }}
        />
      ))}
    </>
  );
};

export default CodeInjection;