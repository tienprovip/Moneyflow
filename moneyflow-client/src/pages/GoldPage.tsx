import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { GoldDialog } from "@/components/gold/GoldDialog";
import { SellGoldDialog } from "@/components/gold/SellGoldDialog";
import { GoldTypeCard } from "@/components/gold/GoldTypeCard";
import { GoldTypeDetailDialog } from "@/components/gold/GoldTypeDetailDialog";
import { GoldSummaryCards } from "@/components/gold/GoldSummaryCards";
import { GoldPriceChart } from "@/components/gold/GoldPriceChart";
import { GoldMarketPrices } from "@/components/gold/GoldMarketPrice";
import { useGoldPortfolio, useGoldMarketPrices } from "@/hooks/use-gold-portfolio";
import { useWallets } from "@/hooks/use-wallets";
import type { GoldHolding, GoldType, GoldTypeAggregate } from "@/types/gold";

const GoldPage = () => {
  const { t } = useLanguage();
  const { wallets } = useWallets();
  const { data: dynamicPrices, isLoading: isLoadingPrices, isError: isErrorPrices } = useGoldMarketPrices();

  // Dùng giá thực tế hoặc fallback object rỗng nếu fetch thất bại/chưa xong
  const activePrices = dynamicPrices ?? {};

  const {
    holdings,
    sales,
    aggregates,
    totals,
    addHolding,
    updateHolding,
    deleteHolding,
    sellGold,
    isLoading: isLoadingPortfolio,
    isError: isErrorPortfolio,
  } = useGoldPortfolio({ prices: activePrices });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GoldHolding | null>(null);
  const [presetType, setPresetType] = useState<GoldType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); // goldId
  const [sellingType, setSellingType] = useState<GoldType | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [detailType, setDetailType] = useState<GoldType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Danh sách ví cho dialog bán / mua (kèm balance để validate)
  const walletOptions = useMemo(
    () => wallets.map((w) => ({ id: w.id, name: w.name, balance: w.balance })),
    [wallets],
  );

  // ─── Holding handlers ──────────────────────────────────────────────────────
  const openAdd = useCallback((type: GoldType | null = null) => {
    setEditing(null);
    setPresetType(type);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((h: GoldHolding) => {
    setEditing(h);
    setPresetType(null);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: {
      type: GoldType;
      quantity: number;
      purchasePrice: number;
      purchaseDate: string;
      notes?: string;
      sourceAccountId?: string;
    }) => {
      if (editing) {
        // Edit: update (backend chưa hỗ trợ, chỉ show toast)
        await updateHolding(editing.id, data);
      } else {
        await addHolding(data);
        toast({
          title: t("gold.added"),
          description: t("gold.addedDesc"),
        });
      }
    },
    [editing, t, addHolding, updateHolding],
  );

  const handleDelete = useCallback(
    async (goldId: string) => {
      await deleteHolding(goldId);
      toast({ title: t("gold.deleted"), description: t("gold.deletedDesc") });
      setDeleteId(null);
    },
    [t, deleteHolding],
  );

  // ─── Sell handlers ─────────────────────────────────────────────────────────
  const openSell = useCallback((type: GoldType) => {
    setSellingType(type);
    setSellDialogOpen(true);
  }, []);

  const sellingAggregate = useMemo<GoldTypeAggregate | null>(
    () =>
      sellingType
        ? (aggregates.find((a) => a.type === sellingType) ?? null)
        : null,
    [sellingType, aggregates],
  );

  // Synthetic holding để SellGoldDialog không cần thay đổi
  const sellingSyntheticHolding: GoldHolding | null = useMemo(() => {
    if (!sellingAggregate) return null;
    return {
      id: `agg-${sellingAggregate.type}`,
      goldId: sellingAggregate.goldId,
      type: sellingAggregate.type,
      quantity: sellingAggregate.totalQty,
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchasePrice: sellingAggregate.avgPrice,
    };
  }, [sellingAggregate]);

  const handleSell = useCallback(
    async (
      _holdingId: string,
      quantity: number,
      sellPrice: number,
      sellDate: string,
      walletId: string,
    ) => {
      if (!sellingType) return;
      await sellGold(sellingType, quantity, sellPrice, sellDate, walletId);
      toast({ title: t("gold.sold"), description: t("gold.soldDesc") });
    },
    [sellingType, sellGold, t],
  );

  // ─── Detail ────────────────────────────────────────────────────────────────
  const openDetail = useCallback((type: GoldType) => {
    setDetailType(type);
    setDetailOpen(true);
  }, []);

  const detailHoldings = useMemo(
    () => (detailType ? holdings.filter((h) => h.type === detailType) : []),
    [detailType, holdings],
  );
  const detailSales = useMemo(
    () => (detailType ? sales.filter((s) => s.type === detailType) : []),
    [detailType, sales],
  );

  // ─── Loading / Error ───────────────────────────────────────────────────────
  if (isLoadingPortfolio || isLoadingPrices) {
    return (
      <DashboardLayout onFabClick={() => openAdd(null)}>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (isErrorPortfolio || isErrorPrices) {
    return (
      <DashboardLayout onFabClick={() => openAdd(null)}>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {t("gold.loadError")}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onFabClick={() => openAdd(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {t("gold.pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("gold.pageSubtitle")}
          </p>
        </div>
        <Button
          onClick={() => openAdd(null)}
          className="hidden lg:flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("gold.addHolding")}
        </Button>
      </div>

      <GoldSummaryCards
        totalSpent={totals.totalSpent}
        currentValue={totals.currentValue}
        totalQuantity={totals.totalQuantity}
        profitLoss={totals.profitLoss}
        profitPct={totals.profitPct}
        typesCount={aggregates.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <GoldPriceChart data={[]} />
        <GoldMarketPrices prices={activePrices} />
      </div>

      {/* Holdings grouped by Type */}
      <div className="mb-3 px-1">
        <h3 className="text-base font-semibold text-foreground">
          {t("gold.byTypeTitle")}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t("gold.byTypeSubtitle")}
        </p>
      </div>

      {aggregates.length === 0 ? (
        <Card className="card-shadow">
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("gold.noBuys")}
            </p>
            <Button onClick={() => openAdd(null)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("gold.addHolding")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {aggregates.map((agg) => (
            <GoldTypeCard
              key={agg.type}
              data={agg}
              onView={() => openDetail(agg.type)}
              onBuy={() => openAdd(agg.type)}
              onSell={() => openSell(agg.type)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <GoldDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        presetType={presetType}
        marketPrices={activePrices}
        wallets={walletOptions}
        onSave={handleSave}
      />

      <SellGoldDialog
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
        holding={sellingSyntheticHolding}
        currentSellPrice={
          sellingType ? (activePrices[sellingType]?.buy ?? 0) : 0
        }
        wallets={walletOptions}
        onSell={handleSell}
      />

      <GoldTypeDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        type={detailType}
        holdings={detailHoldings}
        sales={detailSales}
        onEditHolding={(h) => {
          setDetailOpen(false);
          openEdit(h);
        }}
        onDeleteHolding={(id) => setDeleteId(id)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </DashboardLayout>
  );
};

export default GoldPage;
