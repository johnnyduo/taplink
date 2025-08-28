import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Badge } from '@/components/ui/badge';
import { useOwnerDashboard } from '@/hooks/useOwnerDashboard';
import { formatUnits } from 'viem';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Wallet,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Home,
  ExternalLink,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPITileProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  isLoading?: boolean;
}

const KPITile: React.FC<KPITileProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral', 
  subtitle,
  isLoading = false 
}) => {
  return (
    <GlassCard className="p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-tertiary text-sm font-medium mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-glass-1 rounded animate-pulse mb-2" />
          ) : (
            <p className="text-text-primary text-2xl font-bold mb-2">{value}</p>
          )}
          {subtitle && (
            <p className="text-text-secondary text-xs">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gradient-glow">
          <Icon className={cn(
            "w-6 h-6",
            isLoading ? "animate-pulse text-gray-400" : "text-accent-cyan"
          )} />
        </div>
      </div>
      
      {change !== undefined && !isLoading && (
        <div className="flex items-center mt-4">
          <ArrowUpRight className={cn(
            "w-4 h-4",
            trend === 'up' ? "text-status-success" : 
            trend === 'down' ? "text-status-danger" : "text-gray-400"
          )} />
          <span className={cn(
            "text-sm ml-1",
            trend === 'up' ? "text-status-success" : 
            trend === 'down' ? "text-status-danger" : "text-gray-400"
          )}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      )}
    </GlassCard>
  );
};

const DashboardHome: React.FC = () => {
  const { 
    totalPayments, 
    totalRevenue, 
    recentPayments, 
    isLoading, 
    error, 
    refreshData, 
    fetchPaymentEvents,
    lastUpdate,
    isConnected 
  } = useOwnerDashboard();

  // Debug function to test event fetching
  const testEventFetching = async () => {
    console.log('🔍 Manual test of contract payment fetching triggered');
    if (fetchPaymentEvents) {
      await fetchPaymentEvents();
    } else {
      refreshData();
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatKRW = (amount: bigint) => {
    const formatted = formatUnits(amount, 18);
    const num = parseFloat(formatted);
    return num.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTransactionHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getExplorerUrl = (hash: string) => {
    return `https://kairos.kaiascan.io/tx/${hash}`;
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Dashboard Overview</h2>
          <p className="text-text-secondary">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isConnected && (
            <Badge variant="destructive">Wallet Not Connected</Badge>
          )}
          
          {/* Debug button for testing event fetching */}
          <FuturisticButton
            variant="secondary"
            size="sm"
            onClick={testEventFetching}
            className="border-accent-blue text-accent-blue"
          >
            🔍 Test Events
          </FuturisticButton>
          
          <FuturisticButton
            variant="secondary"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </FuturisticButton>

          <Link to="/">
            <FuturisticButton variant="secondary" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Back to Store
            </FuturisticButton>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <GlassCard className="p-4 border-status-danger">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-status-danger mr-2" />
            <span className="text-status-danger">
              Error loading dashboard data: {error}
            </span>
          </div>
        </GlassCard>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPITile
          title="Total Sales"
          value={totalPayments.toString()}
          icon={ShoppingCart}
          subtitle="All-time transactions"
          isLoading={isLoading}
        />
        
        <KPITile
          title="Total Revenue"
          value={`₩${totalRevenue ? parseFloat(totalRevenue).toLocaleString('ko-KR', { maximumFractionDigits: 0 }) : '0'}`}
          icon={DollarSign}
          subtitle="KRW earned"
          isLoading={isLoading}
        />
        
        <KPITile
          title="Recent Activity"
          value={recentPayments.length.toString()}
          icon={Activity}
          subtitle="Latest payments"
          isLoading={isLoading}
        />
        
        <KPITile
          title="Status"
          value={isConnected ? "Online" : "Offline"}
          icon={Wallet}
          subtitle="Contract connection"
          trend={isConnected ? 'up' : 'down'}
        />
      </div>

      {/* Recent Sales */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-text-primary">Recent Sales</h3>
          <Link to="/owner/sales">
            <FuturisticButton variant="ghost" size="sm">
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </FuturisticButton>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-glass-1 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-glass-2 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-glass-2 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-glass-2 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-glass-2 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : recentPayments.length > 0 ? (
          <div className="space-y-4">
            {recentPayments.slice(0, 5).map((payment) => (
              <div key={payment.paymentId.toString()} className="flex items-center justify-between p-4 bg-glass-1 rounded-lg hover:bg-glass-2 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-accent-cyan/20 rounded-full">
                    <Package className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Product ID: {payment.productId}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <span>From: {formatAddress(payment.buyer)}</span>
                      <span>•</span>
                      <span>{formatTimestamp(payment.timestamp)}</span>
                      {payment.transactionHash && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <span>TX:</span>
                            <button
                              onClick={() => copyToClipboard(payment.transactionHash!)}
                              className="text-accent-cyan hover:text-accent-cyan/80 transition-colors font-mono"
                              title="Click to copy transaction hash"
                            >
                              {formatTransactionHash(payment.transactionHash)}
                            </button>
                            <Copy className="w-3 h-3 text-accent-cyan/60" />
                            <a
                              href={getExplorerUrl(payment.transactionHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                              title="View on Kaia Explorer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-status-success">
                    ₩{formatKRW(payment.amount)}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    #{payment.paymentId.toString()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h4 className="text-lg font-medium text-text-secondary mb-2">No Sales Yet</h4>
            <p className="text-text-tertiary">
              Sales will appear here when customers make purchases
            </p>
          </div>
        )}
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/owner/inventory">
          <GlassCard className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <Package className="w-8 h-8 text-accent-cyan mb-4" />
            <h4 className="text-lg font-semibold text-text-primary mb-2">Manage Inventory</h4>
            <p className="text-text-secondary">Add products and manage stock</p>
          </GlassCard>
        </Link>

        <Link to="/owner/nfc-writer">
          <GlassCard className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <Activity className="w-8 h-8 text-accent-cyan mb-4" />
            <h4 className="text-lg font-semibold text-text-primary mb-2">Write NFC Tags</h4>
            <p className="text-text-secondary">Program NFC tags for products</p>
          </GlassCard>
        </Link>

        <Link to="/owner/payouts">
          <GlassCard className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <Wallet className="w-8 h-8 text-accent-cyan mb-4" />
            <h4 className="text-lg font-semibold text-text-primary mb-2">Manage Payouts</h4>
            <p className="text-text-secondary">Withdraw earnings and view vault</p>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHome;
