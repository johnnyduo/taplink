import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Settings, Shield, MapPin, Users } from 'lucide-react';

export const OwnerSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display text-2xl font-bold text-text-primary">Settings</h2>
        <p className="text-text-secondary">Manage your store configuration and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-display font-semibold text-text-primary">Security</h3>
          </div>
          <p className="text-text-secondary mb-4">Manage API keys and access controls</p>
          <FuturisticButton variant="secondary">Configure Security</FuturisticButton>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-display font-semibold text-text-primary">Store Location</h3>
          </div>
          <p className="text-text-secondary mb-4">Set your store location for mapping</p>
          <FuturisticButton variant="secondary">Update Location</FuturisticButton>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-display font-semibold text-text-primary">Team Management</h3>
          </div>
          <p className="text-text-secondary mb-4">Manage team roles and permissions</p>
          <FuturisticButton variant="secondary">Manage Team</FuturisticButton>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-display font-semibold text-text-primary">General</h3>
          </div>
          <p className="text-text-secondary mb-4">Basic store settings and preferences</p>
          <FuturisticButton variant="secondary">General Settings</FuturisticButton>
        </GlassCard>
      </div>
    </div>
  );
};
