import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Plus } from "lucide-react";

interface TransactionHeaderProps {
  onAddClick: () => void;
}

const TransactionHeader = ({ onAddClick }: TransactionHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {t("tx.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("tx.subtitle")}</p>
      </div>
      <Button className="hidden lg:flex gap-2" onClick={onAddClick}>
        <Plus className="w-4 h-4" />
        {t("tx.add")}
      </Button>
    </div>
  );
};

export default TransactionHeader;
