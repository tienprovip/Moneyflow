import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { Plus, Receipt } from "lucide-react";

interface Props {
  onAddClick: () => void;
}
const TransactionEmptyState = ({ onAddClick }: Props) => {
  const { t } = useLanguage();
  return (
    <Card className="card-shadow">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Receipt className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {t("empty.title")}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {t("empty.description")}
        </p>
        <Button onClick={onAddClick} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("empty.addFirst")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransactionEmptyState;
