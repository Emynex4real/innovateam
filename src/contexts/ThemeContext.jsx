import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [branding, setBranding] = useState({
    primaryColor: '#10b981',
    logoUrl: null,
    centerName: null
  });

  const updateBranding = (newBranding) => {
    setBranding(newBranding);
    if (newBranding.primaryColor) {
      document.documentElement.style.setProperty('--primary', newBranding.primaryColor);
    }
  };

  useEffect(() => {
    localStorage.setItem('admin-theme', JSON.stringify(isDark));
  }, [isDark]);

  // Fetch center branding on mount (tutors only - students load via StudentDashboard)
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('center_id, role')
          .eq('id', user.id)
          .single();

        let centerId = profile?.center_id;

        if (!centerId && profile?.role === 'tutor') {
          const { data: tutorCenter } = await supabase
            .from('tutorial_centers')
            .select('id')
            .eq('tutor_id', user.id)
            .single();

          centerId = tutorCenter?.id;
        }

        if (!centerId) return;

        const { data: center } = await supabase
          .from('tutorial_centers')
          .select('name, theme_config')
          .eq('id', centerId)
          .single();

        if (center) {
          updateBranding({
            primaryColor: center.theme_config?.primary_color || '#10b981',
            logoUrl: center.theme_config?.logo_url || null,
            centerName: center.name
          });
        }
      } catch (error) {
        console.error('Failed to load branding:', error);
      }
    };

    fetchBranding();
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, updateBranding, ...branding }}>
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
