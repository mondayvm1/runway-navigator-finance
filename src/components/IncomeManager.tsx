
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Plus, Trash2, ToggleLeft, ToggleRight, Edit, Check, X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import CollapsibleSection from './CollapsibleSection';

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
  onUpdateIncomeEvent: (id: string, event: Omit<IncomeEvent, 'id'>) => void;
  onToggleIncomeEnabled: () => void;
}

const IncomeManager = ({
  incomeEvents,
  incomeEnabled,
  onAddIncomeEvent,
  onRemoveIncomeEvent,
  onUpdateIncomeEvent,
  onToggleIncomeEnabled
}: IncomeManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    amount: 0,
    date: '',
    frequency: 'one-time' as 'one-time' | 'monthly' | 'yearly',
    endDate: ''
  });

  const handleSubmit = () => {
    if (!newEvent.name || !newEvent.amount || !newEvent.date) return;
    
    if (editingId) {
      onUpdateIncomeEvent(editingId, {
        ...newEvent,
        endDate: newEvent.endDate || undefined
      });
      setEditingId(null);
    } else {
      onAddIncomeEvent({
        ...newEvent,
        endDate: newEvent.endDate || undefined
      });
    }
    
    setNewEvent({
      name: '',
      amount: 0,
      date: '',
      frequency: 'one-time' as 'one-time' | 'monthly' | 'yearly',
      endDate: ''
    });
    setShowForm(false);
  };

  const handleEdit = (event: IncomeEvent) => {
    setNewEvent({
      name: event.name,
      amount: event.amount,
      date: event.date,
      frequency: event.frequency,
      endDate: event.endDate || ''
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setNewEvent({
      name: '',
      amount: 0,
      date: '',
      frequency: 'one-time' as 'one-time' | 'monthly' | 'yearly',
      endDate: ''
    });
    setEditingId(null);
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
    <CollapsibleSection
      title="Income Planning"
      category="income-planning"
      icon={<TrendingUp className="h-5 w-5" />}
      defaultOpen={true}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <Switch
              checked={incomeEnabled}
              onCheckedChange={onToggleIncomeEnabled}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-medium text-slate-700">
              {incomeEnabled ? 'Enabled' : 'Disabled'}
            </span>
            {incomeEnabled ? (
              <ToggleRight className="h-4 w-4 text-blue-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-slate-400" />
            )}
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

        {/* Summary Card */}
        <Card className={`p-6 transition-all duration-200 ${
          incomeEnabled 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
            : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
        }`}>
          <div className={`text-sm mb-2 font-medium ${
            incomeEnabled ? 'text-blue-700' : 'text-slate-500'
          }`}>
            Projected Income (Next 12 Months)
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            incomeEnabled ? 'text-blue-800' : 'text-slate-600'
          }`}>
            {formatCurrency(getTotalProjectedIncome())}
          </div>
          {!incomeEnabled && (
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block">
              Income planning is disabled - toggle above to include in calculations
            </div>
          )}
        </Card>

      {/* Add/Edit Income Form */}
      {showForm && incomeEnabled && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-800">
                {editingId ? 'Edit Income Event' : 'Add New Income Event'}
              </h4>
              {editingId && (
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Event Name</Label>
                <Input
                  placeholder="e.g., Salary Increase"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Amount</Label>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newEvent.amount || ""}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    setNewEvent(prev => ({ ...prev, amount: value }));
                  }}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Start Date</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Frequency</Label>
                <Select 
                  value={newEvent.frequency} 
                  onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">End Date (Optional)</Label>
                <Input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {editingId ? <Check size={16} /> : <Plus size={16} />}
                {editingId ? 'Update Event' : 'Add Event'}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

        {/* Income Events List */}
        {incomeEvents.length > 0 && (
          <CollapsibleSection
            title="Upcoming Income Events"
            category="upcoming-income"
            icon={<Calendar className="h-5 w-5" />}
            defaultOpen={true}
          >
            <div className="space-y-3">
              {incomeEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className={`p-4 transition-all duration-200 hover:shadow-md ${
                    incomeEnabled 
                      ? 'bg-white border-slate-200 hover:border-slate-300' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        incomeEnabled ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <Calendar className={`h-5 w-5 ${
                          incomeEnabled ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <div>
                        <div className={`font-semibold text-base ${
                          incomeEnabled ? 'text-slate-800' : 'text-slate-500'
                        }`}>
                          {event.name}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-2">
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{event.frequency}</span>
                          {event.endDate && (
                            <>
                              <span>•</span>
                              <span>until {new Date(event.endDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-lg ${
                        incomeEnabled ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {formatCurrency(event.amount)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEdit(event)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          disabled={!incomeEnabled}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          onClick={() => onRemoveIncomeEvent(event.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {!incomeEnabled && incomeEvents.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 text-center">
            <p className="text-slate-600">
              You have <span className="font-semibold text-slate-800">{incomeEvents.length}</span> income event{incomeEvents.length > 1 ? 's' : ''} configured.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Enable income planning above to include them in your runway calculations.
            </p>
          </Card>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default IncomeManager;
