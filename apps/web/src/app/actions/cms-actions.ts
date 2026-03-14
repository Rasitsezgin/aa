'use server';

import { updateCMSData, CMSData } from '@/lib/cms-service';
import { revalidatePath } from 'next/cache';

export async function saveCMSData(data: Partial<CMSData>) {
    const success = await updateCMSData(data);
    if (success) {
        revalidatePath('/features');
        revalidatePath('/solutions');
        revalidatePath('/contact');
    }
    return success;
}
