import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Badge } from '@/components/ui/badge';
import { Upload, Package, Tag, DollarSign, Warehouse, AlertCircle, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';
import { parseEther } from 'viem';
import { toast } from 'sonner';

export interface Product {
  productID: string;
  sku: string;
  name: string;
  description?: string;
  priceKRW: number;
  stock: number;
  threshold: number;
  batchID: string;
  writableTag: boolean;
  tagType: string;
  image: string;
  category: string;
  lastUpdated: string;
  cost?: number;
  vendor?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  tags?: string[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Omit<Product, 'productID' | 'lastUpdated'>) => void;
  categories: string[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories
}) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    priceKRW: '',
    cost: '',
    stock: '',
    threshold: '5',
    batchID: '',
    writableTag: true,
    tagType: 'NTAG215',
    image: '/placeholder.svg',
    category: '',
    vendor: '',
    barcode: '',
    weight: '',
    dimensions: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Contract interaction hooks
  const { writeContract, data: hash, isPending: isContractPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isSubmitting = isContractPending || isConfirming;

  // Handle successful contract transaction
  useEffect(() => {
    if (isSuccess) {
      toast.success('🎉 Product added to contract!', {
        description: `${formData.name} is now available for NFC payments`
      });
      
      // Create product object for local state
      const newProduct = {
        ...formData,
        priceKRW: Number(formData.priceKRW),
        cost: formData.cost ? Number(formData.cost) : undefined,
        stock: Number(formData.stock),
        threshold: Number(formData.threshold),
        weight: formData.weight ? Number(formData.weight) : undefined,
        batchID: formData.batchID || `BATCH${Date.now()}`,
      };

      onAdd(newProduct);
      handleClose();
    }
  }, [isSuccess, formData, onAdd]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.priceKRW || Number(formData.priceKRW) <= 0) {
      newErrors.priceKRW = 'Valid price is required';
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Generate product ID from SKU
      const productId = formData.sku.trim().toUpperCase();
      const productName = formData.name.trim();
      const priceKRW = Number(formData.priceKRW);
      const stock = Number(formData.stock);

      // Convert KRW price to wei (18 decimals)
      const priceInWei = parseEther(priceKRW.toString());

      console.log('🏪 Adding product to contract:', {
        productId,
        name: productName,
        price: `${priceKRW} KRW (${priceInWei.toString()} wei)`,
        stock
      });

      // Call smart contract addProduct function
      writeContract({
        address: PAYMENT_CONTRACT_CONFIG.address,
        abi: PAYMENT_CONTRACT_CONFIG.abi,
        functionName: 'addProduct',
        args: [
          productId,
          productName,
          priceInWei,
          BigInt(stock)
        ],
      } as any);

    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product', {
        description: error.message || 'Please check your inputs and try again'
      });
    }
  };

  const handleClose = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      priceKRW: '',
      cost: '',
      stock: '',
      threshold: '5',
      batchID: '',
      writableTag: true,
      tagType: 'NTAG215',
      image: '/placeholder.svg',
      category: '',
      vendor: '',
      barcode: '',
      weight: '',
      dimensions: '',
      tags: [],
    });
    setNewTag('');
    setErrors({});
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-primary" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Fill in the product details to add it to your inventory and deploy it to the smart contract
          </DialogDescription>
        </DialogHeader>

        {/* Transaction Status Display */}
        {isSubmitting && (
          <GlassCard className="p-4 bg-accent-blue/10 border-accent-blue/30">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-medium text-accent-blue">
                  {isContractPending ? 'Submitting to blockchain...' : 'Confirming transaction...'}
                </p>
                <p className="text-sm text-text-secondary">
                  {isContractPending 
                    ? 'Please confirm the transaction in your wallet'
                    : 'Waiting for blockchain confirmation...'
                  }
                </p>
                {hash && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-text-tertiary">TX:</span>
                    <a
                      href={`https://kairos.kaiascan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-cyan hover:text-accent-cyan/80 font-mono flex items-center space-x-1"
                    >
                      <span>{hash.slice(0, 10)}...{hash.slice(-8)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="TapLink Premium Tee"
                  className={errors.name ? 'border-status-danger' : ''}
                />
                {errors.name && <p className="text-status-danger text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="sku">SKU / Product ID *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                  placeholder="TSHIRT-BLK-M"
                  className={errors.sku ? 'border-status-danger' : ''}
                />
                <p className="text-xs text-text-tertiary mt-1">Will be used as contract product identifier</p>
                {errors.sku && <p className="text-status-danger text-sm mt-1">{errors.sku}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="High-quality cotton t-shirt with TapLink logo..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-status-danger' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'all').map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    <SelectItem value="new-category">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-status-danger text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  placeholder="Seoul Fashion Co."
                />
              </div>
            </div>
          </GlassCard>

          {/* Pricing & Inventory */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing & Inventory
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="priceKRW">Selling Price (KRW) *</Label>
                <Input
                  id="priceKRW"
                  type="number"
                  value={formData.priceKRW}
                  onChange={(e) => handleInputChange('priceKRW', e.target.value)}
                  placeholder="25000"
                  min="0"
                  step="100"
                  className={errors.priceKRW ? 'border-status-danger' : ''}
                />
                <p className="text-xs text-text-tertiary mt-1">Price in KRW tokens for NFC payments</p>
                {errors.priceKRW && <p className="text-status-danger text-sm mt-1">{errors.priceKRW}</p>}
              </div>

              <div>
                <Label htmlFor="cost">Cost Price (KRW)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  placeholder="15000"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <Label htmlFor="stock">Initial Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="100"
                  min="0"
                  className={errors.stock ? 'border-status-danger' : ''}
                />
                <p className="text-xs text-text-tertiary mt-1">Available units for sale</p>
                {errors.stock && <p className="text-status-danger text-sm mt-1">{errors.stock}</p>}
              </div>

              <div>
                <Label htmlFor="threshold">Low Stock Alert</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => handleInputChange('threshold', e.target.value)}
                  placeholder="5"
                  min="0"
                />
              </div>
            </div>
          </GlassCard>

          {/* NFC Configuration */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              NFC Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="batchID">Batch ID</Label>
                <Input
                  id="batchID"
                  value={formData.batchID}
                  onChange={(e) => handleInputChange('batchID', e.target.value)}
                  placeholder="Auto-generated"
                />
              </div>

              <div>
                <Label htmlFor="tagType">NFC Tag Type</Label>
                <Select value={formData.tagType} onValueChange={(value) => handleInputChange('tagType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NTAG213">NTAG213 (180 bytes)</SelectItem>
                    <SelectItem value="NTAG215">NTAG215 (504 bytes)</SelectItem>
                    <SelectItem value="NTAG216">NTAG216 (924 bytes)</SelectItem>
                    <SelectItem value="MIFARE">MIFARE Classic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="writableTag"
                  checked={formData.writableTag}
                  onCheckedChange={(checked) => handleInputChange('writableTag', checked)}
                />
                <Label htmlFor="writableTag">Writable NFC Tag</Label>
              </div>
            </div>
          </GlassCard>

          {/* Additional Details */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Warehouse className="w-4 h-4" />
              Additional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="barcode">Barcode/UPC</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  placeholder="1234567890123"
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="200"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions (cm)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="25x30x2"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <Label>Product Tags</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <FuturisticButton type="button" onClick={addTag} size="sm">
                  Add
                </FuturisticButton>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

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
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isContractPending 
                ? 'Submitting...' 
                : isConfirming 
                  ? 'Confirming...' 
                  : 'Add to Contract'
              }
            </FuturisticButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
