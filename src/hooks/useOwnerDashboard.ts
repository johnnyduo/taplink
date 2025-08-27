import React from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';
import { formatUnits } from 'viem';

export interface PaymentEvent {
  paymentId: bigint;
  buyer: string;
  productId: string;
  amount: bigint;
  nfcId: string;
  timestamp: bigint;
}

export interface DashboardStats {
  totalPayments: number;
  totalRevenue: string;
  recentPayments: PaymentEvent[];
  isLoading: boolean;
  error?: string;
}

export const useOwnerDashboard = () => {
  const { address, isConnected } = useAccount();
  const [recentPayments, setRecentPayments] = React.useState<PaymentEvent[]>([]);
  const [lastUpdate, setLastUpdate] = React.useState<number>(Date.now());

  // Get payment counter (total number of payments)
  const { 
    data: paymentCounter, 
    isLoading: paymentCounterLoading,
    error: paymentCounterError,
    refetch: refetchPaymentCounter 
  } = useReadContract({
    ...PAYMENT_CONTRACT_CONFIG,
    functionName: 'paymentCounter',
  });

  // Get recent payments data
  const { 
    data: recentPaymentsData, 
    isLoading: recentPaymentsLoading,
    error: recentPaymentsError,
    refetch: refetchRecentPayments 
  } = useReadContract({
    ...PAYMENT_CONTRACT_CONFIG,
    functionName: 'getRecentPayments',
  });

  // Watch for new payment events in real-time
  useWatchContractEvent({
    ...PAYMENT_CONTRACT_CONFIG,
    eventName: 'PaymentProcessed',
    onLogs: (logs) => {
      console.log('🎉 New Payment Event:', logs);
      
      // Add new payments to the list
      const newPayments = logs.map(log => ({
        paymentId: log.args.paymentId as bigint,
        buyer: log.args.buyer as string,
        productId: log.args.productId as string,
        amount: log.args.amount as bigint,
        nfcId: log.args.nfcId as string,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
      }));

      setRecentPayments(prev => [...newPayments, ...prev].slice(0, 20)); // Keep latest 20
      setLastUpdate(Date.now());
      
      // Refresh contract data
      refetchPaymentCounter();
      refetchRecentPayments();
    },
  });

  // Process recent payments data from contract
  React.useEffect(() => {
    if (recentPaymentsData) {
      const [paymentIds, buyers, productIds, amounts, timestamps] = recentPaymentsData as [
        readonly bigint[],
        readonly string[],
        readonly string[],
        readonly bigint[],
        readonly bigint[]
      ];

      const payments: PaymentEvent[] = paymentIds.map((id, index) => ({
        paymentId: id,
        buyer: buyers[index],
        productId: productIds[index],
        amount: amounts[index],
        nfcId: '', // NFC ID not returned by getRecentPayments, would need individual payment lookup
        timestamp: timestamps[index],
      }));

      // Only update if we don't have real-time data yet
      if (recentPayments.length === 0) {
        setRecentPayments(payments);
      }
    }
  }, [recentPaymentsData]);

  // Calculate total revenue
  const totalRevenue = React.useMemo(() => {
    if (!recentPayments.length) return '0';
    
    const total = recentPayments.reduce((sum, payment) => sum + payment.amount, BigInt(0));
    return formatUnits(total, 18);
  }, [recentPayments]);

  // Manual refresh function
  const refreshData = React.useCallback(() => {
    refetchPaymentCounter();
    refetchRecentPayments();
    setLastUpdate(Date.now());
  }, [refetchPaymentCounter, refetchRecentPayments]);

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const dashboardStats: DashboardStats = {
    totalPayments: paymentCounter ? Number(paymentCounter) : 0,
    totalRevenue,
    recentPayments,
    isLoading: paymentCounterLoading || recentPaymentsLoading,
    error: paymentCounterError?.message || recentPaymentsError?.message,
  };

  return {
    ...dashboardStats,
    refreshData,
    lastUpdate,
    isConnected,
  };
};
