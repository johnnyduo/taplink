import React from 'react';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { useWallet } from '@/hooks/useWallet';
import { Coins, ExternalLink } from 'lucide-react';

export const KRWFaucet: React.FC = () => {
  const { address, isConnected } = useWallet();

  const openContractOnExplorer = () => {
    const contractAddress = import.meta.env.VITE_KRW_CONTRACT_ADDRESS;
    const explorerUrl = `https://kairos.kaiascan.io/account/${contractAddress}`;
    window.open(explorerUrl, '_blank');
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-xs font-medium text-text-primary">KRW Test Faucet</h3>
            <p className="text-xs text-text-tertiary">Get test KRW tokens</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <FuturisticButton
          variant="secondary"
          size="sm"
          onClick={openContractOnExplorer}
          className="w-full text-xs"
        >
          <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
          <span className="leading-none">View Contract on Explorer</span>
        </FuturisticButton>
        
        <p className="text-xs text-text-tertiary text-center">
          Use contract methods directly on Kaiascan to claim test tokens
        </p>
      </div>
    </div>
  );
};
