
export interface Snapshot {
  id: string;
  snapshotName: string;
  createdAt: string;
  accountData?: {
    cash: Account[];
    investments: Account[];
    monthlyExpenses: MonthlyExpense[];
    monthlyIncome: number;
    creditCardDebt: number;
  };
}

export interface Account {
  name: string;
  balance: number;
}

export interface MonthlyExpense {
  name: string;
  amount: number;
}
