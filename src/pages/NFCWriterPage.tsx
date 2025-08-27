import React from 'react';
import NFCTagWriter from '@/components/scanner/NFCTagWriter';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { FuturisticButton } from '@/components/ui/futuristic-button';

const NFCWriterPage: React.FC = () => {
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
      <div className="pt-20">
        <NFCTagWriter 
          onWriteComplete={(data) => {
            console.log('NFC tag written successfully:', data);
          }}
          onError={(error) => {
            console.error('NFC write error:', error);
          }}
        />
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
    </div>
  );
};

export default NFCWriterPage;
