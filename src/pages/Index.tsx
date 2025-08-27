
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import NFCScanner from '@/components/scanner/NFCScanner'; 
import PaymentModal from '@/components/payment/PaymentModal';
import ReceiptNFT from '@/components/receipt/ReceiptNFT';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'scan' | 'payment' | 'receipt'>('scan');
  const [productData, setProductData] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleScanComplete = (data: any) => {
    setProductData(data);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (receipt: any) => {
    setReceiptData(receipt);
    setCurrentStep('receipt');
  };

  const handleReceiptClose = () => {
    setCurrentStep('scan');
    setProductData(null);
    setReceiptData(null);
  };

  const handlePaymentClose = () => {
    setCurrentStep('scan');
    setProductData(null);
  };

  return (
    <div className="min-h-screen bg-surface-900 noise-texture">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <Header 
          title="TapLink dePOS" 
          subtitle="Tap to buy. Proof in hand."
          userRole="customer"
        />
        
        <main className="animate-fade-in">
          {currentStep === 'scan' && (
            <NFCScanner onScanComplete={handleScanComplete} />
          )}
        </main>

        {/* Payment Modal */}
        {currentStep === 'payment' && productData && (
          <PaymentModal
            isOpen={true}
            onClose={handlePaymentClose}
            productData={productData}
            onPaymentComplete={handlePaymentComplete}
          />
        )}

        {/* Receipt NFT Modal */}
        {currentStep === 'receipt' && receiptData && (
          <ReceiptNFT
            receiptData={receiptData}
            onClose={handleReceiptClose}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
