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
  checkBalance: (productData?: NFCProductData) => Promise<{ hasEnoughBalance: boolean; currentBalance: string; requiredAmount: string }>;
}

export const useNFCPayment = (): UseNFCPaymentResult => {
  const { 
    processPayment: walletProcessPayment, 
    isConnected, 
    kaiaBalance,
    krwBalance,
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

      // Use KRW tokens directly - no conversion needed!
      // The price from NFC (25000) represents 25,000 KRW tokens
      const priceInKRW = productData.price.toString();
      
      console.log('🛒 Processing NFC payment:', {
        product: productData.name,
        priceKRW: productData.price,
        priceKRWTokens: priceInKRW + ' KRW tokens',
        productId: productData.productId,
        merchantId: productData.merchantId,
        walletAddress: address,
        paymentMethod: 'KRW stable coin tokens + KAIA gas fees'
      });

      // Use the demo wallet address as merchant for testing (or get from productData if available)
      const merchantAddress = (import.meta.env.VITE_DEMO_WALLET_ADDRESS || '0xa3cD8b433674017376d6E9Df72A78d80f6dEfDce') as `0x${string}`;
      
      console.log('💰 Payment details:', {
        merchantAddress,
        paymentContract: productData.contractAddress,
        krwTokenAmount: priceInKRW,
        gasToken: 'KAIA'
      });

      // Process the payment using KRW tokens
      const hash = await walletProcessPayment(
        productData.productId,
        priceInKRW,
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
    const currentKRWBalance = parseFloat(krwBalance || '0');
    const currentKaiaBalance = parseFloat(kaiaBalance || '0');
    
    if (!productData) {
      return {
        hasEnoughBalance: true,
        currentBalance: krwBalance || '0',
        requiredAmount: '0',
      };
    }

    // Check KRW balance for payment and KAIA balance for gas
    const requiredKRW = parseFloat(productData.price.toString());
    const gasEstimateKAIA = 0.001; // ~0.001 KAIA for gas
    
    const hasEnoughKRW = currentKRWBalance >= requiredKRW;
    const hasEnoughKAIA = currentKaiaBalance >= gasEstimateKAIA;

    console.log('💰 Balance check:', {
      requiredKRW,
      currentKRWBalance,
      hasEnoughKRW,
      gasEstimateKAIA,
      currentKaiaBalance,
      hasEnoughKAIA
    });

    return {
      hasEnoughBalance: hasEnoughKRW && hasEnoughKAIA,
      currentBalance: `${currentKRWBalance.toLocaleString()} KRW, ${currentKaiaBalance.toFixed(4)} KAIA`,
      requiredAmount: `${requiredKRW.toLocaleString()} KRW + ${gasEstimateKAIA.toFixed(4)} KAIA gas est.`,
    };
  }, [krwBalance, kaiaBalance]);

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
