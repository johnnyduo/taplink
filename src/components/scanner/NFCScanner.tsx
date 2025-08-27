
import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useWebNFC } from '@/hooks/useWebNFC';
import { NFCTagManager } from '@/utils/nfcTagManager';
import { NFCProductData } from '@/types/webNFC';
import { 
  Smartphone, 
  Waves, 
  CheckCircle, 
  AlertTriangle, 
  Wifi,
  Shield,
  RefreshCw,
  Zap,
  QrCode,
  Chrome,
  WifiOff,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NFCScannerProps {
  onScanComplete: (data: NFCProductData) => void;
  onError?: (error: string) => void;
}

const NFCScanner: React.FC<NFCScannerProps> = ({ 
  onScanComplete, 
  onError 
}) => {
  const {
    isSupported,
    isPermissionGranted,
    isScanning,
    error,
    lastScannedData,
    scanCount,
    startScan,
    stopScan,
    requestPermission,
    clearError,
    resetState
  } = useWebNFC();

  const [compatibilityInfo] = useState(() => NFCTagManager.checkNFCSupport());
  const [showCompatibilityDetails, setShowCompatibilityDetails] = useState(false);

  // Handle successful scan
  useEffect(() => {
    if (lastScannedData) {
      console.log('NFC scan successful:', lastScannedData);
      onScanComplete(lastScannedData);
    }
  }, [lastScannedData, onScanComplete]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Handle scan start
  const handleStartScan = useCallback(async () => {
    try {
      clearError();
      await startScan();
    } catch (err) {
      console.error('Failed to start scan:', err);
    }
  }, [startScan, clearError]);

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    try {
      clearError();
      await requestPermission();
    } catch (err) {
      console.error('Failed to request permission:', err);
    }
  }, [requestPermission, clearError]);

  // Handle stop scan
  const handleStopScan = useCallback(() => {
    stopScan();
  }, [stopScan]);

  // Handle retry
  const handleRetry = useCallback(() => {
    resetState();
    clearError();
  }, [resetState, clearError]);

  // Render compatibility check
  const renderCompatibilityCheck = () => (
    <GlassCard className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Device Compatibility</h3>
        <FuturisticButton
          variant="ghost"
          size="sm"
          onClick={() => setShowCompatibilityDetails(!showCompatibilityDetails)}
        >
          {showCompatibilityDetails ? 'Hide' : 'Details'}
        </FuturisticButton>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">HTTPS</span>
          </div>
          <Badge variant={compatibilityInfo.isSecureContext ? 'default' : 'destructive'}>
            {compatibilityInfo.isSecureContext ? 'Secure' : 'Required'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Chrome className="w-4 h-4" />
            <span className="text-sm">Chrome Browser</span>
          </div>
          <Badge variant={compatibilityInfo.isChrome ? 'default' : 'destructive'}>
            {compatibilityInfo.isChrome ? 'Detected' : 'Required'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">Mobile Device</span>
          </div>
          <Badge variant={compatibilityInfo.isMobile ? 'default' : 'destructive'}>
            {compatibilityInfo.isMobile ? 'Detected' : 'Required'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">WebNFC API</span>
          </div>
          <Badge variant={isSupported ? 'default' : 'destructive'}>
            {isSupported ? 'Available' : 'Missing'}
          </Badge>
        </div>

        {showCompatibilityDetails && (
          <div className="pt-3 border-t border-border-1">
            <p className="text-xs text-text-tertiary mb-2">Requirements for WebNFC:</p>
            <ul className="text-xs text-text-tertiary space-y-1">
              <li>• Chrome browser on Android 6.0+</li>
              <li>• HTTPS connection (secure context)</li>
              <li>• Physical NFC hardware enabled</li>
              <li>• NFC permission granted</li>
            </ul>
          </div>
        )}
      </div>
    </GlassCard>
  );

  // Render error state
  const renderError = () => (
    <div className="space-y-4">
      <Alert className="border-status-error bg-status-error/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-text-primary">
          {error}
        </AlertDescription>
      </Alert>
      
      <div className="flex space-x-3">
        <FuturisticButton
          variant="secondary"
          size="sm"
          onClick={handleRetry}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </FuturisticButton>
        
        <FuturisticButton
          variant="ghost"
          size="sm"
          onClick={clearError}
          className="flex-1"
        >
          Dismiss
        </FuturisticButton>
      </div>
    </div>
  );

  // Render scanning state
  const renderScanning = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-32 h-32 rounded-full flex items-center justify-center bg-gradient-cta relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sweep"></div>
        <Smartphone className="w-16 h-16 text-white relative z-10 animate-bounce" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-3">
          Looking for Products...
        </h2>
        <p className="text-text-secondary text-lg mb-2">
          Hold your phone close to any NFC product
        </p>
        <p className="text-text-tertiary text-sm">
          The phone will vibrate when a product is detected
        </p>
      </div>

      <div className="flex justify-center space-x-2 mb-6">
        <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      <FuturisticButton 
        variant="secondary" 
        size="lg" 
        onClick={handleStopScan}
        className="w-full text-lg py-4"
      >
        <X className="w-6 h-6 mr-3" />
        Stop Scanning
      </FuturisticButton>

      <div className="bg-surface-700/50 rounded-lg p-4 border border-surface-600">
        <p className="text-sm text-text-tertiary leading-relaxed">
          <strong className="text-text-secondary">Tip:</strong> Make sure NFC is enabled in your device settings and hold your phone within 2-4cm of the product's NFC area.
        </p>
      </div>
    </div>
  );

  // Render success state
  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-status-success">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>
      
      <div>
        <h3 className="text-hero mb-2">Product Found!</h3>
        <p className="text-subtitle">
          Loading product details...
        </p>
      </div>

      <div className="w-full bg-surface-700 rounded-lg h-2 overflow-hidden">
        <div className="h-full bg-gradient-cta animate-pulse"></div>
      </div>
    </div>
  );

  // Render main scanning interface
  const renderScanInterface = () => {
    if (!isSupported) {
      return (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-surface-700">
            <QrCode className="w-12 h-12 text-text-tertiary" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Scan to Buy</h3>
            <p className="text-text-secondary mb-4">
              Use QR code scanning on this device
            </p>
          </div>

          <FuturisticButton
            variant="primary"
            size="lg"
            className="w-full text-lg font-bold py-4"
            onClick={() => {
              // For demo purposes, simulate scanning
              const mockData = NFCTagManager.getProduct('1001');
              if (mockData) {
                setTimeout(() => onScanComplete(mockData), 1000);
              }
            }}
          >
            <QrCode className="w-6 h-6 mr-3" />
            Start Scanning
          </FuturisticButton>
        </div>
      );
    }

    if (!isPermissionGranted) {
      return (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-surface-700">
            <Shield className="w-12 h-12 text-text-tertiary" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Enable NFC Access</h3>
            <p className="text-text-secondary mb-4">
              We need permission to access your device's NFC functionality
            </p>
          </div>

          <FuturisticButton
            variant="primary"
            size="lg"
            className="w-full text-lg font-bold py-4"
            onClick={handleRequestPermission}
          >
            <Shield className="w-6 h-6 mr-3" />
            Grant NFC Permission
          </FuturisticButton>
        </div>
      );
    }

    if (lastScannedData) {
      return renderSuccess();
    }

    if (isScanning) {
      return renderScanning();
    }

    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-32 h-32 rounded-full flex items-center justify-center bg-gradient-cta animate-pulse">
          <Smartphone className="w-16 h-16 text-white" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">Tap to Buy</h2>
          <p className="text-text-secondary text-lg mb-6">
            Hold your phone near any NFC-enabled product to purchase instantly
          </p>
        </div>

        <FuturisticButton 
          variant="primary" 
          size="lg" 
          onClick={handleStartScan}
          className="w-full text-lg font-bold py-4"
        >
          <Zap className="w-6 h-6 mr-3" />
          Start Scanning
        </FuturisticButton>

        <div className="flex items-center justify-center space-x-6 text-sm text-text-tertiary mt-8">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-status-success" />
            <span>Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-status-success" />
            <span>Instant</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-status-success" />
            <span>Blockchain Receipt</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      {renderCompatibilityCheck()}
      
      <GlassCard className="p-8 text-center max-w-md w-full" glow>
        {error ? renderError() : renderScanInterface()}
      </GlassCard>
      
      <div className="mt-8 text-center animate-float">
        <p className="text-sm text-text-tertiary mb-2">
          {isSupported ? 'WebNFC Ready' : 'Demo Mode'}
        </p>
        <div className="icon-text-aligned justify-center space-x-2 text-xs text-accent-cyan">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isSupported ? "bg-status-success animate-pulse" : "bg-accent-cyan animate-pulse"
          )}></div>
          <span>TapLink NFC Integration</span>
        </div>
      </div>
    </div>
  );
};

export default NFCScanner;
