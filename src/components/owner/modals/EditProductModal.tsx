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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit3, Package, Tag, DollarSign, Warehouse, AlertCircle, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Product } from './AddProductModal';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (productId: string, updates: Partial<Product>) => void;
  onDelete: (productId: string) => void;
  product: Product | null;
  categories: string[];
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  product,
  categories
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        priceKRW: product.priceKRW,
        cost: product.cost || 0,
        stock: product.stock,
        threshold: product.threshold,
        weight: product.weight || 0,
        tags: product.tags || [],
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData.priceKRW || Number(formData.priceKRW) <= 0) {
      newErrors.priceKRW = 'Valid price is required';
    }
    if (formData.stock === undefined || Number(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !product) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updates = {
        ...formData,
        lastUpdated: new Date().toISOString(),
      };

      onUpdate(product.productID, updates);
      handleClose();
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onDelete(product.productID);
      handleClose();
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setNewTag('');
    setErrors({});
    setIsSubmitting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl">
              <Edit3 className="w-5 h-5 text-primary" />
              Edit Product
            </div>
            <FuturisticButton
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-status-danger hover:bg-status-danger/10"
            >
              <Trash2 className="w-4 h-4" />
            </FuturisticButton>
          </DialogTitle>
          <DialogDescription>
            Update product details • Last modified: {new Date(product.lastUpdated).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {showDeleteConfirm && (
          <Alert className="border-status-danger bg-status-danger/10">
            <AlertCircle className="h-4 w-4 text-status-danger" />
            <AlertDescription className="text-status-danger">
              <div className="flex items-center justify-between">
                <span>Are you sure you want to delete this product? This action cannot be undone.</span>
                <div className="flex gap-2 ml-4">
                  <FuturisticButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </FuturisticButton>
                  <FuturisticButton
                    size="sm"
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                  </FuturisticButton>
                </div>
              </div>
            </AlertDescription>
          </Alert>
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
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="TapLink Premium Tee"
                  className={errors.name ? 'border-status-danger' : ''}
                />
                {errors.name && <p className="text-status-danger text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                  placeholder="TSHIRT-BLK-M"
                  className={errors.sku ? 'border-status-danger' : ''}
                />
                {errors.sku && <p className="text-status-danger text-sm mt-1">{errors.sku}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="High-quality cotton t-shirt with TapLink logo..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category || ''} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-status-danger' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'all').map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-status-danger text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor || ''}
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
                  value={formData.priceKRW || ''}
                  onChange={(e) => handleInputChange('priceKRW', Number(e.target.value))}
                  placeholder="25000"
                  min="0"
                  step="100"
                  className={errors.priceKRW ? 'border-status-danger' : ''}
                />
                {errors.priceKRW && <p className="text-status-danger text-sm mt-1">{errors.priceKRW}</p>}
              </div>

              <div>
                <Label htmlFor="cost">Cost Price (KRW)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost || ''}
                  onChange={(e) => handleInputChange('cost', Number(e.target.value))}
                  placeholder="15000"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <Label htmlFor="stock">Current Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                  placeholder="100"
                  min="0"
                  className={errors.stock ? 'border-status-danger' : ''}
                />
                {errors.stock && <p className="text-status-danger text-sm mt-1">{errors.stock}</p>}
              </div>

              <div>
                <Label htmlFor="threshold">Low Stock Alert</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold || ''}
                  onChange={(e) => handleInputChange('threshold', Number(e.target.value))}
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
                  value={formData.batchID || ''}
                  onChange={(e) => handleInputChange('batchID', e.target.value)}
                  placeholder="Auto-generated"
                />
              </div>

              <div>
                <Label htmlFor="tagType">NFC Tag Type</Label>
                <Select 
                  value={formData.tagType || 'NTAG215'} 
                  onValueChange={(value) => handleInputChange('tagType', value)}
                >
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
                  checked={formData.writableTag || false}
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
                  value={formData.barcode || ''}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  placeholder="1234567890123"
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                  placeholder="200"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions (cm)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions || ''}
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
              
              {formData.tags && formData.tags.length > 0 && (
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
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </FuturisticButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
