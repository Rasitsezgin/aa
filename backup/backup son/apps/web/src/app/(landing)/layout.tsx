import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
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
            <ExitIntentPopup delay={10000} />
            <LiveChatWidget />
        </div>
    );
}
