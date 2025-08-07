
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Percent, Edit3, Check, X } from 'lucide-react';

interface InterestRateInputProps {
  value: number;
  onUpdate: (rate: number) => void;
  accountType: string;
}

const InterestRateInput = ({ value, onUpdate, accountType }: InterestRateInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const getEstimatedRate = (type: string): number => {
    const estimates = {
      'credit': 24.99,
      'loans': 7.5,
      'investments': 8.0,
      'cash': 0.5,
      'otherAssets': 3.0
    };
    return estimates[type as keyof typeof estimates] || 0;
  };

  const handleSave = () => {
    const newRate = tempValue === '' ? 0 : Number(tempValue);
    onUpdate(newRate);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value.toString());
    setIsEditing(false);
  };

  const handleEstimate = () => {
    const estimated = getEstimatedRate(accountType);
    setTempValue(estimated.toString());
    onUpdate(estimated);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="pr-8"
            placeholder="0.00"
          />
          <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button size="sm" onClick={handleSave} className="px-2">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel} className="px-2">
          <X className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleEstimate}>
          Estimate
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 flex items-center gap-1">
        <Percent className="h-3 w-3" />
        {value.toFixed(2)}%
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="px-2"
      >
        <Edit3 className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default InterestRateInput;
