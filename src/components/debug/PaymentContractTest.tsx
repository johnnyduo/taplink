import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';
import { Card } from '@/components/ui/card';

export const PaymentContractTest: React.FC = () => {
  const { address, isConnected } = useAccount();

  // Test reading the shop owner
  const { data: shopOwner, isLoading: shopOwnerLoading, error: shopOwnerError } = useReadContract({
    ...PAYMENT_CONTRACT_CONFIG,
    functionName: 'shopOwner',
  });

  // Test reading the KRW token address
  const { data: krwToken, isLoading: krwTokenLoading, error: krwTokenError } = useReadContract({
    ...PAYMENT_CONTRACT_CONFIG,
    functionName: 'krwToken',
  });

  // Test reading payment counter
  const { data: paymentCounter, isLoading: paymentCounterLoading, error: paymentCounterError } = useReadContract({
    ...PAYMENT_CONTRACT_CONFIG,
    functionName: 'paymentCounter',
  });

  console.log('🔧 Payment Contract Test:', {
    contractAddress: PAYMENT_CONTRACT_CONFIG.address,
    shopOwner,
    shopOwnerError,
    krwToken,
    krwTokenError,
    paymentCounter: paymentCounter?.toString(),
    paymentCounterError,
  });

  return (
    <Card className="p-4 m-4">
      <h3 className="font-bold mb-4">Payment Contract Test</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Contract Address:</strong> {PAYMENT_CONTRACT_CONFIG.address || 'Not Set'}
        </div>
        
        <div>
          <strong>Shop Owner:</strong> {' '}
          {shopOwnerLoading ? '⏳' : shopOwnerError ? '❌ Error' : shopOwner || 'Not Found'}
        </div>
        
        <div>
          <strong>KRW Token:</strong> {' '}
          {krwTokenLoading ? '⏳' : krwTokenError ? '❌ Error' : krwToken || 'Not Found'}
        </div>
        
        <div>
          <strong>Payment Counter:</strong> {' '}
          {paymentCounterLoading ? '⏳' : paymentCounterError ? '❌ Error' : paymentCounter?.toString() || '0'}
        </div>

        {!isConnected && (
          <div className="text-yellow-600">
            ⚠️ Connect wallet to test contract reads
          </div>
        )}
      </div>
    </Card>
  );
};
