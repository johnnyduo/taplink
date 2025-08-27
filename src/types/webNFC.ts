// WebNFC API type definitions for Chrome Android
// Reference: https://w3c.github.io/web-nfc/

export interface NDEFMessage {
  records: NDEFRecord[];
}

export interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: BufferSource;
  encoding?: string;
  lang?: string;
}

export interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: NDEFMessage;
}

export interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

export interface NDEFScanOptions {
  signal?: AbortSignal;
}

export interface NFCPermissionDescriptor {
  name: 'nfc';
}

declare global {
  interface Navigator {
    nfcPermissions?: {
      query(descriptor: NFCPermissionDescriptor): Promise<PermissionStatus>;
    };
  }
  
  interface Window {
    NDEFReader?: {
      new (): NDEFReader;
    };
  }
}

export interface NDEFReader extends EventTarget {
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
  scan(options?: NDEFScanOptions): Promise<void>;
  write(message: NDEFMessage | string, options?: NDEFWriteOptions): Promise<void>;
}

// Product data structure for NFC tags
export interface NFCProductData {
  productId: string;
  name: string;
  price: number; // in wei or smallest unit
  currency: string;
  description?: string;
  image?: string;
  merchantId: string;
  merchantName: string;
  contractAddress: string;
  chainId: number;
  timestamp: number;
}

// NFC tag types
export type NFCTagType = 'product' | 'merchant' | 'payment' | 'receipt';

export interface NFCTagData {
  type: NFCTagType;
  version: string;
  data: NFCProductData | any;
}
