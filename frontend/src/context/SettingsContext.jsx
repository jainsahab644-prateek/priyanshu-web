import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchSettings(),
      fetchCategories(),
      fetchCollections(),
      fetchAnnouncements()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      categories,
      collections,
      announcements,
      loading,
      refreshAll
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
