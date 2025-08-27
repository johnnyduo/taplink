import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { formatEther, parseEther } from 'viem/utils';
import { PAYMENT_CONTRACT_CONFIG } from './contracts/payment-abi';
import { KRW_CONTRACT_CONFIG } from './contracts/krw-abi';
import { defineChain } from 'viem';

// Define Kaia Testnet chain
const kaiaTestnet = defineChain({
  id: 1001,
  name: 'Kaia Testnet',
  network: 'kaia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kairos.node.kaia.io'],
      webSocket: ['wss://public-en-kairos.node.kaia.io/ws'],
    },
    public: {
      http: ['https://public-en-kairos.node.kaia.io'],
      webSocket: ['wss://public-en-kairos.node.kaia.io/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'KaiaScan', url: 'https://kairos.kaiascan.io' },
  },
  testnet: true,
});

// Hardcoded demo wallet for Chrome Android testing
export class HardcodedWallet {
  public readonly address: `0x${string}`;
  private readonly account: ReturnType<typeof privateKeyToAccount>;
  private readonly walletClient: ReturnType<typeof createWalletClient>;
  private readonly publicClient: ReturnType<typeof createPublicClient>;

  constructor() {
    const privateKeyRaw = import.meta.env.VITE_DEMO_WALLET_PRIVATE_KEY;
    
    if (!privateKeyRaw) {
      throw new Error('Demo wallet private key not configured');
    }

    // Ensure private key has 0x prefix
    const privateKey = privateKeyRaw.startsWith('0x') 
      ? privateKeyRaw as `0x${string}`
      : `0x${privateKeyRaw}` as `0x${string}`;

    this.account = privateKeyToAccount(privateKey);
    this.address = this.account.address;

    this.publicClient = createPublicClient({
      chain: kaiaTestnet,
      transport: http(import.meta.env.VITE_NETWORK_RPC || 'https://public-en-kairos.node.kaia.io')
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: kaiaTestnet,
      transport: http(import.meta.env.VITE_NETWORK_RPC || 'https://public-en-kairos.node.kaia.io')
    });

    console.log('🔐 Hardcoded Demo Wallet Initialized:', this.address);
  }

  // Get native KAIA balance
  async getBalance(): Promise<string> {
    try {
      const balance = await this.publicClient.getBalance({
        address: this.address
      });
      return formatEther(balance);
    } catch (error) {
      console.error('Failed to get KAIA balance:', error);
      return '0';
    }
  }

  // Get KRW token balance
  async getKRWBalance(): Promise<string> {
    try {
      const contractAddress = import.meta.env.VITE_KRW_CONTRACT_ADDRESS as `0x${string}`;
      if (!contractAddress) return '0';

      const balance = await this.publicClient.readContract({
        address: contractAddress,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'balanceOf',
        args: [this.address]
      });
      
      return formatEther(balance as bigint);
    } catch (error) {
      console.error('Failed to get KRW balance:', error);
      return '0';
    }
  }

  // Process payment transaction using KRW stable coins
  async processPayment(
    productId: string,
    krwAmount: string, // KRW amount for reference and approval
    merchantAddress: `0x${string}` // Not used in tapToPay but kept for compatibility
  ): Promise<`0x${string}`> {
    try {
      console.log('💳 Starting KRW token payment:', {
        productId,
        krwAmount: krwAmount + ' KRW tokens',
        paymentContract: PAYMENT_CONTRACT_CONFIG.address,
        krwContract: KRW_CONTRACT_CONFIG.address,
        method: 'tapToPay'
      });

      // Convert KRW amount to token units for approval
      const krwTokenAmount = parseEther(krwAmount);
      
      // Force product to be active - always add or reactivate if needed
      let productNeedsUpdate = false;
      
      try {
        console.log('🔍 Checking if product exists and is active in contract...');
        const productInfo = await this.publicClient.readContract({
          ...PAYMENT_CONTRACT_CONFIG,
          functionName: 'getProduct',
          args: [productId]
        }) as [string, bigint, bigint, boolean]; // [name, price, stock, active]
        
        const [name, price, stock, active] = productInfo;
        
        if (name === '') {
          // Product doesn't exist
          console.log('➕ Product not found, will add it to contract...');
          productNeedsUpdate = true;
        } else if (!active) {
          // Product exists but is inactive - we'll add it again to force activation
          console.log('🔄 Product exists but is inactive, will reactivate it...');
          productNeedsUpdate = true;
        } else {
          console.log('✅ Product exists and is active in contract:', {
            name,
            price: price.toString(),
            stock: stock.toString(),
            active
          });
        }
      } catch (productError) {
        console.log('➕ Product check failed, will add it to contract...', productError);
        productNeedsUpdate = true;
      }
      
      // Add or update the product to ensure it's active
      if (productNeedsUpdate) {
        console.log('📝 Adding/updating product to ensure it\'s active...');
        const addProductHash = await this.walletClient.writeContract({
          ...PAYMENT_CONTRACT_CONFIG,
          functionName: 'addProduct',
          args: [
            productId,
            productId.includes('americano') ? 'Premium Americano' : 
            productId.includes('latte') ? 'Creamy Latte' :
            productId.includes('cappuccino') ? 'Classic Cappuccino' :
            productId.includes('croissant') ? 'Butter Croissant' : 'Unknown Product',
            krwTokenAmount, // price
            BigInt(100) // stock
          ]
        });
        console.log('⏳ Waiting for product registration/update...');
        await this.publicClient.waitForTransactionReceipt({ hash: addProductHash });
        console.log('✅ Product is now active in contract');
        
        // Verify the product is now active
        try {
          const verifyProduct = await this.publicClient.readContract({
            ...PAYMENT_CONTRACT_CONFIG,
            functionName: 'getProduct',
            args: [productId]
          }) as [string, bigint, bigint, boolean];
          console.log('✅ Product verification successful - FORCED ACTIVE:', verifyProduct);
          
          if (!verifyProduct[3]) { // still not active
            throw new Error('Failed to force product to active state');
          }
        } catch (verifyError) {
          console.error('❌ Product verification failed:', verifyError);
          throw new Error('Failed to verify product was activated in contract');
        }
      }
      
      // Step 1: Approve KRW tokens for the payment contract
      console.log('🔓 Approving KRW tokens for payment contract...');
      const approveHash = await this.walletClient.writeContract({
        ...KRW_CONTRACT_CONFIG,
        functionName: 'approve',
        args: [PAYMENT_CONTRACT_CONFIG.address, krwTokenAmount]
      });

      // Wait for approval to be mined
      console.log('⏳ Waiting for approval confirmation...');
      await this.publicClient.waitForTransactionReceipt({ hash: approveHash });
      
      // Step 2: Use tapToPay function - contract handles everything internally
      console.log('💸 Calling tapToPay function...');
      const paymentHash = await this.walletClient.writeContract({
        ...PAYMENT_CONTRACT_CONFIG,
        functionName: 'tapToPay',
        args: [productId, `nfc-${Date.now()}`] // Generate unique NFC ID
      });

      console.log('✅ Payment completed successfully:', { 
        approveHash, 
        paymentHash, 
        productId,
        note: 'KRW tokens transferred, KAIA used for gas only'
      });
      
      return paymentHash;
    } catch (error: any) {
      console.error('❌ KRW token payment failed:', error);
      
      // Better error handling with KRW-specific messages
      if (error.message.includes('Product not active') || error.message.includes('not active')) {
        throw new Error(`Product "${productId}" is not active in the payment contract. Please contact support.`);
      } else if (error.message.includes('Product not found') || error.message.includes('not exist')) {
        throw new Error(`Product "${productId}" not found in payment contract. Please add it first.`);
      } else if (error.message.includes('insufficient allowance') || error.message.includes('transfer amount exceeds allowance')) {
        throw new Error('Insufficient KRW token allowance. The approval transaction may have failed.');
      } else if (error.message.includes('insufficient balance') || error.message.includes('transfer amount exceeds balance')) {
        throw new Error(`Insufficient KRW token balance. You need ${krwAmount} KRW tokens but may have less. Please claim more tokens from the faucet.`);
      } else if (error.message.includes('NFC already used') || error.message.includes('already used')) {
        throw new Error('This NFC tag has already been used for payment. Please use a fresh NFC tag.');
      } else if (error.message.includes('Out of stock') || error.message.includes('out of stock')) {
        throw new Error(`Product "${productId}" is out of stock. Please try a different product.`);
      }
      
      throw error;
    }
  }

  // Claim test tokens from faucet
  async claimFaucet(): Promise<`0x${string}`> {
    try {
      const contractAddress = import.meta.env.VITE_KRW_CONTRACT_ADDRESS as `0x${string}`;
      
      if (!contractAddress) {
        throw new Error('KRW contract address not configured');
      }

      const hash = await this.walletClient.writeContract({
        address: contractAddress,
        abi: [
          {
            name: 'faucet',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: []
          }
        ],
        functionName: 'faucet',
        args: [this.address, parseEther('10000')]
      });

      console.log('🚰 Faucet claimed:', hash);
      return hash;
    } catch (error) {
      console.error('Failed to claim faucet:', error);
      throw error;
    }
  }

  // Check if wallet can claim faucet
  async canClaimFaucet(): Promise<boolean> {
    try {
      const contractAddress = import.meta.env.VITE_KRW_CONTRACT_ADDRESS as `0x${string}`;
      
      if (!contractAddress) return false;

      const canClaim = await this.publicClient.readContract({
        address: contractAddress,
        abi: [
          {
            name: 'canClaimFaucet',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'user', type: 'address' }],
            outputs: [{ name: '', type: 'bool' }]
          }
        ],
        functionName: 'canClaimFaucet',
        args: [this.address]
      });

      return canClaim as boolean;
    } catch (error) {
      console.error('Failed to check faucet status:', error);
      return false;
    }
  }

  // Get wallet info for display
  getWalletInfo() {
    return {
      address: this.address,
      shortAddress: `${this.address.slice(0, 6)}...${this.address.slice(-4)}`,
      isHardcoded: true,
      network: 'Kaia Testnet',
    };
  }
}

// Singleton instance
export const hardcodedWallet = new HardcodedWallet();
