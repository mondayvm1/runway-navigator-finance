import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Trash2, List, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { v4 as uuidv4 } from 'uuid';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'yearly' | 'weekly';
}

interface MonthlyExpensesManagerProps {
  monthlyExpenses: number;
  onUpdateMonthlyExpenses: (amount: number) => void;
}

const EXPENSE_CATEGORIES = [
  'Housing',
  'Utilities',
  'Transportation',
  'Food',
  'Insurance',
  'Healthcare',
  'Subscriptions',
  'Entertainment',
  'Personal',
  'Debt Payments',
  'Other'
];

const MonthlyExpensesManager = ({ 
  monthlyExpenses, 
  onUpdateMonthlyExpenses 
}: MonthlyExpensesManagerProps) => {
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [simpleAmount, setSimpleAmount] = useState(monthlyExpenses);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expenseItems');
    const savedMode = localStorage.getItem('expenseMode');
    
    if (saved) {
      try {
        setExpenseItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved expense items');
      }
    }
    
    if (savedMode === 'detailed') {
      setIsDetailedMode(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    localStorage.setItem('expenseItems', JSON.stringify(expenseItems));
    localStorage.setItem('expenseMode', isDetailedMode ? 'detailed' : 'simple');
  }, [expenseItems, isDetailedMode]);

  // Calculate total from detailed items
  const calculateDetailedTotal = () => {
    return expenseItems.reduce((total, item) => {
      let monthlyAmount = item.amount;
      if (item.frequency === 'yearly') {
        monthlyAmount = item.amount / 12;
      } else if (item.frequency === 'weekly') {
        monthlyAmount = item.amount * 4.33; // Average weeks per month
      }
      return total + monthlyAmount;
    }, 0);
  };

  // Update parent when mode or items change
  useEffect(() => {
    if (isDetailedMode) {
      const total = calculateDetailedTotal();
      onUpdateMonthlyExpenses(Math.round(total * 100) / 100);
    }
  }, [expenseItems, isDetailedMode]);

  const handleModeToggle = (detailed: boolean) => {
    if (detailed && !isDetailedMode) {
      // Switching to detailed mode
      if (expenseItems.length === 0 && monthlyExpenses > 0) {
        // Create a base expense row from simple amount
        setExpenseItems([{
          id: uuidv4(),
          name: 'Base Expenses (Imported)',
          amount: monthlyExpenses,
          category: 'Other',
          frequency: 'monthly'
        }]);
      }
    } else if (!detailed && isDetailedMode) {
      // Switching to simple mode - sum all items
      setSimpleAmount(calculateDetailedTotal());
    }
    setIsDetailedMode(detailed);
  };

  const handleSimpleAmountChange = (value: number) => {
    setSimpleAmount(value);
    onUpdateMonthlyExpenses(value);
  };

  const addExpenseItem = () => {
    const newItem: ExpenseItem = {
      id: uuidv4(),
      name: '',
      amount: 0,
      category: 'Other',
      frequency: 'monthly'
    };
    setExpenseItems([...expenseItems, newItem]);
  };

  const updateExpenseItem = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenseItems(items => 
      items.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const removeExpenseItem = (id: string) => {
    setExpenseItems(items => items.filter(item => item.id !== id));
  };

  const detailedTotal = calculateDetailedTotal();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Monthly Expenses
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calculator className={`h-4 w-4 ${!isDetailedMode ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-sm ${!isDetailedMode ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Simple
            </span>
          </div>
          <Switch
            checked={isDetailedMode}
            onCheckedChange={handleModeToggle}
          />
          <div className="flex items-center gap-2">
            <List className={`h-4 w-4 ${isDetailedMode ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={`text-sm ${isDetailedMode ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Detailed
            </span>
          </div>
        </div>
      </div>

      {!isDetailedMode ? (
        // Simple mode - single input
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="number"
              min="0"
              className="pl-10 text-lg"
              placeholder="Enter your total monthly expenses"
              value={simpleAmount || ""}
              onChange={(e) => handleSimpleAmountChange(Number(e.target.value) || 0)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Switch to Detailed mode to itemize expenses like rent, utilities, subscriptions, etc.
          </p>
        </div>
      ) : (
        // Detailed mode - itemized list
        <div className="space-y-4">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {expenseItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-muted/30 rounded-lg">
                <div className="col-span-4">
                  <Input
                    placeholder="Expense name"
                    value={item.name}
                    onChange={(e) => updateExpenseItem(item.id, { name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      type="number"
                      min="0"
                      className="pl-7"
                      placeholder="0"
                      value={item.amount || ""}
                      onChange={(e) => updateExpenseItem(item.id, { amount: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <Select
                    value={item.frequency}
                    onValueChange={(value: 'monthly' | 'yearly' | 'weekly') => 
                      updateExpenseItem(item.id, { frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Select
                    value={item.category}
                    onValueChange={(value) => updateExpenseItem(item.id, { category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeExpenseItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={addExpenseItem}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>

          {/* Summary */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Total Monthly Expenses:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(detailedTotal)}
              </span>
            </div>
            {expenseItems.some(item => item.frequency !== 'monthly') && (
              <p className="text-xs text-muted-foreground mt-1">
                * Weekly and yearly expenses are converted to monthly equivalents
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MonthlyExpensesManager;