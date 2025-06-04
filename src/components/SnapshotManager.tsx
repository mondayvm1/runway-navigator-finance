
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Camera, Save } from 'lucide-react';

interface SnapshotManagerProps {
  onCreateSnapshot: (name: string) => Promise<string | undefined>;
  onSaveData: () => Promise<void>;
}

const SnapshotManager = ({ onCreateSnapshot, onSaveData }: SnapshotManagerProps) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [showSnapshotInput, setShowSnapshotInput] = useState(false);

  const handleCreateSnapshot = async () => {
    if (!snapshotName.trim()) return;
    
    await onCreateSnapshot(snapshotName);
    setSnapshotName('');
    setShowSnapshotInput(false);
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
            onClick={() => setShowSnapshotInput(!showSnapshotInput)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Camera size={16} />
            Take Snapshot
          </Button>
        </div>
        
        {showSnapshotInput && (
          <div className="flex gap-2">
            <Input
              placeholder="Snapshot name (e.g., 'Before salary increase')"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSnapshot()}
            />
            <Button onClick={handleCreateSnapshot} disabled={!snapshotName.trim()}>
              Create
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SnapshotManager;
