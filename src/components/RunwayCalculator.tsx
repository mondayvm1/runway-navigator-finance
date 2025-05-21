
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RunwayChart from "./RunwayChart";
import { Clock, DollarSign, CalendarDays, Landmark } from "lucide-react";

interface FinanceData {
  savings: number;
  monthlyExpenses: number;
}

const RunwayCalculator = () => {
  const [finances, setFinances] = useState<FinanceData>({
    savings: 0,
    monthlyExpenses: 0,
  });
  
  const [runway, setRunway] = useState({
    days: 0,
    months: 0,
  });

  useEffect(() => {
    // Load saved data from localStorage when component mounts
    const savedData = localStorage.getItem("financeRunwayData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFinances(parsedData);
        calculateRunway(parsedData.savings, parsedData.monthlyExpenses);
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem("financeRunwayData", JSON.stringify(finances));
  }, [finances]);

  const calculateRunway = (savings: number, monthlyExpenses: number) => {
    if (monthlyExpenses <= 0) {
      setRunway({ days: 0, months: 0 });
      return;
    }

    const dailyExpenses = monthlyExpenses / 30;
    const totalDays = Math.floor(savings / dailyExpenses);
    const totalMonths = (savings / monthlyExpenses).toFixed(1);

    setRunway({
      days: totalDays,
      months: parseFloat(totalMonths),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;

    const updatedFinances = {
      ...finances,
      [name]: numericValue,
    };
    
    setFinances(updatedFinances);
    calculateRunway(
      name === "savings" ? numericValue : finances.savings,
      name === "monthlyExpenses" ? numericValue : finances.monthlyExpenses
    );
  };

  const handleCalculate = () => {
    calculateRunway(finances.savings, finances.monthlyExpenses);
    toast.success("Runway calculated successfully!");
  };

  const handleReset = () => {
    setFinances({ savings: 0, monthlyExpenses: 0 });
    setRunway({ days: 0, months: 0 });
    toast.info("Values have been reset");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-blue-700 flex items-center">
        <Landmark className="mr-2" /> Calculate Your Runway
      </h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="savings" className="block text-sm font-medium text-gray-700 mb-1">
            Current Savings
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="savings"
              name="savings"
              type="number"
              min="0"
              className="pl-10"
              placeholder="Enter your total savings"
              value={finances.savings || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="monthlyExpenses" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Expenses
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="monthlyExpenses"
              name="monthlyExpenses"
              type="number"
              min="0"
              className="pl-10"
              placeholder="Enter your monthly expenses"
              value={finances.monthlyExpenses || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3 mb-8">
        <Button onClick={handleCalculate} className="flex-1 bg-blue-600 hover:bg-blue-700">
          Calculate Runway
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
      
      {(runway.days > 0 || runway.months > 0) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm text-gray-500">Runway in Days</div>
              <div className="text-3xl font-bold text-blue-700">{runway.days}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <CalendarDays className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm text-gray-500">Runway in Months</div>
              <div className="text-3xl font-bold text-green-700">{runway.months}</div>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Runway Visualization</h3>
            <RunwayChart 
              savings={finances.savings} 
              monthlyExpenses={finances.monthlyExpenses} 
              months={runway.months} 
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default RunwayCalculator;
