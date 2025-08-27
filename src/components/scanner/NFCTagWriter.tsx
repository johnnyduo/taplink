import React, { useState, useCallback } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useWebNFC } from '@/hooks/useWebNFC';
import { NFCTagManager, DEMO_PRODUCTS } from '@/utils/nfcTagManager';
import { NFCProductData } from '@/types/webNFC';
import {
  PenTool,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Zap,
  Download,
  Smartphone,
  Shield,
  Wifi,
  Chrome
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NFCTagWriterProps {
  onWriteComplete?: (data: NFCProductData) => void;
  onError?: (error: string) => void;
}

const NFCTagWriter: React.FC<NFCTagWriterProps> = ({
  onWriteComplete,
  onError
}) => {
  const {
    isSupported,
    isPermissionGranted,
    isWriting,
    error,
    writeTag,
    requestPermission,
    clearError,
  } = useWebNFC();

  const [selectedProduct, setSelectedProduct] = useState<NFCProductData | null>(null);
  const [customProduct, setCustomProduct] = useState<Partial<NFCProductData>>({
    productId: '',
    name: '',
    price: 0,
    currency: 'KRW',
    description: '',
    merchantId: 'cafe-seoul-001',
    merchantName: 'Cafe Seoul',
  });
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [writeSuccess, setWriteSuccess] = useState(false);

  const compatibilityInfo = NFCTagManager.checkNFCSupport();

  // Handle write operation
  const handleWrite = useCallback(async () => {
    try {
      clearError();
      setWriteSuccess(false);

      const productToWrite = mode === 'preset' ? selectedProduct : customProduct as NFCProductData;
      
      if (!productToWrite || !NFCTagManager.validateProduct(productToWrite)) {
        throw new Error('Invalid product data. Please check all required fields.');
      }

      if (!isPermissionGranted) {
        await requestPermission();
      }

      await writeTag(productToWrite);
      setWriteSuccess(true);
      
      if (onWriteComplete) {
        onWriteComplete(productToWrite);
      }

      // Clear success state after 3 seconds
      setTimeout(() => setWriteSuccess(false), 3000);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to write NFC tag';
      if (onError) {
        onError(errorMessage);
      }
      console.error('Write failed:', err);
    }
  }, [mode, selectedProduct, customProduct, isPermissionGranted, writeTag, requestPermission, clearError, onWriteComplete, onError]);

  // Handle custom product changes
  const handleCustomProductChange = useCallback((field: keyof NFCProductData, value: any) => {
    setCustomProduct(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Render compatibility status
  const renderCompatibilityStatus = () => (
    <GlassCard className="p-4 mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-3">NFC Writer Status</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm">HTTPS</span>
          <Badge variant={compatibilityInfo.isSecureContext ? 'default' : 'destructive'} className="ml-auto">
            {compatibilityInfo.isSecureContext ? 'OK' : 'Required'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Chrome className="w-4 h-4" />
          <span className="text-sm">Chrome</span>
          <Badge variant={compatibilityInfo.isChrome ? 'default' : 'destructive'} className="ml-auto">
            {compatibilityInfo.isChrome ? 'OK' : 'Required'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4" />
          <span className="text-sm">Mobile</span>
          <Badge variant={compatibilityInfo.isMobile ? 'default' : 'destructive'} className="ml-auto">
            {compatibilityInfo.isMobile ? 'OK' : 'Required'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm">WebNFC</span>
          <Badge variant={isSupported ? 'default' : 'destructive'} className="ml-auto">
            {isSupported ? 'Available' : 'Missing'}
          </Badge>
        </div>
      </div>
    </GlassCard>
  );

  // Render preset products
  const renderPresetProducts = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Demo Products</h3>
      <div className="grid gap-3">
        {DEMO_PRODUCTS.map((product) => (
          <div
            key={product.productId}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-all",
              selectedProduct?.productId === product.productId
                ? "border-accent-cyan bg-accent-cyan/10"
                : "border-border-1 hover:border-border-2"
            )}
            onClick={() => setSelectedProduct(product)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-text-primary">{product.name}</h4>
              <Badge variant="secondary">
                {NFCTagManager.formatPrice(product.price, product.currency)}
              </Badge>
            </div>
            <p className="text-sm text-text-tertiary mb-2">{product.description}</p>
            <div className="flex items-center space-x-4 text-xs text-text-tertiary">
              <span>ID: {product.productId}</span>
              <span>Merchant: {product.merchantName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render custom product form
  const renderCustomProductForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Custom Product</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productId">Product ID *</Label>
          <Input
            id="productId"
            placeholder="e.g., coffee-latte-001"
            value={customProduct.productId || ''}
            onChange={(e) => handleCustomProductChange('productId', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price (KRW) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="25000"
            value={customProduct.price || ''}
            onChange={(e) => handleCustomProductChange('price', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Premium Latte"
          value={customProduct.name || ''}
          onChange={(e) => handleCustomProductChange('name', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Product description..."
          rows={3}
          value={customProduct.description || ''}
          onChange={(e) => handleCustomProductChange('description', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="merchantId">Merchant ID</Label>
          <Input
            id="merchantId"
            placeholder="cafe-seoul-001"
            value={customProduct.merchantId || ''}
            onChange={(e) => handleCustomProductChange('merchantId', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="merchantName">Merchant Name</Label>
          <Input
            id="merchantName"
            placeholder="Cafe Seoul"
            value={customProduct.merchantName || ''}
            onChange={(e) => handleCustomProductChange('merchantName', e.target.value)}
          />
        </div>
      </div>

      <div className="p-3 bg-surface-700/50 rounded-lg">
        <p className="text-sm text-text-tertiary mb-2">Contract Details (Auto-filled)</p>
        <div className="text-xs space-y-1">
          <div>Chain: Kaia Testnet (1001)</div>
          <div>Contract: {import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS}</div>
        </div>
      </div>
    </div>
  );

  // Render write interface
  const renderWriteInterface = () => {
    if (!isSupported) {
      return (
        <Alert className="border-status-warning bg-status-warning/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            WebNFC is not supported on this device. {compatibilityInfo.reason}
          </AlertDescription>
        </Alert>
      );
    }

    if (!isPermissionGranted) {
      return (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-surface-700">
            <Shield className="w-8 h-8 text-text-tertiary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Permission Required</h3>
            <p className="text-text-tertiary mb-4">Grant NFC access to write tags</p>
          </div>
          <FuturisticButton
            variant="primary"
            onClick={requestPermission}
          >
            <Shield className="w-4 h-4 mr-2" />
            Grant Permission
          </FuturisticButton>
        </div>
      );
    }

    const productToWrite = mode === 'preset' ? selectedProduct : customProduct as NFCProductData;
    const isValidProduct = NFCTagManager.validateProduct(productToWrite);

    return (
      <div className="space-y-6">
        {/* Mode selector */}
        <div className="flex space-x-2 p-1 bg-surface-700 rounded-lg">
          <button
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              mode === 'preset'
                ? "bg-accent-cyan text-background shadow"
                : "text-text-tertiary hover:text-text-primary"
            )}
            onClick={() => setMode('preset')}
          >
            <Package className="w-4 h-4 mr-2 inline" />
            Demo Products
          </button>
          <button
            className={cn(
              "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
              mode === 'custom'
                ? "bg-accent-cyan text-background shadow"
                : "text-text-tertiary hover:text-text-primary"
            )}
            onClick={() => setMode('custom')}
          >
            <PenTool className="w-4 h-4 mr-2 inline" />
            Custom Product
          </button>
        </div>

        {/* Product selection/form */}
        {mode === 'preset' ? renderPresetProducts() : renderCustomProductForm()}

        {/* Write button */}
        <div className="pt-4 border-t border-border-1">
          {writeSuccess ? (
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-status-success">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-status-success font-semibold">NFC Tag Written Successfully!</p>
            </div>
          ) : (
            <FuturisticButton
              variant="primary"
              size="lg"
              onClick={handleWrite}
              disabled={!isValidProduct || isWriting}
              className="w-full"
            >
              {isWriting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Writing to NFC Tag...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Write to NFC Tag
                </>
              )}
            </FuturisticButton>
          )}
        </div>

        {/* Product preview */}
        {isValidProduct && (
          <div className="mt-4 p-4 bg-surface-700/50 rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2">Write Preview</h4>
            <div className="text-sm space-y-1">
              <div>Name: {productToWrite.name}</div>
              <div>Price: {NFCTagManager.formatPrice(productToWrite.price, productToWrite.currency)}</div>
              <div>ID: {productToWrite.productId}</div>
              <div>Merchant: {productToWrite.merchantName}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">NFC Tag Writer</h1>
        <p className="text-text-tertiary">
          Create NFC tags for TapLink payment demo
        </p>
      </div>

      {renderCompatibilityStatus()}

      <GlassCard className="p-6" glow>
        {error && (
          <Alert className="border-status-error bg-status-error/10 mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {renderWriteInterface()}
      </GlassCard>

      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-text-tertiary">
          <Download className="w-4 h-4" />
          <span>Position device near NFC tag when writing</span>
        </div>
      </div>
    </div>
  );
};

export default NFCTagWriter;
