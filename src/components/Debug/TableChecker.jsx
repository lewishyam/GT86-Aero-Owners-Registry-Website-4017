import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

const TableChecker = ({ tableName = 'owners' }) => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [tables, setTables] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkTable();
    listTables();
  }, [tableName]);

  const checkTable = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      // Try to get a count from the table
      const { data: countResult, error: countError } = await supabase
        .from(tableName)
        .select('count(*)', { count: 'exact', head: true });
      
      if (countError) {
        console.error(`Error checking table ${tableName}:`, countError);
        setStatus('error');
        setError(countError);
        return;
      }
      
      // Try to get one record
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.error(`Error fetching sample data from ${tableName}:`, sampleError);
        setStatus('error');
        setError(sampleError);
        return;
      }
      
      setData(sampleData);
      setStatus('success');
    } catch (err) {
      console.error('Unexpected error checking table:', err);
      setStatus('error');
      setError(err);
    }
  };

  const listTables = async () => {
    try {
      // This is a system query to get all tables
      const { data, error } = await supabase.rpc('get_all_tables');
      
      if (error) {
        console.error('Error listing tables:', error);
        return;
      }
      
      // If the RPC function doesn't exist, we'll try a different approach
      if (!data) {
        // Try to query some common tables to see what exists
        const testTables = ['owners', 'owners_gt86aero2024', 'site_content', 'admins', 'blog_posts'];
        const tableResults = [];
        
        for (const table of testTables) {
          const { error: tableError } = await supabase
            .from(table)
            .select('count(*)', { count: 'exact', head: true });
            
          if (!tableError) {
            tableResults.push(table);
          }
        }
        
        setTables(tableResults);
        return;
      }
      
      setTables(data);
    } catch (err) {
      console.error('Error listing tables:', err);
    }
  };

  const statusColors = {
    checking: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">Table Check: <code className="font-mono">{tableName}</code></h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status === 'checking' ? 'Checking...' : status === 'success' ? 'Table Exists' : 'Error'}
        </span>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 rounded text-xs">
          <p className="font-semibold text-red-700">Error:</p>
          <pre className="mt-1 text-red-600 overflow-x-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {data && data.length > 0 && (
        <div className="mt-2">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
          >
            {expanded ? 'Hide' : 'Show'} Sample Data
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expanded && (
            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
              {JSON.stringify(data[0], null, 2)}
            </pre>
          )}
        </div>
      )}
      
      {tables.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Available tables:</p>
          <div className="flex flex-wrap gap-1">
            {tables.map(table => (
              <span 
                key={typeof table === 'string' ? table : table.name} 
                className={`px-2 py-0.5 rounded-full text-xs ${
                  (typeof table === 'string' ? table : table.name) === tableName 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {typeof table === 'string' ? table : table.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <button 
        onClick={checkTable}
        className="mt-3 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium"
      >
        Refresh
      </button>
    </div>
  );
};

export default TableChecker;