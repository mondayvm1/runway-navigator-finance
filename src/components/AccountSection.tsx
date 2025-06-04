
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Eye, EyeOff, Edit2, Check, X } from "lucide-react";
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
  onUpdateAccountName?: (id: string, name: string) => void;
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
  onUpdateAccountName,
  onToggleHidden
}: AccountSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const displayBalance = isNegative ? -totalBalance : totalBalance;

  const startEditingName = (account: AccountItem) => {
    setEditingNameId(account.id);
    setEditingName(account.name);
  };

  const saveAccountName = (id: string) => {
    if (editingName.trim() && onUpdateAccountName) {
      onUpdateAccountName(id, editingName.trim());
    }
    setEditingNameId(null);
    setEditingName('');
  };

  const cancelEditingName = () => {
    setEditingNameId(null);
    setEditingName('');
  };
  
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
                  <div className="flex items-center gap-2 flex-1">
                    {editingNameId === account.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') saveAccountName(account.id);
                            if (e.key === 'Escape') cancelEditingName();
                          }}
                          className="flex-1 p-1 border rounded text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => saveAccountName(account.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEditingName}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="flex-1">{account.name}</span>
                        <button
                          onClick={() => startEditingName(account)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
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
