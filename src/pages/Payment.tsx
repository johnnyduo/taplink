import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';
import { KRW_CONTRACT_CONFIG } from '@/lib/contracts/krw-abi';
import { useWallet } from '@/hooks/useWallet';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Package,
  Coins,
  Clock,
  Loader2,
  NfcIcon,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('pid') || '';
  const nfcId = searchParams.get('nfc') || '';
  
  const { 
    isConnected, 
    connect, 
    formattedAddress, 
    krwBalance,
    krwBalanceLoading 
  } = useWallet();
  
  const [paymentStep, setPaymentStep] = React.useState<'loading' | 'confirm' | 'approving' | 'paying' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  // Get product information
  const { data: productData, isLoading: productLoading } = useReadContract({
    ...PAYMENT_CONTRACT_CONFIG,
    functionName: 'getProduct',
    args: [productId],
    query: {
      enabled: !!productId,
    },
  });

  // Contract interactions
  const { writeContract: approveKRW, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: processPayment, data: paymentHash, isPending: isPaymentPending } = useWriteContract();
  
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isPaymentConfirming, isSuccess: paymentSuccess } = useWaitForTransactionReceipt({
    hash: paymentHash,
  });

  // Extract product info
  const productName = productData?.[0] || '';
  const productPrice = productData?.[1] || 0n;
  const productStock = productData?.[2] || 0n;
  const productActive = productData?.[3] || false;
  
  const priceInKRW = Number(productPrice);
  const stockCount = Number(productStock);
  const hasStock = stockCount > 0;
  const userBalance = Number(krwBalance?.formatted || 0);
  const hasEnoughBalance = userBalance >= priceInKRW;

  // Set initial state based on data
  React.useEffect(() => {
    if (!productLoading && productData) {
      if (!productActive) {
        setPaymentStep('error');
        setErrorMessage('Product is no longer available');
      } else if (!hasStock) {
        setPaymentStep('error');
        setErrorMessage('Product is out of stock');
      } else if (isConnected && !hasEnoughBalance) {
        setPaymentStep('error');
        setErrorMessage('Insufficient KRW balance');
      } else if (isConnected) {
        setPaymentStep('confirm');
      }
    }
  }, [productLoading, productData, productActive, hasStock, isConnected, hasEnoughBalance]);

  // Handle approval confirmation
  React.useEffect(() => {
    if (approveHash && !isApproveConfirming && !isApproving) {
      setPaymentStep('paying');
      // Auto-process payment after approval
      processPayment({
        address: PAYMENT_CONTRACT_CONFIG.address,
        abi: PAYMENT_CONTRACT_CONFIG.abi,
        functionName: 'tapToPay',
        args: [productId, nfcId],
      } as any);
    }
  }, [approveHash, isApproveConfirming, isApproving, processPayment, productId, nfcId]);

  // Handle payment success
  React.useEffect(() => {
    if (paymentSuccess) {
      setPaymentStep('success');
      toast.success('🎉 Payment successful!', {
        description: `Purchased ${productName} for ₩${priceInKRW.toLocaleString()}`
      });
    }
  }, [paymentSuccess, productName, priceInKRW]);

  const handlePayment = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    try {
      setPaymentStep('approving');
      
      // First approve the KRW spending
      toast.info('🔐 Approving KRW spending...', {
        description: 'Please confirm the approval transaction'
      });
      
      approveKRW({
        address: KRW_CONTRACT_CONFIG.address,
        abi: KRW_CONTRACT_CONFIG.abi,
        functionName: 'approve',
        args: [PAYMENT_CONTRACT_CONFIG.address, parseUnits(priceInKRW.toString(), 18)],
      } as any);
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStep('error');
      setErrorMessage(error.message || 'Payment failed');
      toast.error('Payment failed', {
        description: error.message || 'Please try again'
      });
    }
  };

  if (!productId || !nfcId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 flex items-center justify-center p-4">
        <GlassCard className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-status-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Invalid Payment Link</h2>
          <p className="text-text-secondary mb-4">
            This payment link is missing required information.
          </p>
          <Link to="/">
            <FuturisticButton variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </FuturisticButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (productLoading || paymentStep === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Loading Product...</h2>
          <p className="text-text-secondary">Please wait while we fetch product details.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* NFC Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2 text-accent-cyan">
            <NfcIcon className="w-6 h-6" />
            <span className="text-sm font-medium">NFC Payment</span>
          </div>
        </div>

        <GlassCard className="p-6 space-y-6">
          {/* Product Information */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{productName}</h1>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent-cyan">₩{priceInKRW.toLocaleString()}</p>
                <p className="text-xs text-text-tertiary">Price</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-text-primary">{stockCount}</p>
                <p className="text-xs text-text-tertiary">In Stock</p>
              </div>
            </div>
          </div>

          {/* Payment Step Content */}
          {paymentStep === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-status-danger mx-auto" />
              <h2 className="text-lg font-semibold text-status-danger">Payment Error</h2>
              <p className="text-text-secondary">{errorMessage}</p>
              {errorMessage.includes('balance') && (
                <div className="p-4 bg-status-warning/10 rounded-lg border border-status-warning/30">
                  <p className="text-sm text-status-warning">
                    Your Balance: ₩{userBalance.toLocaleString()} KRW
                  </p>
                  <p className="text-sm text-status-warning">
                    Required: ₩{priceInKRW.toLocaleString()} KRW
                  </p>
                </div>
              )}
              <Link to="/">
                <FuturisticButton variant="secondary" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </FuturisticButton>
              </Link>
            </div>
          )}

          {paymentStep === 'confirm' && (
            <div className="space-y-4">
              {/* Wallet Info */}
              <div className="p-4 bg-surface-800/30 rounded-lg border border-surface-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Wallet</span>
                  <Badge variant="outline" className="text-status-success border-status-success/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <p className="font-mono text-sm text-text-primary mt-1">{formattedAddress}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-text-secondary">KRW Balance</span>
                  <span className="font-semibold text-accent-cyan">
                    ₩{userBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h3 className="font-semibold text-text-primary mb-2">Payment Summary</h3>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Total Amount</span>
                  <span className="text-xl font-bold text-primary">₩{priceInKRW.toLocaleString()}</span>
                </div>
              </div>

              <FuturisticButton 
                onClick={handlePayment}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent-cyan"
                disabled={!hasEnoughBalance}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Confirm Payment
              </FuturisticButton>
            </div>
          )}

          {(paymentStep === 'approving' || paymentStep === 'paying') && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <h2 className="text-lg font-semibold text-text-primary">
                {paymentStep === 'approving' ? 'Approving Payment...' : 'Processing Payment...'}
              </h2>
              <p className="text-text-secondary">
                {paymentStep === 'approving' 
                  ? 'Please approve the KRW spending in your wallet'
                  : 'Payment is being processed on the blockchain'
                }
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary">This may take a few moments...</span>
              </div>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-status-success mx-auto" />
              <h2 className="text-xl font-bold text-status-success">Payment Successful!</h2>
              <div className="p-4 bg-status-success/10 rounded-lg border border-status-success/30">
                <h3 className="font-semibold text-text-primary mb-2">Purchase Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Product:</span>
                    <span className="text-text-primary">{productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Amount:</span>
                    <span className="text-status-success font-semibold">₩{priceInKRW.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Transaction:</span>
                    <span className="font-mono text-xs text-text-primary">
                      {paymentHash?.slice(0, 10)}...{paymentHash?.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
              <Link to="/">
                <FuturisticButton variant="secondary" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </FuturisticButton>
              </Link>
            </div>
          )}

          {!isConnected && (
            <div className="text-center space-y-4">
              <Wallet className="w-12 h-12 text-text-tertiary mx-auto" />
              <h2 className="text-lg font-semibold text-text-primary">Connect Wallet</h2>
              <p className="text-text-secondary">Connect your wallet to proceed with the payment</p>
              <FuturisticButton onClick={connect} className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </FuturisticButton>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
