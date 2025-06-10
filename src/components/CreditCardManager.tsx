
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, DollarSign, TrendingDown, Calculator } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountItem } from '@/hooks/useFinancialData';

interface CreditCardManagerProps {
  account: AccountItem;
  onUpdateAccount: (id: string, updates: Partial<AccountItem>) => void;
}

const CreditCardManager = ({ account, onUpdateAccount }: CreditCardManagerProps) => {
  const [customPayment, setCustomPayment] = useState(account.minimumPayment || 0);

  const calculatePayoffScenarios = () => {
    if (!account.balance || !account.interestRate) return null;

    const monthlyRate = account.interestRate / 100 / 12;
    const minPayment = account.minimumPayment || Math.max(25, account.balance * 0.02);
    
    // Scenario 1: Minimum payments
    const minScenario = calculatePayoff(account.balance, monthlyRate, minPayment);
    
    // Scenario 2: Custom payment
    const customScenario = customPayment > minPayment ? 
      calculatePayoff(account.balance, monthlyRate, customPayment) : null;

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

  const availableCredit = (account.creditLimit || 0) - account.balance;
  const utilizationRate = account.creditLimit ? (account.balance / account.creditLimit) * 100 : 0;
  const scenarios = calculatePayoffScenarios();

  return (
    <Card className="p-4 mt-2 bg-red-50 border-red-200">
      <div className="space-y-4">
        {/* Credit Card Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-600">Credit Limit</Label>
            <Input
              type="number"
              placeholder="Credit limit"
              value={account.creditLimit || ""}
              onChange={(e) => onUpdateAccount(account.id, { 
                creditLimit: parseFloat(e.target.value) || 0 
              })}
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
              onChange={(e) => onUpdateAccount(account.id, { 
                minimumPayment: parseFloat(e.target.value) || 0 
              })}
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

        {/* Utilization Rate */}
        {account.creditLimit && (
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
        {scenarios && (
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
                  onChange={(e) => setCustomPayment(parseFloat(e.target.value) || 0)}
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

export default CreditCardManager;
