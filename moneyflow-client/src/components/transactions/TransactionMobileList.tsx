import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import TransactionPagination from "@/components/transactions/TransactionPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import type { TranslationKey } from "@/i18n/translations";
import { formatVND } from "@/lib/format";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  wallets: { id: string; name: string }[];
}

const TransactionMobileList = ({
  transactions,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  wallets,
}: Props) => {
  const { t } = useLanguage();

  const translateCategory = (cat: string) => {
    const key = `cat.${cat}` as TranslationKey;
    const result = t(key);
    return result === key ? cat : result;
  };

  const getWalletName = (walletId?: string) => {
    if (!walletId) return "—";
    return wallets.find((w) => w.id === walletId)?.name || "—";
  };
  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <Card
          key={tx.id}
          className="card-shadow hover:card-shadow-hover transition-shadow cursor-pointer"
          onClick={() => onEdit(tx)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CategoryIcon
                category={tx.category}
                iconName={tx.categoryIcon}
                colorClassName={tx.categoryColor}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {tx.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.description}
                    </p>
                  </div>
                  <span
                    className={`font-semibold text-sm text-money whitespace-nowrap ${tx.type === "income" ? "text-positive" : "text-negative"}`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatVND(tx.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal text-xs">
                      {translateCategory(tx.category)}
                    </Badge>
                    <Badge variant="outline" className="font-normal text-xs">
                      {getWalletName(tx.walletId)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(tx.date), "dd/MM")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tx);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tx.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default TransactionMobileList;
