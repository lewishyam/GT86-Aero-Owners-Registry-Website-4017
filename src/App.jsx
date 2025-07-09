import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from './hooks/useSiteSettings';
import { supabase } from './config/supabase';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import CodeInjection from './components/Layout/CodeInjection';
import DebugPanel from './components/Debug/DebugPanel';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import DirectoryPage from './pages/DirectoryPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import MemberProfilePage from './pages/MemberProfilePage';
// Admin imports
import AdminRoute from './components/Admin/AdminRoute';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import SiteSettings from './pages/Admin/SiteSettings';
import BlogManagement from './pages/Admin/BlogManagement';
import BlogEditor from './pages/Admin/BlogEditor';
import MemberManagement from './pages/Admin/MemberManagement';
import CodeSnippets from './pages/Admin/CodeSnippets';
import './App.css';
import { useAdmin } from './hooks/useAdmin';

// A debug component to check table status
const DatabaseDebugger = () => {
  const [status, setStatus] = useState('checking...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // First check Supabase connection
        console.log('Testing Supabase connection...');
        const { data: connectionTest, error: connectionError } = await supabase.from('owners').select('count(*)');
        
        if (connectionError) {
          console.error('Connection error:', connectionError);
          setStatus('connection error');
          setError(connectionError);
          return;
        }
        
        console.log('Connection successful!');
        setStatus('connected');
        
        // Now check for some data
        const { data, error } = await supabase.from('owners').select('*').limit(1);
        
        if (error) {
          console.error('Data query error:', error);
          setStatus('query error');
          setError(error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Data found:', data);
          setStatus('data found');
        } else {
          console.log('No data found');
          setStatus('no data');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('unexpected error');
        setError(err);
      }
    };
    
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        
        <div className="mb-6">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'data found' ? 'bg-green-100 text-green-800' : 
            status === 'connected' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            Status: {status}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Connection Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-mono text-sm">URL: {supabase.supabaseUrl}</p>
              <p className="font-mono text-sm">Key: {supabase.supabaseKey ? '✓ Present' : '✗ Missing'}</p>
            </div>
          </div>
          
          {error && (
            <div>
              <h2 className="text-lg font-semibold mb-2 text-red-600">Error Details</h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Next Steps</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Check if the <code className="bg-gray-100 px-1 rounded">owners</code> table exists</li>
              <li>Verify that anonymous access is enabled for this table</li>
              <li>Ensure RLS policies are correctly configured</li>
              <li>Check for any typos in table name references</li>
            </ul>
          </div>
          
          <div className="pt-4 flex space-x-4">
            <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Back to Homepage
            </a>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Refresh Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { settings } = useSiteSettings();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    // Update document title
    if (settings.site_title) {
      document.title = settings.site_title;
    }
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && settings.meta_description) {
      metaDescription.setAttribute('content', settings.meta_description);
    }
    
    // Update favicon
    if (settings.favicon_url) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.favicon_url;
    }
  }, [settings]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <CodeInjection location="head" />
        
        <Routes>
          {/* Database Debug Route */}
          <Route path="/debug/database" element={<DatabaseDebugger />} />
          
          {/* Admin Routes (Protected) */}
          <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="blog/new" element={<BlogEditor />} />
            <Route path="blog/edit/:id" element={<BlogEditor />} />
            <Route path="members" element={<MemberManagement />} />
            <Route path="snippets" element={<CodeSnippets />} />
          </Route>
          
          {/* Public Routes with Header/Footer */}
          <Route path="*" element={<>
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/member/:username" element={<MemberProfilePage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </>} />
        </Routes>
        
        <CodeInjection location="body" />
        {isAdmin && <DebugPanel />}
      </div>
    </Router>
  );
}

export default App;