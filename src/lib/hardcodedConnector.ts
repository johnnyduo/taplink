import { createConnector } from 'wagmi';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';

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
      return null; // AppKit will use the default provider
    },
  }));
}
