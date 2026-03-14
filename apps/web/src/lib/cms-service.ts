import fs from 'fs/promises';
import path from 'path';

const CMS_FILE_PATH = path.join(process.cwd(), 'src/data/cms.json');

export interface CMSData {
    features: {
        hero: { title: string; description: string };
        items: { title: string; description: string; icon: string }[];
    };
    solutions: {
        hero: { title: string; description: string };
        segments: { title: string; description: string; features: string[] }[];
    };
    contact: {
        hero: { title: string; description: string };
        info: { email: string; phone: string; address: string };
    };
}

export async function getCMSData(): Promise<CMSData> {
    try {
        const data = await fs.readFile(CMS_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading CMS file:', error);
        // Return empty default to avoid crash
        return {
            features: { hero: { title: '', description: '' }, items: [] },
            solutions: { hero: { title: '', description: '' }, segments: [] },
            contact: { hero: { title: '', description: '' }, info: { email: '', phone: '', address: '' } }
        };
    }
}

export async function updateCMSData(newData: Partial<CMSData>): Promise<boolean> {
    try {
        const currentData = await getCMSData();
        const updatedData = { ...currentData, ...newData };
        await fs.writeFile(CMS_FILE_PATH, JSON.stringify(updatedData, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing CMS file:', error);
        return false;
    }
}
