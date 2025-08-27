import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NFCScanner from '@/components/scanner/NFCScanner';
import NFCPaymentModal from '@/components/scanner/NFCPaymentModal';
import ReceiptNFT from '@/components/receipt/ReceiptNFT';
import { ArrowLeft } from 'lucide-react';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { NFCProductData } from '@/types/webNFC';

const NFCScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [scannedProduct, setScannedProduct] = useState<NFCProductData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleScanComplete = (productData: NFCProductData) => {
    console.log('Product scanned:', productData);
    setScannedProduct(productData);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = (receipt: any) => {
    console.log('Payment completed:', receipt);
    setReceiptData(receipt);
    setShowPaymentModal(false);
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  const handleClosePayment = () => {
    setShowPaymentModal(false);
    setScannedProduct(null);
  };

  const handleCloseReceipt = () => {
    setReceiptData(null);
    setScannedProduct(null);
    // Optionally navigate back to scanner or home
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-10">
        <Link to="/">
          <FuturisticButton variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </FuturisticButton>
        </Link>
      </div>

      {/* Main Content */}
      <div className="pt-10">
        {receiptData ? (
          <ReceiptNFT 
            receiptData={receiptData} 
            onClose={handleCloseReceipt}
          />
        ) : (
          <NFCScanner 
            onScanComplete={handleScanComplete}
            onError={handleScanError}
          />
        )}
      </div>

      {/* Payment Modal */}
      {scannedProduct && (
        <NFCPaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePayment}
          productData={scannedProduct}
          onPaymentComplete={handlePaymentComplete}
          onError={handlePaymentError}
        />
      )}

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
    </div>
  );
};

export default NFCScanPage;
