import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Wallet,
  ShoppingCart,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPITileProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

const KPITile: React.FC<KPITileProps> = ({ title, value, change, icon: Icon, trend, subtitle }) => {
  return (
    <GlassCard className="p-6 hover:scale-105 transition-transform duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-tertiary text-sm font-medium mb-1">{title}</p>
          <p className="text-text-primary text-2xl font-bold mb-2">{value}</p>
          {subtitle && (
            <p className="text-text-secondary text-xs">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gradient-glow">
          <Icon className="w-6 h-6 text-accent-cyan" />
        </div>
      </div>
      
      <div className="flex items-center mt-4">
        {trend !== 'neutral' && (
          <>
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 text-status-success" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-status-danger" />
            )}
            <span className={cn(
              'text-sm font-medium ml-1',
              trend === 'up' ? 'text-status-success' : 'text-status-danger'
            )}>
              {Math.abs(change)}%
            </span>
          </>
        )}
        <span className="text-text-tertiary text-sm ml-2">vs yesterday</span>
      </div>
    </GlassCard>
  );
};

interface RecentSale {
  id: string;
  productName: string;
  amount: number;
  timestamp: string;
  status: 'confirmed' | 'pending';
  tokenId?: string;
}

interface LowStockItem {
  productId: string;
  name: string;
  currentStock: number;
  threshold: number;
  image: string;
}

export const DashboardHome: React.FC = () => {
  const [kpiData, setKpiData] = useState({
    todayRevenueKRW: 630000,
    txCount: 12,
    pendingPayoutsKRW: 100000,
    lowStockCount: 2,
    vaultBalance: 350000
  });

  const [recentSales] = useState<RecentSale[]>([
    {
      id: 'sale-1',
      productName: 'TapLink Tee (Black)',
      amount: 25000,
      timestamp: '2025-08-27T14:30:00Z',
      status: 'confirmed',
      tokenId: 'NFT_ABC123'
    },
    {
      id: 'sale-2',
      productName: 'Coffee Bean Pack',
      amount: 15000,
      timestamp: '2025-08-27T14:15:00Z',
      status: 'confirmed',
      tokenId: 'NFT_DEF456'
    },
    {
      id: 'sale-3',
      productName: 'Seoul Pop Mug',
      amount: 18000,
      timestamp: '2025-08-27T13:45:00Z',
      status: 'pending'
    }
  ]);

  const [lowStockItems] = useState<LowStockItem[]>([
    {
      productId: 'SKU123',
      name: 'TapLink Tee (Black)',
      currentStock: 2,
      threshold: 5,
      image: '/placeholder.svg'
    },
    {
      productId: 'SKU456',
      name: 'Coffee Bean Pack',
      currentStock: 0,
      threshold: 10,
      image: '/placeholder.svg'
    }
  ]);

  // Simulate real-time updates via WebSocket
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional updates
      if (Math.random() > 0.9) {
        setKpiData(prev => ({
          ...prev,
          txCount: prev.txCount + 1,
          todayRevenueKRW: prev.todayRevenueKRW + Math.floor(Math.random() * 50000)
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <KPITile
          title="Today's Revenue"
          value={`₩${kpiData.todayRevenueKRW.toLocaleString()}`}
          change={15.3}
          trend="up"
          icon={DollarSign}
          subtitle="12 transactions"
        />
        <KPITile
          title="Transactions"
          value={kpiData.txCount.toString()}
          change={8.2}
          trend="up"
          icon={ShoppingCart}
          subtitle="Last 24 hours"
        />
        <KPITile
          title="Pending Payouts"
          value={`₩${kpiData.pendingPayoutsKRW.toLocaleString()}`}
          change={0}
          trend="neutral"
          icon={Wallet}
          subtitle="Next payout: Tomorrow"
        />
        <KPITile
          title="Low Stock Items"
          value={kpiData.lowStockCount.toString()}
          change={25}
          trend="down"
          icon={AlertTriangle}
          subtitle="Needs attention"
        />
        <KPITile
          title="Vault Balance"
          value={`₩${kpiData.vaultBalance.toLocaleString()}`}
          change={12.5}
          trend="up"
          icon={TrendingUp}
          subtitle="ERC-4626 Vault"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-display text-lg font-semibold text-text-primary">Recent Sales</h3>
            <FuturisticButton variant="ghost" size="sm">
              View All
            </FuturisticButton>
          </div>
          
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-700/30 border border-glass-1">
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{sale.productName}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-text-secondary">
                      {new Date(sale.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      sale.status === 'confirmed' 
                        ? 'bg-status-success/20 text-status-success' 
                        : 'bg-status-warning/20 text-status-warning'
                    )}>
                      {sale.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-text-primary">₩{sale.amount.toLocaleString()}</p>
                  {sale.tokenId && (
                    <p className="text-xs text-accent-cyan">{sale.tokenId}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Low Stock Alerts */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-display text-lg font-semibold text-text-primary">Low Stock Alerts</h3>
            <FuturisticButton variant="ghost" size="sm">
              Manage
            </FuturisticButton>
          </div>
          
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.productId} className="flex items-center space-x-4 p-3 rounded-lg bg-surface-700/30 border border-status-warning/20">
                <div className="w-12 h-12 rounded-lg bg-surface-600 flex items-center justify-center">
                  <Package className="w-6 h-6 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{item.name}</p>
                  <p className="text-sm text-text-secondary">
                    Stock: <span className="text-status-warning font-medium">{item.currentStock}</span> / {item.threshold}
                  </p>
                </div>
                <FuturisticButton variant="secondary" size="sm">
                  Restock
                </FuturisticButton>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h3 className="text-display text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FuturisticButton variant="primary" className="h-20 flex-col">
            <Package className="w-6 h-6 mb-2" />
            Add Product
          </FuturisticButton>
          <FuturisticButton variant="secondary" className="h-20 flex-col">
            <Activity className="w-6 h-6 mb-2" />
            Write NFC Tag
          </FuturisticButton>
          <FuturisticButton variant="secondary" className="h-20 flex-col">
            <FileText className="w-6 h-6 mb-2" />
            Export Report
          </FuturisticButton>
          <FuturisticButton variant="secondary" className="h-20 flex-col">
            <Wallet className="w-6 h-6 mb-2" />
            Request Payout
          </FuturisticButton>
        </div>
      </GlassCard>
    </div>
  );
};
