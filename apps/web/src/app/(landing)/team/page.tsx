"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Github, Linkedin, Twitter, Mail, Award, Users, Globe, Target } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    image: string;
    social: { icon: React.ReactNode; url: string }[];
    stats: { label: string; value: string; color: string }[];
}

const teamMembers: TeamMember[] = [
    {
        id: 'founder1',
        name: 'Erdem Kaya',
        role: 'Kurucu & CEO',
        bio: 'E-ticaret endüstrisinde 12+ yıl deneyim. Önce Ticimax\'ta ürün müdürü, sonra kendi startup\'larını kurdu.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        social: [
            { icon: <Twitter size={18} />, url: 'https://twitter.com' },
            { icon: <Linkedin size={18} />, url: 'https://linkedin.com' },
            { icon: <Mail size={18} />, url: 'mailto:erdem@pazaryonetimi.com' },
        ],
        stats: [
            { label: 'Vizyon', value: '%100', color: 'bg-orange-500' },
            { label: 'Kodlama', value: '%85', color: 'bg-purple-500' }
        ]
    },
    {
        id: 'cofounder',
        name: 'Şule Özdemir',
        role: 'Kurucu & CTO',
        bio: 'Full-stack geliştirci. Google ve Uber\'da çalışmış. Pazaryonetimi\'nin teknik mimarisinin tasarımcısı.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
        social: [
            { icon: <Github size={18} />, url: 'https://github.com' },
            { icon: <Linkedin size={18} />, url: 'https://linkedin.com' },
        ],
        stats: [
            { label: 'Architecture', value: '%99', color: 'bg-green-500' },
            { label: 'Problem Solving', value: '%95', color: 'bg-orange-500' }
        ]
    },
    {
        id: 'cfo',
        name: 'Can Yıldız',
        role: 'CFO',
        bio: 'MBA mezunu. E-ticaret finansmanında expert. Pazaryonetimi\'nin iş modelini oluşturdu.',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        social: [
            { icon: <Linkedin size={18} />, url: 'https://linkedin.com' },
            { icon: <Mail size={18} />, url: 'mailto:can@pazaryonetimi.com' },
        ],
        stats: [
            { label: 'ROI', value: '%200', color: 'bg-emerald-500' },
            { label: 'Risk Mgmt', value: '%90', color: 'bg-red-500' }
        ]
    },
    {
        id: 'head-product',
        name: 'Zeynep Kara',
        role: 'Head of Product',
        bio: '500+ müşteri ile görüşmüş. Ürün stratejisinin arkasındaki vizyon sahibi.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        social: [
            { icon: <Twitter size={18} />, url: 'https://twitter.com' },
            { icon: <Linkedin size={18} />, url: 'https://linkedin.com' },
        ],
        stats: [
            { label: 'User Focus', value: '%98', color: 'bg-pink-500' },
            { label: 'Strategy', value: '%92', color: 'bg-orange-500' }
        ]
    },
    {
        id: 'head-marketing',
        name: 'Mehmet Aydın',
        role: 'Head of Marketing',
        bio: 'SaaS marketing specialist. 10+ startup\'ı growth\'a taşımış.',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
        social: [
            { icon: <Linkedin size={18} />, url: 'https://linkedin.com' },
            { icon: <Twitter size={18} />, url: 'https://twitter.com' },
        ],
        stats: [
            { label: 'Growth', value: '%300', color: 'bg-yellow-500' },
            { label: 'Creativity', value: '%95', color: 'bg-cyan-500' }
        ]
    },
    {
        id: 'head-support',
        name: 'Aylin Tunç',
        role: 'Head of Customer Success',
        bio: 'Müşteri memnuniyetine takıntılı. Her müşteriyi kişisel olarak tanıyor.',
        image: 'https://images.unsplash.com/photo-1517841905240-457ba28a26f3?w=400&h=400&fit=crop&crop=face',
        social: [
            { icon: <Linkedin size={18} />, url: 'https://linkedin.com' },
            { icon: <Mail size={18} />, url: 'mailto:aylin@pazaryonetimi.com' },
        ],
        stats: [
            { label: 'Empathy', value: '%100', color: 'bg-rose-500' },
            { label: 'Patience', value: '%99', color: 'bg-teal-500' }
        ]
    },
];

const values = [
    { icon: Target, title: 'Müşteri Odaklı', description: 'Her kararımız müşteri feedback\'e dayalıdır.' },
    { icon: Users, title: 'Takım İlk', description: 'Farklı bakış açıları bize daha iyi çözümler getiriyor.' },
    { icon: Globe, title: 'Açık ve Şeffaf', description: 'Başarılarımızdan ve başarısızlıklarımızdan açık konuşuruz.' },
    { icon: Award, title: 'Mükemmeli Hedefle', description: 'Küçük detaylar, büyük fark yaratır.' },
];

export default function TeamPage() {
    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/5 dark:bg-rose-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-100/50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-full mb-6">
                        <Users size={14} className="text-rose-600 dark:text-rose-400" />
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-300 tracking-wide uppercase">Takım</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Pazaryonetimi&apos;nin Yüzü
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                        E-ticaret tutkunu, ürün aşığı ve müşteri hayranı bir grup insanız. Dünya&apos;nın dört bir yanından gelen ekip olarak, tek hedefimiz: e-ticaret işletmelerini başarıya taşımak.
                    </p>
                </motion.div>

                {/* Story */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-20 max-w-3xl mx-auto">
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Hikayemiz</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                            2023 yılında, Erdem ve Şule bir kütüphanede karşılaştı. Erdem, yönettiği online mağazada 6 farklı pazaryerinde manuel olarak ürünleri yönettiğini, bu yüzden çoğu zaman yanlışlar yaptığını anlatıyordu. Şule, &ldquo;Bunu yazılım ile çözmek o kadar zor değil&rdquo; dedi.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                            3 ay sonra ilk MVP hazırlandı. İlk müşteri test ettikten sonra satışı %300 arttığını söyledi. O gün, Pazaryonetimi&apos;nin yolculuğu başladı.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Bugün 500+ e-ticaret işletmesinin günlük operasyonlarında Pazaryonetimi kullıyor. Ama biz daha öncümüzde çok yol olduğunu biliyoruz.
                        </p>
                    </div>
                </motion.div>

                {/* Values */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Temel Değerlerimiz</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                                <value.icon className="w-12 h-12 text-rose-600 dark:text-rose-400 mx-auto mb-4" />
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Team */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Lider Ekibi</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teamMembers.map((member, i) => (
                            <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="group text-center">
                                <div className="relative mb-6 overflow-hidden rounded-2xl">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={400}
                                        height={400}
                                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                        <div className="flex gap-3">
                                            {member.social.map((social, j) => (
                                                <a key={j} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors backdrop-blur-sm">
                                                    {social.icon}
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Stats Overlay */}
                                    <div className="absolute top-4 right-4 translate-x-full group-hover:translate-x-0 transition-transform duration-300 space-y-2">
                                        {member.stats.map((stat, k) => (
                                            <div key={k} className="bg-black/70 backdrop-blur-md p-2 rounded-lg text-left border border-white/10">
                                                <div className="text-[10px] text-slate-300 font-mono mb-1">{stat.label}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-1.5 w-12 rounded-full bg-white/20 overflow-hidden`}>
                                                        <div className={`h-full ${stat.color} rounded-full`} style={{ width: stat.value.includes('%') ? stat.value : '100%' }} />
                                                    </div>
                                                    <div className="text-xs font-bold text-white font-mono">{stat.value}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                                <p className="text-sm text-rose-600 dark:text-rose-400 font-bold mb-3">{member.role}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{member.bio}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Hiring CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-rose-600 to-pink-700 text-white text-center">
                    <h3 className="text-3xl font-bold mb-4">Takımımıza Katıl</h3>
                    <p className="text-rose-100 mb-8 max-w-xl mx-auto">
                        Açık pozisyonlar: Senior Backend Developer, Product Manager, Sales Executive ve daha fazlası.
                    </p>
                    <Link href="/kurumsal/kariyer" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-700 rounded-2xl font-bold hover:bg-rose-50 transition-colors">
                        Kariyer Sayfasını Gör
                    </Link>
                </motion.div>
            </div>
        </MarketingPageShell>
    );
}
