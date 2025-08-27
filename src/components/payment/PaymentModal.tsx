
import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { X, CreditCard, Shield, Clock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: {
    name: string;
    price: number;
    currency: string;
    merchantName: string;
  };
  onPaymentComplete: (receiptData: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  productData,
  onPaymentComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const receiptData = {
        transactionId: `tx_${Date.now()}`,
        productName: productData.name,
        amount: productData.price,
        currency: productData.currency,
        merchantName: productData.merchantName,
        timestamp: new Date().toISOString(),
        nftTokenId: `NFT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      };
      
      onPaymentComplete(receiptData);
      setIsProcessing(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 animate-slide-up" glow>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-display text-xl font-bold">Confirm Payment</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Product Details */}
          <div className="p-4 rounded-xl bg-surface-700/50 border border-glass-2">
            <h4 className="font-semibold text-text-primary mb-1">{productData.name}</h4>
            <p className="text-sm text-text-secondary mb-3">From {productData.merchantName}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-display font-bold text-accent-cyan">
                {productData.currency}{productData.price.toLocaleString()}
              </span>
              <div className="flex items-center space-x-1 text-xs text-status-success">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-4 rounded-xl bg-surface-700/30 border border-glass-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-button">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">NFC Payment</p>
                <p className="text-sm text-text-secondary">Tap to complete transaction</p>
              </div>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-gradient-glow border border-accent-cyan/20">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-accent-cyan animate-spin" />
                <div>
                  <p className="font-medium text-text-primary">Processing Payment</p>
                  <p className="text-sm text-text-secondary">Generating receipt NFT...</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-surface-700 rounded-lg h-2 overflow-hidden">
                <div className="h-full bg-accent-cyan animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <FuturisticButton 
              variant="secondary" 
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </FuturisticButton>
            <FuturisticButton 
              variant="primary" 
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `Pay ${productData.currency}${productData.price.toLocaleString()}`}
            </FuturisticButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PaymentModal;
