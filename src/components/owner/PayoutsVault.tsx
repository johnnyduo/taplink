import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Wallet, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

export const PayoutsVault: React.FC = () => {
  const [vaultBalance] = useState(350000);
  const [availableBalance] = useState(250000);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display text-2xl font-bold text-text-primary">Payouts & Vault</h2>
        <p className="text-text-secondary">Manage your vault balance and payout schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-glow">
              <Wallet className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-display font-semibold text-text-primary">Vault Balance</h3>
              <p className="text-sm text-text-secondary">ERC-4626 Vault</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-tertiary">Total Balance</p>
              <p className="text-2xl font-bold text-text-primary">₩{vaultBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Available for Payout</p>
              <p className="text-xl font-semibold text-accent-cyan">₩{availableBalance.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-glow">
              <Calendar className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-display font-semibold text-text-primary">Next Payout</h3>
              <p className="text-sm text-text-secondary">Scheduled</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-tertiary">Date</p>
              <p className="text-lg font-semibold text-text-primary">Tomorrow, 9:00 AM</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Amount</p>
              <p className="text-lg font-semibold text-status-success">₩{availableBalance.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-display text-lg font-semibold text-text-primary">Recent Payouts</h3>
          <FuturisticButton variant="ghost" size="sm">
            View All
          </FuturisticButton>
        </div>
        
        <div className="space-y-3">
          {[
            { date: '2025-08-26', amount: 180000, txHash: '0xa1b2c3...', status: 'completed' },
            { date: '2025-08-25', amount: 220000, txHash: '0xd4e5f6...', status: 'completed' },
          ].map((payout, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-surface-700/30 border border-glass-1">
              <div>
                <p className="font-medium text-text-primary">{payout.date}</p>
                <p className="text-sm text-text-secondary">₩{payout.amount.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-status-success">Completed</span>
                <FuturisticButton variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </FuturisticButton>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex justify-center">
        <FuturisticButton variant="primary" size="lg">
          <Wallet className="w-5 h-5 mr-2" />
          Request Immediate Payout
        </FuturisticButton>
      </div>
    </div>
  );
};
