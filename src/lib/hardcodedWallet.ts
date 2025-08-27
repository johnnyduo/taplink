import { createWalletClient, createPublicClient, http, formatEther, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
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

  // Process payment transaction
  async processPayment(
    productId: string,
    amount: string,
    merchantAddress: `0x${string}`
  ): Promise<`0x${string}`> {
    try {
      const contractAddress = import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS as `0x${string}`;
      
      if (!contractAddress) {
        throw new Error('Payment contract address not configured');
      }

      const amountWei = parseEther(amount);

      // Call the payment contract
      const hash = await this.walletClient.writeContract({
        address: contractAddress,
        abi: [
          {
            name: 'processPayment',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              { name: '_recipient', type: 'address' },
              { name: '_amount', type: 'uint256' },
              { name: '_productId', type: 'string' },
              { name: '_merchantId', type: 'string' }
            ],
            outputs: []
          }
        ],
        functionName: 'processPayment',
        args: [merchantAddress, amountWei, productId, 'demo-merchant'],
        value: amountWei
      });

      console.log('💳 Payment processed:', { hash, productId, amount });
      return hash;
    } catch (error) {
      console.error('Failed to process payment:', error);
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
