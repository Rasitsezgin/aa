'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronDown,
  Users,
  Lock,
  Settings,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
} from 'lucide-react';

// Types
interface Role {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  userCount: number;
  isSystem: boolean;
  color: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isGranted: boolean;
}

// Demo data
function generateRoles(): Role[] {
  return [
    {
      id: 'admin',
      name: 'Yönetici',
      description: 'Tüm sistem fonksiyonlarına erişim',
      permissionCount: 32,
      userCount: 2,
      isSystem: true,
      color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    },
    {
      id: 'manager',
      name: 'Yönetici Asistanı',
      description: 'Satış ve müşteri yönetimi',
      permissionCount: 15,
      userCount: 5,
      isSystem: true,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    },
    {
      id: 'staff',
      name: 'Personel',
      description: 'Sipariş ve müşteri hizmetleri',
      permissionCount: 8,
      userCount: 12,
      isSystem: true,
      color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    },
    {
      id: 'viewer',
      name: 'Görüntüleyici',
      description: 'Yalnızca okuma izni',
      permissionCount: 4,
      userCount: 8,
      isSystem: true,
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
    },
  ];
}

function generatePermissions(): Record<string, Permission[]> {
  return {
    'Ürünler': [
      { id: 'p1', name: 'Ürünleri Görüntüle', description: 'Tüm ürünleri görebilir', category: 'products', isGranted: true },
      { id: 'p2', name: 'Ürün Oluştur', description: 'Yeni ürün ekleyebilir', category: 'products', isGranted: true },
      { id: 'p3', name: 'Ürün Düzenle', description: 'Ürün bilgilerini güncelleyebilir', category: 'products', isGranted: true },
      { id: 'p4', name: 'Ürün Sil', description: 'Ürünleri silebilir', category: 'products', isGranted: false },
    ],
    'Siparişler': [
      { id: 'o1', name: 'Siparişleri Görüntüle', description: 'Tüm siparişleri görebilir', category: 'orders', isGranted: true },
      { id: 'o2', name: 'Sipariş Oluştur', description: 'Yeni sipariş verebilir', category: 'orders', isGranted: true },
      { id: 'o3', name: 'Sipariş Düzenle', description: 'Sipariş bilgilerini güncelleyebilir', category: 'orders', isGranted: true },
      { id: 'o4', name: 'Sipariş Kargo', description: 'Siparişi kargoyla gönderebilir', category: 'orders', isGranted: true },
    ],
    'Müşteriler': [
      { id: 'c1', name: 'Müşterileri Görüntüle', description: 'Tüm müşterileri görebilir', category: 'customers', isGranted: true },
      { id: 'c2', name: 'Müşteri Oluştur', description: 'Yeni müşteri ekleyebilir', category: 'customers', isGranted: true },
      { id: 'c3', name: 'Müşteri Düzenle', description: 'Müşteri bilgilerini güncelleyebilir', category: 'customers', isGranted: true },
      { id: 'c4', name: 'Müşteri Sil', description: 'Müşteri silebilir', category: 'customers', isGranted: false },
    ],
    'Analitikler': [
      { id: 'a1', name: 'Analitikleri Görüntüle', description: 'Analitik verilerini görebilir', category: 'analytics', isGranted: true },
      { id: 'a2', name: 'Dışa Aktarma', description: 'Rapor dışa aktarabilir', category: 'analytics', isGranted: false },
    ],
  };
}

// Hooks
export function useRBACDashboard() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      setRoles(generateRoles());
      setLoading(false);
    }, 300);
  }, []);
  
  return { roles, loading };
}

// Role Card
function RoleCard({
  role,
  onEdit,
}: {
  role: Role;
  onEdit: (roleId: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{role.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
        </div>
        {role.isSystem && (
          <span className="text-xs font-bold bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
            Sistem
          </span>
        )}
      </div>
      
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Lock className="w-4 h-4" />
            İzinler
          </span>
          <span className="font-semibold">{role.permissionCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Users className="w-4 h-4" />
            Kullanıcılar
          </span>
          <span className="font-semibold">{role.userCount}</span>
        </div>
      </div>
      
      <button
        onClick={() => onEdit(role.id)}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
      >
        <Edit className="w-4 h-4 inline mr-1" />
        İzinleri Düzenle
      </button>
    </motion.div>
  );
}

// Permission Category
function PermissionCategory({
  categoryName,
  permissions,
  onToggle,
}: {
  categoryName: string;
  permissions: Permission[];
  onToggle: (permissionId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const grantedCount = permissions.filter(p => p.isGranted).length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
          />
          <h4 className="font-semibold">{categoryName}</h4>
          <span className="text-sm text-gray-500">
            {grantedCount}/{permissions.length}
          </span>
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-3">
              {permissions.map(permission => (
                <label
                  key={permission.id}
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={permission.isGranted}
                    onChange={() => onToggle(permission.id)}
                    className="w-4 h-4 mt-1 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{permission.name}</p>
                    <p className="text-xs text-gray-500">{permission.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Component
export function RoleBasedAccessControl() {
  const { roles, loading } = useRBACDashboard();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>(() => generatePermissions());
  
  const handlePermissionToggle = (permissionId: string) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      for (const category in newPermissions) {
        newPermissions[category] = newPermissions[category].map(p =>
          p.id === permissionId ? { ...p, isGranted: !p.isGranted } : p
        );
      }
      return newPermissions;
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Rol Yönetimi (RBAC)
          </h2>
          <p className="text-gray-500 mt-1">Roller, izinler ve kullanıcı erişim kontrolü</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Yeni Rol
        </button>
      </div>
      
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4 border border-blue-200 dark:border-blue-500/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Sistemde 4 önceden tanımlanmış rol vardır. Özel roller oluşturabilir ve izinleri granüler olarak yönetebilirsiniz.
        </p>
      </div>
      
      {/* Roles Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={setSelectedRole}
            />
          ))}
        </div>
      )}
      
      {/* Permissions Editor */}
      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">İzinleri Düzenle</h3>
            <button
              onClick={() => setSelectedRole(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            {Object.entries(permissions).map(([category, perms]) => (
              <PermissionCategory
                key={category}
                categoryName={category}
                permissions={perms}
                onToggle={handlePermissionToggle}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedRole(null)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Değişiklikleri Kaydet
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Permission Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4">İzin İstatistikleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Toplam İzin</p>
            <p className="text-3xl font-bold text-blue-600">32</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Roller</p>
            <p className="text-3xl font-bold text-green-600">4</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Atanan Kullanıcı</p>
            <p className="text-3xl font-bold text-purple-600">27</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleBasedAccessControl;
