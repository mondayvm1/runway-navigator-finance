
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useCategorySettings } from '@/hooks/useCategorySettings';

interface CollapsibleSectionProps {
  title: string;
  category: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

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

  const toggleVisibility = () => {
    updateCategoryVisibility(category, !isHidden);
  };

  if (isHidden) {
    return (
      <Card className="p-4 bg-gray-50 border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500">
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
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="p-4 border-b bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {icon}
                <h3 className="font-semibold text-gray-800">{title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility();
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleSection;
