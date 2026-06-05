"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Mail, CheckCircle, AlertCircle, ArrowRight, Zap, Gift, Percent, Truck } from "lucide-react";

interface SpecialOffer {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: string;
  value?: number;
  code?: string;
  bgColor: string;
  textColor?: string;
  showCountdown: boolean;
  endDate?: string;
  ctaText: string;
  ctaUrl: string;
  showEmailForm: boolean;
  emailFormTitle?: string;
  emailPlaceholder?: string;
}

interface SpecialOfferSectionProps {
  offer?: SpecialOffer;
}

export function SpecialOfferSection({ offer }: SpecialOfferSectionProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!offer?.showCountdown || !offer?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(offer.endDate!).getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [offer?.endDate, offer?.showCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/offers/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer?.id,
          email,
          name,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setEmail("");
        setName("");
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!offer) return null;

  const getOfferIcon = () => {
    switch (offer.type) {
      case "DISCOUNT_PERCENT": return <Percent className="w-8 h-8" />;
      case "FREE_SHIPPING": return <Truck className="w-8 h-8" />;
      case "FREE_TRIAL": return <Zap className="w-8 h-8" />;
      default: return <Gift className="w-8 h-8" />;
    }
  };

  const getOfferValue = () => {
    if (!offer.value) return null;
    if (offer.type === "DISCOUNT_PERCENT") return `%${offer.value}`;
    if (offer.type === "DISCOUNT_FIXED") return `₺${offer.value}`;
    return offer.value;
  };

  return (
    <section className={`relative overflow-hidden bg-gradient-to-r ${offer.bgColor} py-16 md:py-24`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Sınırlı Süreli Fırsat
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            >
              {offer.title}
            </motion.h2>

            {offer.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-white/90 mb-4"
              >
                {offer.subtitle}
              </motion.p>
            )}

            {offer.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-white/80 mb-8"
              >
                {offer.description}
              </motion.p>
            )}

            {/* Big Value Display */}
            {getOfferValue() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white rounded-2xl shadow-2xl mb-8"
              >
                <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {getOfferValue()}
                </span>
                <span className="text-slate-600 font-medium">{offer.type === "DISCOUNT_PERCENT" ? "İndirim" : "Kazanç"}</span>
              </motion.div>
            )}

            {/* Promo Code */}
            {offer.code && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/50 rounded-lg text-white"
              >
                <span className="text-sm opacity-80">Promosyon Kodu:</span>
                <span className="font-mono font-bold">{offer.code}</span>
              </motion.div>
            )}
          </div>

          {/* Right side - Countdown & Form */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            {offer.showCountdown && offer.endDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 text-white mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Fırsat Bitiyor!</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { value: timeLeft.days, label: "Gün" },
                    { value: timeLeft.hours, label: "Saat" },
                    { value: timeLeft.minutes, label: "Dakika" },
                    { value: timeLeft.seconds, label: "Saniye" },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white rounded-lg p-3 shadow-lg">
                        <span className="block text-2xl md:text-3xl font-bold text-slate-800">
                          {String(item.value).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-xs text-white/80 mt-1 block">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Email Form */}
            {offer.showEmailForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl"
              >
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="text-center py-10 px-4 relative overflow-hidden"
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" />
                      
                      {/* Confetti particles */}
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            opacity: 0, 
                            y: 0, 
                            x: 0,
                            scale: 0,
                            rotate: 0 
                          }}
                          animate={{ 
                            opacity: [0, 1, 1, 0], 
                            y: [-20, -100 - Math.random() * 50],
                            x: [(i - 6) * 15, (i - 6) * 30 + (Math.random() - 0.5) * 50],
                            scale: [0, 1, 1, 0.5],
                            rotate: [0, 360 + Math.random() * 360]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            delay: i * 0.05,
                            ease: "easeOut" 
                          }}
                          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm"
                          style={{
                            background: ['#10B981', '#34D399', '#6EE7B7', '#FBBF24', '#F59E0B', '#EC4899'][i % 6]
                          }}
                        />
                      ))}

                      {/* Success circle with pulse */}
                      <div className="relative z-10 mb-6">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-24 h-24 mx-auto relative"
                        >
                          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25" />
                          <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                              <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Success text */}
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative z-10 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3"
                      >
                        🎉 Tebrikler!
                      </motion.h3>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="relative z-10 text-slate-600 mb-4"
                      >
                        Başvurunuz başarıyla alındı!
                      </motion.p>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative z-10 text-sm text-slate-500 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 inline-block shadow-sm"
                      >
                        <span className="text-green-600 font-medium">{email}</span> adresine
                        <br />
                        özel teklif detaylarını göndereceğiz.
                      </motion.p>

                      {/* Decorative elements */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="relative z-10 mt-6 flex justify-center gap-2"
                      >
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⭐ Özel Fırsat</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">🎁 Sürpriz Hediye</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">🚀 Hızlı Teslimat</span>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold text-slate-800 mb-1">
                        {offer.emailFormTitle || "Hemen Başvurun"}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Email adresinizi bırakın, size özel teklifi sunalım
                      </p>

                      {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Adınız Soyadınız (İsteğe bağlı)"
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={offer.emailPlaceholder || "ornek@email.com"}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {offer.ctaText}
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      <p className="text-xs text-slate-400 text-center">
                        Bilgileriniz güvende. Spam yapmayız.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Direct CTA Button (if no email form) */}
            {!offer.showEmailForm && (
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                href={offer.ctaUrl}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all shadow-lg"
              >
                {offer.ctaText}
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
