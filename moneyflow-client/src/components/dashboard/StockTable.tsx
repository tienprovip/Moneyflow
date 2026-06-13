import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StockApiResponse } from "@/types/stock";
import { useNavigate } from "react-router-dom";

interface StockTableProps {
  data: StockApiResponse[];
}

const fmtVND = (v: number) => v.toLocaleString("vi-VN") + "₫";

const StockTable = ({ data }: StockTableProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
        <button
          onClick={() => navigate("/stocks")}
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("stock.viewAll")}
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
      ) : (
        <>
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
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">
                    Tổng vốn
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((stock) => (
                  <tr key={stock._id} className="border-b border-border">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground uppercase">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground uppercase">
                            {stock.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-left text-sm text-foreground py-3 px-4">
                      {stock.totalQty?.toLocaleString("vi-VN")}
                    </td>
                    <td className="text-left py-3 px-4">
                      <p className="text-sm font-medium text-foreground">
                        {fmtVND(stock.avgBuyPrice)}
                      </p>
                    </td>
                    <td className="text-left py-3 px-4">
                      <p className="text-sm font-medium text-foreground">
                        {fmtVND(stock.totalCostBasis)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-2">
            {data.map((stock) => (
              <div
                key={stock._id}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0 uppercase">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground uppercase">
                      {stock.symbol}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {fmtVND(stock.totalCostBasis)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground">
                      {stock.totalQty?.toLocaleString("vi-VN")} CP
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmtVND(stock.avgBuyPrice)} / CP
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export { StockTable };
