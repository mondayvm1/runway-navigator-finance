
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface IncomeEvent {
  id: string;
  name: string;
  amount: number;
  date: string;
  frequency: 'one-time' | 'monthly' | 'yearly';
  endDate?: string;
}

interface IncomeManagerProps {
  incomeEvents: IncomeEvent[];
  incomeEnabled: boolean;
  onAddIncomeEvent: (event: Omit<IncomeEvent, 'id'>) => void;
  onRemoveIncomeEvent: (id: string) => void;
  onToggleIncomeEnabled: () => void;
}

const IncomeManager = ({
  incomeEvents,
  incomeEnabled,
  onAddIncomeEvent,
  onRemoveIncomeEvent,
  onToggleIncomeEnabled
}: IncomeManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    amount: 0,
    date: '',
    frequency: 'one-time' as 'one-time' | 'monthly' | 'yearly',
    endDate: ''
  });

  const handleSubmit = () => {
    if (!newEvent.name || !newEvent.amount || !newEvent.date) return;
    
    onAddIncomeEvent({
      ...newEvent,
      endDate: newEvent.endDate || undefined
    });
    
    setNewEvent({
      name: '',
      amount: 0,
      date: '',
      frequency: 'one-time' as 'one-time' | 'monthly' | 'yearly',
      endDate: ''
    });
    setShowForm(false);
  };

  const getTotalProjectedIncome = () => {
    if (!incomeEnabled) return 0;
    
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    return incomeEvents.reduce((total, event) => {
      const eventDate = new Date(event.date);
      if (eventDate < now) return total;
      
      if (event.frequency === 'one-time') {
        return total + event.amount;
      } else if (event.frequency === 'monthly') {
        const monthsUntilEnd = event.endDate 
          ? Math.max(0, Math.ceil((new Date(event.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
          : 12;
        return total + (event.amount * Math.min(monthsUntilEnd, 12));
      } else if (event.frequency === 'yearly') {
        return total + event.amount;
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Income Planning</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            <Switch
              checked={incomeEnabled}
              onCheckedChange={onToggleIncomeEnabled}
              className="data-[state=checked]:bg-green-600"
            />
            <span className="text-sm font-medium text-gray-700">
              {incomeEnabled ? 'Enabled' : 'Disabled'}
            </span>
            {incomeEnabled ? (
              <ToggleRight className="h-4 w-4 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={!incomeEnabled}
        >
          <Plus size={16} />
          Add Income Event
        </Button>
      </div>

      {/* Summary */}
      <div className={`p-4 rounded-lg transition-all ${incomeEnabled ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className={`text-sm mb-1 ${incomeEnabled ? 'text-green-700' : 'text-gray-500'}`}>
          Projected Income (Next 12 Months)
        </div>
        <div className={`text-2xl font-bold ${incomeEnabled ? 'text-green-800' : 'text-gray-600'}`}>
          {formatCurrency(getTotalProjectedIncome())}
        </div>
        {!incomeEnabled && (
          <div className="text-xs text-gray-500 mt-1">
            Income planning is disabled - toggle above to include in calculations
          </div>
        )}
      </div>

      {/* Add Income Form */}
      {showForm && incomeEnabled && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-600">Event Name</Label>
              <Input
                placeholder="e.g., Salary Increase"
                value={newEvent.name}
                onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                className="h-8"
              />
            </div>
            
            <div>
              <Label className="text-xs text-gray-600">Amount</Label>
              <Input
                type="number"
                placeholder="Amount"
                value={newEvent.amount || ""}
                onChange={(e) => setNewEvent(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="h-8"
              />
            </div>
            
            <div>
              <Label className="text-xs text-gray-600">Start Date</Label>
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                className="h-8"
              />
            </div>
            
            <div>
              <Label className="text-xs text-gray-600">Frequency</Label>
              <Select 
                value={newEvent.frequency} 
                onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(newEvent.frequency === 'monthly' || newEvent.frequency === 'yearly') && (
            <div>
              <Label className="text-xs text-gray-600">End Date (Optional)</Label>
              <Input
                type="date"
                value={newEvent.endDate}
                onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                className="h-8"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleSubmit} size="sm">Add Event</Button>
            <Button onClick={() => setShowForm(false)} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {/* Income Events List */}
      {incomeEvents.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Upcoming Income Events</h4>
          {incomeEvents.map((event) => (
            <div 
              key={event.id} 
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                incomeEnabled ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className={`h-4 w-4 ${incomeEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <div className={`font-medium text-sm ${incomeEnabled ? 'text-gray-800' : 'text-gray-500'}`}>
                    {event.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(event.date).toLocaleDateString()} • {event.frequency}
                    {event.endDate && ` until ${new Date(event.endDate).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${incomeEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {formatCurrency(event.amount)}
                </span>
                <Button
                  onClick={() => onRemoveIncomeEvent(event.id)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!incomeEnabled && incomeEvents.length > 0 && (
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            You have {incomeEvents.length} income event{incomeEvents.length > 1 ? 's' : ''} configured.
            <br />
            Enable income planning above to include them in your runway calculations.
          </p>
        </div>
      )}
    </div>
  );
};

export default IncomeManager;
