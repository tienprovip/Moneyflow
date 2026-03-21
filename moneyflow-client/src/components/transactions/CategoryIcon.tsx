import {
  Banknote,
  Laptop,
  TrendingUp,
  UtensilsCrossed,
  Gamepad2,
  Receipt,
  Heart,
  Car,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { CATEGORY_CONFIG } from "@/types/transaction";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Banknote,
  Laptop,
  TrendingUp,
  UtensilsCrossed,
  Gamepad2,
  Receipt,
  Heart,
  Car,
  BookOpen,
};

export function CategoryIcon({
  category,
  size = "md",
}: {
  category: string;
  size?: "sm" | "md";
}) {
  const config = CATEGORY_CONFIG[category];
  const IconComp = config ? ICON_MAP[config.icon] || HelpCircle : HelpCircle;
  const colorClass = config?.color || "bg-muted text-muted-foreground";
  const sizeClass = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center shrink-0",
        sizeClass,
        colorClass,
      )}
    >
      <IconComp className={iconSize} />
    </div>
  );
}
