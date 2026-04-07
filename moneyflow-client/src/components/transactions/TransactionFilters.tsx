import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import type { TransactionFilters as Filters } from "@/types/transaction";
import { SelectValue } from "@radix-ui/react-select";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";

interface TransactionFiltersProps {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  categories: string[];
  wallets: { id: string; name: string }[];
}

const TransactionFilters = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  categories,
  wallets,
}: TransactionFiltersProps) => {
  const { t, locale } = useLanguage();
  const update = (patch: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...patch });
  };
  const translateCategory = (cat: string) => {
    const key = `cat.${cat}` as any;
    const result = t(key);
    return result === key ? cat : result;
  };
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 min-w-50 flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("filter.search")}
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <Select
        value={filters.category}
        onValueChange={(v) => update({ category: v })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder={t("filter.category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allCategories")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {translateCategory(cat)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select
        value={filters.type}
        onValueChange={(v) => update({ type: v as Filters["type"] })}
      >
        <SelectTrigger className="w-full sm:w-32.5">
          <SelectValue placeholder={t("filter.type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allTypes")}</SelectItem>
          <SelectItem value="income">{t("filter.income")}</SelectItem>
          <SelectItem value="expense">{t("filter.expense")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Wallet Filter */}
      <Select
        value={filters.walletId}
        onValueChange={(v) => update({ walletId: v })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder={t("filter.wallet")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filter.allWallets")}</SelectItem>
          {wallets.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-55 justify-start text-left font-normal",
              !filters.dateRange.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 w-4 h-4" />
            {filters.dateRange.from
              ? filters.dateRange.to
                ? `${format(filters.dateRange.from, "dd/MM")} - ${format(filters.dateRange.to, "dd/MM")}`
                : `${format(filters.dateRange.from, "dd/MM")}`
              : t("filter.dateRange")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.dateRange.from,
              to: filters.dateRange.to,
            }}
            onSelect={(range) =>
              update({ dateRange: { from: range?.from, to: range?.to } })
            }
            numberOfMonths={1}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-35">
          <SelectValue placeholder={t("filter.sort")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("filter.newest")}</SelectItem>
          <SelectItem value="oldest">{t("filter.oldest")}</SelectItem>
          <SelectItem value="amount-high">{t("filter.amountHigh")}</SelectItem>
          <SelectItem value="amount-low">{t("filter.amountLow")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TransactionFilters;
