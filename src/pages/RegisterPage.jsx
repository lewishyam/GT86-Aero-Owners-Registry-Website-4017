import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUpload, FiTrash2, FiCheck } = FiIcons;

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    instagram_handle: '',
    instagram_post_urls: ['', '', ''],
    country: '',
    uk_region: '',
    year: '',
    transmission: '',
    colour: '',
    mod_list: '',
    public_profile: true,
    show_on_map: true,
  });
  const [uploadedImages, setUploadedImages] = useState([]);

  const countries = [
    'United Kingdom', 'Australia', 'Japan', 'Germany', 'France', 
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Other'
  ];

  const ukRegions = [
    'London', 'South East', 'South West', 'East of England', 'East Midlands',
    'West Midlands', 'Yorkshire and the Humber', 'North West', 'North East',
    'Scotland', 'Wales', 'Northern Ireland'
  ];

  const years = ['2015', '2016'];
  const transmissions = ['Manual', 'Auto'];
  const colours = ['White', 'Red', 'Black', 'Grey', 'Silver'];

  useEffect(() => {
    if (user) {
      fetchExistingProfile();
    }
  }, [user]);

  const fetchExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('owners_gt86aero2024')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setExistingProfile(data);
        setFormData({
          display_name: data.display_name || '',
          instagram_handle: data.instagram_handle || '',
          instagram_post_urls: data.instagram_post_urls || ['', '', ''],
          country: data.country || '',
          uk_region: data.uk_region || '',
          year: data.year?.toString() || '',
          transmission: data.transmission || '',
          colour: data.colour || '',
          mod_list: data.mod_list || '',
          public_profile: data.public_profile ?? true,
          show_on_map: data.show_on_map ?? true,
        });
        setUploadedImages(data.photo_urls || []);
      }
    } catch (error) {
      console.error('Error fetching existing profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInstagramUrlChange = (index, value) => {
    const newUrls = [...formData.instagram_post_urls];
    newUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      instagram_post_urls: newUrls
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    setUploadingImages(true);
    const newImages = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      try {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('owner_photos')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('owner_photos')
          .getPublicUrl(fileName);

        newImages.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
      }
    }

    setUploadedImages(prev => [...prev, ...newImages]);
    setUploadingImages(false);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to register your Aero');
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      const cleanInstagramUrls = formData.instagram_post_urls.filter(url => url.trim());
      
      const profileData = {
        ...formData,
        instagram_post_urls: cleanInstagramUrls,
        photo_urls: uploadedImages,
        user_id: user.id,
        year: parseInt(formData.year)
      };

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('owners_gt86aero2024')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        result = await supabase
          .from('owners_gt86aero2024')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      alert(existingProfile ? 'Profile updated successfully!' : 'Registration successful! Welcome to the GT86 Aero Owners Club.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to register your GT86 Aero</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="bg-red-600 text-white p-6">
            <h1 className="text-2xl font-bold">
              {existingProfile ? 'Update Your GT86 Aero' : 'Register Your GT86 Aero'}
            </h1>
            <p className="text-red-100 mt-2">
              {existingProfile ? 'Edit your registry information' : 'Join the exclusive registry'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="How you'd like to be known"
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  name="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="your_handle"
                />
              </div>
            </div>

            {/* Instagram Post URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Post URLs (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Add up to 3 Instagram post URLs to showcase your Aero
              </p>
              {formData.instagram_post_urls.map((url, index) => (
                <input
                  key={index}
                  type="url"
                  value={url}
                  onChange={(e) => handleInstagramUrlChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-2"
                  placeholder={`Instagram post URL ${index + 1}`}
                />
              ))}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fallback Images (Max 3, 5MB each)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Upload images if you're not using Instagram posts
              </p>
              
              {uploadedImages.length < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiUpload} className="h-5 w-5" />
                    <span>{uploadingImages ? 'Uploading...' : 'Upload Images'}</span>
                  </label>
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* UK Region */}
            {formData.country === 'United Kingdom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UK Region
                </label>
                <select
                  name="uk_region"
                  value={formData.uk_region}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Region</option>
                  {ukRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year, Transmission, Colour */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission *
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Transmission</option>
                  {transmissions.map(trans => (
                    <option key={trans} value={trans}>{trans}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colour *
                </label>
                <select
                  name="colour"
                  value={formData.colour}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Colour</option>
                  {colours.map(colour => (
                    <option key={colour} value={colour}>{colour}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modifications
              </label>
              <textarea
                name="mod_list"
                value={formData.mod_list}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="List your modifications, upgrades, or keep it stock!"
              />
            </div>

            {/* Privacy Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="public_profile"
                  checked={formData.public_profile}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Make my profile public in the directory
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="show_on_map"
                  checked={formData.show_on_map}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Display on map (future feature)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>{existingProfile ? 'Updating...' : 'Registering...'}</span>
              ) : (
                <>
                  <SafeIcon icon={FiCheck} className="h-5 w-5" />
                  <span>{existingProfile ? 'Update My Aero' : 'Register My Aero'}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;