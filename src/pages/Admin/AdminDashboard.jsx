import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiEdit3, FiSettings, FiCode, FiTrendingUp, FiEye } = FiIcons;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    publicMembers: 0,
    featuredMembers: 0,
    blogPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    codeSnippets: 0,
    enabledSnippets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching admin dashboard stats');
      
      // Get member stats
      const { data: members } = await supabase
        .from('owners')
        .select('public_profile, featured');
      
      console.log('Members stats fetched:', members);

      // Get blog stats
      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('published');
        
      console.log('Blog stats fetched:', blogs);

      // Get snippet stats
      const { data: snippets } = await supabase
        .from('site_snippets')
        .select('enabled');
        
      console.log('Snippet stats fetched:', snippets);

      setStats({
        totalMembers: members?.length || 0,
        publicMembers: members?.filter(m => m.public_profile).length || 0,
        featuredMembers: members?.filter(m => m.featured).length || 0,
        blogPosts: blogs?.length || 0,
        publishedPosts: blogs?.filter(b => b.published).length || 0,
        draftPosts: blogs?.filter(b => !b.published).length || 0,
        codeSnippets: snippets?.length || 0,
        enabledSnippets: snippets?.filter(s => s.enabled).length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Site Settings',
      description: 'Update homepage content and branding',
      href: '/admin/settings',
      icon: FiSettings,
      color: 'bg-blue-500'
    },
    {
      name: 'New Blog Post',
      description: 'Create a new blog post',
      href: '/admin/blog/new',
      icon: FiEdit3,
      color: 'bg-green-500'
    },
    {
      name: 'Manage Members',
      description: 'View and manage member profiles',
      href: '/admin/members',
      icon: FiUsers,
      color: 'bg-purple-500'
    },
    {
      name: 'Code Snippets',
      description: 'Manage custom code injection',
      href: '/admin/snippets',
      icon: FiCode,
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your GT86 Aero community site</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <SafeIcon icon={FiUsers} className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.publicMembers} public • {stats.featuredMembers} featured
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blog Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.blogPosts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <SafeIcon icon={FiEdit3} className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.publishedPosts} published • {stats.draftPosts} drafts
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Code Snippets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.codeSnippets}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <SafeIcon icon={FiCode} className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.enabledSnippets} enabled
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Site Health</p>
              <p className="text-2xl font-bold text-green-600">Good</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            All systems operational
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.href}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <SafeIcon icon={action.icon} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{action.name}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/admin/members" className="text-sm text-red-600 hover:text-red-700">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="bg-green-100 p-2 rounded-full">
              <SafeIcon icon={FiUsers} className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-600">New member registrations available to review</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="bg-blue-100 p-2 rounded-full">
              <SafeIcon icon={FiEye} className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-600">Site content can be updated from Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;