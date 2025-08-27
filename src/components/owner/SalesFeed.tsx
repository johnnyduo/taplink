import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOwnerDashboard } from '@/hooks/useOwnerDashboard';
import { formatUnits } from 'viem';
import { 
  TrendingUp,
  Download,
  Search,
  RefreshCw,
  Receipt,
  Wallet,
  Package,
  Home,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SalesFeed: React.FC = () => {
  const { 
    recentPayments, 
    totalPayments, 
    totalRevenue, 
    isLoading, 
    error, 
    refreshData, 
    lastUpdate,
    isConnected 
  } = useOwnerDashboard();
  
  const [searchTerm, setSearchTerm] = useState('');

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    };
  };

  const formatKRW = (amount: bigint) => {
    const formatted = formatUnits(amount, 18);
    const num = parseFloat(formatted);
    return num.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const filteredPayments = recentPayments.filter(payment =>
    payment.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentId.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Sales Feed</h2>
          <p className="text-text-secondary">
            Real-time transaction monitoring • Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <FuturisticButton
            variant="secondary"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </FuturisticButton>

          <Link to="/owner">
            <FuturisticButton variant="secondary" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
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
              Error loading sales data: {error}
            </span>
          </div>
        </GlassCard>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm">Total Sales</p>
              <p className="text-text-primary text-2xl font-bold">
                {isLoading ? '...' : totalPayments}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent-cyan" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm">Total Revenue</p>
              <p className="text-text-primary text-2xl font-bold">
                ₩{isLoading ? '...' : totalRevenue ? parseFloat(totalRevenue).toLocaleString('ko-KR', { maximumFractionDigits: 0 }) : '0'}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-accent-cyan" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm">Recent Activity</p>
              <p className="text-text-primary text-2xl font-bold">
                {isLoading ? '...' : recentPayments.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-accent-cyan" />
          </div>
        </GlassCard>
      </div>

      {/* Controls */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by product ID, buyer, or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </GlassCard>

      {/* Sales Feed */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-text-primary mb-6">
          Recent Transactions ({filteredPayments.length})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-glass-1 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-glass-2 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-glass-2 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-glass-2 rounded animate-pulse" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-6 w-24 bg-glass-2 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-glass-2 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const timeData = formatTimestamp(payment.timestamp);
              
              return (
                <div key={payment.paymentId.toString()} className="p-6 bg-glass-1 rounded-lg hover:bg-glass-2 transition-colors border border-glass-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-accent-cyan/20 rounded-lg">
                        <Receipt className="w-6 h-6 text-accent-cyan" />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-text-primary mb-1">
                          Payment #{payment.paymentId.toString()}
                        </h4>
                        
                        <p className="text-sm text-text-secondary mb-1">
                          Product: <span className="font-medium">{payment.productId}</span>
                        </p>
                        
                        <p className="text-sm text-text-secondary">
                          From: <span className="font-mono">{formatAddress(payment.buyer)}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-status-success mb-1">
                        ₩{formatKRW(payment.amount)}
                      </p>
                      
                      <Badge variant="secondary">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !isConnected ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h4 className="text-lg font-medium text-text-secondary mb-2">Wallet Not Connected</h4>
            <p className="text-text-tertiary">
              Connect your wallet to view real-time sales data
            </p>
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h4 className="text-lg font-medium text-text-secondary mb-2">No Results Found</h4>
            <p className="text-text-tertiary">
              No transactions match your search criteria
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h4 className="text-lg font-medium text-text-secondary mb-2">No Sales Yet</h4>
            <p className="text-text-tertiary">
              Transactions will appear here as customers make purchases
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default SalesFeed;
