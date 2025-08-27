import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Calendar } from 'lucide-react';

export const ReportsExports: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [format, setFormat] = useState('csv');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display text-2xl font-bold text-text-primary">Reports & Exports</h2>
        <p className="text-text-secondary">Generate tax-ready reports and export data</p>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-display text-lg font-semibold text-text-primary mb-4">Export Sales Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">From Date</label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">To Date</label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 bg-surface-700 border border-glass-2 rounded-lg text-text-primary"
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">Tax-ready export format</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <FuturisticButton variant="primary">
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </FuturisticButton>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-display text-lg font-semibold text-text-primary mb-4">Recent Exports</h3>
        
        <div className="space-y-3">
          {[
            { name: 'Sales_Report_Aug_2025.csv', date: '2025-08-27', size: '245 KB' },
            { name: 'Tax_Export_Q3_2025.pdf', date: '2025-08-26', size: '1.2 MB' },
          ].map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-surface-700/30 border border-glass-1">
              <div>
                <p className="font-medium text-text-primary">{file.name}</p>
                <p className="text-sm text-text-secondary">{file.date} • {file.size}</p>
              </div>
              <FuturisticButton variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </FuturisticButton>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
