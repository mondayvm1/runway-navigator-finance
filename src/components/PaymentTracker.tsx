import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react';
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
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('payment_excluded_ids_v1');
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(arr);
    } catch {
      return new Set();
    }
  });
  const [flippingIds, setFlippingIds] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDueDate, setEditDueDate] = useState<string>('');

  useEffect(() => {
    // Generate payments from accounts with de-duplication and overrides
    const map = new Map<string, Payment>();

    // Credit cards: use minimumPayment or estimate 2% of balance
    accountData.credit.forEach((account) => {
      const min = account.minimumPayment && account.minimumPayment > 0 
        ? account.minimumPayment 
        : account.balance > 0 
          ? account.balance * 0.02 
          : 0;
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

    // Sort by due date first (earliest first, no due date last), then by balance descending
    const generated = Array.from(map.values())
      .filter(p => !deletedIds.has(p.id))
      .sort((a, b) => {
        // If both have due dates, sort by date (earliest first)
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        // If only one has a due date, prioritize it
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        // If neither has due date, sort by amount descending
        return b.amount - a.amount;
      });
    setPayments(generated);
  }, [accountData, deletedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('payment_excluded_ids_v1', JSON.stringify(Array.from(deletedIds)));
    } catch {}
  }, [deletedIds]);

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

  const deletePayment = (id: string) => {
    setDeletedIds(prev => new Set(prev).add(id));
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
      <div className="space-y-4 sm:space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Paid</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-700 truncate">{formatCurrency(totalPaid)}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-2" />
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Remaining</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-700 truncate">{formatCurrency(totalRemaining)}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-2" />
            </div>
          </Card>
        </div>

        {/* Payment Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="payment-tile-container"
              style={{ perspective: '1000px', minHeight: '160px' }}
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
                  className="absolute w-full h-full backface-hidden p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 hover:border-blue-400 transition-colors"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                            {payment.category === 'credit' ? (
                              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            ) : (
                              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0" onClick={(e) => { e.stopPropagation(); openEdit(payment); }}>
                              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:text-destructive" onClick={(e) => { e.stopPropagation(); deletePayment(payment.id); }}>
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                          </div>
                        </div>
                      <h4 className="font-semibold text-sm sm:text-base text-slate-800 mb-1 sm:mb-2 truncate">{payment.name}</h4>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-600 mt-2">
                      {payment.dueDate ? (
                        <p className="font-semibold">📅 {payment.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      ) : (
                        <p className="text-slate-400">No due date</p>
                      )}
                      <p className="font-medium text-blue-600 mt-1">Tap to mark paid</p>
                    </div>
                  </div>
                </Card>

                {/* Back Face - Paid */}
                <Card
                  className="absolute w-full h-full backface-hidden p-3 sm:p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 hover:border-green-400 transition-colors"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                          {payment.category === 'credit' ? (
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          ) : (
                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0" onClick={(e) => { e.stopPropagation(); openEdit(payment); }}>
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:text-destructive" onClick={(e) => { e.stopPropagation(); deletePayment(payment.id); }}>
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm sm:text-base text-slate-800 mb-1 sm:mb-2 truncate">{payment.name}</h4>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-600 mt-2">
                      {payment.dueDate ? (
                        <p className="font-semibold text-slate-500">📅 {payment.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      ) : (
                        <p className="text-slate-400">No due date</p>
                      )}
                      <p className="font-medium text-green-600 mt-1">✓ Paid</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Survivability Goals */}
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <h3 className="text-base sm:text-lg font-bold text-emerald-900 mb-3 sm:mb-4 flex items-center gap-2">
            <span>💪</span> Survivability Goals
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-sm text-emerald-700 font-medium">Monthly</p>
              <p className="text-base sm:text-2xl font-bold text-emerald-900 truncate">{formatCurrency(totalRemaining)}</p>
              <p className="text-[10px] sm:text-xs text-emerald-600 hidden sm:block">Keep low</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-sm text-emerald-700 font-medium">Impact</p>
              <p className="text-base sm:text-2xl font-bold text-emerald-900">
                {totalRemaining > 0 ? `${Math.max(1, Math.round(totalRemaining / 100))}mo` : '∞'}
              </p>
              <p className="text-[10px] sm:text-xs text-emerald-600 hidden sm:block">Runway used</p>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-sm text-emerald-700 font-medium">Freedom</p>
              <p className="text-base sm:text-2xl font-bold text-emerald-900">
                {payments.filter(p => p.isPaid).length}/{payments.length}
              </p>
              <p className="text-[10px] sm:text-xs text-emerald-600 hidden sm:block">Cleared</p>
            </div>
          </div>
        </Card>

        <p className="text-[10px] sm:text-xs text-slate-500 text-center">
          Tap tiles to toggle • Edit icon to adjust
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
