"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Clock3,
  User,
  Tag,
  MoreHorizontal,
  LayoutTemplate,
  Filter,
  Search,
  Download,
  Sparkles,
  Bot,
  BarChart3,
  Target,
  Zap,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
} from "lucide-react";

interface CalendarItem {
  id: string;
  title: string;
  type: "BLOG_POST" | "SOCIAL_POST" | "NEWSLETTER" | "VIDEO" | "PODCAST";
  status: "IDEA" | "PLANNED" | "IN_PROGRESS" | "IN_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED";
  date: string;
  timeSlot: string;
  assignedTo?: string;
  tags: string[];
  blogPostId?: string;
  campaign?: string;
}

interface Campaign {
  id: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string;
}

export default function EditorialCalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Initialize mock data
  useState(() => {
    const mockItems: CalendarItem[] = [
      { id: "1", title: "Blog Yazısı", type: "BLOG_POST", status: "SCHEDULED", date: "2024-01-15", timeSlot: "10:00", tags: ["blog"], campaign: "Kampanya 1" },
    ];
    const mockCampaigns: Campaign[] = [
      { id: "1", name: "Kampanya 1", color: "blue", startDate: "2024-01-01", endDate: "2024-12-31" },
    ];
    setItems(mockItems);
    setCampaigns(mockCampaigns);
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesStatus && matchesType;
    });
  }, [items, filterStatus, filterType]);

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getItemsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredItems.filter((item) => item.date.startsWith(dateStr));
  };

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "bg-green-500";
      case "SCHEDULED": return "bg-blue-500";
      case "APPROVED": return "bg-emerald-500";
      case "IN_REVIEW": return "bg-yellow-500";
      case "IN_PROGRESS": return "bg-purple-500";
      case "PLANNED": return "bg-slate-500";
      case "IDEA": return "bg-gray-400";
      default: return "bg-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      "IDEA": "Fikir",
      "PLANNED": "Planlandı",
      "IN_PROGRESS": "Yazılıyor",
      "IN_REVIEW": "İncelemede",
      "APPROVED": "Onaylandı",
      "SCHEDULED": "Planlandı",
      "PUBLISHED": "Yayınlandı",
    };
    return labels[status] || status;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "BLOG_POST": return "📝";
      case "SOCIAL_POST": return "📱";
      case "NEWSLETTER": return "📧";
      case "VIDEO": return "🎥";
      case "PODCAST": return "🎙️";
      default: return "📄";
    }
  };

  const stats = {
    total: items.length,
    published: items.filter((i) => i.status === "PUBLISHED").length,
    scheduled: items.filter((i) => i.status === "SCHEDULED").length,
    inProgress: items.filter((i) => i.status === "IN_PROGRESS").length,
    thisMonth: items.filter((i) => {
      const itemDate = new Date(i.date);
      return (
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getFullYear() === currentDate.getFullYear()
      );
    }).length,
  };

  const days = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-indigo-600" />
                  Editoryal Takvim
                </h1>
                <p className="text-slate-500 text-sm">{stats.total} planlanmış içerik</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/blog/calendar/campaigns"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Target className="w-4 h-4" />
                Kampanyalar
              </Link>
              <Link
                href="/admin/blog/calendar/new"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Plan Ekle
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-slate-500">Toplam</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            <p className="text-sm text-slate-500">Yayında</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            <p className="text-sm text-slate-500">Planlandı</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
            <p className="text-sm text-slate-500">Yazılıyor</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-orange-600">{stats.thisMonth}</p>
            <p className="text-sm text-slate-500">Bu Ay</p>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              {["month", "week", "list"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {mode === "month" && "Ay"}
                  {mode === "week" && "Hafta"}
                  {mode === "list" && "Liste"}
                </button>
              ))}
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtreler
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-4 mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Durum</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="all">Tümü</option>
                    <option value="IDEA">Fikir</option>
                    <option value="PLANNED">Planlandı</option>
                    <option value="IN_PROGRESS">Yazılıyor</option>
                    <option value="IN_REVIEW">İncelemede</option>
                    <option value="SCHEDULED">Planlandı</option>
                    <option value="PUBLISHED">Yayınlandı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tip</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="all">Tümü</option>
                    <option value="BLOG_POST">Blog Yazısı</option>
                    <option value="SOCIAL_POST">Sosyal Medya</option>
                    <option value="NEWSLETTER">Newsletter</option>
                    <option value="VIDEO">Video</option>
                    <option value="PODCAST">Podcast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kampanya</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                    <option value="">Tümü</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Month View */}
        {viewMode === "month" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-medium text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] border-b border-r border-slate-100 p-2 ${
                    !day ? "bg-slate-50" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{day}</span>
                        <button
                          onClick={() => {
                            const date = `${currentDate.getFullYear()}-${String(
                              currentDate.getMonth() + 1
                            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            window.location.href = `/admin/blog/calendar/new?date=${date}`;
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-100 rounded text-indigo-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {getItemsForDay(day).map((item) => (
                          <motion.button
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full text-left p-1.5 rounded-md text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">{getTypeIcon(item.type)}</span>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                              <span className="flex-1 truncate text-slate-700">{item.title}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Planlanmış içerik bulunmuyor.</p>
                <Link
                  href="/admin/blog/calendar/new"
                  className="text-indigo-600 hover:underline mt-2 inline-block"
                >
                  İçerik planla
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredItems
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-2xl">{getTypeIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900">{item.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span>{getStatusLabel(item.status)}</span>
                          <span>•</span>
                          <span>{new Date(item.date).toLocaleDateString("tr-TR")}</span>
                          {item.assignedTo && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" /> {item.assignedTo}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-2 hover:bg-slate-200 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTypeIcon(selectedItem.type)}</span>
                    <div>
                      <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                      <span className="text-sm text-slate-500">
                        {new Date(selectedItem.date).toLocaleDateString("tr-TR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedItem.status)}`}>
                      {getStatusLabel(selectedItem.status)}
                    </span>
                    {selectedItem.timeSlot && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                        <Clock className="w-3 h-3 inline mr-1" /> {selectedItem.timeSlot}
                      </span>
                    )}
                  </div>

                  {selectedItem.assignedTo && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4" />
                      <span>Atanan: {selectedItem.assignedTo}</span>
                    </div>
                  )}

                  {selectedItem.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedItem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedItem.campaign && (
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-700">
                        <Target className="w-4 h-4 inline mr-1" />
                        Kampanya: {selectedItem.campaign}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Link
                      href={`/admin/blog/calendar/${selectedItem.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Edit2 className="w-4 h-4" /> Düzenle
                    </Link>
                    {selectedItem.blogPostId && (
                      <Link
                        href={`/admin/blog/${selectedItem.blogPostId}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                      >
                        <LayoutTemplate className="w-4 h-4" /> Yazıya Git
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
