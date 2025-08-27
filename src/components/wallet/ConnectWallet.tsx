import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { KRWFaucet } from './KRWFaucet';
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
  const {
    isConnected,
    formattedAddress,
    networkName,
    balance,
    balanceLoading,
    krwBalance,
    krwBalanceLoading,
    isKaiaTestnet,
    connect,
    disconnect,
    copyAddress,
    openExplorer
  } = useWallet();

  const [copied, setCopied] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleCopyAddress = async () => {
    const success = await copyAddress();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
              Connect Your Wallet
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Connect your wallet to make purchases and receive NFT receipts on Kaia Kairos Testnet
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
              <p className="text-xs text-text-secondary">Testnet</p>
            </div>
          </div>

          <FuturisticButton 
            variant="primary" 
            onClick={connect}
            className="w-full bg-gradient-to-r from-primary to-accent-cyan hover:from-primary/90 hover:to-accent-cyan/90 transition-all duration-300 wallet-connect-btn"
          >
            <Wallet className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Connect Wallet</span>
          </FuturisticButton>

          <div className="pt-4 border-t border-surface-700">
            <p className="text-xs text-text-tertiary text-center">
              Powered by{' '}
              <span className="text-accent-cyan font-medium">Reown AppKit</span>
              {' '}• Kaia Network
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
                {formattedAddress}
              </p>
              <Badge className="bg-status-success text-white text-xs px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-xs text-text-secondary">
                {networkName}
              </p>
              {isKaiaTestnet && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 border-accent-cyan/30 text-accent-cyan">
                  Testnet
                </Badge>
              )}
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
              onClick={openExplorer}
              className="flex-1 h-8 px-2"
              title="View on explorer"
            >
              <ExternalLink className="w-3 h-3" />
            </FuturisticButton>
            <FuturisticButton
              variant="ghost"
              size="sm"
              onClick={connect}
              className="flex-1 h-8 px-2"
              title="Wallet settings"
            >
              <ChevronDown className="w-3 h-3" />
            </FuturisticButton>
          </div>

          {/* Balance Information - Compact Layout */}
          <div className="space-y-2">
            {/* KAIA Balance */}
            <div className="flex items-center justify-between p-2.5 bg-surface-800/30 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-0.5">KAIA Balance</p>
                <p className="text-base font-bold text-text-primary">
                  {balanceLoading 
                    ? 'Loading...' 
                    : balance 
                    ? `${balance.formatted} ${balance.symbol}` 
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
                  {krwBalanceLoading 
                    ? 'Loading...' 
                    : krwBalance 
                    ? `₩${krwBalance.formatted}` 
                    : '₩0'
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
            <FuturisticButton 
              variant="secondary" 
              size="sm"
              onClick={connect}
              className="flex-1 h-9"
            >
              <Wallet className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="text-sm">Manage</span>
            </FuturisticButton>
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
            <KRWFaucet />
          </div>
        </div>
      )}
    </GlassCard>
  );
};
