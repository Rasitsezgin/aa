import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function AdminLoginPage() {
    const session = await auth();

    const userType = (session?.user as { type?: string } | undefined)?.type;

    // If already logged in as admin-like user, redirect to admin dashboard
    if (session?.user?.id && (userType === 'ADMIN' || userType === 'SUPER_ADMIN')) {
        redirect("/admin");
    }

    // Logged-in non-admin users should not be bounced into admin pages
    if (session?.user?.id) {
        redirect('/unauthorized');
    }

    return <LoginForm />;
}
