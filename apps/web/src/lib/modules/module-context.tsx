"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { SystemModule, Plan, ModuleAccess, Announcement } from './types';
import apiClient from '../api-client';
import { DEFAULT_MODULES, getModuleByKey } from './default-modules';

interface ModuleContextType {
  // Tenant bilgileri
  tenantId: string;
  tenantPlan: Plan;
  
  // Modül bilgileri
  allModules: SystemModule[];
  enabledModules: string[];
  
  // Duyurular
  announcements: Announcement[];
  unreadAnnouncementCount: number;
  
  // Fonksiyonlar
  hasModuleAccess: (moduleKey: string) => boolean;
  getModuleAccess: (moduleKey: string) => ModuleAccess;
  isModuleEnabled: (moduleKey: string) => boolean;
  canAccessRoute: (path: string) => boolean;
  
  // Duyuru fonksiyonları
  markAnnouncementAsRead: (id: string) => void;
  dismissAnnouncement: (id: string) => void;
  
  // Admin fonksiyonları (sadece admin paneli için)
  toggleModule: (moduleKey: string, enabled: boolean) => Promise<void>;
  updateModuleConfig: (moduleKey: string, config: Record<string, unknown>) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

// Duyurular API'den yüklenecek
// fetchAnnouncements API call kullanılmalı

export function ModuleProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string>('');
  const [tenantPlan, setTenantPlan] = useState<Plan>('FREE');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Session'dan tenantId al
        const tid = (session.user as any)?.tenantId;
        if (tid) {
          setTenantId(tid);
          try {
            apiClient.setTenantId(tid);
          } catch (e) {
            console.warn('Failed to set tenantId on apiClient', e);
          }
        } else {
          // clear any previous tenant on the client when no tenant in session
          try { apiClient.setTenantId(''); } catch {};
        }

        // TODO: API'den gerçek tenant bilgileri yükle
        // const response = await fetch(`/api/tenant/${tid}`);
        // const { tenant, announcements } = await response.json();
        // setTenantPlan(tenant.plan);
        // setEnabledModules(tenant.enabledModules);
        // setAnnouncements(announcements);

        // Fallback: Eğer API'den veri gelmezse, sadece core modülleri aktif yap
        setEnabledModules(DEFAULT_MODULES.filter(m => m.isCore).map(m => m.key));
        setAnnouncements([]);
      } catch (error) {
        console.error('Failed to load tenant data:', error);
        setEnabledModules(DEFAULT_MODULES.filter(m => m.isCore).map(m => m.key));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [session]);
  
  const hasModuleAccess = (moduleKey: string): boolean => {
    const sysModule = getModuleByKey(moduleKey);
    if (!sysModule) return false;
    
    // Core modüller her zaman erişilebilir
    if (sysModule.isCore) return true;
    
    // Plan kontrolü
    const planOrder: Plan[] = ['FREE', 'PRO', 'ENTERPRISE'];
    const currentPlanIndex = planOrder.indexOf(tenantPlan);
    const requiredPlanIndex = planOrder.indexOf(sysModule.requiredPlan);
    
    if (requiredPlanIndex > currentPlanIndex) return false;
    
    // Modül aktif mi kontrolü
    return enabledModules.includes(moduleKey);
  };
  
  const getModuleAccess = (moduleKey: string): ModuleAccess => {
    const sysModule = getModuleByKey(moduleKey);
    const planOrder: Plan[] = ['FREE', 'PRO', 'ENTERPRISE'];
    const currentPlanIndex = planOrder.indexOf(tenantPlan);
    
    if (!sysModule) {
      return {
        hasAccess: false,
        isEnabled: false,
        isTrial: false,
        requiredPlan: 'FREE',
        currentPlan: tenantPlan,
        canUpgrade: false,
      };
    }
    
    const requiredPlanIndex = planOrder.indexOf(sysModule.requiredPlan);
    const isEnabled = enabledModules.includes(moduleKey);
    const hasAccess = sysModule.isCore || (requiredPlanIndex <= currentPlanIndex && isEnabled);
    
    return {
      hasAccess,
      isEnabled,
      isTrial: false,
      requiredPlan: sysModule.requiredPlan,
      currentPlan: tenantPlan,
      canUpgrade: requiredPlanIndex > currentPlanIndex,
    };
  };
  
  const isModuleEnabled = (moduleKey: string): boolean => {
    return enabledModules.includes(moduleKey);
  };
  
  const canAccessRoute = (path: string): boolean => {
    const sysModule = DEFAULT_MODULES.find(m => m.menuPath === path);
    if (!sysModule) return true;
    return hasModuleAccess(sysModule.key);
  };
  
  const markAnnouncementAsRead = (id: string) => {
    setAnnouncements(prev => 
      prev.map(a => a.id === id ? { ...a, isRead: true } : a)
    );
  };
  
  const dismissAnnouncement = (id: string) => {
    setAnnouncements(prev => 
      prev.map(a => a.id === id ? { ...a, isDismissed: true } : a)
    );
  };
  
  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    // TODO: API çağrısı yap module durumunu güncelle
    if (enabled) {
      setEnabledModules(prev => [...prev, moduleKey]);
    } else {
      setEnabledModules(prev => prev.filter(k => k !== moduleKey));
    }
  };
  
  const updateModuleConfig = async (moduleKey: string, config: Record<string, unknown>) => {
    // TODO: API çağrısı yap module config'i güncelle
  };
  
  const unreadAnnouncementCount = announcements.filter(
    a => !a.isRead && !a.isDismissed && a.isActive
  ).length;
  
  return (
    <ModuleContext.Provider
      value={{
        tenantId,
        tenantPlan,
        allModules: DEFAULT_MODULES as SystemModule[],
        enabledModules,
        announcements,
        unreadAnnouncementCount,
        hasModuleAccess,
        getModuleAccess,
        isModuleEnabled,
        canAccessRoute,
        markAnnouncementAsRead,
        dismissAnnouncement,
        toggleModule,
        updateModuleConfig,
        isLoading,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
}

// Belirli bir modül için hook
export function useModule(moduleKey: string) {
  const { hasModuleAccess, getModuleAccess, isModuleEnabled } = useModules();
  
  return {
    hasAccess: hasModuleAccess(moduleKey),
    access: getModuleAccess(moduleKey),
    isEnabled: isModuleEnabled(moduleKey),
    module: getModuleByKey(moduleKey),
  };
}

// Duyurular için hook
export function useAnnouncements() {
  const { 
    announcements, 
    unreadAnnouncementCount, 
    markAnnouncementAsRead, 
    dismissAnnouncement 
  } = useModules();
  
  // Güvenli filter - announcements undefined olabilir
  const safeAnnouncements = announcements || [];
  
  const activeAnnouncements = safeAnnouncements.filter(
    a => a.isActive && !a.isDismissed && (!a.endsAt || new Date(a.endsAt) > new Date())
  );
  
  const pinnedAnnouncements = activeAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = activeAnnouncements.filter(a => !a.isPinned);
  
  return {
    all: safeAnnouncements,
    active: activeAnnouncements,
    pinned: pinnedAnnouncements,
    regular: regularAnnouncements,
    unreadCount: unreadAnnouncementCount,
    markAsRead: markAnnouncementAsRead,
    dismiss: dismissAnnouncement,
  };
}
