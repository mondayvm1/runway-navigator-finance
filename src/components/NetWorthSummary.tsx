
import { Card } from "@/components/ui/card";
import { formatCurrency } from "../utils/formatters";

interface NetWorthSummaryProps {
  assets: number;
  liabilities: number;
}

const NetWorthSummary = ({ assets, liabilities }: NetWorthSummaryProps) => {
  const netWorth = assets - liabilities;

  return (
    <Card className="p-6 shadow-lg mb-6">
      <div className="text-4xl font-bold text-center mb-4">
        {formatCurrency(netWorth)}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border-t-4 border-blue-500 pt-2">
          <div className="text-sm text-gray-600">Assets</div>
          <div className="text-xl font-semibold">{formatCurrency(assets)}</div>
        </div>
        
        <div className="border-t-4 border-red-500 pt-2">
          <div className="text-sm text-gray-600">Liabilities</div>
          <div className="text-xl font-semibold">{formatCurrency(liabilities)}</div>
        </div>
      </div>
    </Card>
  );
};

export default NetWorthSummary;
