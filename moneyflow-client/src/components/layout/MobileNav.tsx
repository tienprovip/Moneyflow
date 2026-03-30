import { NavLink } from "@/components/NavLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import {
  ArrowLeftRight,
  CircleDollarSign,
  Languages,
  LayoutDashboard,
  Moon,
  MoreHorizontal,
  Settings,
  Sun,
  Target,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MobileNav = () => {
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLocale } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = [
    { title: t("nav.overview"), url: "/", icon: LayoutDashboard },
    {
      title: t("nav.transactions"),
      url: "/transactions",
      icon: ArrowLeftRight,
    },
    { title: t("nav.gold"), url: "/gold", icon: CircleDollarSign },
    { title: t("nav.wallets"), url: "/wallets", icon: Wallet },
  ];

  const moreItems = [
    { title: t("nav.savings"), url: "/savings", icon: Target },
    { title: t("nav.stocks"), url: "/stocks", icon: TrendingUp },
    {
      title: t("nav.profile"),
      url: "/profile",
      icon: User,
    },
    { title: t("nav.settings"), url: "/settings", icon: Settings },
  ];

  const isMoreActive = moreItems.some((item) => location.pathname === item.url);

  return (
    <>
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
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 transition-colors ${isMoreActive ? "text-primary" : "text-muted-foreground"}`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t("nav.more")}</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base">{t("nav.settings")}</SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {moreItems.map((item) => (
              <button
                key={item.url}
                onClick={() => {
                  navigate(item.url);
                  setMoreOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.url ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </button>
            ))}
            <div className="border-t border-border my-2"></div>
            <button
              onClick={() => {
                toggleLocale();
                setMoreOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Languages className="w-5 h-5" />
              <span>{t("lang.label")}</span>
            </button>
            <button
              onClick={() => {
                toggleTheme();
                setMoreOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span>
                {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileNav;
