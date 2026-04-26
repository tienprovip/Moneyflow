import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtVND, fmtShort } from "@/lib/format";
import { format } from "date-fns";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Briefcase,
  PieChart,
  Banknote,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import TransactionPagination from "@/components/transactions/TransactionPagination";
import { StockDialog, WalletOption } from "@/components/stock/StockDialog";
import { SellStockDialog } from "@/components/stock/SellStockDialog";
import { useStocks } from "@/hooks/use-stocks";
import { useWallets } from "@/hooks/use-wallets";
import { StockPosition } from "@/types/stock";

const PORTFOLIO_TREND = [
  { month: "T9", value: 1350000000 },
  { month: "T10", value: 1420000000 },
  { month: "T11", value: 1380000000 },
  { month: "T12", value: 1490000000 },
  { month: "T1", value: 1520000000 },
  { month: "T2", value: 1555000000 },
  { month: "T3", value: 1571000000 },
];

const PAGE_SIZE = 10;

const StocksPage = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const {
    holdings,
    totals,
    addStock,
    sellStock,
    deleteStock,
  } = useStocks();

  const { wallets } = useWallets();

  const walletOptions = useMemo<WalletOption[]>(() => {
    return wallets.map((w) => ({
      id: w.id,
      name: w.name,
      balance: w.balance,
    }));
  }, [wallets]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StockPosition | null>(null);
  const [selling, setSelling] = useState<StockPosition | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(holdings.length / PAGE_SIZE));
  const paginatedHoldings = useMemo(
    () =>
      holdings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [holdings, currentPage],
  );

  const { totalInvested, totalCurrentValue, totalPL, totalPLPct, totalStocks } = totals;

  const openAdd = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openBuyMore = useCallback((h: StockPosition) => {
    setEditing(h);
    setDialogOpen(true);
  }, []);

  const openSell = useCallback((h: StockPosition) => {
    setSelling(h);
    setSellDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteStock(id);
      setDeleteId(null);
    },
    [deleteStock],
  );

  const handleSaveAdd = async (data: any) => {
    await addStock(data);
  };

  const handleSaveSell = async (data: any) => {
    await sellStock(data);
  };

  return (
    <DashboardLayout onFabClick={openAdd}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t("stocks.pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("stocks.pageSubtitle")}
          </p>
        </div>
        <Button onClick={openAdd} className="hidden lg:flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t("stocks.addHolding")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="card-shadow hover:card-shadow-hover transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {t("stocks.totalInvested")}
            </p>
            <p className="text-lg font-bold text-foreground">
              {fmtShort(totalInvested)}₫
            </p>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:card-shadow-hover transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {t("stocks.currentValue")}
            </p>
            <p className="text-lg font-bold text-foreground">
              {fmtShort(totalCurrentValue)}₫
            </p>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:card-shadow-hover transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalPL >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
              >
                {totalPL >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <Badge
                variant="secondary"
                className={`text-xs ${totalPL >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"} border-0`}
              >
                {totalPL >= 0 ? "+" : ""}
                {totalPLPct}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {t("stocks.profitLoss")}
            </p>
            <p
              className={`text-lg font-bold ${totalPL >= 0 ? "text-positive" : "text-negative"}`}
            >
              {totalPL >= 0 ? "+" : ""}
              {fmtShort(totalPL)}₫
            </p>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:card-shadow-hover transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {t("stocks.totalStocks")}
            </p>
            <p className="text-lg font-bold text-foreground">
              {totalStocks} {t("stocks.stockUnit")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart (Mock) */}
      <Card className="card-shadow mb-6">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {t("stocks.chartTitle")}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {t("stocks.chartSubtitle")}
          </p>
          <div className="h-[200px] sm:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PORTFOLIO_TREND}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(217, 91%, 60%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(217, 91%, 60%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtShort}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [
                    fmtVND(value),
                    t("stocks.portfolioValue"),
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2.5}
                  fill="url(#stockGrad)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "hsl(217, 91%, 60%)",
                    strokeWidth: 2,
                    stroke: "hsl(var(--card))",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Table / Mobile List */}
      <Card className="card-shadow overflow-hidden min-w-0">
        <div className="p-5 pb-3 text-left">
          <h3 className="text-sm font-semibold text-foreground">
            {t("stocks.holdingsTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("stocks.holdingsSubtitle")}
          </p>
        </div>

        {isMobile ? (
          <div className="px-5 pb-5 space-y-3">
            {paginatedHoldings.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-lg bg-secondary/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                      {h.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {h.symbol}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {h.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600"
                      onClick={() => openBuyMore(h)}
                      title={t("stocks.buyMore")}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-emerald-600"
                      onClick={() => openSell(h)}
                      title={t("stocks.sellTitle")}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteId(h.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {h.quantity.toLocaleString("vi-VN")} CP ·{" "}
                    {t("stocks.avgPriceLabel")}: {fmtShort(h.avgPrice)}₫
                  </span>
                  <span>
                    {t("stocks.currentLabel")}: {fmtShort(h.currentPrice)}₫
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("stocks.totalLabel")}: {fmtShort(h.currentValue)}₫
                  </span>
                  <span
                    className={`font-semibold ${h.pl >= 0 ? "text-positive" : "text-negative"}`}
                  >
                    {h.pl >= 0 ? "+" : ""}
                    {fmtShort(h.pl)}₫ ({h.plPct}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-left">
                    {t("stock.symbol")}
                  </TableHead>
                  <TableHead className="text-left">{t("stock.qty")}</TableHead>
                  <TableHead className="text-left">
                    {t("stocks.purchaseDate")}
                  </TableHead>
                  <TableHead className="text-left">
                    {t("stock.avgPrice")}
                    <br />
                    {t("stock.currentPrice")}
                  </TableHead>
                  <TableHead className="text-left">
                    {t("stocks.totalLabel")}
                  </TableHead>
                  <TableHead className="text-left">
                    {t("stock.profitLoss")}
                  </TableHead>
                  <TableHead className="text-right w-[120px]">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHoldings.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {h.symbol}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {h.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {h.quantity.toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(h.firstPurchaseDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">
                        {fmtVND(h.avgPrice)}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {fmtVND(h.currentPrice)}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {fmtShort(h.currentValue)}₫
                    </TableCell>
                    <TableCell>
                      <p
                        className={`text-sm font-medium ${h.pl >= 0 ? "text-positive" : "text-negative"}`}
                      >
                        {h.pl >= 0 ? "+" : ""}
                        {fmtShort(h.pl)}₫
                      </p>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${h.pl >= 0 ? "text-positive" : "text-negative"}`}
                      >
                        {h.pl >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(Number(h.plPct)).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          onClick={() => openBuyMore(h)}
                          title={t("stocks.buyMore")}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                          onClick={() => openSell(h)}
                          title={t("stocks.sellTitle")}
                        >
                          <Banknote className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(h.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TransactionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Card>

      <StockDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        wallets={walletOptions}
        onSave={handleSaveAdd}
      />
      
      <SellStockDialog
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
        stock={selling}
        wallets={walletOptions}
        onSave={handleSaveSell}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </DashboardLayout>
  );
};

export default StocksPage;
