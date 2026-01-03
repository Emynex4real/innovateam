import React, { useState, useEffect } from 'react';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';

const ThemeEditor = () => {
  const [theme, setTheme] = useState({
    primary_color: '#10b981',
    logo_url: null,
    custom_domain: null
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const response = await tutorialCenterService.getMyCenter();
      if (response.success && response.center.theme_config) {
        setTheme(response.center.theme_config);
      }
    } catch (error) {
      console.error('Failed to load theme');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await tutorialCenterService.updateTheme(theme);
      if (response.success) {
        toast.success('Theme updated! Refresh to see changes.');
      }
    } catch (error) {
      toast.error('Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Customize Your Brand</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Primary Color</label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={theme.primary_color}
              onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
              className="w-20 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={theme.primary_color}
              onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="#10b981"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Logo URL</label>
          <input
            type="url"
            value={theme.logo_url || ''}
            onChange={(e) => setTheme({ ...theme, logo_url: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="https://example.com/logo.png"
          />
          {theme.logo_url && (
            <img src={theme.logo_url} alt="Logo preview" className="mt-2 h-16 object-contain" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Custom Domain (Premium)</label>
          <input
            type="text"
            value={theme.custom_domain || ''}
            onChange={(e) => setTheme({ ...theme, custom_domain: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="learn.yourschool.com"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">Contact support to enable custom domains</p>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Preview</h3>
          <div 
            className="p-6 rounded-lg text-white"
            style={{ backgroundColor: theme.primary_color }}
          >
            {theme.logo_url && <img src={theme.logo_url} alt="Logo" className="h-12 mb-4" />}
            <h2 className="text-2xl font-bold">Your Tutorial Center</h2>
            <p className="opacity-90">This is how your branding will appear</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>
    </div>
  );
};

export default ThemeEditor;
