import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from './hooks/useSiteSettings';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import CodeInjection from './components/Layout/CodeInjection';
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

function App() {
  const { settings } = useSiteSettings();

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
          {/* Admin Routes (Protected) */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="blog/new" element={<BlogEditor />} />
            <Route path="blog/edit/:id" element={<BlogEditor />} />
            <Route path="members" element={<MemberManagement />} />
            <Route path="snippets" element={<CodeSnippets />} />
          </Route>

          {/* Public Routes with Header/Footer */}
          <Route
            path="*"
            element={
              <>
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
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
        
        <CodeInjection location="body" />
      </div>
    </Router>
  );
}

export default App;