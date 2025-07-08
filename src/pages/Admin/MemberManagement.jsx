import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiEye, FiEyeOff, FiStar, FiTrash2, FiFilter, FiAward, FiEdit } = FiIcons;

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    year: '',
    colour: '',
    status: 'all'
  });
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [availableBadges] = useState([
    'Owner / Creator',
    'Community Host',
    'Club Supporter',
    '#001',
    '#002',
    '#003',
    '#004',
    '#005',
    '#006',
    '#007',
    '#008',
    '#009',
    '#010',
    '#011',
    '#012',
    '#013',
    '#014',
    '#015',
    '#016',
    '#017',
    '#018',
    '#019',
    '#020',
    // Add more numbered badges as needed
  ]);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, searchTerm, filters]);

  const fetchMembers = async () => {
    try {
      console.log('Fetching all members');
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Members fetched:', data);
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        member =>
          member.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(member => member.country === filters.country);
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(member => member.year.toString() === filters.year);
    }

    // Colour filter
    if (filters.colour) {
      filtered = filtered.filter(member => member.colour === filters.colour);
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'public') {
        filtered = filtered.filter(member => member.public_profile);
      } else if (filters.status === 'private') {
        filtered = filtered.filter(member => !member.public_profile);
      } else if (filters.status === 'featured') {
        filtered = filtered.filter(member => member.featured);
      }
    }

    setFilteredMembers(filtered);
  };

  const togglePublicProfile = async (id, currentStatus) => {
    try {
      console.log('Toggling public profile for member:', id);
      const { error } = await supabase
        .from('owners')
        .update({ public_profile: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      console.log('Member profile status updated successfully');
      setMembers(members.map(member => member.id === id ? { ...member, public_profile: !currentStatus } : member));
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile status');
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      console.log('Toggling featured status for member:', id);
      const { error } = await supabase
        .from('owners')
        .update({ featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      console.log('Member featured status updated successfully');
      setMembers(members.map(member => member.id === id ? { ...member, featured: !currentStatus } : member));
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Error updating featured status');
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member profile?')) return;

    try {
      console.log('Deleting member:', id);
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('Member deleted successfully');
      setMembers(members.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error deleting member');
    }
  };

  const openBadgeModal = (member) => {
    setSelectedMember(member);
    setBadgeModalOpen(true);
  };

  const updateMemberBadges = async (memberId, badges) => {
    try {
      console.log('Updating badges for member:', memberId);
      const { error } = await supabase
        .from('owners')
        .update({ badges })
        .eq('id', memberId);

      if (error) throw error;
      
      console.log('Member badges updated successfully');
      setMembers(members.map(member => member.id === memberId ? { ...member, badges } : member));
      setBadgeModalOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error updating badges:', error);
      alert('Error updating badges');
    }
  };

  const getUniqueValues = (key) => {
    const values = members.map(member => member[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
        <p className="text-gray-600 mt-1">Manage GT86 Aero owner profiles and badges</p>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Countries</option>
              {getUniqueValues('country').map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Years</option>
              {getUniqueValues('year').map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.colour}
              onChange={(e) => setFilters(prev => ({ ...prev, colour: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Colours</option>
              {getUniqueValues('colour').map(colour => (
                <option key={colour} value={colour}>{colour}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Status</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </motion.div>

      {/* Members Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiFilter} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {member.photo_urls?.[0] && (
                          <img
                            src={member.photo_urls[0]}
                            alt={member.display_name}
                            className="h-10 w-10 object-cover rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.display_name}</div>
                          {member.instagram_handle && (
                            <div className="text-sm text-gray-500">@{member.instagram_handle}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.year} GT86 Aero</div>
                      <div className="text-sm text-gray-500">{member.colour} • {member.transmission}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.country}</div>
                      {member.uk_region && (
                        <div className="text-sm text-gray-500">{member.uk_region}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.badges && member.badges.length > 0 ? (
                          member.badges.map((badge, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                            >
                              {badge}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No badges</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.public_profile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.public_profile ? 'Public' : 'Private'}
                        </span>
                        {member.featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => togglePublicProfile(member.id, member.public_profile)}
                          className="text-blue-600 hover:text-blue-700"
                          title={member.public_profile ? 'Make Private' : 'Make Public'}
                        >
                          <SafeIcon icon={member.public_profile ? FiEyeOff : FiEye} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleFeatured(member.id, member.featured)}
                          className={`${member.featured ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-700`}
                          title={member.featured ? 'Remove from Featured' : 'Add to Featured'}
                        >
                          <SafeIcon icon={FiStar} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openBadgeModal(member)}
                          className="text-purple-600 hover:text-purple-700"
                          title="Manage Badges"
                        >
                          <SafeIcon icon={FiAward} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Member"
                        >
                          <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Badge Management Modal */}
      {badgeModalOpen && selectedMember && (
        <BadgeModal
          member={selectedMember}
          availableBadges={availableBadges}
          onSave={updateMemberBadges}
          onClose={() => {
            setBadgeModalOpen(false);
            setSelectedMember(null);
          }}
        />
      )}
    </div>
  );
};

const BadgeModal = ({ member, availableBadges, onSave, onClose }) => {
  const [selectedBadges, setSelectedBadges] = useState(member.badges || []);

  const toggleBadge = (badge) => {
    setSelectedBadges(prev =>
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    );
  };

  const handleSave = () => {
    onSave(member.id, selectedBadges);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          Manage Badges for {member.display_name}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {availableBadges.map((badge) => (
            <button
              key={badge}
              onClick={() => toggleBadge(badge)}
              className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                selectedBadges.includes(badge)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {badge}
            </button>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Save Badges
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberManagement;