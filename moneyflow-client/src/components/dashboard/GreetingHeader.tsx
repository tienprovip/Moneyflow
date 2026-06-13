import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { fmtVND } from "@/lib/format";

interface GreetingHeaderProps {
  totalNetWorth: number;
  // If you have user name from auth context, you can pass it here. 
  // For now we default to "Bạn" or use a hardcoded name if none provided.
  userName?: string;
}

export function GreetingHeader({ totalNetWorth, userName = "Tiến" }: GreetingHeaderProps) {
  const { t } = useLanguage();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("greeting.morning")
      : hour < 18
        ? t("greeting.afternoon")
        : t("greeting.evening");

  return (
    <div className="mb-6 sm:mb-8 animate-fade-in">
      <p className="text-muted-foreground text-sm font-medium mb-1">
        {greeting}, {userName} 👋
      </p>
      <div className="flex items-end gap-2 sm:gap-4 flex-wrap">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl text-money text-foreground">
          {fmtVND(totalNetWorth)}
        </h1>
        {/* We keep the percent change mocked or static for now until history tracking is implemented */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12,4%</span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mt-1">
        {t("greeting.netWorth")}
      </p>
    </div>
  );
}
