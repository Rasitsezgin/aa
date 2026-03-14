'use server';

import { prisma } from '@pazaryonetimi/database';
import { revalidatePath } from 'next/cache';

// PWA ayar anahtarları
const PWA_SETTINGS_KEYS = [
  'pwa_enabled',
  'pwa_app_name',
  'pwa_short_name',
  'pwa_description',
  'pwa_theme_color',
  'pwa_bg_color',
  'pwa_display',
  'pwa_start_url',
  'pwa_install_prompt_enabled',
  'pwa_install_prompt_delay',
  'pwa_offline_enabled',
  'pwa_push_notifications_enabled',
] as const;

type PwaSettingsKey = (typeof PWA_SETTINGS_KEYS)[number];

// PWA ayarlarını oku
export async function getPwaSettings(): Promise<Record<string, unknown>> {
  try {
    const settings = await prisma.systemSettings.findMany({
      where: {
        category: 'pwa',
      },
    });

    const result: Record<string, unknown> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }

    return result;
  } catch (error) {
    const errAny = error as Record<string, unknown>;
    if (errAny?.code === 'P2021') {
      console.warn('[PWA] SystemSettings tablosu mevcut değil, varsayılan ayarlar kullanılacak.');
    } else {
      console.error('[PWA] Ayarlar okunamadı:', error);
    }
    return {};
  }
}

// Tek bir PWA ayarını oku
export async function getPwaSetting(key: PwaSettingsKey): Promise<unknown> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });
    return setting?.value ?? null;
  } catch {
    return null;
  }
}

// PWA ayarlarını kaydet
export async function updatePwaSettings(
  _prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    // Yardımcı fonksiyon: FormData'dan güvenli şekilde string değer al
    const getString = (key: string, defaultVal = '') =>
      (formData.get(key) as string | null) ?? defaultVal;

    const updates: Array<{ key: PwaSettingsKey; value: string | number | boolean; description: string }> = [
      {
        key: 'pwa_enabled',
        value: formData.get('pwa_enabled') === 'on',
        description: 'PWA özelliği aktif/pasif',
      },
      {
        key: 'pwa_app_name',
        value: getString('pwa_app_name') || 'PazarYonetimi - E-ticaret Yönetim Platformu',
        description: 'PWA uygulama tam adı',
      },
      {
        key: 'pwa_short_name',
        value: getString('pwa_short_name') || 'PazarYonetimi',
        description: 'PWA kısa uygulama adı',
      },
      {
        key: 'pwa_description',
        value: getString('pwa_description') || 'Tüm pazaryerlerinizi tek platformdan yönetin.',
        description: 'PWA uygulama açıklaması',
      },
      {
        key: 'pwa_theme_color',
        value: getString('pwa_theme_color') || '#2563eb',
        description: 'PWA tema rengi',
      },
      {
        key: 'pwa_bg_color',
        value: getString('pwa_bg_color') || '#ffffff',
        description: 'PWA arka plan rengi',
      },
      {
        key: 'pwa_display',
        value: getString('pwa_display') || 'standalone',
        description: 'PWA görüntüleme modu',
      },
      {
        key: 'pwa_start_url',
        value: getString('pwa_start_url') || '/dashboard',
        description: "PWA başlangıç URL'si",
      },
      {
        key: 'pwa_install_prompt_enabled',
        value: formData.get('pwa_install_prompt_enabled') === 'on',
        description: 'Yükleme promptu aktif/pasif',
      },
      {
        key: 'pwa_install_prompt_delay',
        value: parseInt(getString('pwa_install_prompt_delay')) || 0,
        description: 'Yükleme promptu gecikmesi (saniye)',
      },
      {
        key: 'pwa_offline_enabled',
        value: formData.get('pwa_offline_enabled') === 'on',
        description: 'Offline çalışma modu',
      },
      {
        key: 'pwa_push_notifications_enabled',
        value: formData.get('pwa_push_notifications_enabled') === 'on',
        description: 'Push bildirimleri',
      },
    ];

    // Her ayarı upsert ile kaydet
    await Promise.all(
      updates.map((update) =>
        prisma.systemSettings.upsert({
          where: { key: update.key },
          update: { value: update.value },
          create: {
            key: update.key,
            value: update.value,
            category: 'pwa',
            description: update.description,
            isPublic: true,
          },
        })
      )
    );

    revalidatePath('/admin/settings');
    revalidatePath('/manifest.webmanifest');

    return { success: true, message: 'PWA ayarları başarıyla kaydedildi.' };
  } catch (error) {
    const errAny = error as Record<string, unknown>;
    if (errAny?.code === 'P2021') {
      console.warn('[PWA] SystemSettings tablosu mevcut değil, ayarlar kaydedilemedi.');
    } else {
      console.error('[PWA] Ayarlar kaydedilemedi:', error);
    }
    return { success: false, message: 'PWA ayarları kaydedilirken bir hata oluştu.' };
  }
}
