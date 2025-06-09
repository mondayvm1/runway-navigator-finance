import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Eye, EyeOff, Edit3, Check, X } from "lucide-react";
import InterestRateInput from "./InterestRateInput";
import CreditCardCalculator from "./CreditCardCalculator";
import { AccountItem } from "@/hooks/useFinancialData";

interface AccountSectionProps {
  title: string;
  accounts: AccountItem[];
  icon: React.ReactNode;
  isNegative?: boolean;
  isHidden?: boolean;
  onAddAccount: () => void;
  onUpdateAccount: (id: string, balance: number) => void;
  onUpdateAccountName: (id: string, name: string) => void;
  onUpdateInterestRate?: (id: string, rate: number) => void;
  onToggleHidden: () => void;
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
  onUpdateInterestRate,
  onToggleHidden 
}: AccountSectionProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleNameEdit = (account: AccountItem) => {
    setEditingId(account.id);
    setEditingName(account.name);
  };

  const handleNameSave = (id: string) => {
    onUpdateAccountName(id, editingName);
    setEditingId(null);
  };

  const handleNameCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  const shouldShowCalculator = (title === 'Credit' || title === 'Loans') && !isHidden;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHidden}
            className="ml-2"
          >
            {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <div className="text-lg font-bold">
          {isNegative ? '-' : ''}${total.toLocaleString()}
        </div>
      </div>
      
      {!isHidden && (
        <>
          <div className="space-y-2 mb-3">
            {accounts.map((account) => (
              <div key={account.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    {editingId === account.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleNameSave(account.id)}
                        />
                        <Button size="sm" onClick={() => handleNameSave(account.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleNameCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span 
                          className="cursor-pointer hover:text-blue-600 flex-1"
                          onClick={() => handleNameEdit(account)}
                        >
                          {account.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNameEdit(account)}
                          className="ml-2"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="Balance"
                    value={account.balance || ""}
                    onChange={(e) => onUpdateAccount(account.id, parseFloat(e.target.value) || 0)}
                    className="w-32"
                  />
                </div>
                
                {onUpdateInterestRate && (
                  <div className="ml-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Interest Rate:</span>
                    <InterestRateInput
                      value={account.interestRate || 0}
                      onUpdate={(rate) => onUpdateInterestRate(account.id, rate)}
                      accountType={title.toLowerCase()}
                    />
                  </div>
                )}
                
                {shouldShowCalculator && account.balance > 0 && account.interestRate && (
                  <CreditCardCalculator
                    balance={account.balance}
                    interestRate={account.interestRate}
                  />
                )}
              </div>
            ))}
          </div>
          
          <Button onClick={onAddAccount} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add {title} Account
          </Button>
        </>
      )}
    </Card>
  );
};

export default AccountSection;
