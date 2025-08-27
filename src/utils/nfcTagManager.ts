import { NFCProductData } from '@/types/webNFC';

// Sample product data for demo purposes
export const DEMO_PRODUCTS: NFCProductData[] = [
  {
    productId: '1001',
    name: 'Cap NY',
    price: 25000, // 25,000 KRW
    currency: 'KRW',
    description: 'Stylish New York cap for everyday wear',
    image: '/products/cap-ny.jpg',
    merchantId: 'fashion-store-001',
    merchantName: 'Fashion Store Seoul',
    contractAddress: import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS || '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526',
    chainId: parseInt(import.meta.env.VITE_KAIA_KAIROS_CHAIN_ID || '1001'),
    timestamp: Date.now(),
  },
  {
    productId: 'hat-baseball-002',
    name: 'Baseball Cap',
    price: 28000, // 28,000 KRW
    currency: 'KRW',
    description: 'Classic baseball cap with adjustable strap',
    image: '/products/baseball-cap.jpg',
    merchantId: 'fashion-store-001',
    merchantName: 'Fashion Store Seoul',
    contractAddress: import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS || '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526',
    chainId: parseInt(import.meta.env.VITE_KAIA_KAIROS_CHAIN_ID || '1001'),
    timestamp: Date.now(),
  },
  {
    productId: 'hat-beanie-003',
    name: 'Winter Beanie',
    price: 20000, // 20,000 KRW
    currency: 'KRW',
    description: 'Warm knitted beanie for winter',
    image: '/products/beanie.jpg',
    merchantId: 'fashion-store-001',
    merchantName: 'Fashion Store Seoul',
    contractAddress: import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS || '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526',
    chainId: parseInt(import.meta.env.VITE_KAIA_KAIROS_CHAIN_ID || '1001'),
    timestamp: Date.now(),
  },
  {
    productId: 'pastry-croissant-004',
    name: 'Butter Croissant',
    price: 15000, // 15,000 KRW
    currency: 'KRW',
    description: 'Flaky French butter croissant',
    image: '/products/croissant.jpg',
    merchantId: 'cafe-seoul-001',
    merchantName: 'Cafe Seoul',
    contractAddress: import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS || '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526',
    chainId: parseInt(import.meta.env.VITE_KAIA_KAIROS_CHAIN_ID || '1001'),
    timestamp: Date.now(),
  },
  {
    productId: 'sandwich-club-005',
    name: 'Club Sandwich',
    price: 18000, // 18,000 KRW
    currency: 'KRW',
    description: 'Triple-decker sandwich with chicken and bacon',
    image: '/products/club-sandwich.jpg',
    merchantId: 'cafe-seoul-001',
    merchantName: 'Cafe Seoul',
    contractAddress: import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS || '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526',
    chainId: parseInt(import.meta.env.VITE_KAIA_KAIROS_CHAIN_ID || '1001'),
    timestamp: Date.now(),
  }
];

// Utility functions for NFC tag management
export class NFCTagManager {
  /**
   * Get product by ID
   */
  static getProduct(productId: string): NFCProductData | undefined {
    return DEMO_PRODUCTS.find(product => product.productId === productId);
  }

  /**
   * Get all available products
   */
  static getAllProducts(): NFCProductData[] {
    return [...DEMO_PRODUCTS];
  }

  /**
   * Create custom product data
   */
  static createProduct(
    id: string,
    name: string,
    price: number,
    options?: Partial<NFCProductData>
  ): NFCProductData {
    return {
      productId: id,
      name,
      price,
      currency: options?.currency || 'KRW',
      description: options?.description || '',
      image: options?.image || '/products/default.jpg',
      merchantId: options?.merchantId || 'cafe-seoul-001',
      merchantName: options?.merchantName || 'Cafe Seoul',
      contractAddress: options?.contractAddress || import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS || '0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526',
      chainId: options?.chainId || parseInt(import.meta.env.VITE_KAIA_KAIROS_CHAIN_ID || '1001'),
      timestamp: Date.now(),
    };
  }

  /**
   * Validate product data
   */
  static validateProduct(data: Partial<NFCProductData>): boolean {
    return !!(
      data.productId &&
      data.name &&
      data.price !== undefined &&
      data.price > 0 &&
      data.merchantId &&
      data.contractAddress
    );
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'KRW'): string {
    const formatter = new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency === 'KRW' ? 'KRW' : 'USD',
      minimumFractionDigits: 0,
    });
    
    return formatter.format(price);
  }

  /**
   * Convert KRW price to wei for contract interaction
   */
  static convertToWei(krwPrice: number): bigint {
    // For demo purposes, we'll use a 1:1 ratio
    // In production, you might want to use a proper exchange rate
    return BigInt(krwPrice) * BigInt(10 ** 18);
  }

  /**
   * Convert wei back to KRW for display
   */
  static convertFromWei(weiAmount: bigint): number {
    return Number(weiAmount / BigInt(10 ** 18));
  }

  /**
   * Generate QR code fallback URL for non-NFC devices
   */
  static generateFallbackUrl(productId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/scan?product=${productId}&fallback=qr`;
  }

  /**
   * Check if current environment supports WebNFC
   */
  static checkNFCSupport(): {
    isSupported: boolean;
    isSecureContext: boolean;
    isChrome: boolean;
    isMobile: boolean;
    reason?: string;
  } {
    const isSecureContext = window.isSecureContext;
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasNDEFReader = 'NDEFReader' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;

    let reason: string | undefined;
    
    if (!isSecureContext) {
      reason = 'HTTPS required for WebNFC';
    } else if (!isChrome) {
      reason = 'Chrome browser required';
    } else if (!isMobile) {
      reason = 'Mobile device required';
    } else if (!hasNDEFReader) {
      reason = 'NDEFReader not available';
    } else if (!hasServiceWorker) {
      reason = 'Service Worker not available';
    }

    return {
      isSupported: hasNDEFReader && hasServiceWorker && isSecureContext && isChrome,
      isSecureContext,
      isChrome,
      isMobile,
      reason,
    };
  }
}

// Export demo data for easy access
export default DEMO_PRODUCTS;
