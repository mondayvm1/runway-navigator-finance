import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { AccountItem } from '@/hooks/useFinancialData';
import CreditCardManager, { CreditSummary } from './CreditCardManager';
import InterestRateInput from './InterestRateInput';

interface AccountSectionProps {
  title: string;
  accounts: AccountItem[];
  icon: React.ReactNode;
  isNegative?: boolean;
  isHidden?: boolean;
  onAddAccount: () => void;
  onUpdateAccount?: (id: string, balance: number) => void;
  onUpdateAccountName: (id: string, name: string) => void;
  onUpdateInterestRate?: (id: string, rate: number) => void;
  onUpdateAccountData?: (id: string, updates: Partial<AccountItem>) => void;
  onRemoveAccount: (id: string) => void;
  onToggleHidden: () => void;
}

const AccountSection = ({
  title,
  accounts,
  icon,
  isNegative = false,
  isHidden = false,
  onAddAccount,
  onUpdateAccount = () => {},
  onUpdateAccountName,
  onUpdateInterestRate,
  onUpdateAccountData,
  onRemoveAccount,
  onToggleHidden,
}: AccountSectionProps) => {
  const [editingNames, setEditingNames] = useState<{ [key: string]: boolean }>({});
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleNameEdit = (id: string) => {
    setEditingNames(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNameChange = (id: string, name: string) => {
    onUpdateAccountName(id, name);
    setEditingNames(prev => ({ ...prev, [id]: false }));
  };

  const total = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="mr-2 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </button>
          {icon}
          <h3 className="text-lg font-medium text-gray-700 ml-2">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            {isNegative ? '-' : ''}${Math.abs(total).toLocaleString()}
          </span>
          <Button
            onClick={onToggleHidden}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>

      {/* Show Credit Summary for credit accounts */}
      {title === 'Credit' && accounts.length > 0 && !isHidden && !isCollapsed && (
        <CreditSummary accounts={accounts} />
      )}

      {!isHidden && !isCollapsed && (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  {editingNames[account.id] ? (
                    <Input
                      defaultValue={account.name}
                      onBlur={(e) => handleNameChange(account.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleNameChange(account.id, e.currentTarget.value);
                        }
                      }}
                      className="w-48 h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => toggleNameEdit(account.id)}
                      className="text-left hover:text-blue-600 transition-colors"
                    >
                      <Label className="text-sm font-medium cursor-pointer">{account.name}</Label>
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => onRemoveAccount(account.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-gray-600">Balance</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={account.balance || ""}
                    onChange={(e) => {
                      if (onUpdateAccountData) {
                        onUpdateAccountData(account.id, { balance: parseFloat(e.target.value) || 0 });
                      } else {
                        onUpdateAccount(account.id, parseFloat(e.target.value) || 0);
                      }
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                
                {onUpdateInterestRate && (
                  <div>
                    <Label className="text-xs text-gray-600">Interest Rate (%)</Label>
                    <InterestRateInput
                      value={account.interestRate || 0}
                      onUpdate={(rate) => {
                        if (onUpdateAccountData) {
                          onUpdateAccountData(account.id, { interestRate: rate });
                        } else {
                          onUpdateInterestRate(account.id, rate);
                        }
                      }}
                      accountType={title.toLowerCase()}
                    />
                  </div>
                )}
              </div>

              {/* Credit Card Manager for credit accounts */}
              {title === 'Credit' && onUpdateAccountData && (
                <CreditCardManager 
                  account={account} 
                  onUpdateAccount={onUpdateAccountData}
                />
              )}
            </div>
          ))}
          
          <Button onClick={onAddAccount} variant="outline" className="w-full">
            <Plus size={16} className="mr-2" />
            Add {title} Account
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AccountSection;
