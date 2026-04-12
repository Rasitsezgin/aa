"use client";

import React, { useState, useEffect } from 'react';
import {
  Rocket, Check, ChevronRight, Plus, Building2, Mail, Shield,
  CreditCard, Store, Settings, Users, CheckCircle2, Circle, ArrowLeft
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  onboardingProgress: number;
  currentStep: string;
  completedSteps: string[];
}

export default function OnboardingPage() {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    email: '',
    plan: 'STARTER',
  });

  const allSteps: OnboardingStep[] = [
    { id: 'basic_info', title: 'Temel Bilgiler', description: 'Tenant adı ve iletişim bilgileri', completed: false, icon: <Building2 size={20} /> },
    { id: 'email_verify', title: 'E-posta Doğrulama', description: 'E-posta adresinin doğrulanması', completed: false, icon: <Mail size={20} /> },
    { id: 'security', title: 'Güvenlik Ayarları', description: '2FA ve parola politikası', completed: false, icon: <Shield size={20} /> },
    { id: 'billing', title: 'Fatura Bilgileri', description: 'Ödeme yöntemi ekleme', completed: false, icon: <CreditCard size={20} /> },
    { id: 'store_setup', title: 'Mağaza Kurulumu', description: 'İlk ürün ve kategoriler', completed: false, icon: <Store size={20} /> },
    { id: 'integrations', title: 'Entegrasyonlar', description: 'Pazaryeri bağlantıları', completed: false, icon: <Settings size={20} /> },
    { id: 'team', title: 'Ekip Kurulumu', description: 'Kullanıcı ve rol tanımları', completed: false, icon: <Users size={20} /> },
  ];

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants?onboarding=incomplete');
      if (!res.ok) throw new Error('Onboarding tenant listesi alınamadı');
      const data = await res.json();
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Onboarding tenant listesi yüklenemedi:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async () => {
    if (!newTenant.name || !newTenant.email) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant),
      });
      if (!res.ok) throw new Error('Tenant oluşturulamadı');
      const data = await res.json();
      setTenants(prev => [...prev, {
        id: data.id || 't' + Date.now(),
        name: newTenant.name,
        email: newTenant.email,
        onboardingProgress: 0,
        currentStep: 'basic_info',
        completedSteps: [],
      }]);
      setNewTenant({ name: '', slug: '', email: '', plan: 'STARTER' });
      setView('list');
    } catch (error) {
      console.error('Tenant oluşturma hatası:', error);
    } finally {
      setCreating(false);
    }
  };

  const completeStep = async (tenantId: string, stepId: string) => {
    try {
      const res = await fetch(`/api/admin/onboarding/${tenantId}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
      });
      if (!res.ok) throw new Error('Adım güncellenemedi');
    } catch (error) {
      console.error('Onboarding adımı güncellenemedi:', error);
      return;
    }

    setTenants(prev => prev.map(t => {
      if (t.id === tenantId && !t.completedSteps.includes(stepId)) {
        const newCompleted = [...t.completedSteps, stepId];
        const stepIndex = allSteps.findIndex(s => s.id === stepId);
        const nextStep = allSteps[stepIndex + 1]?.id || 'complete';
        return {
          ...t,
          completedSteps: newCompleted,
          currentStep: nextStep,
          onboardingProgress: Math.round((newCompleted.length / allSteps.length) * 100),
        };
      }
      return t;
    }));
  };

  const viewTenantDetail = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setView('detail');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Create View
  if (view === 'create') {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-foreground">Yeni Tenant Oluştur</h1>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6 max-w-xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">İşletme Adı *</label>
              <input
                type="text"
                value={newTenant.name}
                onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="Örn: Mega Store"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">URL Slug</label>
              <div className="flex items-center">
                <span className="px-3 py-3 bg-slate-100 dark:bg-slate-700 rounded-l-xl text-sm text-slate-500">pazaryonetimi.com/</span>
                <input
                  type="text"
                  value={newTenant.slug}
                  onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                  placeholder="mega-store"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">E-posta *</label>
              <input
                type="email"
                value={newTenant.email}
                onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                placeholder="admin@megastore.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Plan</label>
              <select
                value={newTenant.plan}
                onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="STARTER">Starter</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            <button
              onClick={createTenant}
              disabled={creating || !newTenant.name || !newTenant.email}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Plus size={18} />
                  Tenant Oluştur
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detail View
  if (view === 'detail' && selectedTenant) {
    const stepsWithStatus = allSteps.map(step => ({
      ...step,
      completed: selectedTenant.completedSteps.includes(step.id),
      current: selectedTenant.currentStep === step.id,
    }));

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">{selectedTenant.name}</h1>
            <p className="text-slate-500">{selectedTenant.email}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-foreground">Onboarding İlerlemesi</span>
            <span className="text-2xl font-black text-indigo-600">{selectedTenant.onboardingProgress}%</span>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${selectedTenant.onboardingProgress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <div className="divide-y divide-slate-200 dark:divide-white/5">
            {stepsWithStatus.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-6 ${step.current ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
              >
                <div className={`p-3 rounded-xl ${step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                  {step.completed ? <Check size={20} /> : step.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${step.completed || step.current ? 'text-foreground' : 'text-slate-400'}`}>
                      {idx + 1}. {step.title}
                    </span>
                    {step.completed && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {step.current && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-indigo-500 text-white rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
                {!step.completed && (
                  <button
                    onClick={() => completeStep(selectedTenant.id, step.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Tamamla
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Rocket className="w-6 h-6 text-indigo-500" />
            </div>
            Tenant Onboarding
          </h1>
          <p className="text-slate-500 mt-1">Yeni tenant&apos;ları oluşturun ve onboarding sürecini yönetin</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Yeni Tenant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Circle className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Devam Eden</span>
          </div>
          <div className="text-3xl font-black text-foreground">{tenants.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tamamlanan (Bu Ay)</span>
          </div>
          <div className="text-3xl font-black text-foreground">12</div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Rocket className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ortalama Süre</span>
          </div>
          <div className="text-3xl font-black text-foreground">3.2 gün</div>
        </div>
      </div>

      {/* Tenant List */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5">
          <h3 className="font-bold text-foreground">Devam Eden Onboarding&apos;ler</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => viewTenantDetail(tenant)}
              className="flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
            >
              <div className="flex-1">
                <div className="font-bold text-foreground">{tenant.name}</div>
                <div className="text-sm text-slate-500">{tenant.email}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {tenant.completedSteps.length} / {allSteps.length} adım
                  </span>
                  <span className="text-sm font-bold text-indigo-600">%{tenant.onboardingProgress}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${tenant.onboardingProgress}%` }}
                  />
                </div>
              </div>
              <div className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                {allSteps.find(s => s.id === tenant.currentStep)?.title || 'Başlamadı'}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          ))}
          {tenants.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Rocket className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Devam eden onboarding yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
