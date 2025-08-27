import { useCallback, useEffect, useState } from 'react';
import { hardcodedWallet } from '@/lib/hardcodedWallet';
import { toast } from 'sonner';

export interface HardcodedWalletState {
  kaiaBalance: string;
  krwBalance: string;
  isLoading: boolean;
  isConnected: boolean;
  faucetSuccess: {
    isOpen: boolean;
    transactionHash: string;
  };
}

export interface UseHardcodedWalletResult extends HardcodedWalletState {
  address: string;
  shortAddress: string;
  connect: () => void;
  disconnect: () => void;
  claimFaucet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  processPayment: (productId: string, amount: string, merchantAddress: `0x${string}`) => Promise<`0x${string}`>;
  canClaimFaucet: () => Promise<boolean>;
  closeFaucetModal: () => void;
}

export const useHardcodedWallet = (): UseHardcodedWalletResult => {
  const [state, setState] = useState<HardcodedWalletState>({
    kaiaBalance: '0',
    krwBalance: '0',
    isLoading: false,
    isConnected: false,
    faucetSuccess: {
      isOpen: false,
      transactionHash: '',
    },
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
    
    try {
      const hash = await hardcodedWallet.claimFaucet();
      
      // Show success modal instead of toast
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        faucetSuccess: {
          isOpen: true,
          transactionHash: hash,
        }
      }));
      
      // Wait and refresh balances
      setTimeout(() => {
        refreshBalances();
      }, 3000);
      
    } catch (error: any) {
      console.error('Failed to claim faucet:', error);
      toast.error('Failed to claim tokens', {
        description: error.message
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isConnected, refreshBalances]);

  // Close faucet modal
  const closeFaucetModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      faucetSuccess: {
        isOpen: false,
        transactionHash: '',
      }
    }));
  }, []);

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
    
    try {
      const hash = await hardcodedWallet.processPayment(productId, amount, merchantAddress);
      
      // Refresh balances after payment
      setTimeout(() => {
        refreshBalances();
      }, 3000);
      
      return hash;
    } catch (error: any) {
      console.error('Failed to process payment:', error);
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
    address: hardcodedWallet.address,
    shortAddress: hardcodedWallet.getWalletInfo().shortAddress,
    connect,
    disconnect,
    claimFaucet,
    processPayment,
    refreshBalances,
    canClaimFaucet,
    closeFaucetModal,
  };
};
