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
  Package, 
  Tag, 
  DollarSign, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { Product } from './AddProductModal';

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
  onBulkUpdate: (productIds: string[], updates: Partial<Product>) => void;
  onBulkDelete: (productIds: string[]) => void;
  categories: string[];
}

type BulkActionType = 'update-price' | 'update-category' | 'update-stock' | 'update-threshold' | 'delete';

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedProducts,
  onBulkUpdate,
  onBulkDelete,
  categories
}) => {
  const [actionType, setActionType] = useState<BulkActionType | ''>('');
  const [priceAdjustment, setPriceAdjustment] = useState<'increase' | 'decrease' | 'set'>('increase');
  const [priceValue, setPriceValue] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [stockAdjustment, setStockAdjustment] = useState<'add' | 'subtract' | 'set'>('add');
  const [stockValue, setStockValue] = useState('');
  const [thresholdValue, setThresholdValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async () => {
    if (!actionType) return;

    setIsSubmitting(true);
    const productIds = selectedProducts.map(p => p.productID);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (actionType === 'delete') {
        onBulkDelete(productIds);
      } else {
        let updates: Partial<Product> = {};

        switch (actionType) {
          case 'update-price':
            if (priceValue) {
              const value = Number(priceValue);
              updates.priceKRW = priceAdjustment === 'set' 
                ? value 
                : priceAdjustment === 'increase' 
                  ? undefined // Will be calculated per product
                  : undefined; // Will be calculated per product
            }
            break;
          
          case 'update-category':
            if (newCategory) {
              updates.category = newCategory;
            }
            break;
          
          case 'update-stock':
            if (stockValue) {
              const value = Number(stockValue);
              updates.stock = stockAdjustment === 'set' 
                ? value 
                : undefined; // Will be calculated per product
            }
            break;
          
          case 'update-threshold':
            if (thresholdValue) {
              updates.threshold = Number(thresholdValue);
            }
            break;
        }

        // For percentage/relative changes, handle individually
        if (actionType === 'update-price' && priceAdjustment !== 'set') {
          const value = Number(priceValue);
          selectedProducts.forEach(product => {
            const adjustment = priceAdjustment === 'increase' 
              ? product.priceKRW + value
              : product.priceKRW - value;
            onBulkUpdate([product.productID], { priceKRW: Math.max(0, adjustment) });
          });
        } else if (actionType === 'update-stock' && stockAdjustment !== 'set') {
          const value = Number(stockValue);
          selectedProducts.forEach(product => {
            const adjustment = stockAdjustment === 'add' 
              ? product.stock + value
              : product.stock - value;
            onBulkUpdate([product.productID], { stock: Math.max(0, adjustment) });
          });
        } else {
          onBulkUpdate(productIds, updates);
        }
      }

      handleClose();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActionType('');
    setPriceValue('');
    setNewCategory('');
    setStockValue('');
    setThresholdValue('');
    setIsSubmitting(false);
    setShowConfirmation(false);
    onClose();
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'update-price':
        return `${priceAdjustment === 'set' ? 'Set' : priceAdjustment === 'increase' ? 'Increase' : 'Decrease'} prices for ${selectedProducts.length} products`;
      case 'update-category':
        return `Change category to "${newCategory}" for ${selectedProducts.length} products`;
      case 'update-stock':
        return `${stockAdjustment === 'set' ? 'Set' : stockAdjustment === 'add' ? 'Add' : 'Remove'} stock for ${selectedProducts.length} products`;
      case 'update-threshold':
        return `Set low stock threshold to ${thresholdValue} for ${selectedProducts.length} products`;
      case 'delete':
        return `Delete ${selectedProducts.length} products permanently`;
      default:
        return '';
    }
  };

  const canProceed = () => {
    switch (actionType) {
      case 'update-price':
        return priceValue && Number(priceValue) >= 0;
      case 'update-category':
        return newCategory;
      case 'update-stock':
        return stockValue && Number(stockValue) >= 0;
      case 'update-threshold':
        return thresholdValue && Number(thresholdValue) >= 0;
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Bulk Actions
          </DialogTitle>
          <DialogDescription>
            Apply changes to {selectedProducts.length} selected products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Products Summary */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Selected Products ({selectedProducts.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {selectedProducts.map((product) => (
                <Badge key={product.productID} variant="secondary" className="text-xs">
                  {product.name}
                </Badge>
              ))}
            </div>
          </GlassCard>

          {/* Action Selection */}
          <div>
            <Label htmlFor="actionType">Select Action</Label>
            <Select value={actionType} onValueChange={(value: BulkActionType) => setActionType(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update-price">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Update Prices
                  </div>
                </SelectItem>
                <SelectItem value="update-category">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Change Category
                  </div>
                </SelectItem>
                <SelectItem value="update-stock">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Adjust Stock
                  </div>
                </SelectItem>
                <SelectItem value="update-threshold">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Set Low Stock Threshold
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2 text-status-danger">
                    <Trash2 className="w-4 h-4" />
                    Delete Products
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action-specific Configuration */}
          {actionType === 'update-price' && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-text-primary mb-4">Price Update Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Adjustment Type</Label>
                  <Select value={priceAdjustment} onValueChange={(value: 'increase' | 'decrease' | 'set') => setPriceAdjustment(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase by Amount</SelectItem>
                      <SelectItem value="decrease">Decrease by Amount</SelectItem>
                      <SelectItem value="set">Set to Fixed Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount (KRW)</Label>
                  <Input
                    type="number"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    placeholder="1000"
                    min="0"
                    step="100"
                    className="mt-2"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {actionType === 'update-category' && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-text-primary mb-4">Category Update</h3>
              <div>
                <Label>New Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select new category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'all').map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>
          )}

          {actionType === 'update-stock' && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-text-primary mb-4">Stock Adjustment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Adjustment Type</Label>
                  <Select value={stockAdjustment} onValueChange={(value: 'add' | 'subtract' | 'set') => setStockAdjustment(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add Stock</SelectItem>
                      <SelectItem value="subtract">Remove Stock</SelectItem>
                      <SelectItem value="set">Set to Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={stockValue}
                    onChange={(e) => setStockValue(e.target.value)}
                    placeholder="10"
                    min="0"
                    className="mt-2"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {actionType === 'update-threshold' && (
            <GlassCard className="p-4">
              <h3 className="font-semibold text-text-primary mb-4">Low Stock Threshold</h3>
              <div>
                <Label>Threshold Quantity</Label>
                <Input
                  type="number"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  placeholder="5"
                  min="0"
                  className="mt-2"
                />
              </div>
            </GlassCard>
          )}

          {actionType === 'delete' && (
            <Alert className="border-status-danger bg-status-danger/10">
              <AlertCircle className="h-4 w-4 text-status-danger" />
              <AlertDescription className="text-status-danger">
                <strong>Warning:</strong> This action will permanently delete {selectedProducts.length} products. 
                This cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation */}
          {actionType && !showConfirmation && (
            <div className="p-4 bg-surface-800 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Action Preview</span>
              </div>
              <p className="text-text-secondary mt-2">{getActionDescription()}</p>
            </div>
          )}
        </div>

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
            onClick={handleSubmit}
            variant={actionType === 'delete' ? 'danger' : 'primary'}
            disabled={!canProceed() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : (
              actionType === 'delete' ? 'Delete Products' : 'Apply Changes'
            )}
          </FuturisticButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
