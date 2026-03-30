import React from "react";
import {
  Banknote,
  Building2,
  CircleDollarSign,
  CreditCard,
  Landmark,
  PiggyBank,
  Smartphone,
  Wallet as WalletGlyph,
  type LucideIcon,
} from "lucide-react";

const WALLET_ICON_COMPONENTS: Record<string, LucideIcon> = {
  Wallet: WalletGlyph,
  Landmark,
  CreditCard,
  Smartphone,
  Banknote,
  PiggyBank,
  Building2,
  CircleDollarSign,
};

interface WalletIconProps {
  name: string;
  className?: string;
}

const WalletIcon = React.memo(function WalletIcon({
  name,
  className,
}: WalletIconProps) {
  const IconComponent = WALLET_ICON_COMPONENTS[name] ?? WalletGlyph;
  return <IconComponent className={className} />;
});

export default WalletIcon;
