import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiArrowLeft } = FiIcons;

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts_gt86aero2024')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {post.cover_image_url && (
            <div className="aspect-video bg-gray-100">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <SafeIcon icon={FiCalendar} className="h-4 w-4 mr-2" />
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {post.title}
            </h1>
            
            <div className="prose prose-lg max-w-none">
              {post.body.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200">
              <a
                href="/blog"
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
              >
                <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-1" />
                <span>Back to Blog</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPostPage;