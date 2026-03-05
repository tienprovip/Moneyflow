import AppSidebar from "@/components/layout/AppSidebar";
import MobileNav from "@/components/layout/MobileNav";
import { Plus } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content */}
      <main className="flex-1 min-h-screen pb-24 lg:pb-8">
        <div className="max-w-300 mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile FAB */}
      <button className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center card-shadow-lg hover:scale-105 transition-transform active:scale-95">
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
