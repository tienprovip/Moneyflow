import {
  Banknote,
  BookOpen,
  Car,
  Ellipsis,
  Gamepad2,
  Heart,
  HelpCircle,
  Laptop,
  Receipt,
  ShoppingCart,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

const ICON_MAP: Record<string, LucideIcon> = {
  Banknote,
  Laptop,
  TrendingUp,
  UtensilsCrossed,
  Gamepad2,
  Receipt,
  Heart,
  Car,
  BookOpen,
  ShoppingCart,
  Ellipsis,
};

type CategoryIconProps = {
  category: string;
  iconName?: string;
  colorClassName?: string;
  size?: "sm" | "md";
};

export const CategoryIcon = memo(function CategoryIcon(props: CategoryIconProps) {
  const { iconName, colorClassName, size = "md" } = props;
  const IconComp = iconName ? ICON_MAP[iconName] || HelpCircle : HelpCircle;
  const sizeClass = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        sizeClass,
        colorClassName || "bg-muted text-muted-foreground",
      )}
    >
      <IconComp className={iconSize} />
    </div>
  );
});
