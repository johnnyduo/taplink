
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { NFCTagManager } from '@/utils/nfcTagManager';
import { useHardcodedWallet } from '@/hooks/useHardcodedWallet';
import { 
  Settings, 
  Smartphone, 
  Zap, 
  Wifi, 
  Shield, 
  Chrome,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Wallet,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [nfcSupport, setNfcSupport] = useState(() => NFCTagManager.checkNFCSupport());
  const wallet = useHardcodedWallet();

  // Re-check NFC support periodically
  useEffect(() => {
    const checkSupport = () => {
      setNfcSupport(NFCTagManager.checkNFCSupport());
    };
    
    const interval = setInterval(checkSupport, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderNFCStatus = () => (
    <GlassCard className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text-primary">WebNFC Status</h3>
        <Badge variant={nfcSupport.isSupported ? 'default' : 'destructive'}>
          {nfcSupport.isSupported ? 'Ready' : 'Not Available'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <Shield className={cn("w-3 h-3", nfcSupport.isSecureContext ? "text-status-success" : "text-status-error")} />
          <span>HTTPS</span>
          <span className={cn(nfcSupport.isSecureContext ? "text-status-success" : "text-status-error")}>
            {nfcSupport.isSecureContext ? '✓' : '✗'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Chrome className={cn("w-3 h-3", nfcSupport.isChrome ? "text-status-success" : "text-status-error")} />
          <span>Chrome</span>
          <span className={cn(nfcSupport.isChrome ? "text-status-success" : "text-status-error")}>
            {nfcSupport.isChrome ? '✓' : '✗'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Smartphone className={cn("w-3 h-3", nfcSupport.isMobile ? "text-status-success" : "text-status-error")} />
          <span>Mobile</span>
          <span className={cn(nfcSupport.isMobile ? "text-status-success" : "text-status-error")}>
            {nfcSupport.isMobile ? '✓' : '✗'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wifi className={cn("w-3 h-3", nfcSupport.isSupported ? "text-status-success" : "text-status-error")} />
          <span>WebNFC</span>
          <span className={cn(nfcSupport.isSupported ? "text-status-success" : "text-status-error")}>
            {nfcSupport.isSupported ? '✓' : '✗'}
          </span>
        </div>
      </div>
      
      {!nfcSupport.isSupported && nfcSupport.reason && (
        <div className="mt-3 p-2 bg-status-warning/10 rounded-md">
          <p className="text-xs text-status-warning">{nfcSupport.reason}</p>
        </div>
      )}
    </GlassCard>
  );

  const renderTapToBuy = () => (
    <div className="space-y-6">
      {/* Main Tap to Buy Section */}
      <GlassCard className="p-8 text-center" glow={nfcSupport.isSupported}>
        <div className={cn(
          "mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500",
          nfcSupport.isSupported 
            ? "bg-gradient-cta animate-pulse" 
            : "bg-surface-700"
        )}>
          {nfcSupport.isSupported ? (
            <Smartphone className="w-12 h-12 text-white" />
          ) : (
            <WifiOff className="w-12 h-12 text-text-tertiary" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          {nfcSupport.isSupported ? "Tap to Buy" : "Scan to Buy"}
        </h2>
        
        <p className="text-text-secondary mb-6">
          {nfcSupport.isSupported 
            ? "Simply tap your phone near any NFC-enabled product to buy instantly with blockchain receipts"
            : "WebNFC not available - use QR code scanning instead"
          }
        </p>
        
        <Link to="/scan">
          <FuturisticButton 
            variant="primary" 
            size="lg"
            className="w-full text-lg font-bold py-4"
          >
            {nfcSupport.isSupported ? (
              <>
                <Zap className="w-6 h-6 mr-3" />
                Tap to Buy
              </>
            ) : (
              <>
                <QrCode className="w-6 h-6 mr-3" />
                Scan to Buy
              </>
            )}
          </FuturisticButton>
        </Link>
        
        {nfcSupport.isSupported && (
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-text-tertiary">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-status-success" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-status-success" />
              <span>Instant Receipts</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Demo Wallet Status */}
      <GlassCard className="p-6" glow={wallet.isConnected}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              wallet.isConnected ? "bg-status-success" : "bg-surface-700"
            )}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Demo Wallet</h3>
              <p className="text-sm text-text-secondary">
                {wallet.isConnected ? wallet.shortAddress : "Not Connected"}
              </p>
            </div>
          </div>
          
          <Badge 
            variant={wallet.isConnected ? "default" : "destructive"} 
            className="text-xs"
          >
            {wallet.isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </div>

        {wallet.isConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-accent-cyan" />
                <span className="text-sm text-text-secondary">KAIA Balance</span>
              </div>
              <span className="text-sm font-bold text-text-primary">
                {parseFloat(wallet.kaiaBalance).toFixed(4)} KAIA
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-accent-emerald" />
                <span className="text-sm text-text-secondary">KRW Balance</span>
              </div>
              <span className="text-sm font-bold text-text-primary">
                {parseFloat(wallet.krwBalance).toFixed(2)} KRW
              </span>
            </div>

            <div className="pt-3 border-t border-border-1">
              <FuturisticButton
                variant="secondary"
                size="sm"
                onClick={wallet.claimFaucet}
                disabled={wallet.isLoading}
                className="w-full text-sm"
              >
                {wallet.isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Claim Test Tokens
                  </>
                )}
              </FuturisticButton>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Demo Products Preview */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">Available Products</h3>
          <Badge variant="secondary" className="text-xs">
            Demo Ready
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {NFCTagManager.getAllProducts().slice(0, 4).map(product => (
            <div key={product.productId} className="p-3 bg-surface-700/30 rounded-lg border border-glass-1 hover:border-accent-cyan/50 transition-colors">
              <div className="font-medium text-text-primary text-sm mb-1">{product.name}</div>
              <div className="text-accent-cyan text-lg font-bold">{NFCTagManager.formatPrice(product.price)}</div>
              <div className="text-text-tertiary text-xs mt-1">{product.description}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-text-tertiary">
            {nfcSupport.isSupported 
              ? "Tap your device near any NFC tag to purchase" 
              : "QR codes available for non-NFC devices"
            }
          </p>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-900 noise-texture">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <Header 
          title="TapLink NFC dePOS" 
          subtitle="Tap to buy. Proof in hand."
          userRole="customer"
        />
        
        <main className="animate-fade-in space-y-6">
          {/* Wallet Connection */}
          <ConnectWallet />
          
          {/* NFC Status */}
          {renderNFCStatus()}
          
          {/* Tap to Buy */}
          {renderTapToBuy()}
          
          {/* Owner Dashboard Access */}
          <div className="text-center pt-4">
            <Link to="/owner">
              <FuturisticButton variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Shop Owner Dashboard
              </FuturisticButton>
            </Link>
          </div>
        </main>
      </div>
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
    </div>
  );
};

export default Index;
