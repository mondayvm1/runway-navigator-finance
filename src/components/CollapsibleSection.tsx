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
      <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/60 p-3 sm:p-4 transition-all duration-300 hover:bg-white/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 text-slate-500 min-w-0 flex-1">
            {icon}
            <span className="font-medium text-sm sm:text-base truncate">{title}</span>
            <span className="text-[10px] sm:text-xs bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">Hidden</span>
          </div>
          <Button
            onClick={toggleVisibility}
            variant="ghost"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-white/80 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-3 sm:p-4 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white/80 border-b border-slate-100">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 sm:gap-3 flex-1 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg group min-w-0">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all flex-shrink-0">
                {icon}
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">{title}</h3>
              <ChevronDown 
                className={`h-3 w-3 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 ml-auto flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </CollapsibleTrigger>
          
          <Button
            onClick={toggleVisibility}
            variant="ghost"
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 ml-1 sm:ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex-shrink-0"
          >
            <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="p-4 sm:p-6 bg-white/50">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CollapsibleSection;
