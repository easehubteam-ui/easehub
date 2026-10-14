import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ServiceExperienceSettings,
  serviceExperienceApi,
} from '../services/serviceExperienceApi';

interface ServiceExperienceContextValue {
  settings: ServiceExperienceSettings | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (patch: Partial<Omit<ServiceExperienceSettings, 'id' | 'updated_by' | 'updated_at'>>) => Promise<void>;
}

const ServiceExperienceContext = createContext<ServiceExperienceContextValue | undefined>(undefined);

export const ServiceExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ServiceExperienceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await serviceExperienceApi.getSettings();
      setSettings(next);
      setError(null);
    } catch (err: any) {
      setSettings(null);
      setError(err?.message || 'Service visibility settings could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const update = useCallback(async (
    patch: Partial<Omit<ServiceExperienceSettings, 'id' | 'updated_by' | 'updated_at'>>
  ) => {
    const next = await serviceExperienceApi.updateSettings(patch);
    setSettings(next);
    setError(null);
  }, []);

  return (
    <ServiceExperienceContext.Provider value={{ settings, isLoading, error, refresh, update }}>
      {children}
    </ServiceExperienceContext.Provider>
  );
};

export const useServiceExperience = (): ServiceExperienceContextValue => {
  const context = useContext(ServiceExperienceContext);
  if (!context) throw new Error('useServiceExperience must be used within ServiceExperienceProvider');
  return context;
};
