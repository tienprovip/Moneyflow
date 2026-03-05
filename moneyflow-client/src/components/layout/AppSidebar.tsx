import { NavLink } from "@/components/NavLink";
import {
  ArrowLeftRight,
  CircleDollarSign,
  Landmark,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";

const menuItems = [
  { title: "Tổng quan", url: "/", icon: LayoutDashboard },
  { title: "Giao dịch", url: "/transactions", icon: ArrowLeftRight },
  { title: "Cổ phiếu", url: "/stocks", icon: TrendingUp },
  { title: "Vàng", url: "/gold", icon: CircleDollarSign },
  { title: "Mục tiêu", url: "/goals", icon: Target },
  { title: "Cài đặt", url: "/settings", icon: Settings },
];

const AppSidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-65 min-h-screen border-r border-border bg-card p-6 sticky top-0">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Landmark className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">
          MoneyFlow
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <item.icon className="w-4.5 h-4.5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Phan Đình Tiến
            </p>
            <p className="text-xs text-muted-foreground truncate">
              ptien1305@gmail.com
            </p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
