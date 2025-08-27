import { useCallback, useEffect, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { NFCProductData } from '@/types/webNFC';
import { NFCTagManager } from '@/utils/nfcTagManager';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';

export interface PaymentState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: `0x${string}`;
  receipt?: any;
}

export interface UseNFCPaymentResult extends PaymentState {
  processPayment: (productData: NFCProductData, recipientAddress: `0x${string}`) => Promise<void>;
  reset: () => void;
  estimateGas: (productData: NFCProductData) => Promise<bigint | null>;
  checkBalance: () => Promise<{ hasEnoughBalance: boolean; currentBalance: string; requiredAmount: string }>;
}

export const useNFCPayment = (): UseNFCPaymentResult => {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const [state, setState] = useState<PaymentState>({
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const { 
    writeContract, 
    data: writeData, 
    isPending: isWritePending, 
    error: writeError 
  } = useWriteContract();

  const { 
    isLoading: isReceiptLoading, 
    isSuccess: isReceiptSuccess, 
    data: receipt 
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Update state based on transaction status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: isWritePending || isReceiptLoading,
      isSuccess: isReceiptSuccess,
      transactionHash: writeData,
      receipt,
      error: writeError?.message || null,
    }));
  }, [isWritePending, isReceiptLoading, isReceiptSuccess, writeData, receipt, writeError]);

  // Process payment using NFC product data
  const processPayment = useCallback(async (
    productData: NFCProductData, 
    recipientAddress: `0x${string}`
  ): Promise<void> => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!NFCTagManager.validateProduct(productData)) {
        throw new Error('Invalid product data from NFC tag');
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Convert KRW price to wei (for demo purposes, using 1:1 ratio)
      const amountInWei = NFCTagManager.convertToWei(productData.price);
      
      console.log('Processing NFC payment:', {
        product: productData.name,
        price: productData.price,
        amountInWei: amountInWei.toString(),
        recipient: recipientAddress,
        productId: productData.productId,
        merchantId: productData.merchantId,
      });

      // Call the smart contract
      writeContract({
        ...PAYMENT_CONTRACT_CONFIG,
        functionName: 'processPayment',
        args: [
          recipientAddress,
          amountInWei,
          productData.productId,
          productData.merchantId
        ],
        value: amountInWei, // Send the payment amount as value
      } as any);

    } catch (error: any) {
      console.error('Payment processing failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Payment processing failed',
      }));
    }
  }, [address, writeContract]);

  // Estimate gas for the transaction
  const estimateGas = useCallback(async (productData: NFCProductData): Promise<bigint | null> => {
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // This would typically use estimateGas from wagmi, but for demo we'll return a fixed estimate
      return parseUnits('0.001', 18); // Estimate ~0.001 KAIA for gas
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  }, [address]);

  // Check if user has enough balance
  const checkBalance = useCallback(async (productData?: NFCProductData) => {
    const currentBalance = balance?.value || 0n;
    const currentBalanceFormatted = formatUnits(currentBalance, 18);
    
    if (!productData) {
      return {
        hasEnoughBalance: true,
        currentBalance: currentBalanceFormatted,
        requiredAmount: '0',
      };
    }

    const requiredAmount = NFCTagManager.convertToWei(productData.price);
    const gasEstimate = parseUnits('0.001', 18); // Estimated gas
    const totalRequired = requiredAmount + gasEstimate;
    const totalRequiredFormatted = formatUnits(totalRequired, 18);

    return {
      hasEnoughBalance: currentBalance >= totalRequired,
      currentBalance: currentBalanceFormatted,
      requiredAmount: totalRequiredFormatted,
    };
  }, [balance?.value]);

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
    estimateGas,
    checkBalance,
  };
};
