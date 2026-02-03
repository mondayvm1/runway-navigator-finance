import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  X, 
  Wrench, 
  MessageCircle, 
  Heart, 
  Rocket, 
  Handshake,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DatabaseCleanupTool from './DatabaseCleanupTool';

const FloatingSupportMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCleanupTool, setShowCleanupTool] = useState(false);

  const menuItems = [
    {
      id: 'troubleshoot',
      icon: Wrench,
      label: 'Troubleshooting',
      description: 'Fix data issues',
      color: 'from-orange-500 to-red-500',
      onClick: () => {
        setShowCleanupTool(true);
        setIsOpen(false);
      }
    },
    {
      id: 'message',
      icon: MessageCircle,
      label: 'Send Message',
      description: 'Get in touch',
      color: 'from-blue-500 to-indigo-500',
      onClick: () => window.open('mailto:hello@pathline.app', '_blank')
    },
    {
      id: 'donate',
      icon: Heart,
      label: 'Support Development',
      description: 'Buy me a coffee',
      color: 'from-pink-500 to-rose-500',
      onClick: () => window.open('https://buymeacoffee.com/pathline', '_blank')
    },
    {
      id: 'cta',
      icon: Rocket,
      label: 'Build Your App',
      description: 'Cross-platform development',
      color: 'from-purple-500 to-violet-500',
      onClick: () => window.open('https://pathline.app/build', '_blank')
    },
    {
      id: 'sponsor',
      icon: Handshake,
      label: 'Sponsorship & Affiliate',
      description: 'Partner with us',
      color: 'from-emerald-500 to-teal-500',
      onClick: () => window.open('https://pathline.app/partners', '_blank')
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Menu Items */}
        <div className={cn(
          "absolute bottom-16 right-0 flex flex-col gap-2 transition-all duration-300 origin-bottom-right",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}>
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl",
                "bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-200/50",
                "hover:bg-white hover:shadow-xl hover:scale-[1.02]",
                "transition-all duration-200 text-left min-w-[220px]",
                "animate-fade-up"
              )}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                item.color
              )}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm">{item.label}</p>
                <p className="text-xs text-slate-500 truncate">{item.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full p-0 shadow-lg",
            "bg-gradient-to-br from-blue-600 to-indigo-600",
            "hover:from-blue-700 hover:to-indigo-700",
            "hover:shadow-xl hover:scale-105",
            "transition-all duration-300",
            isOpen && "rotate-180"
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform" />
          ) : (
            <TrendingUp className="w-6 h-6 text-white transition-transform" />
          )}
        </Button>
      </div>

      {/* Backdrop when menu is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Database Cleanup Dialog */}
      <Dialog open={showCleanupTool} onOpenChange={setShowCleanupTool}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              Troubleshooting Tools
            </DialogTitle>
            <DialogDescription>
              Fix data issues and clean up your account
            </DialogDescription>
          </DialogHeader>
          <DatabaseCleanupTool />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingSupportMenu;
