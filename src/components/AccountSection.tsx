
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

export interface AccountItem {
  id: string;
  name: string;
  balance: number;
}

interface AccountSectionProps {
  title: string;
  accounts: AccountItem[];
  icon: React.ReactNode;
  isNegative?: boolean;
  isHidden?: boolean;
  onAddAccount?: () => void;
  onUpdateAccount?: (id: string, balance: number) => void;
  onToggleHidden?: () => void;
}

const AccountSection = ({ 
  title, 
  accounts, 
  icon, 
  isNegative = false,
  isHidden = false,
  onAddAccount,
  onUpdateAccount,
  onToggleHidden
}: AccountSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const displayBalance = isNegative ? -totalBalance : totalBalance;
  
  return (
    <Card className="mb-3 overflow-hidden">
      <div 
        className="p-3 bg-gray-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`font-semibold ${isNegative ? 'text-red-600' : ''} ${isHidden ? 'opacity-50' : ''}`}>
            {isHidden ? '***' : formatCurrency(displayBalance)}
          </div>
          {onToggleHidden && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHidden();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3">
          {accounts.length === 0 ? (
            <div className="text-gray-500 text-center py-2">No {title.toLowerCase()} accounts</div>
          ) : (
            <div className="space-y-3">
              {accounts.map(account => (
                <div key={account.id} className="flex justify-between items-center border-b pb-2">
                  <div>{account.name}</div>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number"
                      className="w-32 p-1 border rounded text-right"
                      value={account.balance}
                      onChange={(e) => onUpdateAccount && onUpdateAccount(account.id, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button 
            className="mt-3 text-sm text-blue-600 hover:underline flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              onAddAccount && onAddAccount();
            }}
          >
            + Add {title.toLowerCase()} account
          </button>
        </div>
      )}
    </Card>
  );
};

export default AccountSection;
