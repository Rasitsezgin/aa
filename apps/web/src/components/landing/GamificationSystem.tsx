'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, 
    Star, 
    Target, 
    Zap, 
    Rocket, 
    Crown, 
    Award, 
    Flame,
    CheckCircle,
    Lock,
    ArrowRight,
    Sparkles,
    Medal,
    Gem,
    Package,
    Brain,
    Heart
} from 'lucide-react';

interface GamificationSystemProps {
    features?: {
        gamification?: {
            enabled: boolean;
            showProgress: boolean;
            showAchievements: boolean;
            showLeaderboard: boolean;
            allowInteraction: boolean;
        };
    };
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    points: number;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
    color: string;
    category: string;
}

interface UserProgress {
    level: number;
    points: number;
    nextLevelPoints: number;
    streak: number;
    badges: string[];
    rank: string;
    completedTasks: number;
    totalTasks: number;
}

export const GamificationSystem = ({ features }: GamificationSystemProps) => {
    const [userProgress, setUserProgress] = useState<UserProgress>({
        level: 1,
        points: 0,
        nextLevelPoints: 100,
        streak: 0,
        badges: ['beginner'],
        rank: 'Yeni Başlayan',
        completedTasks: 0,
        totalTasks: 10
    });

    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
    const [showReward, setShowReward] = useState(false);

    const showProgress = features?.gamification?.showProgress !== false;
    const showAchievements = features?.gamification?.showAchievements !== false;
    const showLeaderboard = features?.gamification?.showLeaderboard !== false;
    const allowInteraction = features?.gamification?.allowInteraction !== false;

    const achievementsData: Achievement[] = [
        {
            id: 'first_product',
            title: 'İlk Ürün',
            description: 'İlk ürününüzü ekleyin',
            icon: Package,
            points: 10,
            unlocked: false,
            progress: 0,
            maxProgress: 1,
            color: 'from-orange-500 to-amber-500',
            category: 'Başlangıç'
        },
        {
            id: 'platform_master',
            title: 'Platform Ustası',
            description: 'Tüm platformları entegre edin',
            icon: Target,
            points: 50,
            unlocked: false,
            progress: 0,
            maxProgress: 5,
            color: 'from-purple-500 to-pink-500',
            category: 'Entegrasyon'
        },
        {
            id: 'speed_demon',
            title: 'Hız Canavarı',
            description: '100 siparişi 1 saatte işleyin',
            icon: Zap,
            points: 75,
            unlocked: false,
            progress: 0,
            maxProgress: 100,
            color: 'from-yellow-500 to-orange-500',
            category: 'Performans'
        },
        {
            id: 'ai_expert',
            title: 'AI Uzmanı',
            description: 'AI özelliklerini kullanarak %20 verimlilik artışı sağlayın',
            icon: Brain,
            points: 100,
            unlocked: false,
            progress: 0,
            maxProgress: 100,
            color: 'from-emerald-500 to-green-500',
            category: 'AI'
        },
        {
            id: 'revenue_king',
            title: 'Ciro Kralı',
            description: 'Aylık ₺100,000 ciro yapın',
            icon: Crown,
            points: 200,
            unlocked: false,
            progress: 0,
            maxProgress: 100000,
            color: 'from-amber-500 to-red-500',
            category: 'Satış'
        },
        {
            id: 'customer_hero',
            title: 'Müşteri Kahramanı',
            description: '1000 müşteri memnuniyeti kazanın',
            icon: Heart,
            points: 150,
            unlocked: false,
            progress: 0,
            maxProgress: 1000,
            color: 'from-rose-500 to-pink-500',
            category: 'Müşteri'
        }
    ];

    const ranks = [
        { level: 1, name: 'Yeni Başlayan', icon: Star, color: 'from-gray-500 to-slate-500' },
        { level: 2, name: 'Öğrenci', icon: Award, color: 'from-orange-500 to-amber-500' },
        { level: 3, name: 'Uzman', icon: Trophy, color: 'from-purple-500 to-pink-500' },
        { level: 4, name: 'Usta', icon: Medal, color: 'from-amber-500 to-orange-500' },
        { level: 5, name: 'Efsane', icon: Crown, color: 'from-red-500 to-rose-500' }
    ];

    useEffect(() => {
        if (!features?.gamification?.enabled) return;

        // Initialize achievements
        setAchievements(achievementsData);
    }, [features?.gamification?.enabled]);

    const handleAchievementClick = (achievementId: string) => {
        if (!allowInteraction) return;

        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return;

        // Simulate progress
        setAchievements(prev => prev.map(a => {
            if (a.id === achievementId) {
                const newProgress = Math.min(a.progress + 20, a.maxProgress);
                const isUnlocked = newProgress >= a.maxProgress;
                
                if (isUnlocked && !a.unlocked) {
                    // Award points
                    setUserProgress(prev => ({
                        ...prev,
                        points: prev.points + a.points,
                        completedTasks: prev.completedTasks + 1
                    }));

                    // Show reward
                    setShowReward(true);
                    setTimeout(() => setShowReward(false), 3000);
                }

                return {
                    ...a,
                    progress: newProgress,
                    unlocked: isUnlocked
                };
            }
            return a;
        }));
    };

    const currentRank = ranks.find(r => r.level === Math.min(userProgress.level, 5));
    const progressPercentage = (userProgress.points / userProgress.nextLevelPoints) * 100;

    if (!features?.gamification?.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">Gamification Sistemi</h3>
                            <p className="text-sm text-slate-500">Başarılarınızı takip edin, ödüller kazanın</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 font-bold">AKTİF</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* User Progress */}
                {showProgress && (
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-200 dark:border-orange-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 bg-gradient-to-r ${currentRank?.color} rounded-xl flex items-center justify-center`}>
                                    {React.createElement(currentRank?.icon || Star, { className: "w-6 h-6 text-white" })}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-foreground">{currentRank?.name}</div>
                                    <div className="text-sm text-slate-500">Level {userProgress.level}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-primary">{userProgress.points}</div>
                                <div className="text-xs text-slate-500">Puan</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Sıradaki Level</span>
                                <span>{userProgress.nextLevelPoints} puan</span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-lg font-bold text-orange-600">{userProgress.streak}</span>
                                </div>
                                <div className="text-xs text-slate-500">Seri</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{userProgress.badges.length}</div>
                                <div className="text-xs text-slate-500">Rozet</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">
                                    {userProgress.completedTasks}/{userProgress.totalTasks}
                                </div>
                                <div className="text-xs text-slate-500">Görev</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Achievements */}
                {showAchievements && (
                    <div>
                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary" />
                            Başarılar
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {achievements.map((achievement) => {
                                const Icon = achievement.icon;
                                const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
                                const isUnlocked = achievement.unlocked;

                                return (
                                    <motion.div
                                        key={achievement.id}
                                        whileHover={allowInteraction && !isUnlocked ? { scale: 1.02 } : {}}
                                        whileTap={allowInteraction && !isUnlocked ? { scale: 0.98 } : {}}
                                        onClick={() => handleAchievementClick(achievement.id)}
                                        className={`p-4 rounded-xl border transition-all ${
                                            isUnlocked
                                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800/50'
                                                : allowInteraction
                                                ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer'
                                                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-10 h-10 bg-gradient-to-r ${achievement.color} rounded-lg flex items-center justify-center`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-primary">+{achievement.points}</div>
                                                <div className="text-xs text-slate-500">puan</div>
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <div className="text-sm font-bold text-foreground">{achievement.title}</div>
                                            <div className="text-xs text-slate-500">{achievement.description}</div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                                                <span>{isUnlocked ? '✓ Tamamlandı' : `${Math.round(progressPercentage)}%`}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${
                                                        isUnlocked
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                            : 'bg-gradient-to-r ' + achievement.color
                                                    }`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressPercentage}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Lock indicator */}
                                        {!isUnlocked && (
                                            <div className="absolute top-2 right-2">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                {showLeaderboard && (
                    <div>
                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Liderlik Tablosu
                        </h4>
                        <div className="space-y-2">
                            {[
                                { rank: 1, name: 'Ahmet D.', points: 2840, badge: '🏆' },
                                { rank: 2, name: 'Ayşe K.', points: 2650, badge: '🥈' },
                                { rank: 3, name: 'Mehmet Y.', points: 2420, badge: '🥉' },
                                { rank: 4, name: 'Fatma S.', points: 2180, badge: '🌟' },
                                { rank: 5, name: 'Mustafa A.', points: 1950, badge: '⭐' }
                            ].map((user) => (
                                <motion.div
                                    key={user.rank}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: user.rank * 0.1 }}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                        user.rank <= 3
                                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800/50'
                                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                            user.rank === 1 ? 'bg-yellow-500 text-white' :
                                            user.rank === 2 ? 'bg-slate-400 text-white' :
                                            user.rank === 3 ? 'bg-amber-600 text-white' :
                                            'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}>
                                            {user.rank}
                                        </div>
                                        <div className="text-2xl">{user.badge}</div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">{user.name}</div>
                                            <div className="text-xs text-slate-500">Level {Math.floor(user.points / 500) + 1}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-primary">{user.points}</div>
                                        <div className="text-xs text-slate-500">puan</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reward Notification */}
                <AnimatePresence>
                    {showReward && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -50 }}
                            className="fixed top-20 right-4 z-50 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-2xl shadow-green-500/30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold">Başarı Kazanıldı!</div>
                                    <div className="text-sm opacity-90">+50 puan eklendi</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
