import { CategoryIcon } from "@/components/transactions/CategoryIcon";
import TransactionPagination from "@/components/transactions/TransactionPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/hooks/use-language";
import { formatVND } from "@/lib/format";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { memo } from "react";

interface TransactionTableProps {
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

const TransactionTable = memo(function TransactionTable({
  categoryLabels,
  currentPage,
  onDelete,
  onEdit,
  onPageChange,
  totalPages,
  transactions,
  walletNames,
}: TransactionTableProps) {
  const { t } = useLanguage();

  return (
    <Card className="card-shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-70">{t("table.transaction")}</TableHead>
            <TableHead>{t("table.category")}</TableHead>
            <TableHead>{t("table.wallet")}</TableHead>
            <TableHead>{t("table.date")}</TableHead>
            <TableHead>{t("table.amount")}</TableHead>
            <TableHead className="w-25 text-right">
              {t("table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const normalizedCategory = transaction.category.trim().toLowerCase();
            const walletName = transaction.walletId
              ? walletNames[transaction.walletId] || FALLBACK_NAME
              : FALLBACK_NAME;

            return (
              <TableRow
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onEdit(transaction)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CategoryIcon
                      category={transaction.category}
                      iconName={transaction.categoryIcon}
                      colorClassName={transaction.categoryColor}
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {categoryLabels[normalizedCategory] || transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {walletName}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold text-money ${transaction.type === "income" ? "text-positive" : "text-negative"}`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatVND(transaction.amount)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(transaction);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(transaction.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </Card>
  );
});

export default TransactionTable;
