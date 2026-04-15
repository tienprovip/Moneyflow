import WalletIcon from "@/components/wallets/WalletIcon";
import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { fmtVND } from "@/lib/format";
import { Transaction } from "@/types/transaction";
import { Wallet, WALLET_TYPE_LABELS } from "@/types/wallet";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import React from "react";

interface WalletDetailPanelProps {
  deletingId: string | null;
  loadingTxWalletId: string | null;
  locale: "vi" | "en";
  noTransactionsLabel: string;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: Wallet) => void;
  recentTransactionsLabel: string;
  selectHintLabel: string;
  selectedTxs: Transaction[];
  wallet: Wallet | null;
}

const WalletDetailPanel = React.memo(function WalletDetailPanel({
  deletingId,
  loadingTxWalletId,
  locale,
  noTransactionsLabel,
  onDeleteWallet,
  onEditWallet,
  recentTransactionsLabel,
  selectHintLabel,
  selectedTxs,
  wallet,
}: WalletDetailPanelProps) {
  const { t } = useLanguage();

  if (!wallet) {
    return (
      <Card className="flex items-center justify-center min-h-75">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">{selectHintLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${wallet.color}`}
            >
              <WalletIcon name={wallet.icon} className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{wallet.name}</CardTitle>
              <CardDescription>
                {WALLET_TYPE_LABELS[wallet.type][locale]}
                {wallet.note && ` - ${wallet.note}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditWallet(wallet);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              disabled={deletingId === wallet.id}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteWallet(wallet.id);
              }}
            >
              {deletingId === wallet.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        <p
          className={`text-2xl font-bold text-money mt-2 ${wallet.balance >= 0 ? "text-positive" : "text-negative"}`}
        >
          {fmtVND(wallet.balance)}
        </p>
      </CardHeader>
      <CardContent>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {recentTransactionsLabel}
        </h3>
        {loadingTxWalletId === wallet.id ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : selectedTxs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {noTransactionsLabel}
          </p>
        ) : (
          <div className="space-y-2">
            {selectedTxs.map((tx) => {
              const isTransfer = tx.type === "transfer";
              const transferDescription = `${t("tx.transferFrom")} ${tx.fromWalletName || "-"} ${t("tx.transferTo")} ${tx.toWalletName || "-"}`;
              const displayName = isTransfer ? t("tx.transferTitle") : tx.name;
              const displayDesc = isTransfer ? transferDescription : tx.date;
              const amountClassName = isTransfer
                ? "text-foreground"
                : tx.type === "income"
                  ? "text-positive"
                  : "text-negative";
              const amountPrefix = isTransfer
                ? ""
                : tx.type === "income"
                  ? "+"
                  : "-";

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <CategoryIcon
                    category={tx.category}
                    iconName={tx.categoryIcon}
                    colorClassName={tx.categoryColor}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{displayDesc}</p>
                  </div>
                  <p className={`text-sm font-bold text-money ${amountClassName}`}>
                    {amountPrefix}
                    {fmtVND(tx.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default WalletDetailPanel;
