import React from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PAYMENT_CONTRACT_CONFIG } from '@/lib/contracts/payment-abi';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  NfcIcon, 
  Plus, 
  Package,
  Coins,
  Hash,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wifi,
  Edit3
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export const ProductNFCWriter: React.FC = () => {
  const [isNFCSupported, setIsNFCSupported] = React.useState(false);
  const [isWriting, setIsWriting] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  
  // Form states for new product
  const [newProduct, setNewProduct] = React.useState({
    id: '',
    name: '',
    price: '',
    stock: ''
  });

  // Contract interaction
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check NFC support
  React.useEffect(() => {
    if ('NDEFReader' in window) {
      setIsNFCSupported(true);
    }
  }, []);

  // Handle contract success
  React.useEffect(() => {
    if (isSuccess) {
      toast.success('🎉 Product added to contract!', {
        description: `${newProduct.name} is now available for NFC payments`
      });
      // Reset form
      setNewProduct({ id: '', name: '', price: '', stock: '' });
    }
  }, [isSuccess, newProduct.name]);

  const generateProductId = () => {
    return `prod_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateNFCId = () => {
    return `nfc_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error('Please fill in all fields');
      return;
    }

    const productId = newProduct.id || generateProductId();
    const price = parseFloat(newProduct.price);
    const stock = parseInt(newProduct.stock);

    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error('Please enter a valid stock amount');
      return;
    }

    try {
      toast.info('📝 Adding product to contract...', {
        description: 'Please confirm the transaction'
      });

      // Add product to smart contract
      writeContract({
        address: PAYMENT_CONTRACT_CONFIG.address,
        abi: PAYMENT_CONTRACT_CONFIG.abi,
        functionName: 'addProduct',
        args: [
          productId,
          newProduct.name,
          BigInt(Math.floor(price * 1e18)), // Convert to wei (18 decimals)
          BigInt(stock)
        ],
      } as any);

      // Add to local state for NFC writing
      const product: Product = {
        id: productId,
        name: newProduct.name,
        price: price,
        stock: stock
      };
      
      setProducts(prev => [...prev, product]);

    } catch (error: any) {
      console.error('Add product error:', error);
      toast.error('Failed to add product', {
        description: error.message || 'Please try again'
      });
    }
  };

  const writeNFCTag = async (product: Product) => {
    if (!isNFCSupported) {
      toast.error('NFC is not supported on this device');
      return;
    }

    try {
      setIsWriting(true);
      toast.info('📱 Preparing NFC write...', {
        description: 'Bring your NFC tag close to the device'
      });

      const ndef = new (window as any).NDEFReader();
      const nfcId = generateNFCId();
      
      // Create the payment URL with product and NFC ID
      const paymentUrl = `${window.location.origin}/pay?pid=${product.id}&nfc=${nfcId}`;
      
      // Create NDEF record with product data
      const record = {
        recordType: 'url',
        data: paymentUrl
      };

      // Write to NFC tag
      await ndef.write({
        records: [record]
      });

      toast.success('✅ NFC tag written successfully!', {
        description: `Tag configured for ${product.name}`
      });

      // Log the written data for debugging
      console.log('NFC Tag Written:', {
        product: product,
        nfcId: nfcId,
        url: paymentUrl
      });

    } catch (error: any) {
      console.error('NFC write error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('NFC permission denied');
      } else if (error.name === 'NotSupportedError') {
        toast.error('NFC is not supported on this device');
      } else if (error.name === 'NotReadableError') {
        toast.error('No NFC tag found. Please try again.');
      } else {
        toast.error('Failed to write NFC tag', {
          description: error.message || 'Please try again'
        });
      }
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* NFC Support Status */}
      <GlassCard className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isNFCSupported ? 'bg-status-success/20' : 'bg-status-danger/20'}`}>
            <Wifi className={`w-5 h-5 ${isNFCSupported ? 'text-status-success' : 'text-status-danger'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">NFC Status</h3>
            <p className={`text-sm ${isNFCSupported ? 'text-status-success' : 'text-status-danger'}`}>
              {isNFCSupported ? 'NFC is supported and ready' : 'NFC is not supported on this device'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Add Product Form */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/20">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Add New Product</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Premium Coffee"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="productId">Product ID (Optional)</Label>
            <Input
              id="productId"
              placeholder="Auto-generated if empty"
              value={newProduct.id}
              onChange={(e) => setNewProduct(prev => ({ ...prev, id: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="productPrice">Price (KRW)</Label>
            <Input
              id="productPrice"
              type="number"
              placeholder="5000"
              value={newProduct.price}
              onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="productStock">Initial Stock</Label>
            <Input
              id="productStock"
              type="number"
              placeholder="50"
              value={newProduct.stock}
              onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>

        <FuturisticButton
          onClick={handleAddProduct}
          disabled={isPending || isConfirming}
          className="w-full mt-6"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isPending ? 'Adding to Contract...' : 'Confirming...'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Product to Contract
            </>
          )}
        </FuturisticButton>
      </GlassCard>

      {/* Products List */}
      {products.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-accent-cyan/20">
              <Package className="w-5 h-5 text-accent-cyan" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Products Ready for NFC</h2>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-surface-800/30 rounded-lg border border-surface-700/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{product.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-sm text-text-secondary">
                        <Coins className="w-3 h-3" />
                        <span>₩{product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-text-secondary">
                        <Package className="w-3 h-3" />
                        <span>{product.stock} in stock</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Hash className="w-3 h-3 mr-1" />
                        {product.id.slice(0, 12)}...
                      </Badge>
                    </div>
                  </div>
                </div>

                <FuturisticButton
                  onClick={() => writeNFCTag(product)}
                  disabled={!isNFCSupported || isWriting}
                  variant="secondary"
                  size="sm"
                >
                  {isWriting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Writing...
                    </>
                  ) : (
                    <>
                      <NfcIcon className="w-4 h-4 mr-2" />
                      Write NFC Tag
                    </>
                  )}
                </FuturisticButton>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Instructions */}
      <GlassCard className="p-6 bg-gradient-to-br from-primary/5 to-accent-cyan/5 border-primary/20">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-primary/20 mt-1">
            <AlertCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-2">How to Use</h3>
            <ol className="text-sm text-text-secondary space-y-2">
              <li>1. Fill in product details and click "Add Product to Contract"</li>
              <li>2. Wait for blockchain confirmation</li>
              <li>3. Click "Write NFC Tag" next to the product</li>
              <li>4. Bring an NFC tag close to your device when prompted</li>
              <li>5. The tag will be programmed with the payment URL</li>
              <li>6. Customers can now tap the tag to instantly purchase!</li>
            </ol>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
