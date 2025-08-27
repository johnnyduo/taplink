
import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Smartphone, Waves, CheckCircle } from 'lucide-react';

interface NFCScannerProps {
  onScanComplete: (data: any) => void;
}

const NFCScanner: React.FC<NFCScannerProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  const handleScan = async () => {
    setIsScanning(true);
    setScanStatus('scanning');

    // Simulate NFC scan
    setTimeout(() => {
      setScanStatus('success');
      setIsScanning(false);
      
      // Mock product data
      const mockData = {
        productId: 'coffee-americano-001',
        name: 'Americano Coffee',
        price: 25000,
        currency: '₩',
        merchantId: 'cafe-seoul-001',
        merchantName: 'Cafe Seoul',
      };
      
      setTimeout(() => {
        onScanComplete(mockData);
      }, 1000);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <GlassCard className="p-8 text-center max-w-md w-full" glow>
        <div className="mb-8">
          <div className={`relative mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
            isScanning 
              ? 'bg-gradient-cta animate-pulse' 
              : scanStatus === 'success'
              ? 'bg-status-success'
              : 'bg-surface-700'
          }`}>
            {scanStatus === 'success' ? (
              <CheckCircle className="w-12 h-12 text-white" />
            ) : (
              <Smartphone className="w-12 h-12 text-text-primary" />
            )}
            
            {isScanning && (
              <div className="absolute inset-0 rounded-full">
                <Waves className="w-full h-full text-accent-cyan animate-ping opacity-50" />
              </div>
            )}
          </div>
          
          <h2 className="text-hero mb-2">
            {scanStatus === 'success' ? 'Product Found!' : 'Tap to Buy'}
          </h2>
          <p className="text-subtitle">
            {scanStatus === 'scanning' 
              ? 'Scanning NFC tag...'
              : scanStatus === 'success'
              ? 'Loading product details...'
              : 'Position your device near the product tag'
            }
          </p>
        </div>

        {scanStatus === 'idle' && (
          <FuturisticButton 
            variant="primary" 
            size="lg" 
            onClick={handleScan}
            className="w-full"
          >
            <span className="leading-none">Start Scan</span>
          </FuturisticButton>
        )}

        {scanStatus === 'scanning' && (
          <div className="space-y-4">
            <div className="w-full bg-surface-700 rounded-lg h-2 overflow-hidden">
              <div className="h-full bg-gradient-cta animate-pulse"></div>
            </div>
            <p className="text-sm text-text-tertiary">Keep device steady...</p>
          </div>
        )}
      </GlassCard>
      
      <div className="mt-8 text-center animate-float">
        <p className="text-sm text-text-tertiary mb-2">Demo Mode Active</p>
        <div className="icon-text-aligned justify-center space-x-2 text-xs text-accent-cyan">
          <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></div>
          <span>Proof in hand.</span>
        </div>
      </div>
    </div>
  );
};

export default NFCScanner;
