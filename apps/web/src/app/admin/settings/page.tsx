import { auth } from "@/auth";
import SettingsContent from "./settings-content";
import { redirect } from "next/navigation";

// Force dynamic rendering to avoid build-time DB calls
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/login");

    // Mock data for now
    return <SettingsContent userTwoFactorEnabled={false} />;
}
