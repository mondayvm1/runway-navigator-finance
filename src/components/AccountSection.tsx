import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronRight, Edit } from 'lucide-react';
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
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/80 p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center hover:from-slate-100 hover:to-slate-200 transition-all"
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? <ChevronRight size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
          </button>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-0.5">Total</div>
            <span className={`text-xl font-bold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
              {isNegative ? '-' : ''}${Math.abs(total).toLocaleString()}
            </span>
            {title === 'Credit' && accounts.length > 0 && (
              <div className="text-xs text-slate-500 mt-0.5">
                Available: ${accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0) - acc.balance, 0).toLocaleString()}
              </div>
            )}
          </div>
          <Button
            onClick={onToggleHidden}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 hover:border-slate-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                {editingNames[account.id] ? (
                  <Input
                    defaultValue={account.name}
                    onBlur={(e) => handleNameChange(account.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNameChange(account.id, e.currentTarget.value);
                      }
                    }}
                    className="h-9 font-medium"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => toggleNameEdit(account.id)}
                    className="text-left hover:text-primary transition-colors"
                  >
                    <span className="font-medium">{account.name}</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Balance</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={account.balance || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = value === '' ? 0 : Number(value);
                      if (onUpdateAccountData) {
                        onUpdateAccountData(account.id, { balance: numericValue });
                      } else {
                        onUpdateAccount(account.id, numericValue);
                      }
                    }}
                    className="h-9"
                  />
                </div>
                
                {onUpdateInterestRate && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Interest Rate (%)</Label>
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

                <div className="flex gap-1 items-end justify-end md:justify-start">
                  <Button
                    onClick={() => toggleNameEdit(account.id)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    onClick={() => onRemoveAccount(account.id)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Credit Card Manager for credit accounts */}
              {title === 'Credit' && onUpdateAccountData && (
                <div className="mt-3">
                  <CreditCardManager 
                    account={account} 
                    onUpdateAccount={onUpdateAccountData}
                  />
                </div>
              )}
            </div>
          ))}
          
          <Button onClick={onAddAccount} variant="ghost" className="w-full h-10 mt-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-dashed border-slate-200">
            <Plus size={16} className="mr-2" />
            Add {title} Account
          </Button>
        </div>
      )}
    </div>
  );
};

export default AccountSection;
