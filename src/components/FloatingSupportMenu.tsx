import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  X, 
  Wrench, 
  MessageCircle, 
  Heart, 
  Rocket, 
  Handshake,
  Crown,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DatabaseCleanupTool from './DatabaseCleanupTool';
import { exportAllData, importFromZip } from '@/utils/dataPortability';

const FloatingSupportMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCleanupTool, setShowCleanupTool] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    setIsOpen(false);
    exportAllData();
  };

  const handleImportClick = () => {
    setIsOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importFromZip(file);
    e.target.value = '';
    window.location.reload();
  };

  const menuItems = [
    {
      id: 'export',
      icon: Download,
      label: 'Export Data',
      description: 'ZIP with CSVs + JSON backup',
      accent: 'border-l-cyan-400',
      onClick: handleExport,
    },
    {
      id: 'import',
      icon: Upload,
      label: 'Import Backup',
      description: 'Restore from a Pathline ZIP',
      accent: 'border-l-cyan-400',
      onClick: handleImportClick,
    },
    {
      id: 'vip',
      icon: Crown,
      label: 'Go VIP',
      description: 'Unlock premium features',
      accent: 'border-l-amber-400',
      href: '/vip'
    },
    {
      id: 'troubleshoot',
      icon: Wrench,
      label: 'Troubleshooting',
      description: 'Fix data issues',
      accent: 'border-l-amber-400',
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
      accent: 'border-l-violet-400',
      href: '/contact'
    },
    {
      id: 'donate',
      icon: Heart,
      label: 'Support Development',
      description: 'Buy me a coffee',
      accent: 'border-l-violet-400',
      href: '/donate'
    },
    {
      id: 'cta',
      icon: Rocket,
      label: 'Build Your App',
      description: 'Cross-platform development',
      accent: 'border-l-violet-400',
      href: '/build'
    },
    {
      id: 'sponsor',
      icon: Handshake,
      label: 'Sponsorship & Affiliate',
      description: 'Partner with us',
      accent: 'border-l-emerald-400',
      href: '/partners'
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Menu Items */}
        <div className={cn(
          "absolute bottom-16 right-0 flex min-w-[270px] flex-col gap-1.5 rounded-2xl border border-white/15 bg-gradient-to-br from-slate-950/95 via-indigo-950/95 to-slate-900/95 p-2.5 shadow-2xl shadow-indigo-950/30 backdrop-blur-2xl transition-all duration-300 origin-bottom-right",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}>
          {menuItems.map((item, index) => {
            const content = (
              <>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                  <item.icon className="h-4.5 w-4.5 text-indigo-100" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="truncate text-xs text-indigo-200/70">{item.description}</p>
                </div>
              </>
            );

            const className = cn(
              "flex min-w-[245px] items-center gap-3 rounded-xl border border-white/5 border-l-2 bg-white/[0.055] px-3 py-2.5",
              "hover:border-white/15 hover:bg-white/[0.11] hover:translate-x-0.5",
              "transition-all duration-200 text-left",
              item.accent,
              "animate-fade-up"
            );

            const style = { 
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards' as const
            };

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={className}
                  style={style}
                  onClick={() => setIsOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={className}
                style={style}
              >
                {content}
              </button>
            );
          })}
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

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default FloatingSupportMenu;
