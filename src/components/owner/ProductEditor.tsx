import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Package, Save, ArrowLeft } from 'lucide-react';

export const ProductEditor: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: 'TapLink Tee (Black)',
    sku: 'TSHIRT-BLK-M',
    priceKRW: 25000,
    stock: 13,
    description: 'Premium cotton t-shirt with TapLink branding'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <FuturisticButton variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
        </FuturisticButton>
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">Edit Product</h2>
          <p className="text-text-secondary">Product ID: {id}</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Product Name</label>
              <Input value={product.name} onChange={(e) => setProduct({...product, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">SKU</label>
              <Input value={product.sku} onChange={(e) => setProduct({...product, sku: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Price (KRW)</label>
              <Input type="number" value={product.priceKRW} onChange={(e) => setProduct({...product, priceKRW: parseInt(e.target.value)})} />
            </div>
          </div>
          <div className="flex items-center justify-center bg-surface-700 rounded-xl">
            <Package className="w-16 h-16 text-text-tertiary" />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <FuturisticButton variant="secondary">Cancel</FuturisticButton>
          <FuturisticButton variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </FuturisticButton>
        </div>
      </GlassCard>
    </div>
  );
};
