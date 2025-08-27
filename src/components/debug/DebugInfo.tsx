import React from 'react';
import { useAccount } from 'wagmi';
import { KRW_CONTRACT_CONFIG } from '@/lib/contracts/krw-abi';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';

export const DebugInfo: React.FC = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div>
        <strong>Wallet:</strong> {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div>
        <strong>Address:</strong> {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'None'}
      </div>
      <div>
        <strong>KRW Contract:</strong> {KRW_CONTRACT_CONFIG.address || 'Missing!'}
      </div>
      <div>
        <strong>Payment Contract:</strong> {PAYMENT_CONTRACT_CONFIG.address || 'Missing!'}
      </div>
      <div>
        <strong>KRW Env:</strong> {import.meta.env.VITE_KRW_CONTRACT_ADDRESS ? '✅' : '❌'}
      </div>
      <div>
        <strong>Payment Env:</strong> {import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS ? '✅' : '❌'}
      </div>
    </div>
  );
};
