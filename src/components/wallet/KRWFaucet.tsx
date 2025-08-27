import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { KRW_CONTRACT_CONFIG } from '@/lib/contracts';
import { Coins, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseUnits } from 'viem';

export const KRWFaucet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [lastClaim, setLastClaim] = React.useState<number>(0);
  const [countdown, setCountdown] = React.useState<string>('');
  
  const COOLDOWN_HOURS = 24; // 24 hour cooldown
  const FAUCET_AMOUNT = '10000'; // 10,000 KRW
  
  // Check cooldown locally (since contract doesn't have cooldown tracking)
  const canClaim = React.useMemo(() => {
    if (!lastClaim) return true;
    const now = Date.now();
    const timeSinceLastClaim = now - lastClaim;
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
    return timeSinceLastClaim >= cooldownMs;
  }, [lastClaim]);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Update countdown timer
  React.useEffect(() => {
    if (!canClaim && lastClaim) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeSinceLastClaim = now - lastClaim;
        const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
        const timeRemaining = Math.max(0, cooldownMs - timeSinceLastClaim);
        
        if (timeRemaining > 0) {
          const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
          const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
          const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
          
          if (hours > 0) {
            setCountdown(`${hours}h ${minutes}m ${seconds}s`);
          } else if (minutes > 0) {
            setCountdown(`${minutes}m ${seconds}s`);
          } else {
            setCountdown(`${seconds}s`);
          }
        } else {
          setCountdown('');
        }
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setCountdown('');
    }
  }, [canClaim, lastClaim]);

  // Load last claim time from localStorage
  React.useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`faucet-last-claim-${address}`);
      if (stored) {
        setLastClaim(parseInt(stored));
      }
    }
  }, [address]);

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
        args: [address, parseUnits(FAUCET_AMOUNT, 18)],
      });
      
    } catch (error: any) {
      console.error('Faucet claim error:', error);
      
      if (error.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user');
      } else {
        toast.error('Failed to claim tokens', {
          description: error.message || 'Please try again later'
        });
      }
    }
  };

  React.useEffect(() => {
    if (isSuccess && hash && address) {
      const now = Date.now();
      setLastClaim(now);
      localStorage.setItem(`faucet-last-claim-${address}`, now.toString());
      
      toast.success('🎉 KRW tokens claimed successfully!', {
        description: `₩${FAUCET_AMOUNT} KRW added to your wallet`
      });
    }
  }, [isSuccess, hash, address]);

  if (!isConnected) {
    return null;
  }

  return (
    <FuturisticButton
      onClick={handleClaimFaucet}
      disabled={!canClaim || isPending || isConfirming}
      className={`w-full h-12 transition-all duration-300 ${
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
          <span className="font-medium">Claim ₩{FAUCET_AMOUNT} KRW</span>
        </>
      ) : (
        <>
          <Coins className="w-4 h-4 mr-2 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-xs">Next claim in:</span>
            {countdown && (
              <span className="text-xs text-text-tertiary">{countdown}</span>
            )}
          </div>
        </>
      )}
    </FuturisticButton>
  );
};
