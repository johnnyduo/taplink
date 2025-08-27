import React, { useCallback } from 'react';
import { useConnect, useDisconnect, useAccount, useBalance, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { KRWFaucet } from './KRWFaucet';
import { toast } from 'sonner';
import { 
  Wallet, 
  ChevronDown, 
  ChevronUp,
  Copy, 
  ExternalLink, 
  LogOut,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  CheckCircle
} from 'lucide-react';

export const ConnectWallet: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Use wagmi's useBalance for KAIA balance
  const { data: kaiaBalance, isLoading: kaiaLoading, refetch: refetchKaia } = useBalance({
    address,
  });

  // Use wagmi's useReadContract for KRW token balance
  const { data: krwBalance, isLoading: krwLoading, refetch: refetchKRW } = useReadContract({
    address: import.meta.env.VITE_KRW_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  // Refresh balances function
  const refreshBalances = useCallback(() => {
    refetchKaia();
    refetchKRW();
  }, [refetchKaia, refetchKRW]);

  // Local state
  const [copied, setCopied] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Auto-connect to our hardcoded wallet on mount
  React.useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      const demoConnector = connectors.find(c => c.id === 'hardcoded-demo-wallet');
      if (demoConnector) {
        connect({ connector: demoConnector });
      }
    }
  }, [connect, connectors, isConnected]);

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleOpenExplorer = () => {
    if (address) {
      const explorerUrl = `https://kairos.kaiascan.io/address/${address}`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isConnected) {
    return (
      <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-accent-cyan/10 border border-primary/20">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-glow">
              <Wallet className="w-8 h-8 text-accent-cyan" />
            </div>
          </div>
          
          <div>
            <h3 className="text-display text-lg font-semibold text-text-primary mb-2">
              Demo Wallet Connecting...
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Initializing hardcoded wallet for Chrome Android NFC testing
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-surface-800/30 rounded-lg">
              <Shield className="w-5 h-5 text-status-success mx-auto mb-1" />
              <p className="text-xs text-text-secondary">Secure</p>
            </div>
            <div className="text-center p-3 bg-surface-800/30 rounded-lg">
              <Zap className="w-5 h-5 text-accent-cyan mx-auto mb-1" />
              <p className="text-xs text-text-secondary">Fast</p>
            </div>
            <div className="text-center p-3 bg-surface-800/30 rounded-lg">
              <Globe className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-text-secondary">Demo</p>
            </div>
          </div>

          <div className="animate-pulse">
            <div className="h-10 bg-surface-700/50 rounded-lg"></div>
          </div>

          <div className="pt-4 border-t border-surface-700">
            <p className="text-xs text-text-tertiary text-center">
              Chrome Android NFC Demo •{' '}
              <span className="text-accent-cyan font-medium">Kaia Testnet</span>
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 bg-gradient-to-br from-status-success/10 to-accent-cyan/10 border border-status-success/20">
      {/* Collapsible Wallet Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group transition-all duration-200 hover:bg-white/5 rounded-lg p-2 -m-2 mb-3"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-glow group-hover:scale-105 transition-transform duration-200">
            <Wallet className="w-5 h-5 text-accent-cyan" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-text-primary">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Demo Wallet'}
              </p>
              <Badge className="bg-status-success text-white text-xs px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-xs text-text-secondary">
                Kaia Testnet
              </p>
              <Badge variant="outline" className="text-xs px-1.5 py-0 border-accent-cyan/30 text-accent-cyan">
                Live
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-accent-cyan transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-5 h-5 text-accent-cyan transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
          {/* Action Buttons Row */}
          <div className="flex items-center space-x-2">
            <FuturisticButton
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="flex-1 h-8 px-2"
              title={copied ? "Copied!" : "Copy address"}
            >
              {copied ? <CheckCircle className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
            </FuturisticButton>
            <FuturisticButton
              variant="ghost"
              size="sm"
              onClick={handleOpenExplorer}
              className="flex-1 h-8 px-2"
              title="View on explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </FuturisticButton>
            <FuturisticButton
              variant="ghost"
              size="sm"
              onClick={refreshBalances}
              className="flex-1 h-8 px-2"
              title="Refresh balances"
            >
              <TrendingUp className="w-3 h-3" />
            </FuturisticButton>
          </div>

          {/* Balance Information - Compact Layout */}
          <div className="space-y-2">
            {/* KAIA Balance */}
            <div className="flex items-center justify-between p-2.5 bg-surface-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-0.5">KAIA Balance</p>
                <p className="text-base font-bold text-text-primary">
                  {kaiaLoading 
                    ? 'Loading...' 
                    : kaiaBalance
                    ? `${parseFloat(formatEther(kaiaBalance.value)).toFixed(4)} KAIA`
                    : '0.0000 KAIA'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-1 text-status-success">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Native</span>
              </div>
            </div>

            {/* KRW Balance */}
            <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex-1">
                <p className="text-xs text-emerald-400 mb-0.5">KRW Balance</p>
                <p className="text-base font-bold text-text-primary">
                  {krwLoading 
                    ? 'Loading...' 
                    : krwBalance
                    ? `₩${parseFloat(formatEther(krwBalance as bigint)).toFixed(2)}`
                    : '₩0.00'
                  }
                </p>
                <p className="text-xs text-text-tertiary">
                  {import.meta.env.VITE_KRW_CONTRACT_ADDRESS?.slice(0, 6)}...{import.meta.env.VITE_KRW_CONTRACT_ADDRESS?.slice(-4)}
                </p>
              </div>
              <div className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Stable</span>
              </div>
            </div>
          </div>

          {/* Main Action Buttons - Compact */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <KRWFaucet />
            </div>
            <FuturisticButton 
              variant="ghost" 
              size="sm"
              onClick={() => disconnect()}
              className="flex-1 h-9 text-status-danger hover:bg-status-danger/10 border-status-danger/30 hover:border-status-danger/50"
            >
              <LogOut className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="text-sm">Disconnect</span>
            </FuturisticButton>
          </div>

          {/* KRW Faucet - Compact */}
          <div className="pt-2 border-t border-surface-700/50">
            <p className="text-xs text-text-tertiary text-center">
              Demo wallet for Chrome Android NFC testing
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

