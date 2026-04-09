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
import type { TranslationKey } from "@/i18n/translations";
import { formatVND } from "@/lib/format";
import { Transaction } from "@/types/transaction";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  wallets: { id: string; name: string }[];
}

const TransactionTable = ({
  transactions,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  wallets,
}: TransactionTableProps) => {
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
    <Card className="card-shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-70">{t("table.transaction")}</TableHead>
            <TableHead>{t("table.category")}</TableHead>
            <TableHead>{t("table.wallet")}</TableHead>
            <TableHead>{t("table.date")}</TableHead>
            <TableHead>{t("table.amount")}</TableHead>
            <TableHead className="text-right w-25">
              {t("table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onEdit(tx)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <CategoryIcon
                    category={tx.category}
                    iconName={tx.categoryIcon}
                    colorClassName={tx.categoryColor}
                  />
                  <div>
                    <p className="font-medium text-foreground">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.description}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {translateCategory(tx.category)}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {getWalletName(tx.walletId)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(tx.date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                <span
                  className={`font-semibold text-money ${tx.type === "income" ? "text-positive" : "text-negative"}`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatVND(tx.amount)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(tx);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tx.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </Card>
  );
};

export default TransactionTable;
