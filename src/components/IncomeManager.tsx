
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-blue-50 rounded-full border border-blue-200 self-start">
            <Switch
              checked={incomeEnabled}
              onCheckedChange={onToggleIncomeEnabled}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              {incomeEnabled ? 'Enabled' : 'Disabled'}
            </span>
            {incomeEnabled ? (
              <ToggleRight className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            ) : (
              <ToggleLeft className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
            )}
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            disabled={!incomeEnabled}
          >
            <Plus size={14} className="sm:hidden" />
            <Plus size={16} className="hidden sm:block" />
            <span className="hidden sm:inline">Add Income Event</span>
            <span className="sm:hidden">Add Income</span>
          </Button>
        </div>

        {/* Summary Card */}
        <Card className={`p-4 sm:p-6 transition-all duration-200 ${
          incomeEnabled 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
            : 'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
        }`}>
          <div className={`text-xs sm:text-sm mb-1 sm:mb-2 font-medium ${
            incomeEnabled ? 'text-blue-700' : 'text-slate-500'
          }`}>
            Projected Income (Next 12 Months)
          </div>
          <div className={`text-2xl sm:text-3xl font-bold mb-1 ${
            incomeEnabled ? 'text-blue-800' : 'text-slate-600'
          }`}>
            {formatCurrency(getTotalProjectedIncome())}
          </div>
          {!incomeEnabled && (
            <div className="text-[10px] sm:text-xs text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-full inline-block">
              Income planning disabled
            </div>
          )}
        </Card>

      {/* Add/Edit Income Form */}
      {showForm && incomeEnabled && (
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h4 className="text-base sm:text-lg font-semibold text-slate-800">
                {editingId ? 'Edit Income Event' : 'Add New Income'}
              </h4>
              {editingId && (
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">Event Name</Label>
                <Input
                  placeholder="e.g., Salary Increase"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">Amount</Label>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newEvent.amount || ""}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    setNewEvent(prev => ({ ...prev, amount: value }));
                  }}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">Start Date</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">Frequency</Label>
                <Select 
                  value={newEvent.frequency} 
                  onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-9 sm:h-10 text-sm">
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
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">End Date (Optional)</Label>
                <Input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-9 sm:h-10 text-sm"
                />
              </div>
            )}
            
            <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
              <Button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
              >
                {editingId ? <Check size={14} /> : <Plus size={14} />}
                {editingId ? 'Update' : 'Add Event'}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm h-9 sm:h-10"
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
            <div className="space-y-2 sm:space-y-3">
              {incomeEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className={`p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${
                    incomeEnabled 
                      ? 'bg-white border-slate-200 hover:border-slate-300' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                        incomeEnabled ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          incomeEnabled ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-semibold text-sm sm:text-base truncate ${
                          incomeEnabled ? 'text-slate-800' : 'text-slate-500'
                        }`}>
                          {event.name}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-1 sm:gap-2">
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{event.frequency}</span>
                          {event.endDate && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">until {new Date(event.endDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-9 sm:pl-0">
                      <span className={`font-bold text-base sm:text-lg ${
                        incomeEnabled ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {formatCurrency(event.amount)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEdit(event)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          disabled={!incomeEnabled}
                        >
                          <Edit size={14} className="sm:hidden" />
                          <Edit size={16} className="hidden sm:block" />
                        </Button>
                        <Button
                          onClick={() => onRemoveIncomeEvent(event.id)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} className="sm:hidden" />
                          <Trash2 size={16} className="hidden sm:block" />
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
          <Card className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 text-center">
            <p className="text-sm sm:text-base text-slate-600">
              You have <span className="font-semibold text-slate-800">{incomeEvents.length}</span> income event{incomeEvents.length > 1 ? 's' : ''}.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enable income planning to include in calculations.
            </p>
          </Card>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default IncomeManager;
