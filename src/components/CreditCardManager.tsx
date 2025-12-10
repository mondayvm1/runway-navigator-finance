import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Calendar, Calculator, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountItem } from '@/hooks/useFinancialData';

interface CreditCardManagerProps {
  account: AccountItem;
  onUpdateAccount: (id: string, updates: Partial<AccountItem>) => void;
}

interface CreditSummaryProps {
  accounts: AccountItem[];
}

const CreditSummary = ({ accounts }: CreditSummaryProps) => {
  const activeAccounts = accounts.filter(a => !a.isPaidOff);
  const paidOffAccounts = accounts.filter(a => a.isPaidOff);
  
  const totalBalance = activeAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalCreditLimit = accounts.reduce((sum, account) => sum + (account.creditLimit || 0), 0);
  const totalAvailableCredit = totalCreditLimit - totalBalance;
  const overallUtilization = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0;
  
  const accountsWithAutopay = accounts.filter(a => a.autopayEnabled).length;
  const accountsWithoutAutopay = accounts.filter(a => !a.isPaidOff && !a.autopayEnabled).length;

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <h4 className="text-lg font-medium text-blue-800 mb-3 flex items-center">
        <CreditCard className="mr-2" size={18} />
        Credit Summary
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-600">Total Credit Used</div>
          <div className="text-lg font-bold text-red-600">
            {formatCurrency(totalBalance)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Total Credit Limit</div>
          <div className="text-lg font-bold text-blue-600">
            {formatCurrency(totalCreditLimit)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Available Credit</div>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(totalAvailableCredit)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">Overall Utilization</div>
          <div className={`text-lg font-bold ${overallUtilization > 30 ? 'text-red-600' : 'text-green-600'}`}>
            {overallUtilization.toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Overall Utilization Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Overall Credit Utilization</span>
          <span>{formatCurrency(totalBalance)} / {formatCurrency(totalCreditLimit)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${overallUtilization > 30 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(overallUtilization, 100)}%` }}
          />
        </div>
      </div>

      {/* Autopay Status */}
      <div className="mt-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">{accountsWithAutopay} with autopay</span>
        </div>
        {accountsWithoutAutopay > 0 && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{accountsWithoutAutopay} without autopay</span>
          </div>
        )}
        {paidOffAccounts.length > 0 && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>{paidOffAccounts.length} paid off</span>
          </div>
        )}
      </div>
    </Card>
  );
};

const CreditCardManager = ({ account, onUpdateAccount }: CreditCardManagerProps) => {
  const [customPayment, setCustomPayment] = useState(account.minimumPayment || 0);

  const effectiveBalance = account.isPaidOff ? 0 : account.balance;

  const calculatePayoffScenarios = () => {
    if (!effectiveBalance || !account.interestRate) return null;

    const monthlyRate = account.interestRate / 100 / 12;
    const minPayment = account.minimumPayment || Math.max(25, effectiveBalance * 0.02);
    
    const minScenario = calculatePayoff(effectiveBalance, monthlyRate, minPayment);
    const customScenario = customPayment > minPayment ? 
      calculatePayoff(effectiveBalance, monthlyRate, customPayment) : null;

    return { minScenario, customScenario, minPayment };
  };

  const calculatePayoff = (balance: number, monthlyRate: number, payment: number) => {
    let remainingBalance = balance;
    let months = 0;
    let totalInterest = 0;
    
    while (remainingBalance > 0 && months < 600) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(payment - interestPayment, remainingBalance);
      
      if (principalPayment <= 0) break;
      
      totalInterest += interestPayment;
      remainingBalance -= principalPayment;
      months++;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    return {
      months,
      years,
      remainingMonths,
      totalInterest,
      totalPaid: balance + totalInterest
    };
  };

  const getNextStatementDate = () => {
    if (!account.statementDate) return null;
    const today = new Date();
    const statementDay = account.statementDate;
    let nextStatement = new Date(today.getFullYear(), today.getMonth(), statementDay);
    if (nextStatement <= today) {
      nextStatement = new Date(today.getFullYear(), today.getMonth() + 1, statementDay);
    }
    return nextStatement.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNextPaymentDate = () => {
    if (!account.dueDate) return null;
    return new Date(account.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const availableCredit = (account.creditLimit || 0) - effectiveBalance;
  const utilizationRate = account.creditLimit ? (effectiveBalance / account.creditLimit) * 100 : 0;
  const scenarios = calculatePayoffScenarios();

  return (
    <Card className={`p-4 mt-2 ${account.isPaidOff ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="space-y-4">
        {/* Paid Off Toggle */}
        <div className="flex items-center justify-between p-2 bg-white rounded border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${account.isPaidOff ? 'text-green-600' : 'text-gray-400'}`} />
            <Label className="text-sm font-medium">Card Paid Off</Label>
          </div>
          <Switch
            checked={account.isPaidOff || false}
            onCheckedChange={(checked) => onUpdateAccount(account.id, { isPaidOff: checked })}
          />
        </div>

        {account.isPaidOff && (
          <div className="bg-green-100 text-green-800 p-3 rounded text-sm text-center">
            🎉 This card is paid off! Balance treated as $0. Credit limit still counts toward available credit.
          </div>
        )}

        {/* Credit Card Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-600">Credit Limit</Label>
            <Input
              type="number"
              placeholder="Credit limit"
              value={account.creditLimit || ""}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                onUpdateAccount(account.id, { creditLimit: value });
              }}
              className="h-8 text-sm"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600">Statement Day (1-31)</Label>
            <Input
              type="number"
              min={1}
              max={31}
              placeholder="Day of month"
              value={account.statementDate || ""}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : Math.min(31, Math.max(1, Number(e.target.value)));
                onUpdateAccount(account.id, { statementDate: value });
              }}
              className="h-8 text-sm"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600">Due Date</Label>
            <Input
              type="date"
              value={account.dueDate || ""}
              onChange={(e) => onUpdateAccount(account.id, { 
                dueDate: e.target.value 
              })}
              className="h-8 text-sm"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600">Minimum Payment</Label>
            <Input
              type="number"
              placeholder="Min payment"
              value={account.minimumPayment || ""}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                onUpdateAccount(account.id, { minimumPayment: value });
              }}
              className="h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-600">Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Interest rate"
              value={account.interestRate || ""}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                onUpdateAccount(account.id, { interestRate: value });
              }}
              className="h-8 text-sm"
            />
          </div>
          
          <div>
            <Label className="text-xs text-gray-600">Available Credit</Label>
            <div className="h-8 flex items-center text-sm font-medium text-green-600">
              {formatCurrency(availableCredit)}
            </div>
          </div>
        </div>

        {/* Date Info */}
        {(account.statementDate || account.dueDate) && (
          <div className="flex gap-4 text-xs bg-white p-2 rounded border">
            {account.statementDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="text-gray-600">Next statement:</span>
                <span className="font-medium">{getNextStatementDate()}</span>
              </div>
            )}
            {account.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-red-600" />
                <span className="text-gray-600">Next payment:</span>
                <span className="font-medium">{getNextPaymentDate()}</span>
              </div>
            )}
          </div>
        )}

        {/* Autopay Settings */}
        <div className="bg-white p-3 rounded border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${account.autopayEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <Label className="text-sm font-medium">Autopay Enabled</Label>
            </div>
            <Switch
              checked={account.autopayEnabled || false}
              onCheckedChange={(checked) => onUpdateAccount(account.id, { autopayEnabled: checked })}
            />
          </div>

          {!account.autopayEnabled && !account.isPaidOff && (
            <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded">
              <AlertTriangle className="h-3 w-3" />
              <span>No autopay – higher risk of missed payments</span>
            </div>
          )}

          {account.autopayEnabled && (
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Autopay Amount</Label>
              <Select
                value={account.autopayAmountType || 'MINIMUM'}
                onValueChange={(value) => onUpdateAccount(account.id, { 
                  autopayAmountType: value as 'MINIMUM' | 'FULL_BALANCE' | 'CUSTOM'
                })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MINIMUM">Minimum Payment</SelectItem>
                  <SelectItem value="FULL_BALANCE">Full Balance</SelectItem>
                  <SelectItem value="CUSTOM">Custom Amount</SelectItem>
                </SelectContent>
              </Select>

              {account.autopayAmountType === 'CUSTOM' && (
                <div>
                  <Label className="text-xs text-gray-600">Custom Amount</Label>
                  <Input
                    type="number"
                    placeholder="Custom payment amount"
                    value={account.autopayCustomAmount || ""}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : Number(e.target.value);
                      onUpdateAccount(account.id, { autopayCustomAmount: value });
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              )}

              {account.autopayAmountType === 'MINIMUM' && (
                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Paying only minimum will result in more interest charges
                </div>
              )}
            </div>
          )}
        </div>

        {/* Utilization Rate */}
        {account.creditLimit && !account.isPaidOff && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Credit Utilization</span>
              <span className={utilizationRate > 30 ? 'text-red-600' : 'text-green-600'}>
                {utilizationRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${utilizationRate > 30 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Payment Calculator */}
        {scenarios && !account.isPaidOff && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <h5 className="text-sm font-medium text-blue-800">Payment Calculator</h5>
            </div>
            
            {/* Minimum Payment Scenario */}
            <div className="bg-white p-3 rounded border">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Minimum Payment: {formatCurrency(scenarios.minPayment)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Payoff Time:</span>
                  <div className="font-medium">
                    {scenarios.minScenario.years > 0 && `${scenarios.minScenario.years}y `}
                    {scenarios.minScenario.remainingMonths}m
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Interest:</span>
                  <div className="font-medium text-red-600">
                    {formatCurrency(scenarios.minScenario.totalInterest)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Paid:</span>
                  <div className="font-medium">
                    {formatCurrency(scenarios.minScenario.totalPaid)}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Payment Scenario */}
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-xs text-gray-600">Custom Payment:</Label>
                <Input
                  type="number"
                  value={customPayment || ""}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    setCustomPayment(value);
                  }}
                  className="h-6 w-20 text-xs"
                  min={scenarios.minPayment}
                />
              </div>
              
              {scenarios.customScenario && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Payoff Time:</span>
                    <div className="font-medium text-green-600">
                      {scenarios.customScenario.years > 0 && `${scenarios.customScenario.years}y `}
                      {scenarios.customScenario.remainingMonths}m
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Interest Saved:</span>
                    <div className="font-medium text-green-600">
                      {formatCurrency(scenarios.minScenario.totalInterest - scenarios.customScenario.totalInterest)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Time Saved:</span>
                    <div className="font-medium text-green-600">
                      {scenarios.minScenario.months - scenarios.customScenario.months} months
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export { CreditSummary };
export default CreditCardManager;