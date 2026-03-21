import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const stocks = [
  {
    symbol: "VNM",
    name: "Vinamilk",
    qty: 500,
    avgPrice: 72000,
    currentPrice: 85000,
    profit: 6500000,
    pct: 18.06,
  },
  {
    symbol: "FPT",
    name: "FPT Corp",
    qty: 300,
    avgPrice: 95000,
    currentPrice: 128000,
    profit: 9900000,
    pct: 34.74,
  },
  {
    symbol: "VCB",
    name: "Vietcombank",
    qty: 200,
    avgPrice: 88000,
    currentPrice: 92500,
    profit: 900000,
    pct: 5.11,
  },
  {
    symbol: "HPG",
    name: "Hòa Phát",
    qty: 1000,
    avgPrice: 28000,
    currentPrice: 31200,
    profit: 3200000,
    pct: 11.43,
  },
  {
    symbol: "MWG",
    name: "Thế Giới Di Động",
    qty: 400,
    avgPrice: 55000,
    currentPrice: 48500,
    profit: -2600000,
    pct: -11.82,
  },
];

const fmtVND = (v: number) => v.toLocaleString("vi-VN") + "₫";

const StockTable = () => {
  const { t } = useLanguage();
  return (
    <div
      className="bg-card rounded-lg p-4 sm:p-5 card-shadow animate-fade-in"
      style={{ animationDelay: "360ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("stock.title")}
          </h3>
          <p className="text-xs text-muted-foreground">{t("stock.count")}</p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">
          {t("stock.viewAll")}
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto -mx-5">
        <table className="w-full min-w-150">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                {t("stock.symbol")}
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                {t("stock.qty")}
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                {t("stock.avgPrice")}
                <br />
                {t("stock.currentPrice")}
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                {t("stock.profitLoss")}
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.symbol} className="border-b border-border">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-left text-sm text-foreground py-3 px-4">
                  {stock.qty.toLocaleString("vi-VN")}
                </td>
                <td className="text-left py-3 px-4">
                  <p className="text-xs text-muted-foreground">
                    {fmtVND(stock.avgPrice)}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {fmtVND(stock.currentPrice)}
                  </p>
                </td>
                <td className="text-left py-3 px-4">
                  <p
                    className={`text-sm font-medium ${stock.profit >= 0 ? "text-positive" : "text-negative"}`}
                  >
                    {stock.profit >= 0 ? "+" : ""}
                    {fmtVND(stock.profit)}
                  </p>
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-semibold ${stock.pct >= 0 ? "text-positive" : "text-negative"}`}
                  >
                    {stock.pct >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(stock.pct).toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
          >
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
              {stock.symbol.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {stock.symbol}
                </p>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold ${stock.pct >= 0 ? "text-positive" : "text-negative"}`}
                >
                  {stock.pct >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(stock.pct).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-muted-foreground">
                  {stock.name} · {stock.qty.toLocaleString("vi-VN")} CP
                </p>
                <p
                  className={`text-xs font-medium ${stock.profit >= 0 ? "text-positive" : "text-negative"}`}
                >
                  {stock.profit >= 0 ? "+" : ""}
                  {fmtVND(stock.profit)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { StockTable };
