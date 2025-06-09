
import { Card } from '@/components/ui/card';
import { CreditCard, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface CreditCardCalculatorProps {
  balance: number;
  interestRate: number;
  minPayment?: number;
}

const CreditCardCalculator = ({ balance, interestRate, minPayment = 0 }: CreditCardCalculatorProps) => {
  const calculatePayoffDetails = () => {
    if (balance <= 0 || interestRate <= 0) return null;

    const monthlyRate = interestRate / 100 / 12;
    const estimatedMinPayment = minPayment || Math.max(25, balance * 0.02);
    
    // Calculate payoff time with minimum payments
    let remainingBalance = balance;
    let months = 0;
    let totalInterest = 0;
    
    while (remainingBalance > 0 && months < 600) { // Cap at 50 years
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(estimatedMinPayment - interestPayment, remainingBalance);
      
      if (principalPayment <= 0) break; // Can't pay off with minimum payment
      
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
      totalPaid: balance + totalInterest,
      minPayment: estimatedMinPayment
    };
  };

  const payoffData = calculatePayoffDetails();

  if (!payoffData || balance <= 0) {
    return null;
  }

  return (
    <Card className="p-4 mt-2 bg-red-50 border-red-200">
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="h-4 w-4 text-red-600" />
        <h4 className="text-sm font-medium text-red-800">Credit Card Payoff Analysis</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-gray-500" />
          <div>
            <div className="text-gray-600">Payoff Time</div>
            <div className="font-medium">
              {payoffData.years > 0 && `${payoffData.years}y `}
              {payoffData.remainingMonths}m
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-gray-500" />
          <div>
            <div className="text-gray-600">Extra Interest</div>
            <div className="font-medium text-red-600">
              {formatCurrency(payoffData.totalInterest)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendingDown className="h-3 w-3 text-gray-500" />
          <div>
            <div className="text-gray-600">Min Payment</div>
            <div className="font-medium">
              {formatCurrency(payoffData.minPayment)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-gray-500" />
          <div>
            <div className="text-gray-600">Total Paid</div>
            <div className="font-medium">
              {formatCurrency(payoffData.totalPaid)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreditCardCalculator;
