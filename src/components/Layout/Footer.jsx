import React from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiInstagram, FiHeart } = FiIcons;

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">GT86 Aero Owners Club</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              The definitive registry for Toyota GT86 Aero owners. Celebrating one of the rarest and most exclusive versions of the GT86 platform.
            </p>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <div className="space-y-2">
              <a
                href="https://instagram.com/explore/tags/GT86AeroClub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <SafeIcon icon={FiInstagram} className="h-4 w-4" />
                <span className="text-sm">#GT86AeroClub</span>
              </a>
              <p className="text-gray-400 text-xs">
                Share your Aero on Instagram with our hashtag
              </p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {settings.footer_stats_title || 'Registry Stats'}
            </h3>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                <span className="font-medium">
                  {settings.footer_stats_production || '~200'}
                  {settings.footer_stats_production ? '' : ' UK Aeros produced'}
                </span>
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">
                  {settings.footer_stats_years || '2015-2016'}
                  {settings.footer_stats_years ? '' : ' model years'}
                </span>
              </p>
              <p className="text-gray-300 text-sm">
                <span className="font-medium">
                  {settings.footer_stats_global || 'Global'}
                  {settings.footer_stats_global ? '' : ' registry'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center space-x-1">
            <span>{settings.footer_text || 'Made with'}</span>
            {!settings.footer_text && <SafeIcon icon={FiHeart} className="h-4 w-4 text-red-500" />}
            {!settings.footer_text && <span>for the GT86 Aero community</span>}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;