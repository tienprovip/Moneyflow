import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import TransactionPagination from "@/components/transactions/TransactionPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { formatVND } from "@/lib/format";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { memo } from "react";

interface Props {
  categoryLabels: Record<string, string>;
  currentPage: number;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onPageChange: (page: number) => void;
  totalPages: number;
  transactions: Transaction[];
  walletNames: Record<string, string>;
}

const FALLBACK_NAME = "-";

const TransactionMobileList = memo(function TransactionMobileList({
  categoryLabels,
  currentPage,
  onDelete,
  onEdit,
  onPageChange,
  totalPages,
  transactions,
  walletNames,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isTransfer = transaction.type === "transfer";
        const normalizedCategory = transaction.category.trim().toLowerCase();
        const walletName = transaction.walletId
          ? walletNames[transaction.walletId] ||
            transaction.fromWalletName ||
            FALLBACK_NAME
          : transaction.fromWalletName || FALLBACK_NAME;
        const transferDescription = `${t("tx.transferFrom")} ${transaction.fromWalletName || FALLBACK_NAME} ${t("tx.transferTo")} ${transaction.toWalletName || FALLBACK_NAME}`;
        const displayName = isTransfer
          ? t("tx.transferTitle")
          : transaction.name;
        const displayDescription = isTransfer
          ? transferDescription
          : transaction.description;
        const displayCategory = isTransfer
          ? t("tx.transferTitle")
          : categoryLabels[normalizedCategory] || transaction.category;
        const amountClassName = isTransfer
          ? "text-foreground"
          : transaction.type === "income"
            ? "text-positive"
            : "text-negative";
        const amountPrefix = isTransfer
          ? ""
          : transaction.type === "income"
            ? "+"
            : "-";

        return (
          <Card
            key={transaction.id}
            className={`card-shadow transition-shadow hover:card-shadow-hover ${isTransfer ? "" : "cursor-pointer"}`}
            onClick={isTransfer ? undefined : () => onEdit(transaction)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CategoryIcon
                  category={transaction.category}
                  iconName={transaction.categoryIcon}
                  colorClassName={transaction.categoryColor}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {displayDescription}
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap text-sm font-semibold text-money ${amountClassName}`}
                    >
                      {amountPrefix}
                      {formatVND(transaction.amount)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {displayCategory}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal">
                        {walletName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "dd/MM")}
                      </span>
                    </div>
                    {!isTransfer && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(transaction);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(transaction.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
});

export default TransactionMobileList;
