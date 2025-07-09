import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

const RouteFallback = ({ componentName }) => {
  const location = useLocation();
  const params = useParams();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Component <span className="font-bold">{componentName}</span> is loading, but may be encountering issues.
              </p>
            </div>
          </div>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Route Debugging Information</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Current Path</h3>
            <p className="mt-1 bg-gray-50 p-2 rounded font-mono text-sm">{location.pathname}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Route Parameters</h3>
            <div className="mt-1 bg-gray-50 p-2 rounded font-mono text-sm">
              {Object.keys(params).length > 0 ? (
                <pre>{JSON.stringify(params, null, 2)}</pre>
              ) : (
                <span className="text-gray-400">No parameters</span>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Search Query</h3>
            <p className="mt-1 bg-gray-50 p-2 rounded font-mono text-sm">
              {location.search || <span className="text-gray-400">No search query</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteFallback;