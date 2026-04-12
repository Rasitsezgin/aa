"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Building2,
  Store,
  Package,
  BarChart3,
  Zap,
  User,
  ArrowRight,
  Trophy,
  Gift,
  Star,
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<StepProps>;
  skippable: boolean;
}

interface StepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
}

// Step 1: Welcome
function WelcomeStep({ onNext }: StepProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30"
      >
        <Sparkles className="w-12 h-12 text-white" />
      </motion.div>
      
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Hoş Geldiniz! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 mt-2"
        >
          Pazaryonetimi'ni keşfetmeye hazır mısınız?
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-50 rounded-xl p-4 text-left space-y-3"
      >
        <p className="text-sm text-slate-600">Bu kısa turda şunları öğreneceksiniz:</p>
        <ul className="space-y-2 text-sm">
          {[
            "Dashboard'u kullanma",
            "Pazaryerlerinizi bağlama",
            "İlk ürünlerinizi ekleme",
            "AI araçlarını kullanma",
          ].map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-slate-700">{item}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
      >
        Turu Başlat
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

// Step 2: Profile Setup
function ProfileSetupStep({ onNext }: StepProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    timezone: "Europe/Istanbul",
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Profilinizi Oluşturun</h2>
        <p className="text-slate-500 mt-1">Kişisel bilgilerinizi girin</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ali Veli"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="+90 555 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Zaman Dilimi</label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
            <option value="Europe/London">Londra (GMT+0)</option>
            <option value="America/New_York">New York (GMT-5)</option>
          </select>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!formData.fullName}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
      >
        Devam Et
      </button>
    </div>
  );
}

// Step 3: Tenant/Store Setup
function TenantSetupStep({ onNext }: StepProps) {
  const [formData, setFormData] = useState({
    storeName: "",
    storeType: "ecommerce",
  });

  const storeTypes = [
    { id: "ecommerce", label: "E-ticaret", icon: Store },
    { id: "retail", label: "Perakende", icon: Building2 },
    { id: "wholesale", label: "Toptan", icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Mağazanızı Kurun</h2>
        <p className="text-slate-500 mt-1">İşletme bilgilerinizi ekleyin</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mağaza Adı</label>
          <input
            type="text"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Örnek Mağaza"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">İşletme Tipi</label>
          <div className="grid grid-cols-3 gap-3">
            {storeTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFormData({ ...formData, storeType: type.id })}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.storeType === type.id
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <type.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!formData.storeName}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
      >
        Mağazamı Oluştur
      </button>
    </div>
  );
}

// Step 4: Platform Connections
function PlatformConnectStep({ onNext }: StepProps) {
  const [connected, setConnected] = useState<string[]>([]);

  const platforms = [
    { id: "trendyol", name: "Trendyol", color: "bg-orange-500", icon: "T" },
    { id: "hepsiburada", name: "Hepsiburada", color: "bg-red-500", icon: "H" },
    { id: "amazon", name: "Amazon", color: "bg-blue-500", icon: "A" },
    { id: "n11", name: "N11", color: "bg-green-500", icon: "N" },
  ];

  const togglePlatform = (id: string) => {
    if (connected.includes(id)) {
      setConnected(connected.filter((p) => p !== id));
    } else {
      setConnected([...connected, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Pazaryerlerinizi Bağlayın</h2>
        <p className="text-slate-500 mt-1">Satış yaptığınız platformları seçin</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
              connected.includes(platform.id)
                ? "border-green-500 bg-green-50"
                : "border-slate-200 hover:border-orange-300"
            }`}
          >
            <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}>
              {platform.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">{platform.name}</p>
              {connected.includes(platform.id) && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Bağlandı
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          API anahtarlarınızı sonradan da ekleyebilirsiniz. Şimdilik atlayabilirsiniz.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        {connected.length > 0 ? `${connected.length} Platform Bağlandı` : "Sonra Bağlayacağım"}
      </button>
    </div>
  );
}

// Step 5: Dashboard Tour
function DashboardTourStep({ onNext }: StepProps) {
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      title: "Ana Panel",
      description: "Tüm mağazalarınızın özetini tek ekranda görün",
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      title: "AI Asistan",
      description: "Yapay zeka ile ürün açıklamaları ve analizler",
      icon: Zap,
      color: "bg-purple-500",
    },
    {
      title: "Siparişler",
      description: "Tüm pazaryeri siparişlerinizi tek yerden yönetin",
      icon: Package,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Turu</h2>
        <p className="text-slate-500 mt-1">Önemli özellikleri keşfedin</p>
      </div>

      <div className="relative h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute inset-0 bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
          >
            <div className={`w-20 h-20 ${tips[currentTip].color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
              {(() => {
                const Icon = tips[currentTip].icon;
                return <Icon className="w-10 h-10 text-white" />;
              })()}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{tips[currentTip].title}</h3>
            <p className="text-slate-600">{tips[currentTip].description}</p>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTip(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentTip ? "w-6 bg-blue-500" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        Anladım, Devam Et
      </button>
    </div>
  );
}

// Step 6: Completion
function CompletionStep({ onNext }: StepProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30"
      >
        <Trophy className="w-12 h-12 text-white" />
      </motion.div>

      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent"
        >
          Tebrikler! 🏆
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 mt-2"
        >
          Onboarding'i tamamladınız!
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6"
      >
        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5 text-orange-500" />
          Kazandığınız Rozetler
        </h3>
        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-1">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs text-slate-600">Hızlı Başlangıç</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-1">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-slate-600">AI Explorer</span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
      >
        Dashboard'a Git
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

// Main Onboarding Component
export function UserOnboarding() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Hoş Geldiniz",
      description: "Platformu keşfedin",
      icon: Sparkles,
      component: WelcomeStep,
      skippable: false,
    },
    {
      id: "profile",
      title: "Profil",
      subtitle: "Kişisel bilgiler",
      description: "Profil bilgilerinizi girin",
      icon: User,
      component: ProfileSetupStep,
      skippable: true,
    },
    {
      id: "tenant",
      title: "Mağaza",
      subtitle: "İşletme kurulumu",
      description: "Mağazanızı oluşturun",
      icon: Building2,
      component: TenantSetupStep,
      skippable: true,
    },
    {
      id: "platforms",
      title: "Pazaryerleri",
      subtitle: "Platform bağlantıları",
      description: "Pazaryerlerinizi bağlayın",
      icon: Store,
      component: PlatformConnectStep,
      skippable: true,
    },
    {
      id: "tour",
      title: "Dashboard",
      subtitle: "Özellik tanıtımı",
      description: "Dashboard turu",
      icon: BarChart3,
      component: DashboardTourStep,
      skippable: false,
    },
    {
      id: "complete",
      title: "Tebrikler!",
      description: "Onboarding tamamlandı",
      icon: Trophy,
      component: CompletionStep,
      skippable: false,
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  }, [currentStepIndex, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    if (currentStep.skippable) {
      handleNext();
    }
  }, [currentStep.skippable, handleNext]);

  const handleComplete = useCallback(async () => {
    setIsCompleted(true);
    
    // Save onboarding completion to API
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedSteps: steps.map((s) => s.id),
          totalTimeSpent: 0, // Calculate if needed
        }),
      });
    } catch (error) {
      console.error("Failed to save onboarding completion:", error);
    }

    // Close onboarding and redirect to dashboard
    setTimeout(() => {
      setIsVisible(false);
      router.push("/dashboard");
    }, 500);
  }, [router, steps]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  const StepComponent = currentStep.component;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header with progress */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">
                    Adım {currentStepIndex + 1} / {steps.length}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Step content */}
            <div className="p-6">
              <StepComponent
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkip}
                isFirst={currentStepIndex === 0}
                isLast={currentStepIndex === steps.length - 1}
                progress={progress}
              />
            </div>

            {/* Step indicators */}
            <div className="px-6 pb-4">
              <div className="flex justify-center gap-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStepIndex
                        ? "w-6 bg-blue-500"
                        : index < currentStepIndex
                        ? "bg-green-500"
                        : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
