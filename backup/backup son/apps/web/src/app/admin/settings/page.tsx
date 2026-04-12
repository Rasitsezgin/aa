import { auth } from "@/auth";
import SettingsContent from "./settings-content";
import { redirect } from "next/navigation";
import { getPwaSettings } from "@/actions/pwa-settings";

// Force dynamic rendering to avoid build-time DB calls
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    let pwaSettings: import('./settings-content').PwaSettings = {};
    try {
        pwaSettings = await getPwaSettings();
    } catch {
        // varsayılan ayarlar kullanılsın
    }

    return <SettingsContent userTwoFactorEnabled={false} pwaSettings={pwaSettings} />;
}
