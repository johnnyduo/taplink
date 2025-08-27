import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { defineChain } from 'viem'
import { createStorage } from '@wagmi/core'
import { hardcodedWalletConnector } from './hardcodedConnector'

// Get project ID from environment
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_REOWN_PROJECT_ID is not set')
}

// Define Kaia Kairos Testnet
const kaiaKairosTestnet = defineChain({
  id: 1001,
  name: 'Kaia Kairos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kairos.node.kaia.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kaia Kairos Explorer',
      url: 'https://kairos.kaiascan.io',
    },
  },
  testnet: true,
})

// Create a metadata object
const metadata = {
  name: import.meta.env.VITE_APP_NAME || 'TapLink dePOS',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'NFC-enabled point of sale with blockchain integration',
  url: 'https://taplink-depos.com',
  icons: ['https://taplink-depos.com/favicon.ico']
}

// Create the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: typeof window !== 'undefined' ? localStorage : undefined }),
  ssr: false,
  projectId,
  networks: [kaiaKairosTestnet],
  connectors: [hardcodedWalletConnector()]
})

// Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [kaiaKairosTestnet],
  defaultNetwork: kaiaKairosTestnet,
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#1a1b1e',
    '--w3m-color-mix-strength': 20,
    '--w3m-font-family': 'Inter, system-ui, -apple-system, sans-serif',
    '--w3m-border-radius-master': '12px',
    '--w3m-accent': '#00d4ff',
  }
})

// Export the wagmi config
export { wagmiAdapter }

// Create query client
export const queryClient = new QueryClient()

// Provider component
export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
