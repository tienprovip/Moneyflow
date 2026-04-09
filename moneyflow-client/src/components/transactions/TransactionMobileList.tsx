import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import TransactionPagination from "@/components/transactions/TransactionPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const normalizedCategory = transaction.category.trim().toLowerCase();
        const walletName = transaction.walletId
          ? walletNames[transaction.walletId] || FALLBACK_NAME
          : FALLBACK_NAME;

        return (
          <Card
            key={transaction.id}
            className="card-shadow cursor-pointer transition-shadow hover:card-shadow-hover"
            onClick={() => onEdit(transaction)}
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
                        {transaction.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.description}
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap text-sm font-semibold text-money ${transaction.type === "income" ? "text-positive" : "text-negative"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatVND(transaction.amount)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {categoryLabels[normalizedCategory] ||
                          transaction.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal">
                        {walletName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), "dd/MM")}
                      </span>
                    </div>
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
