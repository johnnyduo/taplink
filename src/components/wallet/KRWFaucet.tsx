import React from 'react';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { useHardcodedWallet } from '@/hooks/useHardcodedWallet';
import { Coins, Clock, Loader2 } from 'lucide-react';

export const KRWFaucet: React.FC = () => {
  const { isConnected, isLoading, canClaimFaucet, claimFaucet } = useHardcodedWallet();
  const [canClaim, setCanClaim] = React.useState(false);
  const [countdown, setCountdown] = React.useState<string>('');

  // Check faucet eligibility
  React.useEffect(() => {
    const checkEligibility = async () => {
      if (isConnected) {
        try {
          const eligible = await canClaimFaucet();
          setCanClaim(eligible);
        } catch (error) {
          console.error('Failed to check faucet eligibility:', error);
          setCanClaim(false);
        }
      }
    };

    checkEligibility();
    
    // Check every 10 seconds
    const interval = setInterval(checkEligibility, 10000);
    return () => clearInterval(interval);
  }, [isConnected, canClaimFaucet]);

  const handleClaimFaucet = async () => {
    if (!isConnected || !canClaim || isLoading) return;
    
    try {
      await claimFaucet();
      // Refresh eligibility after claim
      setTimeout(async () => {
        try {
          const eligible = await canClaimFaucet();
          setCanClaim(eligible);
        } catch (error) {
          console.error('Failed to refresh faucet status:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Faucet claim failed:', error);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <FuturisticButton
      onClick={handleClaimFaucet}
      disabled={!canClaim || isLoading}
      className={`w-full h-9 transition-all duration-300 ${
        canClaim 
          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 hover:border-emerald-400/70 text-emerald-400 hover:text-emerald-300' 
          : 'bg-surface-700/50 border-surface-600/50 text-text-tertiary cursor-not-allowed'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span className="font-medium">Claiming...</span>
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
