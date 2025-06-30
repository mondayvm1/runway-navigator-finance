
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
    e.preventDefault();
    e.stopPropagation();
    updateCategoryVisibility(category, !isHidden);
  };

  if (isHidden) {
    return (
      <Card 
        className="p-4 border-2" 
        style={{ 
          backgroundColor: palette.headerBg, 
          borderColor: palette.border 
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: palette.text }}>
            {icon}
            <span className="font-medium">{title}</span>
            <span className="text-xs opacity-70">(Hidden)</span>
          </div>
          <Button
            onClick={toggleVisibility}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20"
            style={{ color: palette.text }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="overflow-hidden border-2" 
      style={{ borderColor: palette.border }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="p-4 border-b-2 flex items-center justify-between transition-all duration-200 hover:brightness-95"
          style={{ 
            backgroundColor: palette.headerBg, 
            borderBottomColor: palette.border 
          }}
        >
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 flex-1 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded">
              {icon}
              <h3 className="font-semibold text-lg" style={{ color: palette.text }}>
                {title}
              </h3>
              <ChevronDown 
                className={`h-5 w-5 transition-transform duration-200 ml-auto ${isOpen ? 'rotate-180' : ''}`}
                style={{ color: palette.text }} 
              />
            </button>
          </CollapsibleTrigger>
          
          <Button
            onClick={toggleVisibility}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 ml-2 hover:bg-white/20 flex-shrink-0"
            style={{ color: palette.text }}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
        
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="p-6 bg-white">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleSection;
