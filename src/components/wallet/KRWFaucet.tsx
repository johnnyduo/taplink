import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { KRW_CONTRACT_CONFIG } from '@/lib/contracts/krw-abi';
import { Coins, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const KRWFaucet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [countdown, setCountdown] = React.useState<string>('');
  
  // Check if user can claim from faucet
  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    ...KRW_CONTRACT_CONFIG,
    functionName: 'canClaimFaucet',
    args: address ? [address] : undefined,
  });

  // Get time until next claim
  const { data: timeUntilNextClaim, refetch: refetchTimeUntil } = useReadContract({
    ...KRW_CONTRACT_CONFIG,
    functionName: 'timeUntilNextClaim',
    args: address ? [address] : undefined,
  });

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Faucet Debug:', {
      address,
      canClaim,
      timeUntilNextClaim: timeUntilNextClaim?.toString(),
      contractAddress: KRW_CONTRACT_CONFIG.address
    });
  }, [address, canClaim, timeUntilNextClaim]);

  // Auto-refresh data every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (address && isConnected) {
        refetchCanClaim();
        refetchTimeUntil();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [address, isConnected, refetchCanClaim, refetchTimeUntil]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Format countdown timer
  React.useEffect(() => {
    if (timeUntilNextClaim && !canClaim) {
      const seconds = Number(timeUntilNextClaim);
      if (seconds > 0) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m ${remainingSeconds}s`);
        } else if (minutes > 0) {
          setCountdown(`${minutes}m ${remainingSeconds}s`);
        } else {
          setCountdown(`${remainingSeconds}s`);
        }
      } else {
        setCountdown('');
      }
    } else {
      setCountdown('');
    }
  }, [timeUntilNextClaim, canClaim]);

  const handleClaimFaucet = async () => {
    if (!address) return;

    try {
      toast.info('🚀 Claiming KRW tokens...', {
        description: 'Please confirm the transaction in your wallet'
      });

      writeContract({
        address: KRW_CONTRACT_CONFIG.address,
        abi: KRW_CONTRACT_CONFIG.abi,
        functionName: 'faucet',
      } as any);
      
    } catch (error: any) {
      console.error('Faucet claim error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else if (error.message?.includes('Faucet cooldown not met')) {
        toast.error('⏰ Faucet cooldown not met. Please wait before claiming again.');
      } else {
        toast.error('Failed to claim tokens', {
          description: error.message || 'Please try again later'
        });
      }
    }
  };

  React.useEffect(() => {
    if (isSuccess && hash) {
      toast.success('🎉 KRW tokens claimed successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...${hash.slice(-6)}`
      });
    }
  }, [isSuccess, hash]);

  if (!isConnected) {
    return null;
  }

  return (
    <FuturisticButton
      onClick={handleClaimFaucet}
      disabled={!canClaim || isPending || isConfirming}
      className={`w-full h-9 transition-all duration-300 ${
        canClaim 
          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 hover:border-emerald-400/70 text-emerald-400 hover:text-emerald-300' 
          : 'bg-surface-700/50 border-surface-600/50 text-text-tertiary cursor-not-allowed'
      }`}
    >
      {isPending || isConfirming ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span className="font-medium">{isPending ? 'Claiming...' : 'Confirming...'}</span>
        </>
      ) : canClaim ? (
        <>
          <Coins className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="font-medium">Claim ₩10,000 KRW</span>
        </>
      ) : (
        <>
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-xs">Cooldown Active</span>
            {countdown && (
              <span className="text-xs text-text-tertiary">{countdown}</span>
            )}
          </div>
        </>
      )}
    </FuturisticButton>
  );
};
