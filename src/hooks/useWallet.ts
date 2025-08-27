import React from 'react';
import { useAccount, useBalance, useDisconnect, useReadContract } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { KRW_CONTRACT_CONFIG } from '@/lib/contracts/krw-abi';
import { formatUnits } from 'viem';

export const useWallet = () => {
  const { address, isConnected, chain, status } = useAccount();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  });
  
  // KRW Token Balance
  const { data: krwBalance, isLoading: krwBalanceLoading, error: krwBalanceError } = useReadContract({
    ...KRW_CONTRACT_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('💰 Balance Debug:', {
      address,
      krwBalance: krwBalance?.toString(),
      krwBalanceLoading,
      krwBalanceError,
      contractAddress: KRW_CONTRACT_CONFIG.address,
      isConnected
    });
  }, [address, krwBalance, krwBalanceLoading, krwBalanceError, isConnected]);

  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const formatAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance?: string) => {
    if (!balance) return '0.0000';
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  const formatKrwBalance = (balance?: bigint) => {
    if (!balance) return '0';
    const formatted = formatUnits(balance, 18);
    const num = parseFloat(formatted);
    if (num === 0) return '0';
    if (num < 1) return num.toFixed(4);
    return num.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      return true;
    }
    return false;
  };

  const openExplorer = () => {
    if (address && chain?.blockExplorers?.default) {
      window.open(`${chain.blockExplorers.default.url}/account/${address}`, '_blank');
    }
  };

  return {
    // Account info
    address,
    isConnected,
    chain,
    status,
    
    // Balance info
    balance: balance ? {
      ...balance,
      formatted: formatBalance(balance.formatted)
    } : null,
    balanceLoading,
    
    // KRW Token Balance
    krwBalance: krwBalance ? {
      raw: krwBalance,
      formatted: formatKrwBalance(krwBalance),
      symbol: 'KRW'
    } : null,
    krwBalanceLoading,
    
    // Formatted helpers
    formattedAddress: formatAddress(address),
    
    // Network info
    networkName: chain?.name || 'Unknown Network',
    isKaiaTestnet: chain?.id === 1001,
    
    // Actions
    connect: () => open(),
    disconnect,
    copyAddress,
    openExplorer,
  };
};
