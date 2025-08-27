
import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Zap, User, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  userRole?: 'owner' | 'customer';
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, userRole = 'customer' }) => {
  return (
    <GlassCard className="p-4 mb-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-button">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-display text-xl font-bold text-text-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-text-secondary">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {userRole === 'owner' && (
            <FuturisticButton variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </FuturisticButton>
          )}
          <FuturisticButton variant="ghost" size="sm">
            <User className="w-4 h-4" />
          </FuturisticButton>
        </div>
      </div>
    </GlassCard>
  );
};

export default Header;
