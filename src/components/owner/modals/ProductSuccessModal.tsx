import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Copy, Check, ExternalLink, Package } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

interface ProductSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  transactionHash: string;
  explorerUrl: string;
}

export const ProductSuccessModal: React.FC<ProductSuccessModalProps> = ({
  isOpen,
  onClose,
  productName,
  transactionHash,
  explorerUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const openExplorer = () => {
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-full bg-green-500/10">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-xl text-green-500 mb-1">
                Product Added Successfully!
              </DialogTitle>
              <DialogDescription className="text-base">
                Your product has been successfully added to the blockchain and is now available for NFC payments.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <GlassCard className="space-y-6 p-6">
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2 text-primary" />
              Product
            </h3>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {productName}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center">
              <ExternalLink className="w-4 h-4 mr-2 text-primary" />
              Transaction Hash
            </h3>
            <div className="flex items-center space-x-3 p-3 bg-surface-card rounded-lg">
              <code className="flex-1 text-sm font-mono text-text-secondary break-all">
                {transactionHash.slice(0, 16)}...{transactionHash.slice(-16)}
              </code>
              <button
                onClick={() => copyToClipboard(transactionHash, 'Transaction hash')}
                className="p-2 hover:bg-surface-elevated rounded-md text-text-tertiary hover:text-text-secondary transition-all duration-200 flex-shrink-0"
                title="Copy transaction hash"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <FuturisticButton
              variant="secondary"
              onClick={openExplorer}
              className="flex-1 h-12 text-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </FuturisticButton>
            <FuturisticButton
              variant="primary"
              onClick={onClose}
              className="flex-1 h-12 text-sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Done
            </FuturisticButton>
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
};
