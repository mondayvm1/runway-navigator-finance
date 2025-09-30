import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountData } from '@/hooks/useFinancialData';
import CollapsibleSection from './CollapsibleSection';

interface Payment {
  id: string;
  name: string;
  amount: number;
  dueDate?: Date;
  isPaid: boolean;
  category: 'credit' | 'loan' | 'other';
}

interface PaymentTrackerProps {
  accountData: AccountData;
}

const PaymentTracker = ({ accountData }: PaymentTrackerProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [flippingIds, setFlippingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Generate payments from accounts
    const generatedPayments: Payment[] = [];

    // Credit cards with minimum payments
    accountData.credit.forEach(account => {
      if (account.minimumPayment && account.minimumPayment > 0) {
        generatedPayments.push({
          id: account.id,
          name: account.name,
          amount: account.minimumPayment,
          dueDate: account.dueDate ? new Date(account.dueDate) : undefined,
          isPaid: false,
          category: 'credit'
        });
      }
    });

    // Loans (could add payment amounts if available)
    accountData.loans.forEach(account => {
      if (account.balance > 0) {
        // Estimate monthly payment (simplified)
        const estimatedPayment = account.balance * 0.02; // 2% of balance
        generatedPayments.push({
          id: account.id,
          name: account.name,
          amount: estimatedPayment,
          isPaid: false,
          category: 'loan'
        });
      }
    });

    setPayments(generatedPayments);
  }, [accountData]);

  const togglePayment = (id: string) => {
    setFlippingIds(prev => new Set(prev).add(id));
    
    setTimeout(() => {
      setPayments(prev =>
        prev.map(payment =>
          payment.id === id ? { ...payment, isPaid: !payment.isPaid } : payment
        )
      );
      
      setTimeout(() => {
        setFlippingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 300);
    }, 150);
  };

  const totalPaid = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const totalRemaining = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);

  if (payments.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      title="Payment Tracker"
      category="payment-tracker"
      icon={<CreditCard className="h-5 w-5 text-primary" />}
      defaultOpen={true}
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Paid This Month</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>
          
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Remaining</p>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(totalRemaining)}</p>
              </div>
              <XCircle className="h-8 w-8 text-amber-600" />
            </div>
          </Card>
        </div>

        {/* Payment Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="payment-tile-container"
              style={{ perspective: '1000px', minHeight: '180px' }}
            >
              <div
                className={`payment-tile ${flippingIds.has(payment.id) ? 'flipping' : ''} ${payment.isPaid ? 'paid' : 'unpaid'}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: payment.isPaid ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  cursor: 'pointer'
                }}
                onClick={() => togglePayment(payment.id)}
              >
                {/* Front Face - Unpaid */}
                <Card
                  className="absolute w-full h-full backface-hidden p-5 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 hover:border-red-300 transition-colors"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          {payment.category === 'credit' ? (
                            <CreditCard className="h-5 w-5 text-red-600" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2">{payment.name}</h4>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {payment.dueDate && (
                        <p>Due: {payment.dueDate.toLocaleDateString()}</p>
                      )}
                      <p className="font-medium text-red-600 mt-1">Click to mark paid</p>
                    </div>
                  </div>
                </Card>

                {/* Back Face - Paid */}
                <Card
                  className="absolute w-full h-full backface-hidden p-5 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 hover:border-emerald-300 transition-colors"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          {payment.category === 'credit' ? (
                            <CreditCard className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2">{payment.name}</h4>
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      <p className="font-medium text-emerald-600">✓ Paid</p>
                      <p className="text-slate-400 mt-1">Click to mark unpaid</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 text-center">
          Click any tile to toggle payment status
        </p>
      </div>
    </CollapsibleSection>
  );
};

export default PaymentTracker;
