import { createConnector } from 'wagmi';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, createPublicClient, http } from 'viem';

// Create a custom connector for our hardcoded wallet
export function hardcodedWalletConnector() {
  return createConnector((config) => ({
    id: 'hardcoded-demo-wallet',
    name: 'Demo Wallet (Chrome Android)',
    type: 'injected' as const,
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZmlsbD0iIzAwZDRmZiIgZD0iTTE2IDJhMTQgMTQgMCAxIDEgMCAyOCAxNCAxNCAwIDAgMSAwLTI4WiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Im0xMS41IDEyIDQgNCA0LTQtMS41LTEuNUwxNiAxNmwtMi0yTDExLjUgMTJaIi8+PC9zdmc+',

    async connect() {
      try {
        const privateKeyRaw = import.meta.env.VITE_DEMO_WALLET_PRIVATE_KEY;
        if (!privateKeyRaw) {
          throw new Error('Demo wallet private key not configured');
        }

        const privateKey = privateKeyRaw.startsWith('0x') 
          ? privateKeyRaw as `0x${string}`
          : `0x${privateKeyRaw}` as `0x${string}`;

        const account = privateKeyToAccount(privateKey);
        
        return {
          accounts: [account.address],
          chainId: 1001, // Kaia Testnet
        };
      } catch (error) {
        console.error('Failed to connect hardcoded wallet:', error);
        throw new Error('Failed to connect demo wallet');
      }
    },

    async disconnect() {
      // Nothing to disconnect for hardcoded wallet
    },

    async getAccounts() {
      try {
        const privateKeyRaw = import.meta.env.VITE_DEMO_WALLET_PRIVATE_KEY;
        if (!privateKeyRaw) return [];

        const privateKey = privateKeyRaw.startsWith('0x') 
          ? privateKeyRaw as `0x${string}`
          : `0x${privateKeyRaw}` as `0x${string}`;

        const account = privateKeyToAccount(privateKey);
        return [account.address];
      } catch {
        return [];
      }
    },

    async getChainId() {
      return 1001; // Kaia Testnet
    },

    async isAuthorized() {
      return !!import.meta.env.VITE_DEMO_WALLET_PRIVATE_KEY;
    },

    async switchChain({ chainId }) {
      if (chainId !== 1001) {
        throw new Error('Demo wallet only supports Kaia Testnet');
      }
      return config.chains.find(chain => chain.id === chainId)!;
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect();
      } else {
        config.emitter.emit('change', { accounts: accounts as `0x${string}`[] });
      }
    },

    onChainChanged(chainId) {
      const id = Number(chainId);
      const chain = config.chains.find((x) => x.id === id);
      if (chain) {
        config.emitter.emit('change', { chainId: id });
      }
    },

    onConnect(connectInfo) {
      const chainId = Number(connectInfo.chainId);
      const chain = config.chains.find((x) => x.id === chainId);
      if (chain) {
        const privateKeyRaw = import.meta.env.VITE_DEMO_WALLET_PRIVATE_KEY;
        if (privateKeyRaw) {
          const privateKey = privateKeyRaw.startsWith('0x') 
            ? privateKeyRaw as `0x${string}`
            : `0x${privateKeyRaw}` as `0x${string}`;
          const account = privateKeyToAccount(privateKey);
          config.emitter.emit('connect', { 
            accounts: [account.address],
            chainId: chainId 
          });
        }
      }
    },

    onDisconnect() {
      config.emitter.emit('disconnect');
    },

    onMessage(message) {
      config.emitter.emit('message', message);
    },

    async getProvider() {
      // Create a custom EIP-1193 provider that handles signing
      const privateKeyRaw = import.meta.env.VITE_DEMO_WALLET_PRIVATE_KEY;
      if (!privateKeyRaw) {
        throw new Error('Demo wallet private key not configured');
      }

      const privateKey = privateKeyRaw.startsWith('0x') 
        ? privateKeyRaw as `0x${string}`
        : `0x${privateKeyRaw}` as `0x${string}`;

      const account = privateKeyToAccount(privateKey);
      
      // Find the Kaia testnet chain
      const kaiaChain = config.chains.find(chain => chain.id === 1001);
      if (!kaiaChain) {
        throw new Error('Kaia testnet chain not found in config');
      }

      // Create a wallet client that can sign transactions
      const walletClient = createWalletClient({
        account,
        chain: kaiaChain,
        transport: http('https://public-en-kairos.node.kaia.io')
      });

      // Return an EIP-1193 compatible provider
      return {
        async request({ method, params }: any) {
          if (method === 'eth_sendTransaction') {
            // Use the wallet client to send the transaction
            const [txRequest] = params;
            const hash = await walletClient.sendTransaction(txRequest);
            return hash;
          }
          
          if (method === 'eth_accounts') {
            return [account.address];
          }
          
          if (method === 'eth_chainId') {
            return `0x${kaiaChain.id.toString(16)}`;
          }
          
          // For other methods, use the public client
          const publicClient = createPublicClient({
            chain: kaiaChain,
            transport: http('https://public-en-kairos.node.kaia.io')
          });
          
          return await publicClient.transport.request({ method, params });
        }
      };
    },
  }));
}
