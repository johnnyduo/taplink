import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useNFCPayment } from '@/hooks/useNFCPayment';
import { NFCProductData } from '@/types/webNFC';
import { NFCTagManager } from '@/utils/nfcTagManager';
import { 
  X, 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Wallet,
  Zap,
  Smartphone,
  ExternalLink,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NFCPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: NFCProductData;
  onPaymentComplete: (receiptData: any) => void;
  onError?: (error: string) => void;
}

type PaymentStep = 'connect' | 'confirm' | 'processing' | 'success' | 'error';

const NFCPaymentModal: React.FC<NFCPaymentModalProps> = ({
  isOpen,
  onClose,
  productData,
  onPaymentComplete,
  onError
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const {
    isLoading,
    isSuccess,
    error: paymentError,
    transactionHash,
    receipt,
    processPayment,
    reset: resetPayment,
    checkBalance
  } = useNFCPayment();

  const [currentStep, setCurrentStep] = useState<PaymentStep>('connect');
  const [balanceInfo, setBalanceInfo] = useState<{
    hasEnoughBalance: boolean;
    currentBalance: string;
    requiredAmount: string;
  } | null>(null);

  // Set merchant address (use demo wallet address for testing)
  const MERCHANT_ADDRESS = import.meta.env.VITE_DEMO_WALLET_ADDRESS || "0xa3cD8b433674017376d6E9Df72A78d80f6dEfDce";

  // Update step based on connection and payment state
  useEffect(() => {
    if (!isConnected) {
      setCurrentStep('connect');
    } else if (paymentError) {
      setCurrentStep('error');
    } else if (isSuccess && transactionHash) {
      // When we have transaction hash, immediately show success (on-chain is already done)
      setCurrentStep('success');
    } else if (isLoading) {
      setCurrentStep('processing');
    } else if (isConnected && !isLoading && !isSuccess) {
      setCurrentStep('confirm');
    }
  }, [isConnected, isLoading, isSuccess, paymentError, transactionHash]);

  // Check balance when connected
  useEffect(() => {
    if (isConnected && productData) {
      checkBalance(productData).then(info => {
        setBalanceInfo(info); // Use the properly formatted info from the hook
      });
    }
  }, [isConnected, productData, checkBalance]);

  // Handle payment completion with explorer URL - NO AUTOMATIC COMPLETION
  useEffect(() => {
    // Only log the completion, don't auto-complete
    if (isSuccess && transactionHash && currentStep === 'success') {
      console.log('✅ Payment successful, waiting for user to complete manually');
    }
  }, [isSuccess, transactionHash, currentStep]);

  // Handle errors
  useEffect(() => {
    if (paymentError && onError) {
      onError(paymentError);
    }
  }, [paymentError, onError]);

  // Handle wallet connection
  const handleConnect = useCallback(async () => {
    try {
      const connector = connectors.find(c => c.id === 'walletConnect');
      if (connector) {
        connect({ connector });
      } else if (connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    } catch (err: any) {
      console.error('Connection failed:', err);
      if (onError) {
        onError(err.message || 'Failed to connect wallet');
      }
    }
  }, [connectors, connect, onError]);

  // Handle payment processing
  const handlePayment = useCallback(async () => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      resetPayment();
      await processPayment(productData);
    } catch (err: any) {
      console.error('Payment failed:', err);
      if (onError) {
        onError(err.message || 'Payment processing failed');
      }
    }
  }, [address, productData, processPayment, resetPayment, onError]);

  // Handle retry
  const handleRetry = useCallback(() => {
    resetPayment();
    setCurrentStep(isConnected ? 'confirm' : 'connect');
  }, [resetPayment, isConnected]);

  // Handle manual completion (when user clicks "Complete" button)
  const handleComplete = useCallback(() => {
    if (isSuccess && transactionHash) {
      const explorerUrl = `${import.meta.env.VITE_KAIA_KAIROS_EXPLORER}/tx/${transactionHash}`;
      
      // Generate FIXED NFT ID based on transaction hash (not random)
      const fixedNftId = `NFT_${transactionHash.slice(2, 12).toUpperCase()}`;
      
      const receiptData = {
        transactionId: transactionHash,
        transactionHash,
        explorerUrl,
        productId: productData.productId,
        productName: productData.name,
        amount: productData.price,
        currency: productData.currency,
        merchantName: productData.merchantName,
        merchantId: productData.merchantId,
        timestamp: new Date().toISOString(),
        nftTokenId: fixedNftId, // FIXED NFT ID based on transaction hash
        blockHash: receipt?.blockHash || '',
        blockNumber: receipt?.blockNumber || 0n,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        receipt,
      };
      
      onPaymentComplete(receiptData);
    }
  }, [isSuccess, transactionHash, productData, onPaymentComplete, receipt]);

  // Handle close
  const handleClose = useCallback(() => {
    resetPayment();
    onClose();
  }, [resetPayment, onClose]);

  if (!isOpen) return null;

  // Render steps
  const renderConnectStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-surface-700">
        <Wallet className="w-8 h-8 text-text-tertiary" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Connect Wallet</h3>
        <p className="text-text-tertiary">
          Connect your wallet to complete the NFC payment
        </p>
      </div>

      <FuturisticButton
        variant="primary"
        size="lg"
        onClick={handleConnect}
        className="w-full"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </FuturisticButton>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      {/* Product Details */}
      <div className="p-4 rounded-xl bg-surface-700/50 border border-glass-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-text-primary">{productData.name}</h4>
          <Badge variant="secondary">NFC</Badge>
        </div>
        <p className="text-sm text-text-secondary mb-3">
          From {productData.merchantName}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-display font-bold text-accent-cyan">
            {NFCTagManager.formatPrice(productData.price, productData.currency)}
          </span>
          <div className="flex items-center space-x-1 text-xs text-status-success">
            <Shield className="w-3 h-3" />
            <span>Secure</span>
          </div>
        </div>
      </div>

      {/* NFC Tag Info */}
      <div className="p-4 rounded-xl bg-gradient-glow border border-accent-cyan/20">
        <div className="flex items-center space-x-3">
          <Smartphone className="w-5 h-5 text-accent-cyan" />
          <div className="flex-1">
            <p className="font-medium text-text-primary">NFC Payment</p>
            <p className="text-sm text-text-secondary">
              Product ID: {productData.productId}
            </p>
          </div>
          <div className="text-xs text-text-tertiary">
            Chain: {productData.chainId}
          </div>
        </div>
      </div>

      {/* Balance Check */}
      {balanceInfo && (
        <div className={cn(
          "p-4 rounded-xl border",
          balanceInfo.hasEnoughBalance 
            ? "bg-status-success/10 border-status-success/20" 
            : "bg-status-warning/10 border-status-warning/20"
        )}>
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="font-medium text-text-primary">Balance Check</span>
          </div>
          <div className="text-sm space-y-1">
            <div>Current: {balanceInfo.currentBalance}</div>
            <div>Required: {balanceInfo.requiredAmount}</div>
            {!balanceInfo.hasEnoughBalance && (
              <div className="text-status-warning font-medium">Insufficient balance</div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <FuturisticButton 
          variant="secondary" 
          onClick={handleClose}
          className="flex-1"
        >
          Cancel
        </FuturisticButton>
        <FuturisticButton 
          variant="primary" 
          onClick={handlePayment}
          disabled={balanceInfo && !balanceInfo.hasEnoughBalance}
          className="flex-1"
        >
          <Zap className="w-4 h-4 mr-2" />
          Pay Now
        </FuturisticButton>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gradient-cta animate-pulse">
        <Clock className="w-8 h-8 text-white animate-spin" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Processing Payment</h3>
        <p className="text-text-tertiary mb-4">
          Confirming transaction on blockchain...
        </p>
        {transactionHash && (
          <div className="text-xs text-text-tertiary">
            TX: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
          </div>
        )}
      </div>

      <div className="w-full bg-surface-700 rounded-lg h-3 overflow-hidden">
        <div className="h-full bg-gradient-cta animate-pulse"></div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-status-success">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-status-success mb-2">Payment Successful! 🎉</h3>
        <p className="text-text-tertiary mb-4">
          Your {productData.name} purchase is complete
        </p>
        <div className="text-sm text-text-tertiary space-y-2">
          <div>Product: {productData.name}</div>
          <div>Amount: {productData.price.toLocaleString()} KRW tokens</div>
          <div>From: {productData.merchantName}</div>
        </div>
      </div>

      {/* Prominent Explorer Link */}
      {transactionHash && (
        <div className="p-4 bg-surface-700 rounded-xl border border-accent-cyan/20">
          <div className="text-sm text-text-secondary mb-2">Transaction Complete</div>
          <a 
            href={`${import.meta.env.VITE_KAIA_KAIROS_EXPLORER}/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-cyan/10 hover:bg-accent-cyan/20 rounded-lg text-accent-cyan hover:text-accent-cyan-bright transition-all duration-200 font-medium"
          >
            <span>View on Explorer</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="text-xs text-text-tertiary mt-2">
            TX: {transactionHash.slice(0, 10)}...{transactionHash.slice(-10)}
          </div>
        </div>
      )}

      <div className="text-xs text-accent-cyan opacity-75">
        ✨ Transaction confirmed on blockchain
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <FuturisticButton 
          variant="secondary" 
          onClick={handleClose}
          className="flex-1"
        >
          Close
        </FuturisticButton>
        <FuturisticButton 
          variant="primary" 
          onClick={handleComplete}
          className="flex-1"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete & Get Receipt
        </FuturisticButton>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-status-error">
        <AlertTriangle className="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-status-error mb-2">Payment Failed</h3>
        <p className="text-text-tertiary mb-4">
          {paymentError || 'An error occurred during payment processing'}
        </p>
      </div>

      <div className="flex space-x-3">
        <FuturisticButton 
          variant="secondary" 
          onClick={handleClose}
          className="flex-1"
        >
          Close
        </FuturisticButton>
        <FuturisticButton 
          variant="primary" 
          onClick={handleRetry}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </FuturisticButton>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'connect':
        return renderConnectStep();
      case 'confirm':
        return renderConfirmStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderConfirmStep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 animate-slide-up" glow>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-display text-xl font-bold">NFC Payment</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {['connect', 'confirm', 'processing', 'success'].map((step, index) => (
            <div
              key={step}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentStep === step || (currentStep === 'error' && step === 'processing')
                  ? "bg-accent-cyan"
                  : index < ['connect', 'confirm', 'processing', 'success'].indexOf(currentStep)
                  ? "bg-accent-cyan/50"
                  : "bg-surface-700"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        {renderCurrentStep()}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border-1 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-text-tertiary">
            <Shield className="w-3 h-3" />
            <span>Secured by blockchain technology</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default NFCPaymentModal;
