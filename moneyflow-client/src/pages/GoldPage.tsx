import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { GoldDialog, type GoldHolding } from "@/components/gold/GoldDialog";
import { SellGoldDialog } from "@/components/gold/SellGoldDialog";
import { GoldTypeCard } from "@/components/gold/GoldTypeCard";
import { GoldTypeDetailDialog } from "@/components/gold/GoldTypeDetailDialog";
import { GoldSummaryCards } from "@/components/gold/GoldSummaryCards";
import { GoldPriceChart } from "@/components/gold/GoldPriceChart";
import { GoldMarketPrices } from "@/components/gold/GoldMarketPrice";
import { useGoldPortfolio } from "@/hooks/use-gold-portfolio";

import type { GoldType } from "@/types/gold";
import {
  CURRENT_GOLD_PRICES,
  GOLD_TREND,
  GOLD_WALLETS,
  MOCK_HOLDINGS,
  MOCK_SALES,
} from "@/data/gold-mock";

const GoldPage = () => {
  const { t } = useLanguage();
  const {
    holdings,
    sales,
    aggregates,
    totals,
    addHolding,
    updateHolding,
    deleteHolding,
    sellGold,
  } = useGoldPortfolio({
    initialHoldings: MOCK_HOLDINGS,
    initialSales: MOCK_SALES,
    prices: CURRENT_GOLD_PRICES,
  });

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GoldHolding | null>(null);
  const [presetType, setPresetType] = useState<GoldType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sellingType, setSellingType] = useState<GoldType | null>(null);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [detailType, setDetailType] = useState<GoldType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Holding handlers
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
    (data: GoldHolding) => {
      if (editing) {
        updateHolding(editing.id, data);
      } else {
        addHolding(data);
      }
      toast({
        title: editing ? t("gold.updated") : t("gold.added"),
        description: editing ? t("gold.updatedDesc") : t("gold.addedDesc"),
      });
    },
    [editing, t, addHolding, updateHolding],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteHolding(id);
      toast({ title: t("gold.deleted"), description: t("gold.deletedDesc") });
      setDeleteId(null);
    },
    [t, deleteHolding],
  );

  // Sell handlers
  const openSell = useCallback((type: GoldType) => {
    setSellingType(type);
    setSellDialogOpen(true);
  }, []);

  const sellingAggregate = useMemo(
    () =>
      sellingType
        ? (aggregates.find((a) => a.type === sellingType) ?? null)
        : null,
    [sellingType, aggregates],
  );

  // Synthetic holding to keep SellGoldDialog API unchanged
  const sellingSyntheticHolding: GoldHolding | null = useMemo(() => {
    if (!sellingAggregate) return null;
    return {
      id: `agg-${sellingAggregate.type}`,
      type: sellingAggregate.type,
      quantity: sellingAggregate.totalQty,
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchasePrice: sellingAggregate.avgPrice,
    };
  }, [sellingAggregate]);

  const handleSell = useCallback(
    (
      _holdingId: string,
      quantity: number,
      sellPrice: number,
      sellDate: string,
      walletId: string,
    ) => {
      if (!sellingType) return;
      sellGold(sellingType, quantity, sellPrice, sellDate, walletId);
      toast({ title: t("gold.sold"), description: t("gold.soldDesc") });
    },
    [sellingType, sellGold, t],
  );

  // Detail
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
        <GoldPriceChart data={GOLD_TREND} />
        <GoldMarketPrices prices={CURRENT_GOLD_PRICES} />
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
        editing={
          editing ??
          (presetType
            ? ({
                id: "",
                type: presetType,
                quantity: 0,
                purchaseDate: new Date().toISOString().slice(0, 10),
                purchasePrice: 0,
              } as GoldHolding)
            : null)
        }
        onSave={(data) => {
          if (!editing && presetType) {
            handleSave({ ...data, id: crypto.randomUUID() });
          } else {
            handleSave(data);
          }
        }}
      />

      <SellGoldDialog
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
        holding={sellingSyntheticHolding}
        currentSellPrice={
          sellingType ? (CURRENT_GOLD_PRICES[sellingType]?.sell ?? 0) : 0
        }
        wallets={GOLD_WALLETS}
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
