'use server'

import { prisma } from "@pazaryonetimi/database"
import { revalidatePath } from "next/cache"

export async function updateAuthSettings(_prevState: unknown, formData: FormData) {
    try {
        const googleId = formData.get('google_id') as string
        const googleSecret = formData.get('google_secret') as string
        const facebookId = formData.get('facebook_id') as string
        const facebookSecret = formData.get('facebook_secret') as string

        // Helper to upsert setting
        const saveSetting = async (key: string, value: string) => {
            await prisma.systemSettings.upsert({
                where: { key },
                update: { value: value },
                create: {
                    key,
                    value: value,
                    category: 'auth',
                    description: `Auth setting for ${key}`,
                    isPublic: false
                }
            })
        }

        if (googleId) await saveSetting('google_id', googleId)
        if (googleSecret) await saveSetting('google_secret', googleSecret)
        if (facebookId) await saveSetting('facebook_id', facebookId)
        if (facebookSecret) await saveSetting('facebook_secret', facebookSecret)

        revalidatePath('/admin/settings/auth')
        return { success: true, message: 'Settings updated successfully' }
    } catch (error) {
        console.error('Failed to update auth settings:', error)
        return { success: false, message: 'Failed to update settings' }
    }
}
