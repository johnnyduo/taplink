/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID: string
  readonly VITE_KAIA_KAIROS_RPC: string
  readonly VITE_KAIA_KAIROS_CHAIN_ID: string
  readonly VITE_KAIA_KAIROS_SYMBOL: string
  readonly VITE_KAIA_KAIROS_EXPLORER: string
  readonly VITE_KRW_CONTRACT_ADDRESS: string
  readonly VITE_PAYMENT_CONTRACT_ADDRESS: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
