import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, CheckCircle2, XCircle, Pencil } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AccountData, AccountItem } from '@/hooks/useFinancialData';
import CollapsibleSection from './CollapsibleSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Payment {
  id: string; // unique composite id per payment (e.g., "credit:uuid")
  accountId: string; // original account id in DB
  name: string;
  amount: number;
  dueDate?: Date;
  isPaid: boolean;
  category: 'credit' | 'loan' | 'other';
}

interface PaymentTrackerProps {
  accountData: AccountData;
  updateAccountField: (
    category: keyof AccountData,
    id: string,
    updates: Partial<AccountItem>
  ) => Promise<void> | void;
}

const PaymentTracker = ({ accountData, updateAccountField }: PaymentTrackerProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [flippingIds, setFlippingIds] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDueDate, setEditDueDate] = useState<string>('');

  useEffect(() => {
    // Generate payments from accounts with de-duplication and overrides
    const map = new Map<string, Payment>();

    // Credit cards: use minimumPayment when available
    accountData.credit.forEach((account) => {
      const min = account.minimumPayment && account.minimumPayment > 0 ? account.minimumPayment : 0;
      if (min > 0) {
        const key = `credit:${account.id}`;
        map.set(key, {
          id: key,
          accountId: account.id,
          name: account.name,
          amount: min,
          dueDate: account.dueDate ? new Date(account.dueDate) : undefined,
          isPaid: false,
          category: 'credit',
        });
      }
    });

    // Loans: prefer explicit minimumPayment, fallback to 2% estimate
    accountData.loans.forEach((account) => {
      const amt = account.minimumPayment && account.minimumPayment > 0
        ? account.minimumPayment
        : account.balance > 0
          ? account.balance * 0.02
          : 0;
      if (amt > 0) {
        const key = `loan:${account.id}`;
        map.set(key, {
          id: key,
          accountId: account.id,
          name: account.name,
          amount: amt,
          dueDate: account.dueDate ? new Date(account.dueDate) : undefined,
          isPaid: false,
          category: 'loan',
        });
      }
    });

    // Sort by amount descending (largest first)
    const generated = Array.from(map.values()).sort((a, b) => b.amount - a.amount);
    setPayments(generated);
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

  const openEdit = (p: Payment) => {
    setEditing(p);
    setEditName(p.name);
    setEditAmount(Number(p.amount.toFixed(2)));
    setEditDueDate(p.dueDate ? p.dueDate.toISOString().slice(0, 10) : '');
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const categoryKey = editing.category === 'credit' ? 'credit' : 'loans';
    await Promise.resolve(
      updateAccountField(categoryKey as keyof AccountData, editing.accountId, {
        name: editName,
        minimumPayment: Number(editAmount),
        dueDate: editDueDate || undefined,
      })
    );
    setEditOpen(false);
    setEditing(null);
  };
  const totalPaid = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const totalRemaining = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);

  if (payments.length === 0) {
    return (
      <CollapsibleSection
        title="Payment Tracker"
        category="payment-tracker"
        icon={<CreditCard className="h-5 w-5 text-primary" />}
        defaultOpen={true}
      >
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-center text-slate-600">
            No payments to track. Add credit cards with minimum payments or loans to see payment tiles here.
          </p>
        </Card>
      </CollapsibleSection>
    );
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
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Paid This Month</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalPaid)}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Remaining</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalRemaining)}</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
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
                  className="absolute w-full h-full backface-hidden p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 hover:border-blue-400 transition-colors"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {payment.category === 'credit' ? (
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            ) : (
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(payment); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <XCircle className="h-5 w-5 text-blue-400" />
                          </div>
                        </div>
                      <h4 className="font-semibold text-slate-800 mb-2">{payment.name}</h4>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {payment.dueDate && (
                        <p>Due: {payment.dueDate.toLocaleDateString()}</p>
                      )}
                      <p className="font-medium text-blue-600 mt-1">Click to mark paid</p>
                    </div>
                  </div>
                </Card>

                {/* Back Face - Paid */}
                <Card
                  className="absolute w-full h-full backface-hidden p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 hover:border-green-400 transition-colors"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          {payment.category === 'credit' ? (
                            <CreditCard className="h-5 w-5 text-green-600" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(payment); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2">{payment.name}</h4>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      <p className="font-medium text-green-600">✓ Paid</p>
                      <p className="text-slate-400 mt-1">Click to mark unpaid</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Survivability Goals */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <span>💪</span> Survivability Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-emerald-700 font-medium">Monthly Obligation</p>
              <p className="text-2xl font-bold text-emerald-900">{formatCurrency(totalRemaining)}</p>
              <p className="text-xs text-emerald-600">Keep this low to maximize runway</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-emerald-700 font-medium">Survival Impact</p>
              <p className="text-2xl font-bold text-emerald-900">
                {totalRemaining > 0 ? `${Math.max(1, Math.round(totalRemaining / 100))} mo` : '∞'}
              </p>
              <p className="text-xs text-emerald-600">Months of runway consumed</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-emerald-700 font-medium">Freedom Score</p>
              <p className="text-2xl font-bold text-emerald-900">
                {payments.filter(p => p.isPaid).length}/{payments.length}
              </p>
              <p className="text-xs text-emerald-600">Payments cleared this cycle</p>
            </div>
          </div>
        </Card>

        <p className="text-xs text-slate-500 text-center">
          Click any tile to toggle payment status • Click edit icon to adjust payment details
        </p>
      </div>

      {/* Edit Payment Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Payment Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="edit-due">Due Date (optional)</Label>
              <Input
                id="edit-due"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CollapsibleSection>
  );
};

export default PaymentTracker;
