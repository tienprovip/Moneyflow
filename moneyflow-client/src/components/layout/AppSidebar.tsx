import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  CircleDollarSign,
  Target,
  Settings,
  LogOut,
  Landmark,
  Sun,
  Moon,
  Languages,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";

export function AppSidebar() {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale } = useLanguage();

  const menuItems = [
    { title: t("nav.overview"), url: "/", icon: LayoutDashboard },
    {
      title: t("nav.transactions"),
      url: "/transactions",
      icon: ArrowLeftRight,
    },
    { title: t("nav.stocks"), url: "/stocks", icon: TrendingUp },
    { title: t("nav.gold"), url: "/gold", icon: CircleDollarSign },
    { title: t("nav.savings"), url: "/savings", icon: Target },
    { title: t("nav.settings"), url: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-65 h-screen border-r border-border bg-card p-6 sticky top-0 overflow-y-auto">
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
            key={item.url}
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

      <div className="mt-auto pt-6 border-t border-border space-y-1">
        {/* Language toggle */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
        >
          <Languages className="w-4.5 h-4.5" />
          <span>{t("lang.label")}</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
        >
          {theme === "dark" ? (
            <Sun className="w-4.5 h-4.5" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
          <span>
            {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
          </span>
        </button>

        <NavLink
          to="/profile"
          className="flex items-center gap-3 pt-3 rounded-lg transition-colors"
          activeClassName=""
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Nguyễn Văn Tiến
            </p>
            <p className="text-xs text-muted-foreground truncate">
              tien@email.com
            </p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </NavLink>
      </div>
    </aside>
  );
}
