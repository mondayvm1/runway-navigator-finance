
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Save } from 'lucide-react';

interface EnhancedSnapshotManagerProps {
  onCreateSnapshot: (name: string, description?: string) => Promise<string | undefined>;
  onSaveData: () => Promise<void>;
}

const EnhancedSnapshotManager = ({ onCreateSnapshot, onSaveData }: EnhancedSnapshotManagerProps) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const [showSnapshotInput, setShowSnapshotInput] = useState(false);

  const handleCreateSnapshot = async () => {
    if (!snapshotName.trim()) return;
    
    await onCreateSnapshot(snapshotName, snapshotDescription);
    setSnapshotName('');
    setSnapshotDescription('');
    setShowSnapshotInput(false);
  };

  const generateDefaultSnapshotName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `Financial Snapshot - ${dateStr} at ${timeStr}`;
  };

  const handleShowForm = () => {
    setShowSnapshotInput(true);
    if (!snapshotName) {
      setSnapshotName(generateDefaultSnapshotName());
    }
  };

  return (
    <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="grid grid-cols-2 sm:flex gap-2">
          <Button onClick={onSaveData} className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10">
            <Save size={14} className="sm:hidden" />
            <Save size={16} className="hidden sm:block" />
            <span className="hidden sm:inline">Save Current Data</span>
            <span className="sm:hidden">Save Data</span>
          </Button>
          
          <Button 
            onClick={handleShowForm}
            variant="outline"
            className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-9 sm:h-10"
          >
            <Camera size={14} className="sm:hidden" />
            <Camera size={16} className="hidden sm:block" />
            <span className="hidden sm:inline">Take Snapshot</span>
            <span className="sm:hidden">Snapshot</span>
          </Button>
        </div>
        
        {showSnapshotInput && (
          <div className="space-y-3 bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-700">Snapshot Name</Label>
              <Input
                placeholder="e.g., 'Before salary increase'"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreateSnapshot()}
                className="mt-1 text-sm h-9 sm:h-10"
              />
            </div>
            
            <div>
              <Label className="text-xs sm:text-sm font-medium text-gray-700">Description (Optional)</Label>
              <Textarea
                placeholder="Add notes about this snapshot..."
                value={snapshotDescription}
                onChange={(e) => setSnapshotDescription(e.target.value)}
                className="mt-1 h-16 sm:h-20 text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreateSnapshot} disabled={!snapshotName.trim()} className="text-xs sm:text-sm h-9 sm:h-10">
                Create Snapshot
              </Button>
              <Button 
                onClick={() => setShowSnapshotInput(false)} 
                variant="outline"
                className="text-xs sm:text-sm h-9 sm:h-10"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EnhancedSnapshotManager;
