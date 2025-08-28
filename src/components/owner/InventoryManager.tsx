import React, { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Edit2,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ChevronDown,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { AddProductModal, Product } from './modals/AddProductModal';
import { EditProductModal } from './modals/EditProductModal';
import { BulkActionsModal } from './modals/BulkActionsModal';

export const InventoryManager: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Mock product data
  const [products, setProducts] = useState<Product[]>([
    {
      productID: 'PRD001',
      sku: 'TCOFFEE-001',
      name: 'Premium Americano',
      description: 'Rich, bold coffee made from premium beans',
      priceKRW: 4500,
      cost: 2200,
      stock: 150,
      threshold: 20,
      batchID: 'BATCH-2025-001',
      writableTag: true,
      tagType: 'NTAG216',
      image: '/api/placeholder/300/300',
      category: 'Beverages',
      lastUpdated: '2025-08-27T10:30:00Z',
      vendor: 'Coffee Roasters Co.',
      barcode: '1234567890123',
      weight: 350,
      dimensions: '7x7x12cm',
      tags: ['hot', 'coffee', 'premium']
    },
    {
      productID: 'PRD002',
      sku: 'TPASTRY-001',
      name: 'Chocolate Croissant',
      description: 'Flaky pastry with rich chocolate filling',
      priceKRW: 3200,
      cost: 1800,
      stock: 8,
      threshold: 10,
      batchID: 'BATCH-2025-002',
      writableTag: true,
      tagType: 'NTAG213',
      image: '/api/placeholder/300/300',
      category: 'Pastries',
      lastUpdated: '2025-08-27T09:15:00Z',
      vendor: 'French Bakery',
      barcode: '1234567890124',
      weight: 120,
      dimensions: '12x8x4cm',
      tags: ['pastry', 'chocolate', 'breakfast']
    },
    {
      productID: 'PRD003',
      sku: 'TMERCH-001',
      name: 'TapLink Mug',
      description: 'Official TapLink ceramic mug with NFC chip',
      priceKRW: 18000,
      cost: 9500,
      stock: 45,
      threshold: 15,
      batchID: 'BATCH-2025-003',
      writableTag: true,
      tagType: 'NTAG216',
      image: '/api/placeholder/300/300',
      category: 'Merchandise',
      lastUpdated: '2025-08-27T08:45:00Z',
      vendor: 'TapLink Co.',
      barcode: '1234567890125',
      weight: 280,
      dimensions: '10x10x9cm',
      tags: ['mug', 'nfc', 'collectible']
    },
    {
      productID: 'PRD004',
      sku: 'TSNACK-001',
      name: 'Matcha Latte Kit',
      description: 'DIY matcha latte with premium powder and instructions',
      priceKRW: 12500,
      cost: 7200,
      stock: 0,
      threshold: 5,
      batchID: 'BATCH-2025-004',
      writableTag: true,
      tagType: 'NTAG213',
      image: '/api/placeholder/300/300',
      category: 'Kits',
      lastUpdated: '2025-08-26T16:20:00Z',
      vendor: 'Green Tea Masters',
      barcode: '1234567890126',
      weight: 450,
      dimensions: '15x10x8cm',
      tags: ['matcha', 'diy', 'premium']
    },
    {
      productID: 'PRD005',
      sku: 'TTECH-001',
      name: 'Smart NFC Coaster',
      description: 'Interactive coaster with programmable NFC actions',
      priceKRW: 25000,
      cost: 15000,
      stock: 2,
      threshold: 8,
      batchID: 'BATCH-2025-005',
      writableTag: true,
      tagType: 'NTAG216',
      image: '/api/placeholder/300/300',
      category: 'Tech',
      lastUpdated: '2025-08-27T07:10:00Z',
      vendor: 'Smart Home Inc.',
      barcode: '1234567890127',
      weight: 95,
      dimensions: '10x10x1cm',
      tags: ['smart', 'nfc', 'interactive']
    }
  ]);

  const categories = Array.from(new Set(
    products
      .map(p => p.category)
      .filter(cat => cat && cat.trim() !== '') // Filter out empty/falsy categories
  ));

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === 'in-stock') matchesStock = product.stock > 0;
      else if (stockFilter === 'low-stock') matchesStock = product.stock <= product.threshold && product.stock > 0;
      else if (stockFilter === 'out-of-stock') matchesStock = product.stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.priceKRW * p.stock), 0);
    const lowStock = products.filter(p => p.stock <= p.threshold && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    return {
      totalProducts,
      totalValue,
      lowStock,
      outOfStock,
      inStock: totalProducts - outOfStock
    };
  }, [products]);

  const handleAddProduct = (newProduct: Omit<Product, 'productID' | 'lastUpdated'>) => {
    const product: Product = {
      ...newProduct,
      productID: `PRD${String(Date.now()).slice(-3)}`,
      lastUpdated: new Date().toISOString()
    };
    setProducts(prev => [product, ...prev]);
  };

  const handleEditProduct = (productId: string, updatedProduct: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.productID === productId 
        ? { ...p, ...updatedProduct, lastUpdated: new Date().toISOString() }
        : p
    ));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.productID !== productId));
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleBulkUpdate = (productIds: string[], updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      productIds.includes(p.productID)
        ? { ...p, ...updates, lastUpdated: new Date().toISOString() }
        : p
    ));
    setSelectedProducts(new Set());
  };

  const handleBulkDelete = (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(p.productID)));
    setSelectedProducts(new Set());
  };

  const handleStockEdit = (productId: string, newStock: number) => {
    if (newStock >= 0) {
      handleEditProduct(productId, { stock: newStock });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p.productID)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const exportToCSV = () => {
    const csvData = products.map(product => ({
      SKU: product.sku,
      Name: product.name,
      Category: product.category,
      Price: product.priceKRW,
      Stock: product.stock,
      'Low Stock Threshold': product.threshold,
      Vendor: product.vendor || '',
      'Last Updated': new Date(product.lastUpdated).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">Inventory Manager</h2>
          <p className="text-text-secondary">Manage products, stock levels, and NFC configurations</p>
        </div>
        
        <div className="flex gap-2">
          <FuturisticButton variant="secondary" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </FuturisticButton>
          <FuturisticButton 
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </FuturisticButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Products</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Value</p>
              <p className="text-2xl font-bold text-status-success">₩{stats.totalValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-status-success" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">In Stock</p>
              <p className="text-2xl font-bold text-accent-cyan">{stats.inStock}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-accent-cyan" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-status-warning">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-status-warning" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-status-danger">{stats.outOfStock}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-status-danger" />
          </div>
        </GlassCard>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <Input
              placeholder="Search products by name, SKU, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Package className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <GlassCard className="p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-primary font-medium">
              {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
            </p>
            <FuturisticButton
              variant="secondary"
              onClick={() => setShowBulkModal(true)}
            >
              <MoreVertical className="w-4 h-4 mr-2" />
              Bulk Actions
            </FuturisticButton>
          </div>
        </GlassCard>
      )}

      {/* Products Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-800/50">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-surface-600 bg-surface-800 text-primary focus:ring-primary"
                  />
                </th>
                <th className="p-4 text-left text-text-secondary font-medium">Product</th>
                <th className="p-4 text-left text-text-secondary font-medium">SKU</th>
                <th className="p-4 text-left text-text-secondary font-medium">Category</th>
                <th className="p-4 text-left text-text-secondary font-medium">Price</th>
                <th className="p-4 text-left text-text-secondary font-medium">Stock</th>
                <th className="p-4 text-left text-text-secondary font-medium">Status</th>
                <th className="p-4 text-left text-text-secondary font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr 
                  key={product.productID}
                  className="border-t border-surface-700 hover:bg-surface-800/30 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.productID)}
                      onChange={(e) => handleSelectProduct(product.productID, e.target.checked)}
                      className="rounded border-surface-600 bg-surface-800 text-primary focus:ring-primary"
                    />
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-surface-800 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-text-tertiary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{product.name}</p>
                        <p className="text-sm text-text-secondary line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <code className="text-sm bg-surface-800 px-2 py-1 rounded">
                      {product.sku}
                    </code>
                  </td>
                  
                  <td className="p-4">
                    <Badge variant="outline">{product.category}</Badge>
                  </td>
                  
                  <td className="p-4">
                    <p className="font-medium text-text-primary">₩{product.priceKRW.toLocaleString()}</p>
                    {product.cost && (
                      <p className="text-xs text-text-secondary">
                        Cost: ₩{product.cost.toLocaleString()}
                      </p>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <Input
                      type="number"
                      value={product.stock}
                      onChange={(e) => handleStockEdit(product.productID, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                      min="0"
                    />
                  </td>
                  
                  <td className="p-4">
                    <Badge className={`text-xs ${
                      product.stock === 0 
                        ? 'bg-status-danger text-white' 
                        : product.stock <= product.threshold
                        ? 'bg-status-warning text-surface-900'
                        : 'bg-status-success text-white'
                    }`}>
                      {product.stock === 0 
                        ? 'Out of Stock' 
                        : product.stock <= product.threshold 
                        ? 'Low Stock' 
                        : 'In Stock'}
                    </Badge>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <FuturisticButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </FuturisticButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No products found</h3>
              <p className="text-text-secondary mb-4">
                {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first product'
                }
              </p>
              <FuturisticButton 
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </FuturisticButton>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        categories={categories}
      />

      {editingProduct && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onUpdate={handleEditProduct}
          onDelete={handleDeleteProduct}
          categories={categories}
        />
      )}

      <BulkActionsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        selectedProducts={filteredProducts.filter(p => selectedProducts.has(p.productID))}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDelete}
        categories={categories}
      />
    </div>
  );
};
