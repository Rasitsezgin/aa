"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Edit2,
  Eye,
  Save,
  X,
  ExternalLink,
  Type,
  Image,
  Columns,
  Check,
  AlertCircle,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  url?: string;
  type: "LINK" | "DROPDOWN" | "MEGA_MENU" | "DIVIDER" | "LABEL";
  icon?: string;
  description?: string;
  isActive: boolean;
  isHighlighted: boolean;
  highlightColor?: string;
  imageUrl?: string;
  columns?: number;
  sortOrder: number;
  children: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  type: string;
  location: string;
}

export default function MenuItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string>("");

  useEffect(() => {
    params.then(p => {
      setMenuId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (menuId) {
      fetchMenuAndItems();
    }
  }, [menuId]);

  const fetchMenuAndItems = async () => {
    try {
      const [menuRes, itemsRes] = await Promise.all([
        fetch(`/api/admin/menus/${menuId}`),
        fetch(`/api/admin/menus/${menuId}/items`),
      ]);

      if (menuRes.ok && itemsRes.ok) {
        const menuData = await menuRes.json();
        const itemsData = await itemsRes.json();
        setMenu(menuData);
        setItems(itemsData);
      } else {
        setError("Veriler yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newOrder: MenuItem[]) => {
    setItems(newOrder);
    
    try {
      await fetch(`/api/admin/menus/${menuId}/items/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: newOrder.map((item, index) => ({ id: item.id, sortOrder: index })),
        }),
      });
    } catch (error) {
      console.error("Error reordering items:", error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(
        `/api/admin/menus/${menuId}/items/${itemId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setItems(items.filter((item) => item.id !== itemId));
      } else {
        alert("Öğe silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Öğe silinirken bir hata oluştu.");
    }
  };

  const handleSaveItem = async (itemData: Partial<MenuItem>) => {
    setIsSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/menus/${menuId}/items/${editingItem.id}`
        : `/api/admin/menus/${menuId}/items`;
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...itemData, parentId }),
      });

      if (response.ok) {
        await fetchMenuAndItems();
        setEditingItem(null);
        setShowAddModal(false);
        setParentId(null);
      } else {
        alert("Öğe kaydedilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Öğe kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case "LINK": return <ExternalLink className="w-4 h-4" />;
      case "DROPDOWN": return <ChevronDown className="w-4 h-4" />;
      case "MEGA_MENU": return <Columns className="w-4 h-4" />;
      case "DIVIDER": return <div className="w-4 h-px bg-current" />;
      case "LABEL": return <Type className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "LINK": return "Link";
      case "DROPDOWN": return "Dropdown";
      case "MEGA_MENU": return "Mega Menü";
      case "DIVIDER": return "Ayraç";
      case "LABEL": return "Etiket";
      default: return type;
    }
  };

  const renderItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id} className={`${level > 0 ? "ml-8 border-l-2 border-slate-200 pl-4" : ""}`}>
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
          <Reorder.Item value={item}>
            <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
          </Reorder.Item>

          <button
            onClick={() => hasChildren && toggleExpand(item.id)}
            className={`p-1 rounded ${hasChildren ? "hover:bg-slate-100" : "invisible"}`}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className={`p-2 rounded ${item.isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
            {getItemTypeIcon(item.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.label}</span>
              {item.isHighlighted && (
                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  Öne Çıkan
                </span>
              )}
              {!item.isActive && (
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">
                  Pasif
                </span>
              )}
            </div>
            {item.url && (
              <span className="text-sm text-slate-400 truncate">{item.url}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setParentId(item.id);
                setShowAddModal(true);
              }}
              className="p-2 hover:bg-green-50 rounded-lg text-green-600"
              title="Alt öğe ekle"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingItem(item)}
              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
              title="Düzenle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 hover:bg-red-50 rounded-lg text-red-600"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {item.children.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/menus`}
                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{menu?.name} - Menü Öğeleri</h1>
                <p className="text-slate-500 text-sm">{items.length} öğe</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Yeni Öğe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-100 p-4 rounded-xl">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                Sürükle-Bırak ile Sırala
              </h2>
              
              {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-400 mb-2">Henüz menü öğesi yok</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-blue-600 hover:underline"
                  >
                    İlk öğeyi ekle
                  </button>
                </div>
              ) : (
                <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
                  {items.map((item) => renderItem(item))}
                </Reorder.Group>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-xl border border-slate-200 sticky top-24">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Canlı Önizleme
              </h2>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className={`p-3 ${menu?.type === "HEADER" ? "bg-slate-900 text-white" : "bg-slate-100"}`}>
                  <nav className="flex flex-col gap-2">
                    {items.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        {item.icon && <span>🔹</span>}
                        <span className={!item.isActive ? "opacity-50" : ""}>{item.label}</span>
                        {item.children && item.children.length > 0 && (
                          <ChevronRight className="w-3 h-3 ml-auto" />
                        )}
                      </div>
                    ))}
                    {items.length > 5 && (
                      <span className="text-xs opacity-50">+{items.length - 5} daha</span>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingItem) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {editingItem ? "Öğeyi Düzenle" : "Yeni Öğe Ekle"}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowAddModal(false);
                      setParentId(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <ItemForm
                  item={editingItem}
                  parentId={parentId}
                  onSave={handleSaveItem}
                  onCancel={() => {
                    setEditingItem(null);
                    setShowAddModal(false);
                    setParentId(null);
                  }}
                  isSaving={isSaving}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItemForm({
  item,
  parentId,
  onSave,
  onCancel,
  isSaving,
}: {
  item: MenuItem | null;
  parentId: string | null;
  onSave: (data: Partial<MenuItem>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    label: item?.label || "",
    url: item?.url || "",
    type: item?.type || "LINK",
    icon: item?.icon || "",
    description: item?.description || "",
    isActive: item?.isActive ?? true,
    isHighlighted: item?.isHighlighted ?? false,
    highlightColor: item?.highlightColor || "",
    imageUrl: item?.imageUrl || "",
    columns: item?.columns || 1,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Etiket *
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          placeholder="Menüde görünecek metin"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tip
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="LINK">Link</option>
            <option value="DROPDOWN">Dropdown</option>
            <option value="MEGA_MENU">Mega Menü</option>
            <option value="DIVIDER">Ayraç</option>
            <option value="LABEL">Etiket</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            İkon (Lucide)
          </label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="home, user, settings..."
          />
        </div>
      </div>

      {formData.type === "LINK" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            URL
          </label>
          <input
            type="text"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="/sayfa-url veya https://..."
          />
        </div>
      )}

      {formData.type === "MEGA_MENU" && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Açıklama
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Mega menü alt başlığı"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Görsel URL
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Kolon Sayısı
              </label>
              <input
                type="number"
                value={formData.columns}
                onChange={(e) => setFormData({ ...formData, columns: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                min={1}
                max={4}
              />
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-4 pt-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-slate-300"
          />
          <span className="text-sm">Aktif</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isHighlighted}
            onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
            className="rounded border-slate-300"
          />
          <span className="text-sm">Öne Çıkan</span>
        </label>
      </div>

      {formData.isHighlighted && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vurgu Rengi
          </label>
          <input
            type="text"
            value={formData.highlightColor}
            onChange={(e) => setFormData({ ...formData, highlightColor: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="red-500 veya #FF0000"
          />
        </div>
      )}

      {parentId && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <Check className="w-4 h-4 inline mr-1" />
          Bu öğe bir alt menü olarak eklenecek
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
