import { NavLink } from "@/components/NavLink";
import {
  ArrowLeftRight,
  CircleDollarSign,
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import React from "react";

const navItems = [
  { title: "Tổng quan", url: "/", icon: LayoutDashboard },
  { title: "Giao dịch", url: "/transactions", icon: ArrowLeftRight },
  { title: "Cổ phiếu", url: "/stocks", icon: TrendingUp },
  { title: "Vàng", url: "/gold", icon: CircleDollarSign },
  { title: "Mục tiêu", url: "/goals", icon: Target },
  { title: "Cài đặt", url: "/settings", icon: Settings },
];

const MobileNav = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
