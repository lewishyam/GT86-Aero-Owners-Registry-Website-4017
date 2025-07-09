import React, { useState } from 'react';
import TableChecker from './TableChecker';
import { supabase } from '../../config/supabase';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('tables');
  const [customQuery, setCustomQuery] = useState('SELECT * FROM owners LIMIT 5');
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [isRunningQuery, setIsRunningQuery] = useState(false);

  const runCustomQuery = async () => {
    setIsRunningQuery(true);
    setQueryResult(null);
    setQueryError(null);
    
    try {
      const { data, error } = await supabase.rpc('execute_sql', { query: customQuery });
      
      if (error) {
        console.error('Error running custom query:', error);
        setQueryError(error);
        
        // Try a direct query as fallback (this will only work for simple SELECT queries)
        try {
          const result = await supabase.from(customQuery.split(' ')[3]).select('*').limit(5);
          if (!result.error) {
            setQueryResult(result.data);
            setQueryError({
              message: 'RPC failed, but direct query succeeded. Limited to SELECT operations.',
              original: error
            });
          }
        } catch (directError) {
          // Ignore direct query errors
        }
      } else {
        setQueryResult(data);
      }
    } catch (err) {
      console.error('Unexpected error running query:', err);
      setQueryError(err);
    } finally {
      setIsRunningQuery(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-50"
        title="Debug Tools"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Debug Panel</h2>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-red-700 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'tables' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Tables
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'connection' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Connection
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'query' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Custom Query
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <TableChecker tableName="owners" />
              <TableChecker tableName="owners_gt86aero2024" />
              <TableChecker tableName="site_content" />
              <TableChecker tableName="blog_posts" />
            </div>
          )}
          
          {activeTab === 'connection' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Supabase Connection</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">URL:</span>
                    <code className="ml-2 font-mono bg-gray-50 px-2 py-1 rounded">{supabase.supabaseUrl}</code>
                  </div>
                  <div>
                    <span className="text-gray-500">Anon Key:</span>
                    <code className="ml-2 font-mono bg-gray-50 px-2 py-1 rounded">
                      {supabase.supabaseKey ? `${supabase.supabaseKey.substring(0, 10)}...` : 'Not set'}
                    </code>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Browser Information</h3>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">User Agent:</span> {navigator.userAgent}</div>
                  <div><span className="text-gray-500">Platform:</span> {navigator.platform}</div>
                  <div><span className="text-gray-500">Language:</span> {navigator.language}</div>
                  <div><span className="text-gray-500">Window Size:</span> {window.innerWidth}x{window.innerHeight}</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'query' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Run Custom SQL Query</h3>
                <p className="text-xs text-gray-500 mb-2">
                  Note: This requires the 'execute_sql' RPC function to be enabled in your Supabase project.
                </p>
                <textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="w-full h-32 p-2 border border-gray-300 rounded font-mono text-sm"
                  placeholder="Enter SQL query..."
                />
                <button
                  onClick={runCustomQuery}
                  disabled={isRunningQuery}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  {isRunningQuery ? 'Running...' : 'Run Query'}
                </button>
                
                {queryError && (
                  <div className="mt-3 p-3 bg-red-50 rounded text-sm">
                    <p className="font-semibold text-red-700">Error:</p>
                    <pre className="mt-1 text-red-600 overflow-x-auto text-xs">
                      {JSON.stringify(queryError, null, 2)}
                    </pre>
                  </div>
                )}
                
                {queryResult && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700 mb-2">Results:</h4>
                    <pre className="p-3 bg-gray-50 rounded overflow-x-auto text-xs">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-4 py-3 flex justify-between border-t border-gray-200">
          <a 
            href="/debug/database" 
            target="_blank" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Open Full Debug Page
          </a>
          <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;