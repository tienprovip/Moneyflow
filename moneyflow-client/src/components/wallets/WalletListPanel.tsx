import WalletIcon from "@/components/wallets/WalletIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fmtVND } from "@/lib/format";
import { Wallet, WALLET_TYPE_LABELS } from "@/types/wallet";
import { Loader2 } from "lucide-react";
import React from "react";

interface WalletListPanelProps {
  addFirstLabel: string;
  emptyTitle: string;
  isLoadingWallets: boolean;
  locale: "vi" | "en";
  onOpenAdd: () => void;
  onSelectWallet: (walletId: string) => void;
  selectedWallet: string | null;
  wallets: Wallet[];
}

const WalletListPanel = React.memo(function WalletListPanel({
  addFirstLabel,
  emptyTitle,
  isLoadingWallets,
  locale,
  onOpenAdd,
  onSelectWallet,
  selectedWallet,
  wallets,
}: WalletListPanelProps) {
  if (isLoadingWallets) {
    return (
      <Card className="py-12">
        <CardContent className="flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (wallets.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <p className="text-muted-foreground mb-3">{emptyTitle}</p>
          <Button onClick={onOpenAdd} variant="outline">
            {addFirstLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {wallets.map((wallet) => (
        <Card
          key={wallet.id}
          className={`cursor-pointer transition-all hover:card-shadow-hover hover:border-primary ${selectedWallet === wallet.id ? "ring-2 ring-primary" : ""}`}
          onClick={() => onSelectWallet(wallet.id)}
        >
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${wallet.color}`}
            >
              <WalletIcon name={wallet.icon} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {wallet.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {WALLET_TYPE_LABELS[wallet.type][locale]}
              </p>
            </div>
            <p
              className={`text-sm font-bold text-money ${wallet.balance >= 0 ? "text-positive" : "text-negative"}`}
            >
              {fmtVND(wallet.balance)}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
});

export default WalletListPanel;
