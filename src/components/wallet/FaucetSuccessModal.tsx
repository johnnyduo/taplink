import React from 'react';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { ExternalLink, CheckCircle, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface FaucetSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionHash: string;
}

export const FaucetSuccessModal: React.FC<FaucetSuccessModalProps> = ({
  isOpen,
  onClose,
  transactionHash
}) => {
  const [copied, setCopied] = React.useState(false);

  const explorerUrl = `https://kairos.kaiascan.io/tx/${transactionHash}`;

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy transaction hash:', error);
    }
  };

  const handleOpenExplorer = () => {
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md bg-gradient-to-br from-status-success/20 to-emerald-500/10 border-status-success/30">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-status-success/20">
                <CheckCircle className="w-6 h-6 text-status-success" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                Faucet Claim Successful!
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-text-secondary text-sm">
              ₩10,000 KRW tokens have been successfully claimed to your wallet!
            </p>

            {/* Transaction Hash */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary font-medium">
                Transaction Hash
              </label>
              <div className="flex items-center space-x-2 p-3 bg-surface-800/50 rounded-lg">
                <span className="flex-1 text-sm font-mono text-text-primary truncate">
                  {transactionHash}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title={copied ? "Copied!" : "Copy hash"}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-status-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-secondary" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <FuturisticButton
                onClick={handleOpenExplorer}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </FuturisticButton>
              <FuturisticButton
                onClick={onClose}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Close
              </FuturisticButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
