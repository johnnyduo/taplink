import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlassCard } from '@/components/ui/glass-card';
import { Loader2, Package, ExternalLink } from 'lucide-react';

interface ProductLoadingModalProps {
  isOpen: boolean;
  productName: string;
  transactionHash?: string;
  stage: 'submitting' | 'confirming';
}

export const ProductLoadingModal: React.FC<ProductLoadingModalProps> = ({
  isOpen,
  productName,
  transactionHash,
  stage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Package className="w-6 h-6 text-primary" />
              <div className="absolute -inset-1">
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
              </div>
            </div>
            <DialogTitle className="text-primary">
              {stage === 'submitting' ? 'Adding Product to Blockchain' : 'Confirming Transaction'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {stage === 'submitting' 
              ? 'Please confirm the transaction in your wallet'
              : 'Waiting for blockchain confirmation...'
            }
          </DialogDescription>
        </DialogHeader>

        <GlassCard className="space-y-4">
          <div>
            <h3 className="font-medium text-text-primary mb-2">Product</h3>
            <div className="bg-surface-card px-3 py-2 rounded text-sm text-text-secondary">
              {productName}
            </div>
          </div>

          {transactionHash && (
            <div>
              <h3 className="font-medium text-text-primary mb-2">Transaction Hash</h3>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-surface-elevated px-3 py-2 rounded text-xs font-mono text-text-secondary">
                  {transactionHash.slice(0, 10)}...{transactionHash.slice(-10)}
                </code>
                <a
                  href={`${import.meta.env.VITE_KAIA_KAIROS_EXPLORER}/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener,noreferrer"
                  className="p-2 hover:bg-surface-card rounded text-text-tertiary hover:text-text-secondary transition-colors"
                  title="View on explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-text-secondary">
              {stage === 'submitting' ? 'Waiting for wallet confirmation...' : 'Processing on blockchain...'}
            </span>
          </div>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
};
