import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit, FiTrash2, FiPlus, FiUser, FiCar, FiMapPin, FiInstagram } = FiIcons;

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      console.log('Profile data:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your registration? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      alert('Profile deleted successfully');
      setProfile(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Error deleting profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Dashboard</h1>
          <p className="text-gray-600">Manage your GT86 Aero registration and profile</p>
        </div>

        {!profile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center"
          >
            <SafeIcon icon={FiCar} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Register Your GT86 Aero</h2>
            <p className="text-gray-600 mb-6">
              You haven't registered your GT86 Aero yet. Join the exclusive registry and connect with fellow Aero owners worldwide.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="h-5 w-5" />
              <span>Register Your Aero</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-red-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.display_name}</h2>
                    <p className="text-red-100">GT86 Aero Owner</p>
                  </div>
                  <SafeIcon icon={FiUser} className="h-12 w-12 text-red-200" />
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiCar} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Vehicle Details</p>
                        <p className="font-medium">
                          {profile.year} GT86 Aero • {profile.colour} • {profile.transmission}
                        </p>
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

                    {profile.instagram_handle && (
                      <div className="flex items-center space-x-3">
                        <SafeIcon icon={FiInstagram} className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Instagram</p>
                          <a
                            href={`https://instagram.com/${profile.instagram_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-red-600 hover:text-red-700"
                          >
                            @{profile.instagram_handle}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {profile.mod_list && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Modifications</p>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {profile.mod_list}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Status */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Profile Status</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-sm font-medium ${profile.public_profile ? 'text-green-600' : 'text-gray-600'}`}>
                          {profile.public_profile ? 'Public' : 'Private'}
                        </span>
                        <span className={`text-sm font-medium ${profile.show_on_map ? 'text-green-600' : 'text-gray-600'}`}>
                          {profile.show_on_map ? 'On Map' : 'Not on Map'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate('/register')}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium"
                      >
                        <SafeIcon icon={FiEdit} className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDeleteProfile}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/directory')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900">Browse Directory</h4>
                  <p className="text-sm text-gray-600 mt-1">Explore other GT86 Aero owners</p>
                </button>

                <a
                  href="https://instagram.com/explore/tags/GT86AeroClub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900">Community Feed</h4>
                  <p className="text-sm text-gray-600 mt-1">Check out #GT86AeroClub</p>
                </a>

                <button
                  onClick={() => navigate('/register')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900">Update Profile</h4>
                  <p className="text-sm text-gray-600 mt-1">Edit your registration details</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;