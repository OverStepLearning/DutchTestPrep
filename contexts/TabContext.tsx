import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { usePathname } from 'expo-router';
import { storage } from '@/utils/storage';
import Config from '@/constants/Config';

// Define tab context state
interface TabContextType {
  currentTab: string;
  lastVisited: Record<string, number>;
  currentSubject: string;
  getLastVisitTime: (tab: string) => number;
  shouldRefresh: (tab: string, intervalMs?: number) => boolean;
  refreshTab: (tab: string) => void;
  forceRefreshAllTabs: () => void;
}

// Create the context
const TabContext = createContext<TabContextType | undefined>(undefined);

// Provider component
export function TabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState('');
  const [lastVisited, setLastVisited] = useState<Record<string, number>>({});
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [lastCheckedSubject, setLastCheckedSubject] = useState<string>('');

  // Update current tab based on pathname
  useEffect(() => {
    const tab = pathname.split('/').pop() || '';
    if (tab && tab !== currentTab) {
      setCurrentTab(tab);
      setLastVisited(prev => ({
        ...prev,
        [tab]: Date.now()
      }));
    }
  }, [pathname]);

  // Check for subject changes only when tabs change rather than polling
  useEffect(() => {
    // Check subject when tab changes or app first loads
    checkCurrentSubject();
  }, [pathname]); // Only run when pathname changes
  
  // Additional checks when tabs are focused
  useEffect(() => {
    if (currentTab) {
      // Check subject on tab focus
      checkCurrentSubject();
    }
  }, [currentTab]);

  // Check current subject from storage
  const checkCurrentSubject = async () => {
    try {
      const userData = await storage.getItem(Config.STORAGE_KEYS.USER_DATA);
      if (userData) {
        const parsedData = JSON.parse(userData);
        const subject = parsedData.learningSubject || 'Dutch';
        
        // If subject has changed, force refresh all tabs
        if (lastCheckedSubject && subject !== lastCheckedSubject) {
          console.log(`[TabContext] Subject changed from ${lastCheckedSubject} to ${subject} - forcing tab refreshes`);
          forceRefreshAllTabs();
          setCurrentSubject(subject);
          setLastCheckedSubject(subject);
        } else if (!lastCheckedSubject && subject) {
          // First initialization without logging
          setCurrentSubject(subject);
          setLastCheckedSubject(subject);
        }
      }
    } catch (error) {
      console.error('[TabContext] Error checking current subject:', error);
    }
  };

  // Get last time a tab was visited
  const getLastVisitTime = (tab: string): number => {
    return lastVisited[tab] || 0;
  };

  // Check if a tab should refresh based on last visit time
  const shouldRefresh = (tab: string, intervalMs: number = 5000): boolean => {
    const lastTime = getLastVisitTime(tab);
    if (!lastTime) return true;
    return Date.now() - lastTime >= intervalMs;
  };

  // Manually mark a tab as refreshed
  const refreshTab = (tab: string): void => {
    setLastVisited(prev => ({
      ...prev,
      [tab]: Date.now()
    }));
  };

  // Force refresh all tabs
  const forceRefreshAllTabs = (): void => {
    console.log('[TabContext] Forcing refresh of all tabs');
    setLastVisited({}); // Clear all last visited times to force refresh on all tabs
  };

  return (
    <TabContext.Provider
      value={{
        currentTab,
        lastVisited,
        currentSubject,
        getLastVisitTime,
        shouldRefresh,
        refreshTab,
        forceRefreshAllTabs
      }}
    >
      {children}
    </TabContext.Provider>
  );
}

// Custom hook to use the tab context
export function useTabContext() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
} 