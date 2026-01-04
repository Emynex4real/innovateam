import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Palette, 
  Image as ImageIcon, 
  Globe, 
  Check, 
  Save, 
  Layout, 
  School,
  BookOpen,
  Trophy,
  Target,
  Clock,
  BarChart2,
  Upload,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';
import { useTheme } from '../../contexts/ThemeContext';

// Standard Brand Colors Palette
const PRESET_COLORS = [
  { name: 'Innova Green', value: '#10b981' },
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Deep Purple', value: '#7c3aed' },
  { name: 'Crimson Red', value: '#db2777' },
  { name: 'Sunset Orange', value: '#ea580c' },
  { name: 'Ocean Teal', value: '#0d9488' },
  { name: 'Midnight', value: '#0f172a' },
  { name: 'Gold', value: '#ca8a04' }
];

const ThemeEditor = () => {
  const navigate = useNavigate();
  const { primaryColor: currentColor, logoUrl: currentLogo } = useTheme();
  
  const [center, setCenter] = useState(null);
  const [theme, setTheme] = useState({
    primary_color: '#10b981',
    logo_url: '',
    custom_domain: null
  });
  
  const [saving, setSaving] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const response = await tutorialCenterService.getMyCenter();
      if (response.success && response.center) {
        setCenter(response.center);
        if (response.center.theme_config) {
          setTheme(prev => ({ ...prev, ...response.center.theme_config }));
        }
      }
    } catch (error) {
      console.error('Failed to load theme');
      toast.error('Could not load theme settings');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('center-logos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('center-logos')
        .getPublicUrl(fileName);

      setTheme({ ...theme, logo_url: publicUrl });
      setLogoError(false);
      toast.success('Logo uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await tutorialCenterService.updateTheme(theme);
      if (response.success) {
        toast.success('Brand settings published successfully');
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = theme.primary_color !== currentColor || theme.logo_url !== currentLogo;

  // --- PREVIEW COMPONENTS (Mimicking EnterpriseDashboard.jsx) ---

  const PreviewStatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 scale-90 origin-left">
      <div className={`p-3 rounded-2xl ${colorClass} text-white shadow-sm`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      
      {/* 1. TOP BAR */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Brand Customization
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wide">
                  Enterprise
                </span>
              </h1>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${hasChanges 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:scale-105' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}
            `}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 2. SETTINGS PANEL (Left) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Color Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                  <Palette size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Brand Color</h2>
                  <p className="text-xs text-gray-500">Main accent for buttons & cards</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setTheme({ ...theme, primary_color: color.value })}
                    className={`
                      group relative w-full aspect-square rounded-2xl transition-all duration-200 flex items-center justify-center
                      ${theme.primary_color === color.value 
                        ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-100 shadow-md' 
                        : 'hover:scale-105 hover:shadow-sm'}
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {theme.primary_color === color.value && (
                      <Check className="text-white drop-shadow-md" size={20} strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Custom Hex</label>
                <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div 
                    className="w-8 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                    style={{ backgroundColor: theme.primary_color }}
                  />
                  <input
                    type="text"
                    value={theme.primary_color}
                    onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 text-sm font-mono text-gray-900 dark:text-white w-full uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Logo Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Center Logo</h2>
                  <p className="text-xs text-gray-500">Appears on dashboard & reports</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`
                  relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[140px]
                  ${theme.logo_url && !logoError 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'}
                `}>
                  {theme.logo_url && !logoError ? (
                    <img 
                      src={theme.logo_url} 
                      alt="Logo Preview" 
                      className="max-h-16 object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500">
                      {logoError ? (
                        <div className="flex flex-col items-center text-red-500">
                          <AlertCircle size={32} className="mb-2" />
                          <span className="text-xs font-medium">Invalid Image URL</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={32} className="mb-2" />
                          <span className="text-xs font-medium">No Logo Set</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Upload Logo</label>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="w-full px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-all text-center">
                      <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={18} />
                            Choose Image File
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">PNG, JPG, or SVG • Max 2MB</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">OR</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Logo URL</label>
                  <input
                    type="url"
                    value={theme.logo_url || ''}
                    onChange={(e) => {
                      setTheme({ ...theme, logo_url: e.target.value });
                      setLogoError(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    placeholder="https://..."
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    Paste a direct image URL
                  </p>
                </div>
              </div>
            </div>

            {/* Domain Settings */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Globe size={20} className="text-blue-300" />
                </div>
                <h2 className="font-bold">Custom Domain</h2>
              </div>
              <div className="bg-black/30 rounded-xl p-3 flex items-center gap-3 border border-white/10 mb-3">
                <span className="text-gray-400 font-mono text-sm">https://</span>
                <input
                  type="text"
                  value={theme.custom_domain || 'portal.yourschool.com'}
                  disabled
                  className="bg-transparent border-none p-0 text-sm font-mono text-white w-full focus:ring-0 opacity-70"
                />
              </div>
              <p className="text-xs text-gray-400">
                Map your own domain (e.g., learn.myschool.com). <br/>
                <span className="underline cursor-pointer hover:text-white transition-colors">Contact Support</span> to enable.
              </p>
            </div>

          </div>

          {/* 3. LIVE PREVIEW (Right) - Mimics EnterpriseDashboard.jsx */}
          <div className="lg:col-span-8">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Layout size={16} /> Student Dashboard Preview
                </h3>
                <span className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Update
                </span>
              </div>

              {/* THE MOCK DASHBOARD */}
              <div className="bg-gray-50 dark:bg-gray-950 rounded-[2.5rem] border-[8px] border-gray-900 dark:border-gray-800 shadow-2xl overflow-hidden relative min-h-[600px]">
                
                {/* Mock Header Bar */}
                <div className="h-8 bg-gray-900 flex items-center justify-center gap-2 px-6">
                  <div className="w-16 h-4 bg-black rounded-full" />
                </div>

                {/* Dashboard Content */}
                <div className="p-6 md:p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
                  
                  {/* Mock Welcome Header */}
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
                        Welcome Back! 👋
                      </h1>
                      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                    {/* Mock Streak Badge */}
                    <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-orange-500 text-xs font-bold">🔥 12 Day Streak</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Main Content Column */}
                    <div className="md:col-span-8 space-y-6">
                      
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <PreviewStatCard icon={BookOpen} label="Tests" value="24" colorClass="bg-blue-500" />
                        <PreviewStatCard icon={Target} label="Score" value="85%" colorClass="bg-emerald-500" />
                        <PreviewStatCard icon={Trophy} label="Rank" value="#12" colorClass="bg-purple-500" />
                      </div>

                      {/* --- THEMEABLE CENTER CARD --- */}
                      <div 
                        className="p-6 rounded-[2rem] relative overflow-hidden shadow-xl transition-colors duration-500"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.primary_color}dd)`,
                          color: '#ffffff'
                        }}
                      >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                          <School size={140} />
                        </div>

                        <div className="relative z-10">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-4">
                            Active Center
                          </div>
                          
                          {/* Logo Display */}
                          <div className="mb-4 h-12 flex items-center">
                            {theme.logo_url && !logoError ? (
                              <img 
                                src={theme.logo_url} 
                                alt="Center Logo" 
                                className="h-full object-contain brightness-0 invert" 
                                onError={() => setLogoError(true)}
                              />
                            ) : (
                              <h2 className="text-2xl font-bold">{center?.name || 'Your Academy'}</h2>
                            )}
                          </div>

                          <div className="h-px w-full bg-white/20 mb-4" />

                          <div className="flex flex-wrap gap-3">
                            <button className="px-5 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                              <Clock size={16} /> Take Test
                            </button>
                            <button className="px-5 py-2.5 bg-black/20 text-white rounded-xl font-bold text-sm backdrop-blur-sm flex items-center gap-2 hover:bg-black/30 transition-colors">
                              <BarChart2 size={16} /> Analytics
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mock Quick Actions */}
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm opacity-60">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 mb-3" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                            <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="md:col-span-4 space-y-6">
                      {/* Mock Leaderboard */}
                      <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Leaderboard</h3>
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700" />
                              <div className="flex-1">
                                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded mb-1" />
                                <div className="h-2 w-12 bg-gray-50 dark:bg-gray-800 rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
              <p className="text-center text-xs text-gray-400">
                This is a live preview of how students will see their dashboard.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThemeEditor;