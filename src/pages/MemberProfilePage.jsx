import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import SafeIcon from '../common/SafeIcon';
import ImageLightbox from '../components/ImageLightbox';
import RouteFallback from '../components/Debug/RouteFallback';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiCar, FiInstagram, FiStar, FiArrowLeft, FiCalendar, FiAward, FiLock, FiExternalLink } = FiIcons;

const MemberProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    queryAttempted: false,
    queryResult: null,
    queryError: null
  });

  useEffect(() => {
    console.log('MemberProfilePage: Starting fetch for username:', username);
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    if (!username) {
      console.error('No username provided');
      setError('invalid');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for username:', username);
      setDebugInfo(prev => ({ ...prev, queryAttempted: true }));
      
      // First, try to get the profile regardless of public status to check if it exists
      const { data: profileCheck, error: checkError } = await supabase
        .from('owners')
        .select('username, public_profile')
        .eq('username', username)
        .single();

      console.log('Profile check result:', { profileCheck, checkError });
      setDebugInfo(prev => ({ 
        ...prev, 
        initialCheck: { data: profileCheck, error: checkError } 
      }));

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('Profile does not exist');
          setError('notfound');
        } else {
          console.error('Database error during check:', checkError);
          setError('database');
        }
        setLoading(false);
        return;
      }

      // Profile exists, check if it's public
      if (!profileCheck.public_profile) {
        console.log('Profile exists but is private');
        setError('private');
        setLoading(false);
        return;
      }

      // Profile exists and is public, fetch full data
      const { data: fullProfile, error: fetchError } = await supabase
        .from('owners')
        .select('*')
        .eq('username', username)
        .eq('public_profile', true)
        .single();

      console.log('Full profile fetch result:', { fullProfile, fetchError });
      setDebugInfo(prev => ({ 
        ...prev, 
        fullQuery: { data: fullProfile, error: fetchError } 
      }));

      if (fetchError) {
        console.error('Error fetching full profile:', fetchError);
        setError('database');
      } else {
        console.log('Profile successfully loaded:', fullProfile);
        setProfile(fullProfile);
        setError(null);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setError('unexpected');
      setDebugInfo(prev => ({ 
        ...prev, 
        queryError: error 
      }));
    } finally {
      setLoading(false);
    }
  };

  const getDisplayImages = () => {
    if (!profile) return [];
    
    const images = [];
    
    // Only add uploaded images (not attempting to embed Instagram images)
    if (profile.photo_urls && Array.isArray(profile.photo_urls)) {
      profile.photo_urls.forEach(url => {
        if (url && typeof url === 'string') {
          images.push({
            src: url,
            type: 'upload',
            url: url
          });
        }
      });
    }
    
    return images;
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getBadgeColor = (badge) => {
    if (badge === 'Owner / Creator') return 'bg-red-100 text-red-800';
    if (badge === 'Community Host') return 'bg-purple-100 text-purple-800';
    if (badge === 'Club Supporter') return 'bg-green-100 text-green-800';
    if (badge.startsWith('#')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Format Instagram URLs for display
  const formatInstagramUrl = (url) => {
    if (!url) return '';
    
    // Extract post ID if it's a standard Instagram URL
    let postId = '';
    try {
      if (url.includes('/p/')) {
        postId = url.split('/p/')[1]?.split('/')[0] || '';
        if (postId) {
          return `instagram.com/p/${postId}`;
        }
      }
    } catch (e) {
      console.error('Error formatting Instagram URL:', e);
    }
    
    // If we couldn't extract a post ID, just return the URL as is
    // but strip protocol and www for cleaner display
    return url.replace(/^https?:\/\/(www\.)?/i, '');
  };

  // Debug UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching: {username}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm max-w-md w-full">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Information</h3>
          <p className="text-xs text-gray-600">
            Table: <span className="font-mono">owners</span><br />
            Username: <span className="font-mono">{username}</span><br />
            Query attempted: {debugInfo.queryAttempted ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    );
  }

  // Fallback for unexpected issues
  if (!profile && !error) {
    return <RouteFallback componentName="MemberProfilePage" />;
  }

  // Error states
  if (error) {
    let title, message, actionText, actionHref;
    
    switch (error) {
      case 'notfound':
        title = 'Profile Not Found';
        message = 'This GT86 Aero owner profile does not exist.';
        actionText = 'Browse Directory';
        actionHref = '/directory';
        break;
      case 'private':
        title = 'Private Profile';
        message = 'This GT86 Aero owner has set their profile to private.';
        actionText = 'Browse Public Profiles';
        actionHref = '/directory';
        break;
      case 'database':
        title = 'Unable to Load Profile';
        message = 'There was an error loading this profile. Please try again later.';
        actionText = 'Back to Directory';
        actionHref = '/directory';
        break;
      default:
        title = 'Something Went Wrong';
        message = 'We encountered an unexpected error. Please try again.';
        actionText = 'Back to Directory';
        actionHref = '/directory';
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {error === 'private' && (
              <SafeIcon icon={FiLock} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <a
                href={actionHref}
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-2" />
                {actionText}
              </a>
              <div className="text-sm text-gray-500 mt-4">
                Looking for: <span className="font-mono">{username}</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <details className="text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile successfully loaded
  const displayImages = getDisplayImages();
  const hasInstagramPosts = profile.instagram_post_urls && profile.instagram_post_urls.length > 0 && 
                            profile.instagram_post_urls.some(url => url && url.trim());

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <a
            href="/directory"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="h-4 w-4 mr-1" />
            <span>Back to Directory</span>
          </a>
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
        >
          <div className="bg-red-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold flex items-center space-x-3">
                  <span>{profile.display_name}</span>
                  {profile.featured && (
                    <div className="bg-yellow-500 text-white p-2 rounded-full">
                      <SafeIcon icon={FiStar} className="h-5 w-5" />
                    </div>
                  )}
                </h1>
                <p className="text-red-100 mt-2">GT86 Aero Owner</p>
                
                {/* Badges */}
                {profile.badges && Array.isArray(profile.badges) && profile.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.badges.map((badge, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getBadgeColor(badge)}`}
                      >
                        <SafeIcon icon={FiAward} className="h-3 w-3 mr-1" />
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                
                {profile.featured_quote && (
                  <p className="text-red-100 mt-4 italic">"{profile.featured_quote}"</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vehicle Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiCar} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Model & Year</p>
                        <p className="font-medium">{profile.year} GT86 Aero</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 flex items-center justify-center">
                        <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Colour & Transmission</p>
                        <p className="font-medium">{profile.colour} • {profile.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiMapPin} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">
                          {profile.country}
                          {profile.uk_region && ` • ${profile.uk_region}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Info</h3>
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instagram Posts */}
                {hasInstagramPosts && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Instagram Posts</h3>
                    <ul className="space-y-2">
                      {profile.instagram_post_urls.map((url, index) => {
                        if (!url || !url.trim()) return null;
                        
                        return (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <SafeIcon icon={FiInstagram} className="h-4 w-4 text-pink-500 flex-shrink-0" />
                            <a 
                              href={url.startsWith('http') ? url : `https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline truncate flex-1"
                            >
                              {formatInstagramUrl(url)}
                            </a>
                            <SafeIcon icon={FiExternalLink} className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Social & Mods */}
              <div className="space-y-6">
                {/* Instagram */}
                {profile.instagram_handle && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiInstagram} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Instagram</p>
                        <a
                          href={`https://instagram.com/${profile.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                          @{profile.instagram_handle}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modifications */}
                {profile.mod_list && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifications</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{profile.mod_list}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Image Gallery - Only for uploaded photos */}
        {displayImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.src}
                      alt={`${profile.display_name}'s GT86 Aero ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 p-2 rounded-full">
                      <span className="text-gray-800 text-sm font-medium">View</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Image Lightbox - Only for uploaded images */}
        <ImageLightbox
          images={displayImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    </div>
  );
};

export default MemberProfilePage;