import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fmtVND } from "@/lib/format";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import type { GoldHolding, GoldSale, GoldType } from "@/types/gold";
import { GOLD_TYPE_LABELS } from "@/types/gold";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: GoldType | null;
  holdings: GoldHolding[];
  sales: GoldSale[];
  onEditHolding: (h: GoldHolding) => void;
  onDeleteHolding: (id: string) => void;
}

export function GoldTypeDetailDialog({
  open,
  onOpenChange,
  type,
  holdings,
  sales,
  onEditHolding,
  onDeleteHolding,
}: Props) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  if (!type) return null;

  const sortedBuys = [...holdings].sort(
    (a, b) =>
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
  );
  const sortedSells = [...sales].sort(
    (a, b) => new Date(b.sellDate).getTime() - new Date(a.sellDate).getTime(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-170 max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6 gap-3 sm:gap-4">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0"
            >
              {GOLD_TYPE_LABELS[type] ?? type}
            </Badge>
            <DialogTitle className="text-base sm:text-lg">
              {t("gold.detailTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm">
            {t("gold.detailDesc")}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="buys"
          className="flex-1 overflow-hidden flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="buys" className="text-xs sm:text-sm">
              {t("gold.tabBuys")} ({sortedBuys.length})
            </TabsTrigger>
            <TabsTrigger value="sells" className="text-xs sm:text-sm">
              {t("gold.tabSells")} ({sortedSells.length})
            </TabsTrigger>
          </TabsList>

          {/* BUYS */}
          <TabsContent
            value="buys"
            className="flex-1 overflow-auto mt-3 -mx-1 px-1"
          >
            {sortedBuys.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {t("gold.noBuys")}
              </div>
            ) : isMobile ? (
              <div className="space-y-2">
                {sortedBuys.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-lg bg-secondary/40 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(h.purchaseDate), "dd/MM/yyyy")}
                        </p>
                        {h.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {h.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEditHolding(h)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => onDeleteHolding(h.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">
                          {t("gold.qtyCol")}
                        </p>
                        <p className="font-medium text-foreground mt-0.5">
                          {h.quantity} {t("gold.unit")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {t("gold.purchasePrice")}
                        </p>
                        <p className="font-medium text-foreground mt-0.5 text-money">
                          {(h.purchasePrice / 1e6).toFixed(2)}M
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">
                          {t("gold.totalInvested")}
                        </p>
                        <p className="font-semibold text-foreground mt-0.5 text-money">
                          {fmtVND(h.quantity * h.purchasePrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-left">
                      {t("gold.purchaseDate")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("gold.qtyCol")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("gold.purchasePrice")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("gold.totalInvested")}
                    </TableHead>
                    <TableHead className="text-right w-17.5">
                      {t("table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBuys.map((h) => (
                    <TableRow key={h.id} className="group hover:bg-muted/50">
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(h.purchaseDate), "dd/MM/yyyy")}
                        {h.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {h.notes}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {h.quantity} {t("gold.unit")}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {fmtVND(h.purchasePrice)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {fmtVND(h.quantity * h.purchasePrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onEditHolding(h)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => onDeleteHolding(h.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* SELLS */}
          <TabsContent
            value="sells"
            className="flex-1 overflow-auto mt-3 -mx-1 px-1"
          >
            {sortedSells.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {t("gold.noSells")}
              </div>
            ) : isMobile ? (
              <div className="space-y-2">
                {sortedSells.map((s) => {
                  const proceeds = s.quantity * s.sellPrice;
                  const cost = s.quantity * s.avgPriceAtSell;
                  const pl = proceeds - cost;
                  const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg bg-secondary/40 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(s.sellDate), "dd/MM/yyyy")}
                        </p>
                        <div
                          className={`text-sm font-semibold text-money ${pl >= 0 ? "text-positive" : "text-negative"}`}
                        >
                          {pl >= 0 ? "+" : ""}
                          {fmtVND(pl)}
                          <span className="text-xs ml-1">
                            ({pl >= 0 ? "+" : ""}
                            {plPct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">
                            {t("gold.qtyCol")}
                          </p>
                          <p className="font-medium text-foreground mt-0.5">
                            {s.quantity} {t("gold.unit")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("gold.sellPrice")}
                          </p>
                          <p className="font-medium text-foreground mt-0.5 text-money">
                            {(s.sellPrice / 1e6).toFixed(2)}M
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">
                            {t("gold.avgAtSell")}
                          </p>
                          <p className="font-medium text-muted-foreground mt-0.5 text-money">
                            {(s.avgPriceAtSell / 1e6).toFixed(2)}M
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-left">
                      {t("gold.sellDate")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("gold.qtyCol")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("gold.sellPrice")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("gold.avgAtSell")}
                    </TableHead>
                    <TableHead className="text-left">
                      {t("gold.realizedPL")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSells.map((s) => {
                    const proceeds = s.quantity * s.sellPrice;
                    const cost = s.quantity * s.avgPriceAtSell;
                    const pl = proceeds - cost;
                    const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                    return (
                      <TableRow key={s.id} className="hover:bg-muted/50">
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(s.sellDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {s.quantity} {t("gold.unit")}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {fmtVND(s.sellPrice)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {fmtVND(s.avgPriceAtSell)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-semibold text-sm ${pl >= 0 ? "text-positive" : "text-negative"}`}
                            >
                              {pl >= 0 ? "+" : ""}
                              {fmtVND(pl)}
                            </span>
                            <span
                              className={`text-xs ${pl >= 0 ? "text-positive" : "text-negative"}`}
                            >
                              ({pl >= 0 ? "+" : ""}
                              {plPct.toFixed(2)}%)
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
