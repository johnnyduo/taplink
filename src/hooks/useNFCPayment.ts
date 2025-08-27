import { useCallback, useState } from 'react';
import { NFCProductData } from '@/types/webNFC';
import { useHardcodedWallet } from './useHardcodedWallet';
import { toast } from 'sonner';

export interface PaymentState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: `0x${string}`;
}

export interface UseNFCPaymentResult extends PaymentState {
  processPayment: (productData: NFCProductData) => Promise<void>;
  reset: () => void;
  checkBalance: () => Promise<{ hasEnoughBalance: boolean; currentBalance: string; requiredAmount: string }>;
}

export const useNFCPayment = (): UseNFCPaymentResult => {
  const { 
    processPayment: walletProcessPayment, 
    isConnected, 
    kaiaBalance,
    address 
  } = useHardcodedWallet();
  
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  // Process payment using NFC product data
  const processPayment = useCallback(async (productData: NFCProductData): Promise<void> => {
    try {
      if (!isConnected) {
        throw new Error('Demo wallet not connected');
      }

      setState(prev => ({ ...prev, isLoading: true, error: null, isSuccess: false }));

      // Convert KRW price to KAIA (1 KRW = 0.001 KAIA for demo)
      const priceInKaia = (parseFloat(productData.price.toString()) * 0.001).toString();
      
      console.log('🛒 Processing NFC payment:', {
        product: productData.name,
        priceKRW: productData.price,
        priceKAIA: priceInKaia,
        productId: productData.productId,
        merchantId: productData.merchantId,
        walletAddress: address,
      });

      // Use demo merchant address (replace with actual merchant from NFC data if available)
      const merchantAddress = '0x742d35Cc6634C0532925a3b8D404Cb7e3C9A7C62' as `0x${string}`;

      // Process the payment
      const hash = await walletProcessPayment(
        productData.productId,
        priceInKaia,
        merchantAddress
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
        transactionHash: hash,
        error: null,
      }));

      console.log('✅ NFC Payment completed:', { hash, productId: productData.productId });

    } catch (error: any) {
      console.error('💸 NFC Payment failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: false,
        error: error.message || 'Payment processing failed',
      }));
    }
  }, [isConnected, walletProcessPayment, address]);

  // Check if user has enough balance
  const checkBalance = useCallback(async (productData?: NFCProductData) => {
    const currentBalance = parseFloat(kaiaBalance || '0');
    
    if (!productData) {
      return {
        hasEnoughBalance: true,
        currentBalance: kaiaBalance || '0',
        requiredAmount: '0',
      };
    }

    // Convert KRW to KAIA and add gas estimate
    const priceInKaia = parseFloat(productData.price.toString()) * 0.001;
    const gasEstimate = 0.001; // ~0.001 KAIA for gas
    const totalRequired = priceInKaia + gasEstimate;

    return {
      hasEnoughBalance: currentBalance >= totalRequired,
      currentBalance: kaiaBalance || '0',
      requiredAmount: totalRequired.toFixed(6),
    };
  }, [kaiaBalance]);

  // Reset payment state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    processPayment,
    reset,
    checkBalance,
  };
};
