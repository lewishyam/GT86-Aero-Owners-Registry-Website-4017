import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import SafeIcon from '../common/SafeIcon';
import RouteFallback from '../components/Debug/RouteFallback';
import * as FiIcons from 'react-icons/fi';

const { FiFilter, FiInstagram, FiMapPin, FiCar, FiStar } = FiIcons;

const DirectoryPage = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    colour: '',
    country: '',
    transmission: '',
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [owners, filters]);

  const fetchOwners = async () => {
    try {
      console.log('Fetching public owners');
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('public_profile', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owners:', error);
        setError(error);
        throw error;
      }
      
      console.log('Owners fetched:', data);
      setOwners(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching owners:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...owners];

    if (filters.colour) {
      filtered = filtered.filter(owner => owner.colour === filters.colour);
    }

    if (filters.country) {
      filtered = filtered.filter(owner => owner.country === filters.country);
    }

    if (filters.transmission) {
      filtered = filtered.filter(owner => owner.transmission === filters.transmission);
    }

    setFilteredOwners(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      colour: '',
      country: '',
      transmission: '',
    });
  };

  const getUniqueValues = (key) => {
    const values = owners.map(owner => owner[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  // If there's an error or unexpected state, show the debug fallback
  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Directory Error</h2>
            <p className="text-gray-700 mb-4">We encountered an error loading the directory.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Details</h3>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
            
            <button 
              onClick={fetchOwners}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading directory...</p>
        </div>
      </div>
    );
  }

  // If we have no owners and no error, use the debug fallback
  if (owners.length === 0 && !error) {
    return <RouteFallback componentName="DirectoryPage" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            GT86 Aero Owners Directory
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover GT86 Aero owners from around the world. Connect with fellow enthusiasts and explore the rarest GT86 variant ever made.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <SafeIcon icon={FiFilter} className="h-5 w-5" />
              <span>Filters</span>
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colour
              </label>
              <select
                value={filters.colour}
                onChange={(e) => handleFilterChange('colour', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Colours</option>
                {getUniqueValues('colour').map(colour => (
                  <option key={colour} value={colour}>{colour}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Countries</option>
                {getUniqueValues('country').map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmission
              </label>
              <select
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Transmissions</option>
                {getUniqueValues('transmission').map(trans => (
                  <option key={trans} value={trans}>{trans}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredOwners.length} of {owners.length} registered Aeros
          </p>
        </div>

        {/* Directory Grid */}
        {filteredOwners.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiCar} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Aeros Found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or be the first to register your Aero!
            </p>
            <Link
              to="/register"
              className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Register Your Aero
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOwners.map((owner, index) => (
              <motion.div
                key={owner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OwnerCard owner={owner} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OwnerCard = ({ owner }) => {
  // Simplified approach - just use the first photo_url directly
  const getDisplayImage = () => {
    return owner.photo_urls && owner.photo_urls.length > 0 ? owner.photo_urls[0] : null;
  };

  const displayImage = getDisplayImage();

  return (
    <Link to={`/member/${owner.username}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative">
          {displayImage && (
            <div className="aspect-square bg-gray-100">
              <img
                src={displayImage}
                alt={`${owner.display_name}'s GT86 Aero`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          {owner.featured && (
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-500 text-white p-2 rounded-full">
                <SafeIcon icon={FiStar} className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {owner.display_name}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiMapPin} className="h-4 w-4" />
              <span>
                {owner.country}
                {owner.uk_region && ` • ${owner.uk_region}`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiCar} className="h-4 w-4" />
              <span>{owner.year} • {owner.colour} • {owner.transmission}</span>
            </div>
            {owner.instagram_handle && (
              <div className="flex items-center space-x-2 text-red-600">
                <SafeIcon icon={FiInstagram} className="h-4 w-4" />
                <span>@{owner.instagram_handle}</span>
              </div>
            )}
          </div>
          
          {owner.mod_list && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">
                <span className="font-medium">Mods:</span> {owner.mod_list}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DirectoryPage;