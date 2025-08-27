
import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Download, Share2, Copy, ExternalLink, Sparkles } from 'lucide-react';

interface ReceiptNFTProps {
  receiptData: {
    transactionId: string;
    productName: string;
    amount: number;
    currency: string;
    merchantName: string;
    timestamp: string;
    nftTokenId: string;
  };
  onClose: () => void;
}

const ReceiptNFT: React.FC<ReceiptNFTProps> = ({ receiptData, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const copyTokenId = () => {
    navigator.clipboard.writeText(receiptData.nftTokenId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    // Mock download functionality
    console.log('Downloading receipt...', receiptData);
  };

  const shareReceipt = () => {
    // Mock share functionality
    console.log('Sharing receipt...', receiptData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/90 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 animate-slide-up">
        {/* NFT Card Animation */}
        <div className={`relative mb-6 ${isAnimating ? 'animate-mint-flip' : ''}`}>
          <div className="aspect-[4/3] rounded-xl bg-gradient-panel p-6 relative overflow-hidden">
            {/* Holographic Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-violet/10"></div>
            
            {/* Particle Effect */}
            {isAnimating && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-accent-cyan rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-accent-cyan" />
                  <span className="text-sm font-medium text-text-secondary">Receipt NFT</span>
                </div>
                <span className="text-xs font-mono text-text-tertiary">#{receiptData.nftTokenId.slice(-6)}</span>
              </div>

              <h3 className="text-lg font-display font-bold text-text-primary mb-2">
                {receiptData.productName}
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-display font-bold text-accent-cyan">
                    {receiptData.currency}{receiptData.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-text-secondary">{receiptData.merchantName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-tertiary">
                    {new Date(receiptData.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(receiptData.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h2 className="text-display text-xl font-bold text-status-success mb-2">
            Receipt Minted!
          </h2>
          <p className="text-text-secondary">
            Your purchase proof has been secured on the blockchain
          </p>
        </div>

        {/* Token Details */}
        <div className="p-4 rounded-xl bg-surface-700/30 border border-glass-1 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Token ID</p>
              <p className="font-mono text-sm text-text-primary">{receiptData.nftTokenId}</p>
            </div>
            <FuturisticButton
              variant="ghost"
              size="sm"
              onClick={copyTokenId}
            >
              {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
            </FuturisticButton>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <FuturisticButton variant="secondary" size="sm" onClick={downloadReceipt}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </FuturisticButton>
          <FuturisticButton variant="secondary" size="sm" onClick={shareReceipt}>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </FuturisticButton>
          <FuturisticButton variant="secondary" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </FuturisticButton>
        </div>

        <FuturisticButton variant="primary" className="w-full" onClick={onClose}>
          Complete
        </FuturisticButton>
      </GlassCard>
    </div>
  );
};

export default ReceiptNFT;
