import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';

export interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
  method: 'bank_transfer' | 'crypto' | 'paypal';
  destination: string;
  fee: number;
  notes?: string;
}

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPayout: (request: Omit<PayoutRequest, 'id' | 'requestedAt' | 'status'>) => void;
  availableBalance: number;
  currency: string;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  isOpen,
  onClose,
  onSubmitPayout,
  availableBalance,
  currency
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer' as PayoutRequest['method'],
    destination: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const payoutMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer', fee: 0.5, minAmount: 10000 },
    { value: 'crypto', label: 'Cryptocurrency', fee: 0.1, minAmount: 5000 },
    { value: 'paypal', label: 'PayPal', fee: 2.9, minAmount: 1000 },
  ];

  const selectedMethod = payoutMethods.find(m => m.value === formData.method);
  const amount = Number(formData.amount) || 0;
  const feeAmount = selectedMethod ? (amount * selectedMethod.fee) / 100 : 0;
  const netAmount = amount - feeAmount;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Valid amount is required';
    } else if (amount > availableBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    } else if (selectedMethod && amount < selectedMethod.minAmount) {
      newErrors.amount = `Minimum amount is ${currency}${selectedMethod.minAmount.toLocaleString()}`;
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedMethod) return;

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubmitPayout({
        amount,
        currency,
        method: formData.method,
        destination: formData.destination,
        fee: feeAmount,
        notes: formData.notes,
        processedAt: undefined,
      });

      handleClose();
    } catch (error) {
      console.error('Payout request failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      method: 'bank_transfer',
      destination: '',
      notes: '',
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ArrowUpRight className="w-5 h-5 text-primary" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Transfer funds from your vault to your preferred payment method
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Balance Overview */}
          <GlassCard className="p-4 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-text-secondary text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-primary">
                    {currency}{availableBalance.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-text-secondary text-sm">After Payout</p>
                <p className="text-lg font-semibold text-text-primary">
                  {currency}{(availableBalance - amount).toLocaleString()}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Payout Details */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payout Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount ({currency}) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="100000"
                  min="0"
                  step="1000"
                  className={errors.amount ? 'border-status-danger' : ''}
                />
                {errors.amount && <p className="text-status-danger text-sm mt-1">{errors.amount}</p>}
              </div>

              <div>
                <Label htmlFor="method">Payment Method *</Label>
                <Select value={formData.method} onValueChange={(value: PayoutRequest['method']) => handleInputChange('method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {payoutMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{method.label}</span>
                          <span className="text-xs text-text-secondary ml-2">
                            {method.fee}% fee
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="destination">
                  Destination {formData.method === 'bank_transfer' ? 'Account' : 
                              formData.method === 'crypto' ? 'Wallet Address' : 'Email'} *
                </Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder={
                    formData.method === 'bank_transfer' ? '1234-5678-9012-3456' :
                    formData.method === 'crypto' ? '0x742d35Cc6634C0532925a3b8D404' :
                    'user@example.com'
                  }
                  className={errors.destination ? 'border-status-danger' : ''}
                />
                {errors.destination && <p className="text-status-danger text-sm mt-1">{errors.destination}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or reference..."
                />
              </div>
            </div>
          </GlassCard>

          {/* Fee Breakdown */}
          {selectedMethod && amount > 0 && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fee Breakdown
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Payout Amount</span>
                  <span className="text-text-primary font-medium">
                    {currency}{amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Processing Fee ({selectedMethod.fee}%)
                  </span>
                  <span className="text-status-warning font-medium">
                    -{currency}{feeAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="border-t border-surface-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-text-primary font-semibold">Net Amount</span>
                    <span className="text-primary font-bold text-lg">
                      {currency}{netAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-surface-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Processing time: {
                      formData.method === 'bank_transfer' ? '1-3 business days' :
                      formData.method === 'crypto' ? '10-30 minutes' :
                      '24-48 hours'
                    }
                  </span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Warnings */}
          {amount > availableBalance * 0.8 && (
            <Alert className="border-status-warning bg-status-warning/10">
              <AlertCircle className="h-4 w-4 text-status-warning" />
              <AlertDescription className="text-status-warning">
                You're withdrawing a large portion of your balance. Consider keeping some funds for operational expenses.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-between">
            <FuturisticButton 
              type="button" 
              variant="ghost" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </FuturisticButton>
            <FuturisticButton 
              type="submit" 
              variant="primary"
              disabled={!formData.amount || !formData.destination || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? 'Processing...' : `Request ${currency}${netAmount.toLocaleString()}`}
            </FuturisticButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
