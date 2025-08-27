import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  ArrowUpRight,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  PieChart,
  BarChart3
} from 'lucide-react';
import { PayoutModal, PayoutRequest } from './modals/PayoutModal';

interface VaultMetrics {
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  pendingPayouts: number;
  monthlyGrowth: number;
  totalEarnings: number;
  lastPayoutAmount: number;
  nextPayoutDate: string;
}

export const PayoutsVault: React.FC = () => {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([
    {
      id: 'PO001',
      amount: 150000,
      currency: '₩',
      status: 'completed',
      requestedAt: '2025-08-25T14:30:00Z',
      processedAt: '2025-08-26T09:15:00Z',
      method: 'bank_transfer',
      destination: '1234-****-****-5678',
      fee: 750,
      notes: 'Monthly revenue withdrawal'
    },
    {
      id: 'PO002',
      amount: 75000,
      currency: '₩',
      status: 'processing',
      requestedAt: '2025-08-27T10:45:00Z',
      method: 'crypto',
      destination: '0x742d...404',
      fee: 75,
    },
    {
      id: 'PO003',
      amount: 200000,
      currency: '₩',
      status: 'pending',
      requestedAt: '2025-08-27T15:20:00Z',
      method: 'bank_transfer',
      destination: '9876-****-****-1234',
      fee: 1000,
      notes: 'Weekly settlement'
    }
  ]);

  const [vaultMetrics, setVaultMetrics] = useState<VaultMetrics>({
    totalBalance: 850000,
    availableBalance: 475000,
    lockedBalance: 375000,
    pendingPayouts: 275000,
    monthlyGrowth: 12.5,
    totalEarnings: 2450000,
    lastPayoutAmount: 150000,
    nextPayoutDate: '2025-08-30'
  });

  // Simulate real-time balance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVaultMetrics(prev => ({
        ...prev,
        totalBalance: prev.totalBalance + Math.floor(Math.random() * 1000) - 500,
        availableBalance: prev.availableBalance + Math.floor(Math.random() * 500) - 250,
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handlePayoutRequest = (newRequest: Omit<PayoutRequest, 'id' | 'requestedAt' | 'status'>) => {
    const request: PayoutRequest = {
      ...newRequest,
      id: `PO${String(Date.now()).slice(-3)}`,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    setPayoutRequests(prev => [request, ...prev]);
    
    setVaultMetrics(prev => ({
      ...prev,
      availableBalance: prev.availableBalance - request.amount,
      pendingPayouts: prev.pendingPayouts + request.amount
    }));
  };

  const getStatusColor = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'completed': return 'bg-status-success text-white';
      case 'processing': return 'bg-status-warning text-surface-900';
      case 'pending': return 'bg-surface-700 text-text-secondary';
      case 'failed': return 'bg-status-danger text-white';
      default: return 'bg-surface-700 text-text-secondary';
    }
  };

  const getStatusIcon = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: PayoutRequest['method']) => {
    switch (method) {
      case 'bank_transfer': return <CreditCard className="w-4 h-4" />;
      case 'crypto': return <Wallet className="w-4 h-4" />;
      case 'paypal': return <ExternalLink className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">Payouts & Vault</h2>
          <p className="text-text-secondary">Manage your vault balance and payout schedule</p>
        </div>
        
        <FuturisticButton 
          variant="primary"
          onClick={() => setShowPayoutModal(true)}
          disabled={vaultMetrics.availableBalance <= 0}
        >
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Request Payout
        </FuturisticButton>
      </div>

      {/* Vault Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Balance</p>
              <p className="text-2xl font-bold text-text-primary">₩{vaultMetrics.totalBalance.toLocaleString()}</p>
            </div>
            <Wallet className="w-8 h-8 text-primary" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Available</p>
              <p className="text-2xl font-bold text-status-success">₩{vaultMetrics.availableBalance.toLocaleString()}</p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-status-success" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Locked</p>
              <p className="text-2xl font-bold text-status-warning">₩{vaultMetrics.lockedBalance.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-status-warning" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Monthly Growth</p>
              <p className="text-2xl font-bold text-accent-cyan">+{vaultMetrics.monthlyGrowth}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent-cyan" />
          </div>
        </GlassCard>
      </div>

      {/* Vault Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-glow">
              <PieChart className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-display font-semibold text-text-primary">Vault Analytics</h3>
              <p className="text-sm text-text-secondary">ERC-4626 Compliant Vault</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-surface-800/30 rounded-lg">
              <span className="text-text-secondary">Total Earnings</span>
              <span className="font-semibold text-text-primary">₩{vaultMetrics.totalEarnings.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-surface-800/30 rounded-lg">
              <span className="text-text-secondary">Last Payout</span>
              <span className="font-semibold text-text-primary">₩{vaultMetrics.lastPayoutAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-surface-800/30 rounded-lg">
              <span className="text-text-secondary">Next Scheduled</span>
              <span className="font-semibold text-text-primary">
                {new Date(vaultMetrics.nextPayoutDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-primary">Pending Payouts</span>
              <span className="font-bold text-primary">₩{vaultMetrics.pendingPayouts.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-700">
            <FuturisticButton variant="secondary" className="w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </FuturisticButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-glow">
              <Calendar className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-display font-semibold text-text-primary">Payout Schedule</h3>
              <p className="text-sm text-text-secondary">Automated & Manual</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent-cyan/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-text-primary">Weekly Auto-Payout</h4>
                <Badge className="bg-status-success text-white">Active</Badge>
              </div>
              <p className="text-sm text-text-secondary mb-3">
                Automatically withdraw 80% of available balance every Friday
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Next: Friday, Aug 30</span>
                <span className="text-primary font-medium">~₩380,000</span>
              </div>
            </div>

            <div className="p-4 bg-surface-800/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-text-primary">Monthly Report</h4>
                <Badge variant="outline">Scheduled</Badge>
              </div>
              <p className="text-sm text-text-secondary mb-3">
                Comprehensive payout summary and tax documentation
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-text-tertiary">Next: Sept 1</span>
                <span className="text-text-secondary">PDF + CSV</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Payouts */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-surface-700">
          <div className="flex items-center justify-between">
            <h3 className="text-display font-semibold text-text-primary">Recent Payouts</h3>
            <FuturisticButton variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All
            </FuturisticButton>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-800/50">
              <tr>
                <th className="p-4 text-left text-text-secondary font-medium">Request ID</th>
                <th className="p-4 text-left text-text-secondary font-medium">Amount</th>
                <th className="p-4 text-left text-text-secondary font-medium">Method</th>
                <th className="p-4 text-left text-text-secondary font-medium">Status</th>
                <th className="p-4 text-left text-text-secondary font-medium">Requested</th>
                <th className="p-4 text-left text-text-secondary font-medium">Processed</th>
              </tr>
            </thead>
            <tbody>
              {payoutRequests.map((request) => (
                <tr 
                  key={request.id}
                  className="border-t border-surface-700 hover:bg-surface-800/30 transition-colors"
                >
                  <td className="p-4">
                    <code className="text-sm bg-surface-800 px-2 py-1 rounded">
                      {request.id}
                    </code>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-text-primary">
                        {request.currency}{request.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Fee: {request.currency}{request.fee.toLocaleString()}
                      </p>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(request.method)}
                      <div>
                        <p className="text-sm text-text-primary capitalize">
                          {request.method.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {request.destination}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <Badge className={`text-xs px-2 py-1 flex items-center gap-1 w-fit ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                  </td>
                  
                  <td className="p-4">
                    <p className="text-sm text-text-primary">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(request.requestedAt).toLocaleTimeString()}
                    </p>
                  </td>
                  
                  <td className="p-4">
                    {request.processedAt ? (
                      <div>
                        <p className="text-sm text-text-primary">
                          {new Date(request.processedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {new Date(request.processedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-text-tertiary">Pending</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payoutRequests.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No payouts yet</h3>
              <p className="text-text-secondary mb-4">
                Start by requesting your first payout
              </p>
              <FuturisticButton 
                variant="primary"
                onClick={() => setShowPayoutModal(true)}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Request Payout
              </FuturisticButton>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Payout Modal */}
      <PayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSubmitPayout={handlePayoutRequest}
        availableBalance={vaultMetrics.availableBalance}
        currency="₩"
      />
    </div>
  );
};
