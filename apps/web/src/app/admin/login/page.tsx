import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function AdminLoginPage() {
    const session = await auth();

    // If already logged in, redirect to admin dashboard
    if (session?.user?.id) {
        redirect("/admin");
    }

    return <LoginForm />;
}
