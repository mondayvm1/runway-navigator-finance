
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { AccountItem } from '@/hooks/useFinancialData';

interface MassImportDialogProps {
  onImport: (data: {
    accounts: {
      cash: AccountItem[];
      investments: AccountItem[];
      credit: AccountItem[];
      loans: AccountItem[];
      otherAssets: AccountItem[];
    };
    monthlyExpenses: number;
  }) => void;
}

const MassImportDialog = ({ onImport }: MassImportDialogProps) => {
  const [importText, setImportText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const parseImportText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const accounts = {
      cash: [] as AccountItem[],
      investments: [] as AccountItem[],
      credit: [] as AccountItem[],
      loans: [] as AccountItem[],
      otherAssets: [] as AccountItem[]
    };
    
    let monthlyExpenses = 0;
    let currentCategory = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check for category headers
      if (lowerLine.includes('cash') && !lowerLine.includes(':')) {
        currentCategory = 'cash';
        continue;
      } else if (lowerLine.includes('investment') && !lowerLine.includes(':')) {
        currentCategory = 'investments';
        continue;
      } else if (lowerLine.includes('credit') && !lowerLine.includes(':')) {
        currentCategory = 'credit';
        continue;
      } else if (lowerLine.includes('loan') && !lowerLine.includes(':')) {
        currentCategory = 'loans';
        continue;
      } else if ((lowerLine.includes('other') || lowerLine.includes('asset')) && !lowerLine.includes(':')) {
        currentCategory = 'otherAssets';
        continue;
      } else if (lowerLine.includes('expense') && !lowerLine.includes(':')) {
        currentCategory = 'expenses';
        continue;
      }
      
      // Parse account lines (format: "Account Name: $1,234" or "Account Name $1,234")
      const colonMatch = line.match(/^(.+?):\s*\$?([\d,]+(?:\.\d{2})?)$/);
      const spaceMatch = line.match(/^(.+?)\s+\$?([\d,]+(?:\.\d{2})?)$/);
      
      if (colonMatch || spaceMatch) {
        const match = colonMatch || spaceMatch;
        const name = match[1].trim();
        const amount = Number(match[2].replace(/,/g, ''));
        
        if (currentCategory === 'expenses') {
          monthlyExpenses = amount;
        } else if (currentCategory && currentCategory in accounts) {
          const account: AccountItem = {
            id: uuidv4(),
            name,
            balance: amount,
            interestRate: getDefaultInterestRate(currentCategory as keyof typeof accounts)
          };
          accounts[currentCategory as keyof typeof accounts].push(account);
        }
      }
    }
    
    return { accounts, monthlyExpenses };
  };

  const getDefaultInterestRate = (category: string): number => {
    const defaultRates = {
      cash: 0.5,
      investments: 8.0,
      credit: 24.99,
      loans: 7.5,
      otherAssets: 3.0
    };
    return defaultRates[category as keyof typeof defaultRates] || 0;
  };

  const handleImport = () => {
    if (!importText.trim()) {
      toast.error('Please enter some data to import');
      return;
    }

    try {
      const parsedData = parseImportText(importText);
      const totalAccounts = Object.values(parsedData.accounts).reduce((sum, accounts) => sum + accounts.length, 0);
      
      if (totalAccounts === 0 && parsedData.monthlyExpenses === 0) {
        toast.error('No valid data found. Please check the format and try again.');
        return;
      }

      onImport(parsedData);
      toast.success(`Imported ${totalAccounts} accounts${parsedData.monthlyExpenses > 0 ? ' and monthly expenses' : ''}`);
      setIsOpen(false);
      setImportText('');
    } catch (error) {
      console.error('Error parsing import data:', error);
      toast.error('Error parsing data. Please check the format and try again.');
    }
  };

  const exampleText = `Cash
Checking Account: $5,000
Savings Account: $15,000
Emergency Fund: $10,000

Investments
401k: $75,000
Roth IRA: $25,000
Brokerage Account: $50,000

Credit
Chase Credit Card: $2,500
Amex: $1,200

Loans
Car Loan: $15,000
Student Loan: $25,000

Other Assets
Car Value: $20,000
Home Equity: $100,000

Expenses
Monthly Expenses: $4,500`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Mass Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Mass Import Financial Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <HelpCircle className="h-4 w-4" />
              <span>Format Guide</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
              <p><strong>Simple format:</strong></p>
              <p>1. Write category names (Cash, Investments, Credit, Loans, Other Assets, Expenses)</p>
              <p>2. List accounts under each category with amounts:</p>
              <p className="font-mono">Account Name: $1,234</p>
              <p className="font-mono">or Account Name $1,234</p>
              <p className="text-gray-500 mt-2">Numbers can include commas (e.g., $1,234.56)</p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p><strong>Example:</strong></p>
              <pre className="text-xs mt-2 whitespace-pre-wrap">{exampleText}</pre>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Paste your financial data:
            </label>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={exampleText}
              className="min-h-[400px] font-mono text-sm"
            />
            
            <div className="flex gap-2">
              <Button onClick={handleImport} className="flex-1">
                Import Data
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setImportText(exampleText)}
              >
                Load Example
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MassImportDialog;
