import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CustomerFilters {
  tenantId: string;
  status?: 'vip' | 'regular' | 'new' | 'at-risk' | 'inactive';
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: CustomerFilters) {
    const { tenantId, status, search, sortBy = 'totalSpent', page = 1, limit = 20 } = filters;

    // Demo müşteri verileri
    const demoCustomers = [
      {
        id: 'cust-1',
        name: 'Ahmet Yılmaz',
        email: 'ahmet.y***@gmail.com',
        phone: '+90 532 XXX XX XX',
        city: 'İstanbul',
        totalOrders: 15,
        totalSpent: 24750,
        averageOrder: 1650,
        lastOrderDate: new Date('2024-01-15'),
        status: 'vip',
        rating: 5,
        platforms: ['TRENDYOL', 'AMAZON'],
        tags: ['Sadık Müşteri', 'Yüksek Değer'],
        createdAt: new Date('2023-01-15'),
        lifetimeValue: 45000
      },
      {
        id: 'cust-2',
        name: 'Elif Demir',
        email: 'elif.d***@hotmail.com',
        phone: '+90 535 XXX XX XX',
        city: 'Ankara',
        totalOrders: 8,
        totalSpent: 12450,
        averageOrder: 1556,
        lastOrderDate: new Date('2024-01-14'),
        status: 'regular',
        rating: 4,
        platforms: ['AMAZON', 'HEPSIBURADA'],
        tags: ['Teknoloji Meraklısı'],
        createdAt: new Date('2023-05-20'),
        lifetimeValue: 18000
      },
      {
        id: 'cust-3',
        name: 'Mehmet Kaya',
        email: 'm.kaya***@outlook.com',
        phone: '+90 542 XXX XX XX',
        city: 'İzmir',
        totalOrders: 3,
        totalSpent: 5890,
        averageOrder: 1963,
        lastOrderDate: new Date('2024-01-10'),
        status: 'new',
        rating: 5,
        platforms: ['TRENDYOL'],
        tags: ['Yeni Müşteri'],
        createdAt: new Date('2024-01-01'),
        lifetimeValue: 8000
      },
      {
        id: 'cust-4',
        name: 'Zeynep Arslan',
        email: 'zeynep***@gmail.com',
        phone: '+90 533 XXX XX XX',
        city: 'Bursa',
        totalOrders: 22,
        totalSpent: 35680,
        averageOrder: 1622,
        lastOrderDate: new Date('2024-01-13'),
        status: 'vip',
        rating: 5,
        platforms: ['TRENDYOL', 'AMAZON', 'N11'],
        tags: ['VIP', 'Sadık Müşteri', 'Hediye Alıcısı'],
        createdAt: new Date('2022-08-10'),
        lifetimeValue: 62000
      },
      {
        id: 'cust-5',
        name: 'Can Özkan',
        email: 'can.o***@yahoo.com',
        phone: '+90 544 XXX XX XX',
        city: 'Antalya',
        totalOrders: 5,
        totalSpent: 8920,
        averageOrder: 1784,
        lastOrderDate: new Date('2024-01-08'),
        status: 'at-risk',
        rating: 3,
        platforms: ['HEPSIBURADA'],
        tags: ['Risk Altında'],
        createdAt: new Date('2023-09-15'),
        lifetimeValue: 12000
      }
    ];

    // Filtreleme
    let filtered = demoCustomers;
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.city.toLowerCase().includes(searchLower)
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'totalOrders') return b.totalOrders - a.totalOrders;
      if (sortBy === 'lastOrder') return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
      return 0;
    });

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const customers = filtered.slice(skip, skip + limit);

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, tenantId: string) {
    return {
      id,
      name: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@gmail.com',
      phone: '+90 532 123 45 67',
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Caferağa Mah. Moda Cad. No:123 D:4',
      totalOrders: 15,
      totalSpent: 24750,
      averageOrder: 1650,
      lastOrderDate: new Date('2024-01-15'),
      status: 'vip',
      rating: 5,
      platforms: ['TRENDYOL', 'AMAZON'],
      tags: ['Sadık Müşteri', 'Yüksek Değer'],
      createdAt: new Date('2023-01-15'),
      lifetimeValue: 45000,
      recentOrders: [
        { id: 'ORD-001', date: new Date('2024-01-15'), amount: 1397, status: 'DELIVERED' },
        { id: 'ORD-002', date: new Date('2024-01-10'), amount: 2499, status: 'DELIVERED' },
        { id: 'ORD-003', date: new Date('2024-01-05'), amount: 899, status: 'DELIVERED' }
      ],
      notes: [
        { id: 1, text: 'VIP müşteri, özel ilgi göster', createdAt: new Date('2023-12-01') },
        { id: 2, text: 'Hızlı kargo tercih ediyor', createdAt: new Date('2023-11-15') }
      ]
    };
  }

  async getStats(tenantId: string) {
    return {
      total: 1247,
      vip: 89,
      regular: 456,
      new: 234,
      atRisk: 45,
      inactive: 423,
      totalRevenue: 2345670,
      averageLifetimeValue: 1880,
      averageOrderValue: 1456,
      retentionRate: 68.5,
      growth: {
        thisMonth: 12.5,
        lastMonth: 8.3
      },
      topCities: [
        { city: 'İstanbul', count: 456 },
        { city: 'Ankara', count: 234 },
        { city: 'İzmir', count: 189 },
        { city: 'Bursa', count: 98 },
        { city: 'Antalya', count: 76 }
      ]
    };
  }

  async addTag(customerId: string, tenantId: string, tag: string) {
    return { success: true, customerId, tag };
  }

  async removeTag(customerId: string, tenantId: string, tag: string) {
    return { success: true, customerId, tag };
  }

  async addNote(customerId: string, tenantId: string, note: string) {
    return {
      id: Date.now(),
      customerId,
      text: note,
      createdAt: new Date()
    };
  }

  async getSegments(tenantId: string) {
    return [
      {
        id: 'seg-1',
        name: 'Yüksek Değerli Müşteriler',
        description: 'Toplam harcaması 10.000₺ üzeri',
        count: 156,
        criteria: { totalSpent: { gte: 10000 } }
      },
      {
        id: 'seg-2',
        name: 'Sadık Müşteriler',
        description: '5+ sipariş veren müşteriler',
        count: 234,
        criteria: { totalOrders: { gte: 5 } }
      },
      {
        id: 'seg-3',
        name: 'Risk Altındaki Müşteriler',
        description: '30 gündür sipariş vermeyen',
        count: 89,
        criteria: { lastOrderDaysAgo: { gte: 30 } }
      },
      {
        id: 'seg-4',
        name: 'Yeni Müşteriler',
        description: 'Son 30 günde katılan',
        count: 67,
        criteria: { createdDaysAgo: { lte: 30 } }
      }
    ];
  }
}
