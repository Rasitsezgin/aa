import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";

import DynamicPopupSystem from "@/components/DynamicPopupSystem";
import LiveChatWidget from "@/components/LiveChatWidget";

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <Navbar />
            {children}
            <Footer />

            {/* Floating Components */}
            <FloatingCTA />
            <DynamicPopupSystem />
            <LiveChatWidget />
        </div>
    );
}
