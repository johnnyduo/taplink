import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit3, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  productID: string;
  sku: string;
  name: string;
  priceKRW: number;
  stock: number;
  threshold: number;
  batchID: string;
  writableTag: boolean;
  tagType: string;
  image: string;
  category: string;
  lastUpdated: string;
}

interface StockEditProps {
  product: Product;
  onSave: (productId: string, newStock: number) => void;
  onCancel: () => void;
}

const StockEdit: React.FC<StockEditProps> = ({ product, onSave, onCancel }) => {
  const [value, setValue] = useState(product.stock.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const newStock = parseInt(value);
    if (newStock < 0) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    onSave(product.productID, newStock);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 h-8 text-sm"
        min="0"
        autoFocus
      />
      <FuturisticButton 
        size="sm" 
        variant="success"
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
      </FuturisticButton>
      <FuturisticButton size="sm" variant="ghost" onClick={onCancel}>
        ✕
      </FuturisticButton>
    </div>
  );
};

export const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      productID: 'SKU123',
      sku: 'TSHIRT-BLK-M',
      name: 'TapLink Tee (Black)',
      priceKRW: 25000,
      stock: 13,
      threshold: 5,
      batchID: 'BATCH42',
      writableTag: true,
      tagType: 'NTAG215',
      image: '/placeholder.svg',
      category: 'Apparel',
      lastUpdated: '2025-08-27T10:00:00Z'
    },
    {
      productID: 'SKU456',
      sku: 'COFFEE-BEAN-100G',
      name: 'Seoul Coffee Beans',
      priceKRW: 15000,
      stock: 0,
      threshold: 10,
      batchID: 'BATCH43',
      writableTag: false,
      tagType: 'NTAG213',
      image: '/placeholder.svg',
      category: 'Food & Beverage',
      lastUpdated: '2025-08-27T09:30:00Z'
    },
    {
      productID: 'SKU789',
      sku: 'MUG-POP-RED',
      name: 'Seoul Pop Mug (Red)',
      priceKRW: 18000,
      stock: 25,
      threshold: 8,
      batchID: 'BATCH44',
      writableTag: true,
      tagType: 'NTAG215',
      image: '/placeholder.svg',
      category: 'Merchandise',
      lastUpdated: '2025-08-27T08:15:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.threshold);
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleStockEdit = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => 
      p.productID === productId 
        ? { ...p, stock: newStock, lastUpdated: new Date().toISOString() }
        : p
    ));
    setEditingStock(null);
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-status-danger text-white' };
    if (stock <= threshold) return { label: 'Low Stock', color: 'bg-status-warning text-surface-900' };
    return { label: 'In Stock', color: 'bg-status-success text-white' };
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">Inventory Manager</h2>
          <p className="text-text-secondary">
            {products.length} products • {lowStockProducts.length} low stock alerts
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <FuturisticButton variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </FuturisticButton>
          <FuturisticButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </FuturisticButton>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-surface-700 border border-glass-2 rounded-lg text-text-primary text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
            
            <FuturisticButton variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </FuturisticButton>
          </div>
        </div>
      </GlassCard>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <GlassCard className="p-4 bg-gradient-glow border border-accent-cyan/20">
          <div className="flex items-center justify-between">
            <p className="text-text-primary">
              <span className="font-medium">{selectedProducts.size}</span> products selected
            </p>
            <div className="flex items-center space-x-2">
              <FuturisticButton variant="secondary" size="sm">
                Bulk Edit
              </FuturisticButton>
              <FuturisticButton variant="secondary" size="sm">
                Write Tags
              </FuturisticButton>
              <FuturisticButton variant="ghost" size="sm" onClick={() => setSelectedProducts(new Set())}>
                Clear
              </FuturisticButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Products Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-2">
                <th className="p-4 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-glass-2"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(new Set(filteredProducts.map(p => p.productID)));
                      } else {
                        setSelectedProducts(new Set());
                      }
                    }}
                  />
                </th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Product</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">SKU</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Price</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Stock</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Status</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Tag</th>
                <th className="p-4 text-left text-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.threshold);
                const isSelected = selectedProducts.has(product.productID);
                const isEditing = editingStock === product.productID;
                
                return (
                  <tr 
                    key={product.productID} 
                    className={cn(
                      'border-b border-glass-1 hover:bg-glass-1 transition-colors',
                      isSelected && 'bg-gradient-glow/50',
                      product.stock === 0 && 'animate-pulse'
                    )}
                  >
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-glass-2"
                        checked={isSelected}
                        onChange={() => handleSelectProduct(product.productID)}
                      />
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-surface-600 flex items-center justify-center">
                          <Package className="w-6 h-6 text-text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{product.name}</p>
                          <p className="text-sm text-text-tertiary">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <span className="font-mono text-sm text-text-secondary">{product.sku}</span>
                    </td>
                    
                    <td className="p-4">
                      <span className="font-medium text-text-primary">₩{product.priceKRW.toLocaleString()}</span>
                    </td>
                    
                    <td className="p-4">
                      {isEditing ? (
                        <StockEdit
                          product={product}
                          onSave={handleStockEdit}
                          onCancel={() => setEditingStock(null)}
                        />
                      ) : (
                        <button 
                          onClick={() => setEditingStock(product.productID)}
                          className="text-text-primary hover:text-accent-cyan font-medium transition-colors"
                        >
                          {product.stock}
                        </button>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <Badge className={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {product.writableTag ? (
                          <Unlock className="w-4 h-4 text-status-success" />
                        ) : (
                          <Lock className="w-4 h-4 text-text-tertiary" />
                        )}
                        <span className="text-sm text-text-secondary">{product.tagType}</span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link to={`/owner/product/${product.productID}`}>
                          <FuturisticButton variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </FuturisticButton>
                        </Link>
                        <FuturisticButton variant="ghost" size="sm">
                          <Package className="w-4 h-4" />
                        </FuturisticButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">No products found matching your criteria.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
