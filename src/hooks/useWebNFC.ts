import { useState, useEffect, useCallback, useRef } from 'react';
import { NDEFReader, NDEFReadingEvent, NFCProductData, NFCTagData } from '@/types/webNFC';

export interface NFCState {
  isSupported: boolean;
  isPermissionGranted: boolean;
  isScanning: boolean;
  isWriting: boolean;
  error: string | null;
  lastScannedData: NFCProductData | null;
  scanCount: number;
}

export interface UseWebNFCResult extends NFCState {
  startScan: () => Promise<void>;
  stopScan: () => void;
  writeTag: (data: NFCProductData) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  clearError: () => void;
  resetState: () => void;
}

export const useWebNFC = (): UseWebNFCResult => {
  const [state, setState] = useState<NFCState>({
    isSupported: false,
    isPermissionGranted: false,
    isScanning: false,
    isWriting: false,
    error: null,
    lastScannedData: null,
    scanCount: 0,
  });

  const readerRef = useRef<NDEFReader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check WebNFC support on mount
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 'NDEFReader' in window && 'serviceWorker' in navigator;
      setState(prev => ({ ...prev, isSupported }));
      
      if (!isSupported) {
        setState(prev => ({
          ...prev,
          error: 'WebNFC is not supported. Please use Chrome on Android 6+ with HTTPS.'
        }));
      }
    };

    checkSupport();
  }, []);

  // Request NFC permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!state.isSupported) {
        throw new Error('WebNFC is not supported on this device');
      }

      // Check if permissions API is available (not available in all browsers)
      if ('permissions' in navigator && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'nfc' } as any);
          if (permission.state === 'granted') {
            setState(prev => ({ ...prev, isPermissionGranted: true, error: null }));
            return true;
          }
        } catch (e) {
          // Permissions API might not support NFC, continue with direct approach
          console.log('Permissions API does not support NFC, trying direct approach');
        }
      }

      // Try to create NDEFReader to test permission
      if (window.NDEFReader) {
        const testReader = new window.NDEFReader();
        // If we can create it without error, assume permission is available
        setState(prev => ({ ...prev, isPermissionGranted: true, error: null }));
        return true;
      }

      throw new Error('NDEFReader not available');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to request NFC permission';
      setState(prev => ({ ...prev, error: errorMessage, isPermissionGranted: false }));
      return false;
    }
  }, [state.isSupported]);

  // Parse NFC data from NDEF record
  const parseNFCData = useCallback((data: ArrayBuffer): NFCProductData | null => {
    try {
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(data);
      
      console.log('📱 Raw NFC data string:', jsonString);
      
      const tagData: NFCTagData = JSON.parse(jsonString);
      
      console.log('📱 Parsed NFC tag data:', tagData);
      
      // Validate the tag data structure
      if (tagData.type === 'product' && tagData.data) {
        const productData = tagData.data as NFCProductData;
        
        console.log('📱 Product data extracted:', productData);
        
        // Validate required fields (including merchantId and contractAddress)
        if (productData.productId && 
            productData.name && 
            productData.price !== undefined && 
            productData.price > 0 &&
            productData.merchantId &&
            productData.contractAddress) {
          
          console.log('✅ NFC product data validation passed');
          
          return {
            ...productData,
            timestamp: Date.now(), // Add current timestamp
          };
        } else {
          console.error('❌ Missing required fields:', {
            productId: !!productData.productId,
            name: !!productData.name,
            price: productData.price !== undefined && productData.price > 0,
            merchantId: !!productData.merchantId,
            contractAddress: !!productData.contractAddress
          });
        }
      } else {
        console.error('❌ Invalid tag structure:', {
          type: tagData.type,
          hasData: !!tagData.data
        });
      }
      
      throw new Error('Invalid NFC tag format');
    } catch (error: any) {
      console.error('❌ Failed to parse NFC data:', error);
      throw new Error('Invalid NFC tag data format');
    }
  }, []);

  // Start NFC scanning
  const startScan = useCallback(async (): Promise<void> => {
    try {
      if (!state.isSupported) {
        throw new Error('WebNFC is not supported on this device');
      }

      if (!state.isPermissionGranted) {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
          throw new Error('NFC permission denied');
        }
      }

      // Stop any existing scan
      stopScan();

      // Create new reader and abort controller
      if (!window.NDEFReader) {
        throw new Error('NDEFReader not available');
      }

      const reader = new window.NDEFReader();
      const abortController = new AbortController();
      
      readerRef.current = reader;
      abortControllerRef.current = abortController;

      setState(prev => ({ ...prev, isScanning: true, error: null }));

      // Set up event listeners
      reader.onreading = (event: NDEFReadingEvent) => {
        console.log('📱 NFC tag detected:', event);
        console.log('📱 Message records:', event.message.records);
        
        try {
          // Process each record in the message
          for (const record of event.message.records) {
            console.log('📱 Processing record:', {
              recordType: record.recordType,
              hasData: !!record.data,
              dataLength: record.data?.byteLength
            });
            
            if (record.recordType === 'text' || record.recordType === 'application/json') {
              if (record.data) {
                const productData = parseNFCData(record.data as ArrayBuffer);
                if (productData) {
                  console.log('✅ Successfully parsed product data:', productData);
                  setState(prev => ({
                    ...prev,
                    lastScannedData: productData,
                    scanCount: prev.scanCount + 1,
                    error: null
                  }));
                  return; // Exit after successful parse
                }
              } else {
                console.warn('⚠️ Record has no data:', record);
              }
            } else {
              console.warn('⚠️ Unsupported record type:', record.recordType);
            }
          }
          
          // If no valid data found in any record
          console.error('❌ No valid product data found in any record');
          throw new Error('No valid product data found in NFC tag');
        } catch (error: any) {
          console.error('❌ Error processing NFC tag:', error);
          setState(prev => ({
            ...prev,
            error: error.message || 'Failed to read NFC tag data'
          }));
        }
      };

      reader.onreadingerror = (event: Event) => {
        console.error('NFC reading error:', event);
        setState(prev => ({
          ...prev,
          error: 'Failed to read NFC tag. Please try again.',
          isScanning: false
        }));
      };

      // Start scanning
      await reader.scan({ signal: abortController.signal });
      
    } catch (error: any) {
      console.error('Failed to start NFC scan:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to start NFC scanning',
        isScanning: false
      }));
      stopScan();
    }
  }, [state.isSupported, state.isPermissionGranted, requestPermission, parseNFCData]);

  // Stop NFC scanning
  const stopScan = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    readerRef.current = null;
    setState(prev => ({ ...prev, isScanning: false }));
  }, []);

  // Write data to NFC tag
  const writeTag = useCallback(async (data: NFCProductData): Promise<void> => {
    try {
      if (!state.isSupported) {
        throw new Error('WebNFC is not supported on this device');
      }

      if (!state.isPermissionGranted) {
        const hasPermission = await requestPermission();
        if (!hasPermission) {
          throw new Error('NFC permission denied');
        }
      }

      if (!window.NDEFReader) {
        throw new Error('NDEFReader not available');
      }

      setState(prev => ({ ...prev, isWriting: true, error: null }));

      const reader = new window.NDEFReader();
      const abortController = new AbortController();

      // Create NFC tag data structure
      const tagData: NFCTagData = {
        type: 'product',
        version: '1.0',
        data: {
          ...data,
          timestamp: Date.now(),
        },
      };

      const message = JSON.stringify(tagData);

      // Write to NFC tag
      await reader.write(message, { 
        overwrite: true,
        signal: abortController.signal 
      });

      setState(prev => ({ ...prev, isWriting: false, error: null }));
      
    } catch (error: any) {
      console.error('Failed to write NFC tag:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to write NFC tag',
        isWriting: false
      }));
    }
  }, [state.isSupported, state.isPermissionGranted, requestPermission]);

  // Clear error
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Reset state
  const resetState = useCallback((): void => {
    stopScan();
    setState(prev => ({
      ...prev,
      error: null,
      lastScannedData: null,
      scanCount: 0
    }));
  }, [stopScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, [stopScan]);

  return {
    ...state,
    startScan,
    stopScan,
    writeTag,
    requestPermission,
    clearError,
    resetState,
  };
};
