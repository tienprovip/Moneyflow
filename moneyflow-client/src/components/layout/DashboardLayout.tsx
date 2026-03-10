import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Plus } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
  onFabClick?: () => void;
}

export function DashboardLayout({
  children,
  onFabClick,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Main content */}
      <main className="flex-1 min-h-screen min-w-0 overflow-hidden pb-24 lg:pb-8">
        <div className="max-w-300 mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile FAB */}
      {onFabClick && (
        <button
          onClick={onFabClick}
          className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
