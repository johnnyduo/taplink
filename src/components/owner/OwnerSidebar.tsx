import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { 
  Home, 
  Package, 
  Nfc, 
  TrendingUp, 
  Wallet, 
  FileText, 
  Settings, 
  Menu,
  X,
  ArrowLeft,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OwnerSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({ isOpen, onToggle }) => {
  const menuItems = [
    { path: '/owner', icon: Home, label: 'Dashboard', exact: true },
    { path: '/owner/inventory', icon: Package, label: 'Inventory' },
    { path: '/owner/nfc-writer', icon: Nfc, label: 'NFC Writer' },
    { path: '/owner/sales', icon: TrendingUp, label: 'Sales Feed' },
    { path: '/owner/payouts', icon: Wallet, label: 'Payouts & Vault' },
    { path: '/owner/reports', icon: FileText, label: 'Reports' },
    { path: '/owner/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <FuturisticButton variant="ghost" size="sm" onClick={onToggle}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </FuturisticButton>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          'fixed left-0 top-0 h-screen bg-surface-800/95 backdrop-blur-xl border-r border-glass-2 transition-all duration-300 z-40',
          isOpen ? 'w-64' : 'w-16 lg:w-16'
        )}
      >
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-gradient-button rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            {isOpen && (
              <div className="ml-3">
                <h2 className="text-display font-bold text-text-primary">TapLink</h2>
                <p className="text-xs text-text-tertiary">Owner Portal</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {/* Back to Store Button */}
            <Link
              to="/"
              className="flex items-center px-3 py-3 rounded-xl transition-all duration-200 group text-text-secondary hover:text-text-primary hover:bg-glass-1 mb-4 border-b border-glass-1"
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="ml-3 font-medium">Back to Store</span>
              )}
            </Link>

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative',
                      isActive
                        ? 'bg-gradient-glow text-accent-cyan border border-accent-cyan/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-glass-1'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent-cyan')} />
                      {isOpen && (
                        <span className="ml-3 font-medium">{item.label}</span>
                      )}
                      {!isOpen && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-surface-700 text-text-primary text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Store Info */}
        {isOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-button rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">Cap Cafe Seoul</p>
                  <p className="text-xs text-text-tertiary">Active Store</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-surface-900/80 backdrop-blur-sm z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};
