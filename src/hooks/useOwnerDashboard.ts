import React from 'react';
import { useAccount, useReadContract, useWatchContractEvent, usePublicClient } from 'wagmi';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';
import { formatUnits } from 'viem';

export interface PaymentEvent {
  paymentId: bigint;
  buyer: string;
  productId: string;
  amount: bigint;
  nfcId: string;
  timestamp: bigint;
  transactionHash?: string;
}

export interface DashboardStats {
  totalPayments: number;
  totalRevenue: string;
  recentPayments: PaymentEvent[];
  isLoading: boolean;
  error?: string;
}

// API configuration from environment
const KAIA_API_KEY = import.meta.env.VITE_KAIA_API_KEY;
const KAIA_API_URL = import.meta.env.VITE_KAIA_API_URL;

export const useOwnerDashboard = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [recentPayments, setRecentPayments] = React.useState<PaymentEvent[]>([]);
  const [lastUpdate, setLastUpdate] = React.useState<number>(Date.now());
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(false);

  // Fetch transactions using Kaia API
  const fetchTransactionsFromAPI = React.useCallback(async () => {
    if (!KAIA_API_KEY || !KAIA_API_URL || !PAYMENT_CONTRACT_CONFIG.address) {
      console.warn('⚠️ Kaia API key or URL not configured');
      return [];
    }

    try {
      console.log('🔍 Fetching transactions from Kaia API...');
      console.log('📍 API URL:', KAIA_API_URL);
      console.log('📍 Contract address:', PAYMENT_CONTRACT_CONFIG.address);

      // Use the working endpoint: /accounts/{address}/transactions
      const response = await fetch(`${KAIA_API_URL}/accounts/${PAYMENT_CONTRACT_CONFIG.address}/transactions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${KAIA_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 API response:', data);

      // Extract transactions from results
      const transactions = data.results || [];
      console.log(`✅ Found ${transactions.length} transactions from API`);
      
      // Log sample transaction details
      if (transactions.length > 0) {
        console.log('🔍 Sample transaction:', {
          hash: transactions[0].transaction_hash,
          from: transactions[0].from,
          to: transactions[0].to,
          datetime: transactions[0].datetime,
          method_id: transactions[0].method_id
        });
      }
      
      return transactions;
    } catch (error) {
      console.error('❌ Failed to fetch from Kaia API:', error);
      return [];
    }
  }, []);

  // Fetch historical payment events with transaction hashes from API
  const fetchPaymentEvents = React.useCallback(async () => {
    if (!publicClient || !PAYMENT_CONTRACT_CONFIG.address) return;

    setIsLoadingEvents(true);
    try {
      console.log('🔍 Fetching payment data from contract...');
      console.log('📍 Contract address:', PAYMENT_CONTRACT_CONFIG.address);
      
      // Get payment data from contract
      // @ts-ignore - Temporary fix for readContract type issue
      const recentPaymentsData = await publicClient.readContract({
        address: PAYMENT_CONTRACT_CONFIG.address,
        abi: PAYMENT_CONTRACT_CONFIG.abi,
        functionName: 'getRecentPayments',
      }) as [bigint[], `0x${string}`[], string[], bigint[], bigint[]];

      console.log('📊 Contract returned:', recentPaymentsData);

      const [paymentIds, buyers, productIds, amounts, timestamps] = recentPaymentsData;

      if (!paymentIds || paymentIds.length === 0) {
        console.log('ℹ️ No payments found');
        setRecentPayments([]);
        return;
      }

      console.log('✅ Found', paymentIds.length, 'payments in contract');

      // Fetch transaction data from Kaia API
      const apiTransactions = await fetchTransactionsFromAPI();

      // Filter only the processPayment transactions (method_id: 0xce012d37)
      const paymentTransactions = apiTransactions.filter((tx: any) => 
        tx.method_id === '0xce012d37'
      );

      console.log(`🔍 Found ${paymentTransactions.length} payment transactions from API`);
      
      // Debug: Show all payment transactions
      paymentTransactions.forEach((tx: any, index: number) => {
        console.log(`  API[${index}]: ${tx.transaction_hash?.slice(0, 10)}...${tx.transaction_hash?.slice(-6)} (Block: ${tx.block_id})`);
      });

      // Process the payment data and match with API transactions  
      const eventsWithTxHash = paymentIds.map((paymentId, index) => {
        // API returns transactions in reverse chronological order (newest first)
        // Check if payment IDs start from 0 or 1
        const paymentIdNum = Number(paymentId);
        
        // If payment IDs are 0-based (0,1,2,3,4), adjust mapping
        // If payment IDs are 1-based (1,2,3,4,5), use direct mapping
        let txIndex;
        if (paymentIds.some(id => Number(id) === 0)) {
          // 0-based: Payment ID 0 → last API transaction, Payment ID 4 → first API transaction  
          txIndex = paymentTransactions.length - 1 - paymentIdNum;
        } else {
          // 1-based: Payment ID 1 → last API transaction, Payment ID 5 → first API transaction
          txIndex = paymentTransactions.length - paymentIdNum;
        }
        
        const matchingTx = paymentTransactions[txIndex];

        console.log(`🔗 Payment ID ${paymentIdNum} → API Index ${txIndex} → TX: ${matchingTx?.transaction_hash?.slice(0, 10)}...${matchingTx?.transaction_hash?.slice(-6) || 'NOT FOUND'}`);

        return {
          paymentId,
          buyer: buyers[index],
          productId: productIds[index],
          amount: amounts[index],
          nfcId: `nfc-${paymentId.toString()}`,
          timestamp: timestamps[index],
          transactionHash: matchingTx?.transaction_hash || undefined,
        };
      });

      // Sort by payment ID (most recent first)
      eventsWithTxHash.sort((a, b) => Number(b.paymentId) - Number(a.paymentId));

      setRecentPayments(eventsWithTxHash);
      console.log('✅ Payment events loaded:', eventsWithTxHash);
      
      // Log transaction hash status
      const withHashes = eventsWithTxHash.filter(p => p.transactionHash).length;
      console.log(`🔗 ${withHashes}/${eventsWithTxHash.length} payments have transaction hashes from API`);

    } catch (error) {
      console.error('❌ Failed to fetch payment data:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [publicClient, fetchTransactionsFromAPI]);

  // Enhanced API transaction fetching with specific contract filtering
  const fetchContractTransactions = React.useCallback(async () => {
    if (!KAIA_API_KEY || !KAIA_API_URL || !PAYMENT_CONTRACT_CONFIG.address) {
      console.warn('⚠️ Missing API configuration');
      return [];
    }

    try {
      console.log('🔍 Fetching contract transactions from Kaia API...');
      
      // Use the working endpoint
      const response = await fetch(`${KAIA_API_URL}/accounts/${PAYMENT_CONTRACT_CONFIG.address}/transactions`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${KAIA_API_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 API response:`, data);
        
        const transactions = data.results || [];
        console.log(`✅ Found ${transactions.length} contract transactions`);
        
        // Show transaction hashes for verification
        transactions.forEach((tx: any, index: number) => {
          console.log(`Transaction ${index + 1}:`, {
            hash: tx.transaction_hash,
            from: tx.from,
            datetime: tx.datetime,
            method_id: tx.method_id
          });
        });
        
        return transactions;
      } else {
        console.log(`⚠️ API returned ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to fetch contract transactions:', error);
      return [];
    }
  }, []);

  // Effect to fetch data on mount and when dependencies change
  React.useEffect(() => {
    if (isConnected && publicClient) {
      fetchPaymentEvents();
    }
  }, [fetchPaymentEvents, isConnected, publicClient]);

  // Watch for new payment events
  useWatchContractEvent({
    address: PAYMENT_CONTRACT_CONFIG.address,
    abi: PAYMENT_CONTRACT_CONFIG.abi,
    eventName: 'PaymentProcessed',
    onLogs: (logs) => {
      console.log('🔔 New payment event detected, refreshing dashboard...');
      fetchPaymentEvents(); // Refresh the data
      setLastUpdate(Date.now());
    },
  });

  // Read total payments from contract
  const { data: totalPayments = 0, isLoading: isLoadingPayments } = useReadContract({
    address: PAYMENT_CONTRACT_CONFIG.address,
    abi: PAYMENT_CONTRACT_CONFIG.abi,
    functionName: 'paymentCounter',
    query: { enabled: isConnected }
  });

  // Calculate dashboard stats
  const stats: DashboardStats = React.useMemo(() => {
    // Calculate total revenue from recent payments
    const totalRevenueAmount = recentPayments.reduce((sum, payment) => sum + payment.amount, BigInt(0));
    
    return {
      totalPayments: Number(totalPayments),
      totalRevenue: formatUnits(totalRevenueAmount, 18), // Assuming 18 decimals for KAIA
      recentPayments,
      isLoading: isLoadingPayments || isLoadingEvents,
      error: undefined,
    };
  }, [totalPayments, recentPayments, isLoadingPayments, isLoadingEvents]);

  // Return dashboard data with refresh function
  return {
    ...stats,
    refresh: fetchPaymentEvents,
    refreshTransactions: fetchContractTransactions,
    lastUpdate,
    isConnected,
  };
};
