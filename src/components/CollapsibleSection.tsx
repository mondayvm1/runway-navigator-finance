
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useCategorySettings } from '@/hooks/useCategorySettings';

interface CollapsibleSectionProps {
  title: string;
  category: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

const palette = {
  headerBg: '#F0F2AC', // Potential-3
  border: '#D9D9D9',  // Potential-4
  text: '#0D0D0D',    // Potential-5
  accent1: '#E0F252', // Potential-1
  accent2: '#EDF25C', // Potential-2
};

const CollapsibleSection = ({ 
  title, 
  category, 
  children, 
  icon, 
  defaultOpen = true 
}: CollapsibleSectionProps) => {
  const { isCategoryHidden, updateCategoryVisibility } = useCategorySettings();
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const isHidden = isCategoryHidden(category);

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCategoryVisibility(category, !isHidden);
  };

  if (isHidden) {
    return (
      <Card className="p-4" style={{ backgroundColor: palette.headerBg, borderColor: palette.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: palette.text }}>
            {icon}
            <span className="font-medium">{title}</span>
            <span className="text-xs">(Hidden)</span>
          </div>
          <Button
            onClick={toggleVisibility}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2" style={{ borderColor: palette.border }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="p-4 border-b flex items-center justify-between cursor-pointer select-none transition-colors hover:opacity-90"
          style={{ backgroundColor: palette.headerBg, borderColor: palette.border }}
        >
          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
            {icon}
            <h3 className="font-semibold" style={{ color: palette.text }}>{title}</h3>
          </CollapsibleTrigger>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleVisibility}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              type="button"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="h-4 w-4" style={{ color: palette.text }} />
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="p-6" style={{ backgroundColor: '#fff' }}>
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleSection;
