import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  Download,
  Filter,
  Search,
  ExternalLink,
  RefreshCw,
  Calendar,
  Receipt,
  Wallet,
  Package,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Sale {
  id: string;
  timestamp: string;
  tokenId: string;
  productName: string;
  productSku: string;
  buyerWallet: string;
  amountKRW: number;
  status: 'pending' | 'confirmed' | 'anchored';
  receiptCID: string;
  anchorTxHash?: string;
  batchId: string;
}

export const SalesFeed: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 'sale-001',
      timestamp: '2025-08-27T14:30:00Z',
      tokenId: 'NFT_ABC123DEF',
      productName: 'TapLink Tee (Black)',
      productSku: 'TSHIRT-BLK-M',
      buyerWallet: '0x742d...5f2a',
      amountKRW: 25000,
      status: 'confirmed',
      receiptCID: 'QmX1Y2Z3...',
      anchorTxHash: '0xa1b2c3d4...',
      batchId: 'BATCH42'
    },
    {
      id: 'sale-002',
      timestamp: '2025-08-27T14:15:00Z',
      tokenId: 'NFT_GHI456JKL',
      productName: 'Seoul Coffee Beans',
      productSku: 'COFFEE-BEAN-100G',
      buyerWallet: '0x123a...8c9d',
      amountKRW: 15000,
      status: 'pending',
      receiptCID: 'QmA4B5C6...',
      batchId: 'BATCH43'
    },
    {
      id: 'sale-003',
      timestamp: '2025-08-27T13:45:00Z',
      tokenId: 'NFT_MNO789PQR',
      productName: 'Seoul Pop Mug (Red)',
      productSku: 'MUG-POP-RED',
      buyerWallet: '0x456b...1e2f',
      amountKRW: 18000,
      status: 'anchored',
      receiptCID: 'QmD7E8F9...',
      anchorTxHash: '0xe5f6g7h8...',
      batchId: 'BATCH44'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isLiveUpdates, setIsLiveUpdates] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveUpdates) return;
    
    const interval = setInterval(() => {
      // Simulate new sale or status update
      if (Math.random() > 0.95) {
        const newSale: Sale = {
          id: `sale-${Date.now()}`,
          timestamp: new Date().toISOString(),
          tokenId: `NFT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          productName: 'New Product Sale',
          productSku: 'NEW-PRODUCT',
          buyerWallet: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
          amountKRW: Math.floor(Math.random() * 50000) + 10000,
          status: 'pending',
          receiptCID: `Qm${Math.random().toString(36).substr(2, 6)}...`,
          batchId: 'BATCH45'
        };
        
        setSales(prev => [newSale, ...prev]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isLiveUpdates]);

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.tokenId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amountKRW, 0);
  const todayRevenue = sales
    .filter(sale => new Date(sale.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, sale) => sum + sale.amountKRW, 0);

  const getStatusConfig = (status: Sale['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: 'bg-status-warning text-surface-900' };
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-accent-cyan text-surface-900' };
      case 'anchored':
        return { label: 'Anchored', color: 'bg-status-success text-white' };
      default:
        return { label: status, color: 'bg-text-tertiary text-surface-900' };
    }
  };

  const exportSales = () => {
    // Simulate export
    console.log('Exporting sales data...');
  };

  const viewReceipt = (sale: Sale) => {
    // Open receipt modal or new tab
    console.log('Viewing receipt for sale:', sale.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">Sales Feed</h2>
          <p className="text-text-secondary">Real-time transaction monitoring</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isLiveUpdates ? 'bg-status-success animate-pulse' : 'bg-text-tertiary'
            )} />
            <span className="text-sm text-text-secondary">
              {isLiveUpdates ? 'Live' : 'Paused'}
            </span>
          </div>
          
          <FuturisticButton 
            variant="ghost" 
            size="sm"
            onClick={() => setIsLiveUpdates(!isLiveUpdates)}
          >
            <RefreshCw className={cn('w-4 h-4', isLiveUpdates && 'animate-spin')} />
          </FuturisticButton>
          
          <FuturisticButton variant="secondary" size="sm" onClick={exportSales}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </FuturisticButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-glow">
              <TrendingUp className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Today's Sales</p>
              <p className="text-lg font-bold text-text-primary">₩{todayRevenue.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-glow">
              <Receipt className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Total Transactions</p>
              <p className="text-lg font-bold text-text-primary">{sales.length}</p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-glow">
              <Clock className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Pending</p>
              <p className="text-lg font-bold text-text-primary">
                {sales.filter(s => s.status === 'pending').length}
              </p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-glow">
              <Wallet className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Total Revenue</p>
              <p className="text-lg font-bold text-text-primary">₩{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-surface-700 border border-glass-2 rounded-lg text-text-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="anchored">Anchored</option>
          </select>
          
          {/* Date Range */}
          <Input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="text-text-primary"
          />
          
          <Input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="text-text-primary"
          />
        </div>
      </GlassCard>

      {/* Sales Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-2">
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Time</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Product</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Token ID</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Buyer</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Amount</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Status</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Receipt</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => {
                const statusConfig = getStatusConfig(sale.status);
                
                return (
                  <tr key={sale.id} className="border-b border-glass-1 hover:bg-glass-1 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-text-primary">
                          {new Date(sale.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {new Date(sale.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-600 flex items-center justify-center">
                          <Package className="w-5 h-5 text-text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{sale.productName}</p>
                          <p className="text-sm font-mono text-text-tertiary">{sale.productSku}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono text-accent-cyan">{sale.tokenId}</code>
                        <FuturisticButton variant="ghost" size="sm">
                          <ExternalLink className="w-3 h-3" />
                        </FuturisticButton>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <code className="text-sm font-mono text-text-secondary">{sale.buyerWallet}</code>
                    </td>
                    
                    <td className="p-4">
                      <span className="font-semibold text-text-primary">₩{sale.amountKRW.toLocaleString()}</span>
                    </td>
                    
                    <td className="p-4">
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <code className="text-xs text-text-tertiary">{sale.receiptCID}</code>
                        </div>
                        {sale.anchorTxHash && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-status-success">Anchored</span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <FuturisticButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewReceipt(sale)}
                        >
                          <Receipt className="w-4 h-4" />
                        </FuturisticButton>
                        <FuturisticButton variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </FuturisticButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredSales.length === 0 && (
          <div className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">No sales found matching your criteria.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
