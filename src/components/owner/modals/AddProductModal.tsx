import React, { useState, useEffect, useRef } from 'react';
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
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConfig, useConnectorClient } from 'wagmi';
import { MULTISHOP_CONTRACT_CONFIG } from '@/lib/contracts/multishop-abi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { ProductSuccessModal } from './ProductSuccessModal';
import { ProductLoadingModal } from './ProductLoadingModal';

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
    category: undefined as string | undefined,
    vendor: '',
    barcode: '',
    weight: '',
    dimensions: '',
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    productName: string;
    transactionHash: string;
    explorerUrl: string;
  } | null>(null);

  // Track if we've already processed this transaction success
  const processedTransactionRef = useRef<string | null>(null);

  // Contract interaction hooks - SIMPLIFIED like ProductNFCWriter
  const { address, isConnected, connector } = useAccount();
  const { writeContract, data: hash, isPending: isContractPending, error: contractError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  const isSubmitting = isContractPending || isConfirming;
  // Simple wallet ready check - like ProductNFCWriter
  const isWalletReady = isConnected && address;

  // Debug wallet connection state
  useEffect(() => {
    console.log('🔍 Wallet connection state:', {
      isConnected,
      address,
      connector: connector?.name
    });
  }, [isConnected, address, connector]);

  // Debug categories array
  useEffect(() => {
    console.log('📂 Categories passed to modal:', categories);
    console.log('📂 Categories details:', categories.map((cat, index) => ({
      index,
      value: cat,
      type: typeof cat,
      isEmpty: !cat || cat.trim() === '',
      isAll: cat === 'all'
    })));
  }, [categories]);

  // Remove all the complex connector client retry logic - not needed!

  // Handle contract errors - prevent duplicate toasts
  useEffect(() => {
    if (contractError) {
      console.error('❌ Contract error:', contractError);
      
      let errorMessage = 'Transaction failed';
      let errorDescription = 'Please try again';
      
      if (contractError.message) {
        if (contractError.message.includes('user rejected') || contractError.message.includes('User denied')) {
          errorMessage = 'Transaction rejected';
          errorDescription = 'You rejected the transaction in your wallet';
        } else if (contractError.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds';
          errorDescription = 'You don\'t have enough KAIA to pay for gas fees';
        } else if (contractError.message.includes('network') || contractError.message.includes('Network')) {
          errorMessage = 'Network error';
          errorDescription = 'Please check your network connection and try again';
        } else if (contractError.message.includes('connector') || contractError.message.includes('provider')) {
          errorMessage = 'Wallet connection error';
          errorDescription = 'Please make sure your wallet is connected and try again';
        } else {
          errorMessage = 'Contract error';
          errorDescription = contractError.message.slice(0, 100) + (contractError.message.length > 100 ? '...' : '');
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 4000,
        id: 'contract-error' // Prevent duplicate toasts with same ID
      });
    }
  }, [contractError]);

  // Handle transaction receipt errors - prevent duplicate toasts
  useEffect(() => {
    if (receiptError) {
      console.error('❌ Receipt error:', receiptError);
      
      let errorMessage = 'Transaction confirmation failed';
      let errorDescription = 'Transaction was not confirmed on blockchain';
      
      if (receiptError.message) {
        if (receiptError.message.includes('timeout')) {
          errorMessage = 'Transaction timeout';
          errorDescription = 'Transaction is taking longer than expected. Please check the blockchain explorer.';
        } else if (receiptError.message.includes('reverted')) {
          errorMessage = 'Transaction reverted';
          errorDescription = 'Transaction was rejected by the smart contract. Please check your inputs.';
        } else {
          errorDescription = receiptError.message.slice(0, 100) + (receiptError.message.length > 100 ? '...' : '');
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 4000,
        id: 'receipt-error' // Prevent duplicate toasts
      });
    }
  }, [receiptError]);

  // Handle successful contract transaction - FIXED to prevent infinite loop
  useEffect(() => {
    if (isSuccess && hash && hash !== processedTransactionRef.current) {
      // Mark this transaction as processed
      processedTransactionRef.current = hash;
      
      const explorerUrl = `${import.meta.env.VITE_KAIA_KAIROS_EXPLORER}/tx/${hash}`;
      
      console.log('✅ Product added to blockchain successfully!');
      console.log('📊 Transaction hash:', hash);
      console.log('🔍 Explorer URL:', explorerUrl);
      
      // Create product object for local state with current form data
      const uniqueTimestamp = Date.now();
      const productData = {
        sku: formData.sku.toUpperCase(),
        name: formData.name,
        description: formData.description,
        priceKRW: Number(formData.priceKRW),
        cost: formData.cost ? Number(formData.cost) : undefined,
        stock: Number(formData.stock),
        threshold: Number(formData.threshold),
        weight: formData.weight ? Number(formData.weight) : undefined,
        batchID: formData.batchID || `BATCH-${uniqueTimestamp}`,
        writableTag: formData.writableTag,
        tagType: formData.tagType,
        image: formData.image,
        category: formData.category || 'Uncategorized', // Provide a default category instead of empty string
        vendor: formData.vendor,
        barcode: formData.barcode,
        dimensions: formData.dimensions,
        tags: formData.tags,
        // Add a unique identifier to help parent component avoid duplicates
        _uniqueId: `${formData.sku.toUpperCase()}-${uniqueTimestamp}`
      };
      
      console.log('✅ Product data for local state:', productData);

      // Set success modal data
      setSuccessData({
        productName: formData.name,
        transactionHash: hash,
        explorerUrl
      });
      
      setShowSuccessModal(true);
      onAdd(productData);
    }
  }, [isSuccess, hash]); // Clean dependencies without showSuccessModal

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields for contract
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required for contract';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Product name must be less than 100 characters';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU/Product ID is required for contract';
    } else if (formData.sku.trim().length < 2) {
      newErrors.sku = 'SKU must be at least 2 characters';
    } else if (formData.sku.trim().length > 50) {
      newErrors.sku = 'SKU must be less than 50 characters';
    } else if (!/^[A-Z0-9-_]+$/.test(formData.sku.trim())) {
      newErrors.sku = 'SKU can only contain uppercase letters, numbers, hyphens, and underscores';
    }

    const priceNum = Number(formData.priceKRW);
    if (!formData.priceKRW || isNaN(priceNum) || priceNum <= 0) {
      newErrors.priceKRW = 'Valid price is required (must be > 0 KRW)';
    } else if (priceNum > 1000000000) {
      newErrors.priceKRW = 'Price too high (max 1 billion KRW)';
    } else if (priceNum < 1) {
      newErrors.priceKRW = 'Price must be at least 1 KRW';
    }

    const stockNum = Number(formData.stock);
    if (!formData.stock || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Valid stock quantity is required (≥ 0)';
    } else if (stockNum > 1000000000) {
      newErrors.stock = 'Stock too high (max 1 billion units)';
    } else if (!Number.isInteger(stockNum)) {
      newErrors.stock = 'Stock must be a whole number';
    }

    const thresholdNum = Number(formData.threshold);
    if (formData.threshold && (isNaN(thresholdNum) || thresholdNum < 0)) {
      newErrors.threshold = 'Threshold must be a non-negative number';
    } else if (thresholdNum > stockNum) {
      newErrors.threshold = 'Threshold cannot be higher than initial stock';
    }

    if (!formData.category || formData.category.trim() === '') {
      newErrors.category = 'Category is required for organization';
    }

    // Optional cost validation
    if (formData.cost) {
      const costNum = Number(formData.cost);
      if (isNaN(costNum) || costNum < 0) {
        newErrors.cost = 'Cost must be a valid non-negative number';
      } else if (costNum >= priceNum && priceNum > 0) {
        newErrors.cost = 'Cost should be less than selling price for profit';
      }
    }

    // Optional weight validation
    if (formData.weight) {
      const weightNum = Number(formData.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        newErrors.weight = 'Weight must be a positive number';
      }
    }

    // Barcode validation (if provided)
    if (formData.barcode && formData.barcode.trim()) {
      if (!/^\d{8,13}$/.test(formData.barcode.trim())) {
        newErrors.barcode = 'Barcode must be 8-13 digits only';
      }
    }

    // Description length validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isSubmitting) {
        handleSubmit(e as any);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Form validation failed', {
        description: 'Please fix the highlighted fields and try again',
        duration: 3000,
        id: 'form-validation-error'
      });
      return;
    }

    // Simple wallet connection check - like ProductNFCWriter
    if (!isWalletReady) {
      if (!isConnected) {
        toast.error('Wallet not connected', {
          description: 'Please connect your wallet first',
          duration: 3000,
          id: 'wallet-not-connected'
        });
      } else if (!address) {
        toast.error('Wallet address not available', {
          description: 'Please ensure your wallet is properly connected',
          duration: 3000,
          id: 'wallet-address-missing'
        });
      }
      return;
    }

    try {
      // Prepare contract parameters
      const productId = formData.sku.trim().toUpperCase();
      const productName = formData.name.trim();
      const priceKRW = Number(formData.priceKRW);
      const stock = Number(formData.stock);

      // Validate price conversion
      if (priceKRW <= 0 || isNaN(priceKRW)) {
        toast.error('Invalid price', {
          description: 'Price must be a positive number',
          duration: 3000,
          id: 'invalid-price'
        });
        return;
      }

      // Convert KRW price to wei (18 decimals for KRW token)
      // Example: 25000 KRW → 25000000000000000000000 wei
      const priceInWei = parseEther(priceKRW.toString());

      console.log('🏪 Adding product to contract:', {
        productId,
        name: productName,
        price: `${priceKRW} KRW`,
        priceInWei: priceInWei.toString(),
        stock
      });

      // Remove toast notification - we'll show processing in the modal UI instead

      // Simple contract call - exactly like ProductNFCWriter
      writeContract({
        address: MULTISHOP_CONTRACT_CONFIG.address,
        abi: MULTISHOP_CONTRACT_CONFIG.abi,
        functionName: 'addProduct',
        args: [
          productId,     // string productId
          productName,   // string name  
          priceInWei,    // uint256 price (in wei)
          BigInt(stock)  // uint256 stock
        ],
      } as any);

    } catch (error: any) {
      console.error('❌ Failed to add product:', error);
      
      let errorMessage = 'Failed to add product';
      let errorDescription = 'Please try again';
      
      if (error?.message) {
        if (error.message.includes('parseEther')) {
          errorMessage = 'Invalid price format';
          errorDescription = 'Please enter a valid number for the price';
        } else if (error.message.includes('BigInt')) {
          errorMessage = 'Invalid stock format';
          errorDescription = 'Please enter a valid whole number for stock';
        } else {
          errorDescription = error.message.slice(0, 100) + (error.message.length > 100 ? '...' : '');
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 4000,
        id: 'submit-error'
      });
    }
  };

  const handleClose = () => {
    console.log('🔄 AddProductModal: Main modal closing - resetting all state');
    
    // Reset transaction processing ref
    processedTransactionRef.current = null;
    
    // Reset form state with a small delay to prevent Select rendering issues
    setTimeout(() => {
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
        category: undefined,
        vendor: '',
        barcode: '',
        weight: '',
        dimensions: '',
        tags: [],
      });
      setNewTag('');
      setErrors({});
      setShowSuccessModal(false);
      setSuccessData(null);
    }, 50); // Small delay to let React finish current render cycle
    
    // Close modal immediately
    onClose();
  };

  const handleSuccessModalClose = () => {
    console.log('🔄 AddProductModal: Success modal close requested - navigating back to inventory');
    
    // Close the success modal first
    setShowSuccessModal(false);
    setSuccessData(null);
    
    // Then close the main modal to return to inventory
    setTimeout(() => {
      handleClose();
    }, 100);
  };

  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.map(t => t.toLowerCase()).includes(trimmedTag) && formData.tags.length < 10) {
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
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-primary" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Fill in the product details to add it to your inventory and deploy it to the smart contract.
            <span className="block text-xs text-text-tertiary mt-1">
              Press <kbd className="px-1 py-0.5 text-xs bg-background border rounded">Ctrl+Enter</kbd> to submit
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Status - Simple and Clean */}
        {isConnected && address ? (
          <GlassCard className={`p-3 ${isWalletReady ? 'bg-accent-green/5 border-accent-green/20' : 'bg-status-warning/10 border-status-warning/30'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${isWalletReady ? 'bg-accent-green animate-pulse' : 'bg-status-warning animate-pulse'}`}></div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isWalletReady ? 'text-accent-green' : 'text-status-warning'}`}>
                  Wallet Ready {connector?.name && `(${connector.name})`}
                </p>
                <p className="text-xs text-text-tertiary font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-4 bg-status-warning/10 border-status-warning/30">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-status-warning" />
              <div className="flex-1">
                <p className="font-medium text-status-warning">Wallet Not Connected</p>
                <p className="text-sm text-text-secondary">
                  Please connect your wallet to deploy products to the blockchain
                </p>
              </div>
            </div>
          </GlassCard>
        )}

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
                      href={`${import.meta.env.VITE_KAIA_KAIROS_EXPLORER}/tx/${hash}`}
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

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
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
                  placeholder="e.g., Premium Cotton T-Shirt, Wireless Earbuds"
                  maxLength={100}
                  className={errors.name ? 'border-status-danger' : ''}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.name ? (
                    <p className="text-status-danger text-sm">{errors.name}</p>
                  ) : (
                    <p className="text-text-tertiary text-xs">Clear, descriptive product name</p>
                  )}
                  <span className="text-xs text-text-tertiary">{formData.name.length}/100</span>
                </div>
              </div>

              <div>
                <Label htmlFor="sku">SKU / Product ID *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, ''))}
                  placeholder="e.g., SHIRT-BLK-M, PHONE-CASE-01"
                  maxLength={50}
                  className={errors.sku ? 'border-status-danger' : ''}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.sku ? (
                    <p className="text-status-danger text-sm">{errors.sku}</p>
                  ) : (
                    <p className="text-text-tertiary text-xs">Unique identifier for blockchain</p>
                  )}
                  <span className="text-xs text-text-tertiary">{formData.sku.length}/50</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed product description, materials, features, size info..."
                  rows={3}
                  maxLength={500}
                  className={errors.description ? 'border-status-danger' : ''}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-status-danger text-sm">{errors.description}</p>
                  ) : (
                    <p className="text-text-tertiary text-xs">Optional detailed description for customers</p>
                  )}
                  <span className="text-xs text-text-tertiary">{formData.description.length}/500</span>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category || undefined} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-status-danger' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Only render if categories exist and are valid */}
                    {categories && categories.length > 0 ? (
                      categories
                        .filter(cat => {
                          // Robust filtering for invalid categories
                          const isValid = cat && 
                                         typeof cat === 'string' && 
                                         cat !== 'all' && 
                                         cat.trim() !== '' && 
                                         cat.length > 0;
                          if (!isValid && cat) { // Only log if cat exists but is invalid
                            console.log('🚫 Filtering out invalid category:', { value: cat, type: typeof cat });
                          }
                          return isValid;
                        })
                        .map((category) => (
                          <SelectItem key={`cat-${category}`} value={category}>
                            {category}
                          </SelectItem>
                        ))
                    ) : null}
                    <SelectItem value="new-category">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-status-danger text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="vendor">Vendor/Supplier</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  placeholder="Seoul Fashion Co., Ltd."
                />
                <p className="text-xs text-text-tertiary mt-1">
                  {formData.vendor 
                    ? `Supplier: ${formData.vendor}`
                    : 'Optional: Product supplier/manufacturer'
                  }
                </p>
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
                  min="1"
                  max="1000000000"
                  step="1"
                  className={errors.priceKRW ? 'border-status-danger' : ''}
                />
                <div className="mt-1">
                  {errors.priceKRW ? (
                    <p className="text-status-danger text-sm">{errors.priceKRW}</p>
                  ) : (
                    <p className="text-xs text-text-tertiary">
                      {formData.priceKRW 
                        ? `₩${Number(formData.priceKRW).toLocaleString('ko-KR')} for NFC payments`
                        : 'Price in KRW tokens for blockchain'
                      }
                    </p>
                  )}
                </div>
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
                  step="1"
                  className={errors.cost ? 'border-status-danger' : ''}
                />
                <div className="mt-1">
                  {errors.cost ? (
                    <p className="text-status-danger text-sm">{errors.cost}</p>
                  ) : (
                    <p className="text-xs text-text-tertiary">
                      {formData.cost && formData.priceKRW 
                        ? `Profit: ₩${(Number(formData.priceKRW) - Number(formData.cost)).toLocaleString('ko-KR')}`
                        : 'Optional: Your cost per unit'
                      }
                    </p>
                  )}
                </div>
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
                  max="1000000000"
                  step="1"
                  className={errors.stock ? 'border-status-danger' : ''}
                />
                <div className="mt-1">
                  {errors.stock ? (
                    <p className="text-status-danger text-sm">{errors.stock}</p>
                  ) : (
                    <p className="text-xs text-text-tertiary">
                      {formData.stock 
                        ? `${Number(formData.stock).toLocaleString()} units available`
                        : 'Units available on blockchain'
                      }
                    </p>
                  )}
                </div>
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
                  step="1"
                  className={errors.threshold ? 'border-status-danger' : ''}
                />
                <div className="mt-1">
                  {errors.threshold ? (
                    <p className="text-status-danger text-sm">{errors.threshold}</p>
                  ) : (
                    <p className="text-xs text-text-tertiary">
                      {formData.threshold 
                        ? `Alert when ≤ ${formData.threshold} units left`
                        : 'Notify when stock is low'
                      }
                    </p>
                  )}
                </div>
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
                  placeholder={`BATCH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`}
                />
                <p className="text-xs text-text-tertiary mt-1">
                  {formData.batchID 
                    ? `Production batch: ${formData.batchID}`
                    : 'Auto-generated if empty'
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="tagType">NFC Tag Type</Label>
                <Select value={formData.tagType} onValueChange={(value) => handleInputChange('tagType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NTAG213">
                      <div className="flex flex-col">
                        <span>NTAG213</span>
                        <span className="text-xs text-text-tertiary">180 bytes • Basic</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="NTAG215">
                      <div className="flex flex-col">
                        <span>NTAG215</span>
                        <span className="text-xs text-text-tertiary">504 bytes • Recommended</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="NTAG216">
                      <div className="flex flex-col">
                        <span>NTAG216</span>
                        <span className="text-xs text-text-tertiary">924 bytes • Advanced</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MIFARE">
                      <div className="flex flex-col">
                        <span>MIFARE Classic</span>
                        <span className="text-xs text-text-tertiary">1KB • Legacy</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-tertiary mt-1">
                  {formData.tagType === 'NTAG215' 
                    ? 'Perfect for payment links'
                    : formData.tagType === 'NTAG216'
                    ? 'Extra space for rich content'
                    : 'Standard NFC compatibility'
                  }
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                  <Switch
                    id="writableTag"
                    checked={formData.writableTag}
                    onCheckedChange={(checked) => handleInputChange('writableTag', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="writableTag" className="cursor-pointer">Writable NFC Tag</Label>
                    <p className="text-xs text-text-tertiary mt-1">
                      {formData.writableTag 
                        ? 'Tag can be updated after creation'
                        : 'Tag will be read-only for security'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Product Image */}
          <GlassCard className="p-4">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Product Image
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-background/50 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <img 
                  src={formData.image} 
                  alt="Product preview" 
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/product-image.jpg"
                />
                <p className="text-xs text-text-tertiary mt-1">
                  URL to product image • Will show preview on successful load
                </p>
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
                  onChange={(e) => handleInputChange('barcode', e.target.value.replace(/\D/g, ''))}
                  placeholder="8801234567890"
                  maxLength={13}
                  className={errors.barcode ? 'border-status-danger' : ''}
                />
                <div className="mt-1">
                  {errors.barcode ? (
                    <p className="text-status-danger text-sm">{errors.barcode}</p>
                  ) : (
                    <p className="text-xs text-text-tertiary">
                      {formData.barcode 
                        ? `${formData.barcode.length} digits - ${formData.barcode.length >= 8 && formData.barcode.length <= 13 ? 'Valid' : 'Need 8-13 digits'}`
                        : 'Optional: EAN/UPC code'
                      }
                    </p>
                  )}
                </div>
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
                  className={errors.weight ? 'border-status-danger' : ''}
                />
                <div className="mt-1">
                  {errors.weight ? (
                    <p className="text-status-danger text-sm">{errors.weight}</p>
                  ) : (
                    <p className="text-xs text-text-tertiary">
                      {formData.weight 
                        ? `${formData.weight}g ${Number(formData.weight) >= 1000 ? `(${(Number(formData.weight) / 1000).toFixed(1)}kg)` : ''}`
                        : 'Optional: Product weight'
                      }
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="dimensions">Dimensions (cm)</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="25 × 30 × 2"
                />
                <p className="text-xs text-text-tertiary mt-1">
                  {formData.dimensions 
                    ? `Size: ${formData.dimensions}`
                    : 'Optional: L × W × H format'
                  }
                </p>
              </div>
            </div>

            {/* Product Tags */}
            <div className="mt-6">
              <Label className="text-sm font-medium">Product Tags</Label>
              <p className="text-xs text-text-tertiary mb-3">Add searchable tags to categorize your product</p>
              
              <div className="flex items-center space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g., premium, cotton, bestseller, limited-edition"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                  maxLength={30}
                />
                <FuturisticButton 
                  type="button" 
                  onClick={addTag} 
                  size="sm"
                  disabled={!newTag.trim() || formData.tags.map(t => t.toLowerCase()).includes(newTag.trim().toLowerCase()) || formData.tags.length >= 10}
                >
                  Add Tag
                </FuturisticButton>
              </div>

              {/* Tag feedback */}
              {newTag.trim() && formData.tags.map(t => t.toLowerCase()).includes(newTag.trim().toLowerCase()) && (
                <p className="text-status-warning text-xs mt-1">Tag already exists</p>
              )}
              {formData.tags.length >= 10 && (
                <p className="text-status-warning text-xs mt-1">Maximum 10 tags allowed</p>
              )}
              
              {formData.tags.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-status-danger hover:text-white transition-colors"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ✕
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">
                    {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} • Click to remove
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Submission Summary */}
          {formData.name && formData.sku && formData.priceKRW && formData.stock && formData.category && (
            <GlassCard className="p-4 bg-accent-cyan/5 border-accent-cyan/20">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-accent-cyan" />
                Ready to Deploy
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-tertiary">Product:</span>
                  <span className="ml-2 font-medium">{formData.name}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">SKU:</span>
                  <span className="ml-2 font-mono">{formData.sku}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Price:</span>
                  <span className="ml-2 font-medium text-accent-green">₩{Number(formData.priceKRW).toLocaleString('ko-KR')}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Stock:</span>
                  <span className="ml-2 font-medium">{Number(formData.stock).toLocaleString()} units</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Category:</span>
                  <span className="ml-2 capitalize">{formData.category}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">NFC:</span>
                  <span className="ml-2">{formData.tagType} {formData.writableTag ? '(Writable)' : '(Read-only)'}</span>
                </div>
                {formData.cost && (
                  <div>
                    <span className="text-text-tertiary">Profit:</span>
                    <span className="ml-2 font-medium text-accent-green">₩{(Number(formData.priceKRW) - Number(formData.cost)).toLocaleString('ko-KR')}</span>
                  </div>
                )}
                {formData.tags.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-text-tertiary">Tags:</span>
                    <span className="ml-2">{formData.tags.join(', ')}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-text-tertiary">
                  💡 This product will be deployed to the Kaia blockchain at contract{' '}
                  <span className="font-mono">0xA363...0c0d</span> with price{' '}
                  <span className="font-mono">{parseEther(formData.priceKRW).toString()}</span> wei
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  🏪 Multi-shop contract - your wallet will be the owner of this product!
                </p>
              </div>
            </GlassCard>
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
              disabled={isSubmitting || !isWalletReady}
              className="min-w-[160px]"
            >
              {!isConnected
                ? '🔌 Connect Wallet'
                : !isWalletReady
                  ? '⏳ Connecting...'
                  : isContractPending 
                    ? '⛏️ Mining...' 
                    : isConfirming 
                      ? '⏳ Confirming...' 
                      : '🚀 Deploy to Blockchain'
              }
            </FuturisticButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    
    <ProductLoadingModal
      isOpen={isContractPending || isConfirming}
      transactionHash={hash}
      productName={formData.name}
      stage={isContractPending ? 'confirming' : 'submitting'}
    />

    <ProductSuccessModal
      key={showSuccessModal ? 'success-modal-open' : 'success-modal-closed'}
      isOpen={showSuccessModal}
      onClose={handleSuccessModalClose}
      productName={successData?.productName || formData.name}
      transactionHash={successData?.transactionHash || hash || ''}
      explorerUrl={successData?.explorerUrl || (hash ? `${import.meta.env.VITE_KAIA_KAIROS_EXPLORER}/tx/${hash}` : '')}
    />
    </>
  );
};
