import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Nfc, 
  Wifi, 
  Lock, 
  Unlock,
  Check,
  AlertTriangle,
  Smartphone,
  QrCode,
  RefreshCw,
  Shield,
  Eye,
  Copy,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  productID: string;
  name: string;
  sku: string;
  batchID: string;
  priceKRW: number;
}

interface WriteJob {
  id: string;
  productID: string;
  writeToken: string;
  payload: string;
  status: 'preparing' | 'ready' | 'writing' | 'verifying' | 'success' | 'error';
  progress: number;
  tagUid?: string;
  error?: string;
}

export const NFCWriter: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [writeMode, setWriteMode] = useState<'writable' | 'sealed'>('writable');
  const [password, setPassword] = useState('');
  const [currentJob, setCurrentJob] = useState<WriteJob | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const mockProducts: Product[] = [
    {
      productID: 'SKU123',
      name: 'TapLink Tee (Black)',
      sku: 'TSHIRT-BLK-M',
      batchID: 'BATCH42',
      priceKRW: 25000
    },
    {
      productID: 'SKU456',
      name: 'Seoul Coffee Beans',
      sku: 'COFFEE-BEAN-100G',
      batchID: 'BATCH43',
      priceKRW: 15000
    }
  ];

  // Check NFC support
  useEffect(() => {
    setNfcSupported('NDEFWriter' in window);
  }, []);

  const generatePayload = (product: Product): string => {
    const signature = btoa(`${product.productID}-${product.batchID}-${Date.now()}`);
    return `https://taplink.app/scan?p=${product.productID}&b=${product.batchID}&c=CIDxyz&s=${signature}`;
  };

  const startWrite = async () => {
    if (!selectedProduct) return;

    const writeJob: WriteJob = {
      id: `write-${Date.now()}`,
      productID: selectedProduct.productID,
      writeToken: `nonce-${Math.random().toString(36).substr(2, 9)}`,
      payload: generatePayload(selectedProduct),
      status: 'preparing',
      progress: 0
    };

    setCurrentJob(writeJob);

    // Simulate write process
    const steps = [
      { status: 'ready' as const, progress: 20, delay: 500 },
      { status: 'writing' as const, progress: 50, delay: 2000 },
      { status: 'verifying' as const, progress: 80, delay: 1500 },
      { status: 'success' as const, progress: 100, delay: 1000 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setCurrentJob(prev => prev ? { 
        ...prev, 
        status: step.status, 
        progress: step.progress,
        tagUid: step.status === 'success' ? '04A1B2C3D5E6F7' : undefined
      } : null);
    }
  };

  const resetWrite = () => {
    setCurrentJob(null);
    setSelectedProduct(null);
  };

  const copyPayload = () => {
    if (currentJob) {
      navigator.clipboard.writeText(currentJob.payload);
    }
  };

  const getStepStatus = (step: string, currentStatus: string) => {
    const stepOrder = ['preparing', 'ready', 'writing', 'verifying', 'success'];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">NFC Writer</h2>
          <p className="text-text-secondary">Write and lock NFC tags for your products</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {nfcSupported ? (
            <Badge className="bg-status-success text-white">
              <Wifi className="w-3 h-3 mr-1" />
              NFC Ready
            </Badge>
          ) : (
            <Badge className="bg-status-warning text-surface-900">
              <AlertTriangle className="w-3 h-3 mr-1" />
              NFC Not Supported
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection & Configuration */}
        <GlassCard className="p-6">
          <h3 className="text-display text-lg font-semibold text-text-primary mb-4">
            1. Select Product
          </h3>
          
          <div className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Choose Product
              </label>
              <select
                value={selectedProduct?.productID || ''}
                onChange={(e) => {
                  const product = mockProducts.find(p => p.productID === e.target.value);
                  setSelectedProduct(product || null);
                }}
                className="w-full px-3 py-2 bg-surface-700 border border-glass-2 rounded-lg text-text-primary"
              >
                <option value="">Select a product...</option>
                {mockProducts.map(product => (
                  <option key={product.productID} value={product.productID}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <>
                {/* Write Mode */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Tag Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWriteMode('writable')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all',
                        writeMode === 'writable'
                          ? 'border-accent-cyan bg-gradient-glow text-accent-cyan'
                          : 'border-glass-2 text-text-secondary hover:border-glass-3'
                      )}
                    >
                      <Unlock className="w-5 h-5 mb-1 mx-auto" />
                      <p className="text-sm font-medium">Writable</p>
                      <p className="text-xs opacity-75">Can be updated</p>
                    </button>
                    
                    <button
                      onClick={() => setWriteMode('sealed')}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all',
                        writeMode === 'sealed'
                          ? 'border-status-warning bg-status-warning/10 text-status-warning'
                          : 'border-glass-2 text-text-secondary hover:border-glass-3'
                      )}
                    >
                      <Lock className="w-5 h-5 mb-1 mx-auto" />
                      <p className="text-sm font-medium">Sealed</p>
                      <p className="text-xs opacity-75">Read-only</p>
                    </button>
                  </div>
                </div>

                {/* Password for Sealed Mode */}
                {writeMode === 'sealed' && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Lock Password (Optional)
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to lock tag"
                    />
                    <p className="text-xs text-status-warning mt-1">
                      ⚠️ Sealing is irreversible. Tag cannot be changed after locking.
                    </p>
                  </div>
                )}

                {/* Product Preview */}
                <div className="p-4 rounded-xl bg-surface-700/30 border border-glass-1">
                  <h4 className="font-medium text-text-primary mb-2">Product Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-text-tertiary">Name:</span> <span className="text-text-primary">{selectedProduct.name}</span></p>
                    <p><span className="text-text-tertiary">SKU:</span> <span className="font-mono text-text-secondary">{selectedProduct.sku}</span></p>
                    <p><span className="text-text-tertiary">Batch:</span> <span className="font-mono text-text-secondary">{selectedProduct.batchID}</span></p>
                    <p><span className="text-text-tertiary">Price:</span> <span className="text-accent-cyan">₩{selectedProduct.priceKRW.toLocaleString()}</span></p>
                  </div>
                </div>

                {/* Payload Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-secondary">
                      NFC Payload Preview
                    </label>
                    <FuturisticButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPayload(!showPayload)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {showPayload ? 'Hide' : 'Show'}
                    </FuturisticButton>
                  </div>
                  
                  {showPayload && (
                    <div className="p-3 rounded-lg bg-surface-800 border border-glass-2">
                      <div className="flex items-start justify-between">
                        <code className="text-xs text-accent-cyan font-mono break-all flex-1">
                          {generatePayload(selectedProduct)}
                        </code>
                        <FuturisticButton variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(generatePayload(selectedProduct))}>
                          <Copy className="w-3 h-3" />
                        </FuturisticButton>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </GlassCard>

        {/* Write Process */}
        <GlassCard className="p-6">
          <h3 className="text-display text-lg font-semibold text-text-primary mb-4">
            2. Write Process
          </h3>
          
          {!selectedProduct ? (
            <div className="text-center py-8">
              <Nfc className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">Select a product to begin writing</p>
            </div>
          ) : !currentJob ? (
            <div className="space-y-4">
              {/* NFC Support Check */}
              {!nfcSupported && (
                <div className="p-4 rounded-xl bg-status-warning/10 border border-status-warning/20">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="w-5 h-5 text-status-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-status-warning mb-1">NFC Not Available</p>
                      <p className="text-sm text-text-secondary">
                        Use a supported device or scan the QR code for manual setup.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Write Button */}
              <div className="text-center py-6">
                <FuturisticButton
                  variant="primary"
                  size="lg"
                  onClick={startWrite}
                  className="w-full h-16"
                >
                  <Zap className="w-6 h-6 mr-2" />
                  Start NFC Write
                </FuturisticButton>
                <p className="text-sm text-text-tertiary mt-2">
                  Bring your device close to the NFC tag
                </p>
              </div>

              {/* Fallback Options */}
              <div className="grid grid-cols-2 gap-3">
                <FuturisticButton variant="secondary">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Fallback
                </FuturisticButton>
                <FuturisticButton variant="secondary">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Mobile App
                </FuturisticButton>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="space-y-3">
                {[
                  { key: 'preparing', label: 'Preparing Write', icon: RefreshCw },
                  { key: 'ready', label: 'Ready to Write', icon: Nfc },
                  { key: 'writing', label: 'Writing Tag', icon: Wifi },
                  { key: 'verifying', label: 'Verifying', icon: Shield },
                  { key: 'success', label: 'Complete', icon: Check }
                ].map((step) => {
                  const status = getStepStatus(step.key, currentJob.status);
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.key} className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg transition-all',
                      status === 'completed' && 'bg-status-success/20 text-status-success',
                      status === 'active' && 'bg-gradient-glow text-accent-cyan',
                      status === 'pending' && 'text-text-tertiary'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        status === 'active' && currentJob.status === 'writing' && 'animate-spin'
                      )} />
                      <span className="font-medium">{step.label}</span>
                      {status === 'completed' && <Check className="w-4 h-4 ml-auto" />}
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Progress</span>
                  <span className="text-accent-cyan font-medium">{currentJob.progress}%</span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-button transition-all duration-500 ease-out"
                    style={{ width: `${currentJob.progress}%` }}
                  />
                </div>
              </div>

              {/* Success State */}
              {currentJob.status === 'success' && (
                <div className="text-center p-6 rounded-xl bg-gradient-glow border border-accent-cyan/20">
                  <div className="w-16 h-16 bg-status-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-text-primary mb-2">Tag Written Successfully!</h4>
                  {currentJob.tagUid && (
                    <p className="text-sm text-text-secondary mb-4">
                      Tag UID: <code className="font-mono text-accent-cyan">{currentJob.tagUid}</code>
                    </p>
                  )}
                  <div className="flex space-x-3">
                    <FuturisticButton variant="primary" onClick={resetWrite}>
                      Write Another
                    </FuturisticButton>
                    <FuturisticButton variant="secondary">
                      Scan to Verify
                    </FuturisticButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
