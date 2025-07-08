import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiArrowRight } = FiIcons;

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('Fetching published blog posts');
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Blog posts fetched:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            GT86 Aero Blog
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Latest news, stories, and insights from the GT86 Aero community
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600">Check back soon for community stories and updates!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="md:flex">
                  {post.cover_image_url && (
                    <div className="md:w-1/3">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${post.cover_image_url ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <SafeIcon icon={FiCalendar} className="h-4 w-4 mr-2" />
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      <Link to={`/blog/${post.slug}`} className="hover:text-red-600 transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.body.substring(0, 150)}...
                    </p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                    >
                      <span>Read more</span>
                      <SafeIcon icon={FiArrowRight} className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;