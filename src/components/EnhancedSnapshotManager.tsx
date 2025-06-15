
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
    <Card className="p-4 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button onClick={onSaveData} className="flex items-center gap-2">
            <Save size={16} />
            Save Current Data
          </Button>
          
          <Button 
            onClick={handleShowForm}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Camera size={16} />
            Take Snapshot
          </Button>
        </div>
        
        {showSnapshotInput && (
          <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-700">Snapshot Name</Label>
              <Input
                placeholder="e.g., 'Before salary increase' or 'Q1 2024 baseline'"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleCreateSnapshot()}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Description (Optional)</Label>
              <Textarea
                placeholder="Add notes about this financial snapshot..."
                value={snapshotDescription}
                onChange={(e) => setSnapshotDescription(e.target.value)}
                className="mt-1 h-20"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreateSnapshot} disabled={!snapshotName.trim()}>
                Create Snapshot
              </Button>
              <Button 
                onClick={() => setShowSnapshotInput(false)} 
                variant="outline"
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
