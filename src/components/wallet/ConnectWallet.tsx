import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ChevronDown, 
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
    isKaiaTestnet,
    connect,
    disconnect,
    copyAddress,
    openExplorer
  } = useWallet();

  const [copied, setCopied] = React.useState(false);

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
            className="w-full bg-gradient-to-r from-primary to-accent-cyan hover:from-primary/90 hover:to-accent-cyan/90 transition-all duration-300 btn-aligned"
          >
            <Wallet className="w-4 h-4 mr-2" />
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-glow">
            <Wallet className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-text-primary">
                {formattedAddress}
              </p>
              <Badge className="bg-status-success text-white text-xs px-2 py-0.5">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-text-secondary">
                {networkName}
              </p>
              {isKaiaTestnet && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  Testnet
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <FuturisticButton
            variant="ghost"
            size="sm"
            onClick={handleCopyAddress}
            className="p-2"
            title={copied ? "Copied!" : "Copy address"}
          >
            {copied ? <CheckCircle className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
          </FuturisticButton>
          <FuturisticButton
            variant="ghost"
            size="sm"
            onClick={openExplorer}
            className="p-2"
            title="View on explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </FuturisticButton>
          <FuturisticButton
            variant="ghost"
            size="sm"
            onClick={connect}
            className="p-2"
            title="Wallet settings"
          >
            <ChevronDown className="w-4 h-4" />
          </FuturisticButton>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg mb-3">
        <div>
          <p className="text-xs text-text-secondary">Balance</p>
          <p className="text-lg font-bold text-text-primary">
            {balanceLoading 
              ? '...' 
              : balance 
              ? `${balance.formatted} ${balance.symbol}` 
              : '0.0000 KAIA'
            }
          </p>
        </div>
        <div className="flex items-center space-x-1 text-status-success">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Ready</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <FuturisticButton 
          variant="secondary" 
          size="sm"
          onClick={connect}
          className="flex-1 btn-aligned"
        >
          <Wallet className="w-4 h-4 mr-2" />
          <span>Manage</span>
        </FuturisticButton>
        <FuturisticButton 
          variant="ghost" 
          size="sm"
          onClick={() => disconnect()}
          className="flex-1 text-status-danger hover:bg-status-danger/10 btn-aligned"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Disconnect</span>
        </FuturisticButton>
      </div>
    </GlassCard>
  );
};
