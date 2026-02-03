import React from 'react';
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
      <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 transition-all duration-300 hover:bg-white/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-500">
            {icon}
            <span className="font-medium">{title}</span>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">Hidden</span>
          </div>
          <Button
            onClick={toggleVisibility}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/80 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white/80 border-b border-slate-100">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-3 flex-1 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all">
                {icon}
              </div>
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <ChevronDown 
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ml-auto ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </CollapsibleTrigger>
          
          <Button
            onClick={toggleVisibility}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
        
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="p-6 bg-white/50">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CollapsibleSection;
