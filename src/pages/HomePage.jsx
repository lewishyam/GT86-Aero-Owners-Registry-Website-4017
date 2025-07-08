import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useSiteSettings } from '../hooks/useSiteSettings';
import SafeIcon from '../common/SafeIcon';
import DynamicContent from '../components/Layout/DynamicContent';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiUsers, FiMapPin, FiInstagram, FiStar } = FiIcons;

const HomePage = () => {
  const { settings } = useSiteSettings();
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [featuredProfiles, setFeaturedProfiles] = useState([]);
  const [stats, setStats] = useState({ total: 0, countries: 0 });

  useEffect(() => {
    fetchRecentProfiles();
    fetchFeaturedProfiles();
    fetchStats();
  }, []);

  const fetchRecentProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('public_profile', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentProfiles(data || []);
    } catch (error) {
      console.error('Error fetching recent profiles:', error);
    }
  };

  const fetchFeaturedProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('public_profile', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedProfiles(data || []);
    } catch (error) {
      console.error('Error fetching featured profiles:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('country')
        .eq('public_profile', true);

      if (error) throw error;

      const total = data?.length || 0;
      const countries = new Set(data?.map(owner => owner.country)).size;
      setStats({ total, countries });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getProfileImage = (profile) => {
    if (profile.photo_urls && profile.photo_urls.length > 0) {
      return profile.photo_urls[0];
    }
    if (profile.instagram_post_urls && profile.instagram_post_urls.length > 0) {
      const postUrl = profile.instagram_post_urls[0];
      const postId = postUrl.split('/p/')[1]?.split('/')[0];
      if (postId) {
        return `https://www.instagram.com/p/${postId}/media/?size=m`;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-red-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {settings.homepage_main_heading || 'GT86 Aero Owners Club'}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-200">
              <DynamicContent 
                contentKey="homepage_tagline" 
                defaultValue={settings.homepage_sub_heading || 'The Definitive Registry for Toyota GT86 Aero Owners'} 
              />
            </p>
            <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
              <DynamicContent 
                contentKey="homepage_intro" 
                defaultValue="Join the exclusive community celebrating one of the rarest GT86 variants. Fewer than 200 UK Aeros were ever made." 
              />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
              >
                <span>
                  <DynamicContent 
                    contentKey="hero_cta" 
                    defaultValue="Register Your Aero" 
                  />
                </span>
                <SafeIcon icon={FiArrowRight} className="h-5 w-5" />
              </Link>
              <Link
                to="/directory"
                className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Directory
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 p-6 rounded-xl"
            >
              <Link to="/directory" className="block hover:bg-gray-100 rounded-xl transition-colors">
                <SafeIcon icon={FiUsers} className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</h3>
                <p className="text-gray-600">Registered Aeros</p>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 p-6 rounded-xl"
            >
              <SafeIcon icon={FiMapPin} className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.countries}</h3>
              <p className="text-gray-600">Countries</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 p-6 rounded-xl"
            >
              <SafeIcon icon={FiInstagram} className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">#GT86AeroClub</h3>
              <p className="text-gray-600">Community Hashtag</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Members */}
      {featuredProfiles.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Members
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Showcasing exceptional GT86 Aero builds from our community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <Link to={`/member/${profile.username}`}>
                    <div className="relative">
                      {getProfileImage(profile) && (
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={getProfileImage(profile)}
                            alt={`${profile.display_name}'s GT86 Aero`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="bg-yellow-500 text-white p-2 rounded-full">
                          <SafeIcon icon={FiStar} className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {profile.display_name}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {profile.year} • {profile.colour} • {profile.country}
                      </p>
                      {profile.featured_quote && (
                        <p className="text-gray-700 italic text-sm">
                          "{profile.featured_quote}"
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Profiles */}
      {recentProfiles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Recent Registrations
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Welcome our newest members to the GT86 Aero family
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link to={`/member/${profile.username}`}>
                    <div className="flex items-center p-6">
                      {getProfileImage(profile) && (
                        <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden mr-4 flex-shrink-0">
                          <img
                            src={getProfileImage(profile)}
                            alt={`${profile.display_name}'s GT86 Aero`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {profile.display_name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{profile.year} • {profile.colour} • {profile.transmission}</p>
                          <p>{profile.country}</p>
                          {profile.instagram_handle && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <SafeIcon icon={FiInstagram} className="h-4 w-4" />
                              <span>@{profile.instagram_handle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/directory"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
              >
                <span>View All Profiles</span>
                <SafeIcon icon={FiArrowRight} className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Community Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Join the Community
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 mb-8">
              Connect with fellow GT86 Aero owners worldwide. Share your build, discover modifications, and celebrate the rarest GT86 variant ever made.
            </p>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Share Your Aero
              </h3>
              <p className="text-gray-600 mb-6">
                Tag your Instagram posts with <span className="font-semibold text-red-600">#GT86AeroClub</span> to connect with the community and showcase your build.
              </p>
              <a
                href="https://instagram.com/explore/tags/GT86AeroClub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <SafeIcon icon={FiInstagram} className="h-5 w-5" />
                <span>View on Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;