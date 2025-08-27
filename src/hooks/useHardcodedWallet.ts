import { useState, useEffect, useCallback } from 'react';
import { hardcodedWallet } from '@/lib/hardcodedWallet';
import { toast } from 'sonner';

export interface HardcodedWalletState {
  address: `0x${string}`;
  shortAddress: string;
  kaiaBalance: string;
  krwBalance: string;
  isLoading: boolean;
  isConnected: boolean;
}

export interface UseHardcodedWalletResult extends HardcodedWalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  claimFaucet: () => Promise<void>;
  processPayment: (productId: string, amount: string, merchantAddress: `0x${string}`) => Promise<`0x${string}`>;
  refreshBalances: () => Promise<void>;
  canClaimFaucet: () => Promise<boolean>;
}

export const useHardcodedWallet = (): UseHardcodedWalletResult => {
  const [state, setState] = useState<HardcodedWalletState>({
    address: hardcodedWallet.address,
    shortAddress: hardcodedWallet.getWalletInfo().shortAddress,
    kaiaBalance: '0',
    krwBalance: '0',
    isLoading: false,
    isConnected: false,
  });

  // Auto-connect on mount
  useEffect(() => {
    connect();
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const kaiaBalance = await hardcodedWallet.getBalance();
      const krwBalance = await hardcodedWallet.getKRWBalance();
      
      setState(prev => ({
        ...prev,
        kaiaBalance,
        krwBalance,
        isLoading: false,
        isConnected: true,
      }));

      toast.success('🔐 Demo wallet connected!', {
        description: `Address: ${hardcodedWallet.getWalletInfo().shortAddress}`
      });
      
      console.log('📱 Wallet connected:', {
        address: hardcodedWallet.address,
        kaiaBalance,
        krwBalance
      });
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      kaiaBalance: '0',
      krwBalance: '0',
      isLoading: false,
      isConnected: false,
    }));
    toast.info('Wallet disconnected');
  }, []);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (!state.isConnected) return;
    
    try {
      const kaiaBalance = await hardcodedWallet.getBalance();
      const krwBalance = await hardcodedWallet.getKRWBalance();
      
      setState(prev => ({ ...prev, kaiaBalance, krwBalance }));
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    }
  }, [state.isConnected]);

  // Claim faucet
  const claimFaucet = useCallback(async () => {
    if (!state.isConnected) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    const toastId = toast.loading('🚰 Claiming test tokens...', {
      description: 'Getting 10,000 KRW tokens for testing'
    });
    
    try {
      const hash = await hardcodedWallet.claimFaucet();
      
      toast.success('🎉 Test tokens claimed!', {
        id: toastId,
        description: `Transaction: ${hash.slice(0, 10)}...${hash.slice(-6)}`
      });
      
      // Wait and refresh balances
      setTimeout(() => {
        refreshBalances();
      }, 3000);
      
    } catch (error: any) {
      console.error('Failed to claim faucet:', error);
      toast.error('Failed to claim tokens', {
        id: toastId,
        description: error.message
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isConnected, refreshBalances]);

  // Process payment
  const processPayment = useCallback(async (
    productId: string, 
    amount: string, 
    merchantAddress: `0x${string}`
  ): Promise<`0x${string}`> => {
    if (!state.isConnected) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    const toastId = toast.loading('💳 Processing payment...', {
      description: `Paying ${amount} KAIA for ${productId}`
    });
    
    try {
      const hash = await hardcodedWallet.processPayment(productId, amount, merchantAddress);
      
      toast.success('✅ Payment successful!', {
        id: toastId,
        description: `Transaction: ${hash.slice(0, 10)}...${hash.slice(-6)}`
      });
      
      // Refresh balances after payment
      setTimeout(() => {
        refreshBalances();
      }, 3000);
      
      return hash;
    } catch (error: any) {
      console.error('Failed to process payment:', error);
      toast.error('💸 Payment failed', {
        id: toastId,
        description: error.message
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isConnected, refreshBalances]);

  // Check faucet status
  const canClaimFaucet = useCallback(async (): Promise<boolean> => {
    if (!state.isConnected) return false;
    return await hardcodedWallet.canClaimFaucet();
  }, [state.isConnected]);

  // Auto-refresh balances every 30 seconds when connected
  useEffect(() => {
    if (state.isConnected) {
      const interval = setInterval(refreshBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [state.isConnected, refreshBalances]);

  return {
    ...state,
    connect,
    disconnect,
    claimFaucet,
    processPayment,
    refreshBalances,
    canClaimFaucet,
  };
};
