import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { OwnerSidebar } from '@/components/owner/OwnerSidebar';
import DashboardHome from '@/components/owner/DashboardHome';
import { InventoryManager } from '@/components/owner/InventoryManager';
import { ProductEditor } from '@/components/owner/ProductEditor';
import { NFCWriter } from '@/components/owner/NFCWriter';
import SalesFeed from '@/components/owner/SalesFeed';
import { PayoutsVault } from '@/components/owner/PayoutsVault';
import { ReportsExports } from '@/components/owner/ReportsExports';
import { OwnerSettings } from '@/components/owner/OwnerSettings';

const OwnerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-surface-900 noise-texture">
      <div className="flex">
        <OwnerSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="p-6">
            <Header 
              title="Shop Owner Dashboard" 
              subtitle="Manage your store operations"
              userRole="owner"
            />
            
            <main className="animate-fade-in">
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/inventory" element={<InventoryManager />} />
                <Route path="/product/:id" element={<ProductEditor />} />
                <Route path="/nfc-writer" element={<NFCWriter />} />
                <Route path="/sales" element={<SalesFeed />} />
                <Route path="/payouts" element={<PayoutsVault />} />
                <Route path="/reports" element={<ReportsExports />} />
                <Route path="/settings" element={<OwnerSettings />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
