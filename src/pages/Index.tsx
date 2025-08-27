
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import NFCScanner from '@/components/scanner/NFCScanner'; 
import PaymentModal from '@/components/payment/PaymentModal';
import ReceiptNFT from '@/components/receipt/ReceiptNFT';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Settings } from 'lucide-react';

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
            <div className="space-y-4">
              {/* Wallet Connection Section */}
              <ConnectWallet />
              
              <NFCScanner onScanComplete={handleScanComplete} />
              
              {/* Owner Dashboard Access */}
              <div className="text-center">
                <Link to="/owner">
                  <FuturisticButton variant="ghost" size="sm" className="btn-aligned">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Shop Owner Dashboard</span>
                  </FuturisticButton>
                </Link>
              </div>
            </div>
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
