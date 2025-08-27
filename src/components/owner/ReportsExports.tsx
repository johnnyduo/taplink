import React, { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  Receipt,
  DollarSign,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FileImage,
  Printer,
  Mail,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
}

interface ExportJob {
  id: string;
  type: string;
  format: string;
  status: 'generating' | 'ready' | 'sent';
  progress: number;
  filename?: string;
  createdAt: string;
}

export const ReportsExports: React.FC = () => {
  const [dateRange, setDateRange] = useState({ 
    from: '2025-08-01', 
    to: '2025-08-27' 
  });
  const [reportType, setReportType] = useState('sales');
  const [format, setFormat] = useState('csv');
  const [deliveryMethod, setDeliveryMethod] = useState('download');
  const [emailAddress, setEmailAddress] = useState('');
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: 'job-001',
      type: 'Sales Summary',
      format: 'PDF',
      status: 'ready',
      progress: 100,
      filename: 'sales-report-aug-2025.pdf',
      createdAt: '2025-08-27T10:30:00Z'
    },
    {
      id: 'job-002',
      type: 'Inventory Report',
      format: 'CSV',
      status: 'generating',
      progress: 65,
      createdAt: '2025-08-27T11:15:00Z'
    }
  ]);

  // Mock report data
  const reportData: ReportData = useMemo(() => ({
    totalSales: 247,
    totalRevenue: 3250000,
    totalProducts: 85,
    averageOrderValue: 13158,
    topProducts: [
      { name: 'Premium Americano', sales: 45, revenue: 202500 },
      { name: 'TapLink Mug', sales: 28, revenue: 504000 },
      { name: 'Chocolate Croissant', sales: 32, revenue: 102400 },
      { name: 'Matcha Latte Kit', sales: 18, revenue: 225000 },
      { name: 'Smart NFC Coaster', sales: 12, revenue: 300000 }
    ],
    dailySales: [
      { date: '2025-08-20', sales: 15, revenue: 187500 },
      { date: '2025-08-21', sales: 22, revenue: 295000 },
      { date: '2025-08-22', sales: 18, revenue: 234000 },
      { date: '2025-08-23', sales: 25, revenue: 312500 },
      { date: '2025-08-24', sales: 19, revenue: 248000 },
      { date: '2025-08-25', sales: 28, revenue: 365000 },
      { date: '2025-08-26', sales: 31, revenue: 402500 }
    ],
    paymentMethods: [
      { method: 'Credit Card', count: 142, percentage: 57.5 },
      { method: 'Crypto', count: 68, percentage: 27.5 },
      { method: 'Mobile Pay', count: 37, percentage: 15.0 }
    ]
  }), []);

  const handleGenerateReport = () => {
    const newJob: ExportJob = {
      id: `job-${Date.now()}`,
      type: reportType === 'sales' ? 'Sales Summary' 
           : reportType === 'inventory' ? 'Inventory Report'
           : reportType === 'financial' ? 'Financial Report'
           : 'Tax Report',
      format: format.toUpperCase(),
      status: 'generating',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setExportJobs(prev => [newJob, ...prev]);

    // Simulate report generation
    const interval = setInterval(() => {
      setExportJobs(prev => prev.map(job => {
        if (job.id === newJob.id && job.status === 'generating') {
          const newProgress = Math.min(job.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...job,
              status: deliveryMethod === 'email' ? 'sent' : 'ready',
              progress: 100,
              filename: `${job.type.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format}`
            };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));
    }, 500);
  };

  const downloadReport = (job: ExportJob) => {
    if (job.filename) {
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = job.filename;
      link.click();
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'csv': 
      case 'excel': return <FileSpreadsheet className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'generating': return <Clock className="w-4 h-4 animate-pulse" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <Mail className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'generating': return 'bg-status-warning text-surface-900';
      case 'ready': return 'bg-status-success text-white';
      case 'sent': return 'bg-accent-cyan text-white';
      default: return 'bg-surface-700 text-text-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">Reports & Exports</h2>
          <p className="text-text-secondary">Generate comprehensive business reports and export data</p>
        </div>
        
        <FuturisticButton variant="secondary">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Report
        </FuturisticButton>
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-text-primary">{reportData.totalSales}</p>
            </div>
            <Receipt className="w-8 h-8 text-primary" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Revenue</p>
              <p className="text-2xl font-bold text-status-success">₩{reportData.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-status-success" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Products Sold</p>
              <p className="text-2xl font-bold text-accent-cyan">{reportData.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-accent-cyan" />
          </div>
        </GlassCard>
        
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-text-primary">₩{reportData.averageOrderValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-text-primary" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-glow">
              <FileText className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-display font-semibold text-text-primary">Generate Report</h3>
              <p className="text-sm text-text-secondary">Create custom business reports</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Summary</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="tax">Tax Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Delivery</label>
                <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="download">Download</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {deliveryMethod === 'email' && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
            )}

            <FuturisticButton 
              variant="primary" 
              className="w-full"
              onClick={handleGenerateReport}
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </FuturisticButton>
          </div>
        </GlassCard>

        {/* Top Products */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-glow">
              <BarChart3 className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-display font-semibold text-text-primary">Top Products</h3>
              <p className="text-sm text-text-secondary">Best performing products</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {reportData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{product.name}</p>
                    <p className="text-sm text-text-secondary">{product.sales} sales</p>
                  </div>
                </div>
                <p className="font-semibold text-status-success">₩{product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Export History */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-surface-700">
          <div className="flex items-center justify-between">
            <h3 className="text-display font-semibold text-text-primary">Export History</h3>
            <FuturisticButton variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </FuturisticButton>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-800/50">
              <tr>
                <th className="p-4 text-left text-text-secondary font-medium">Report Type</th>
                <th className="p-4 text-left text-text-secondary font-medium">Format</th>
                <th className="p-4 text-left text-text-secondary font-medium">Status</th>
                <th className="p-4 text-left text-text-secondary font-medium">Progress</th>
                <th className="p-4 text-left text-text-secondary font-medium">Created</th>
                <th className="p-4 text-left text-text-secondary font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exportJobs.map((job) => (
                <tr 
                  key={job.id}
                  className="border-t border-surface-700 hover:bg-surface-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-text-tertiary" />
                      <span className="font-medium text-text-primary">{job.type}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getFormatIcon(job.format)}
                      <span className="text-text-primary">{job.format}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <Badge className={`text-xs px-2 py-1 flex items-center gap-1 w-fit ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      {job.status}
                    </Badge>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-surface-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-secondary">{Math.round(job.progress)}%</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <p className="text-sm text-text-primary">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(job.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  
                  <td className="p-4">
                    {job.status === 'ready' && (
                      <FuturisticButton
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReport(job)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </FuturisticButton>
                    )}
                    {job.status === 'sent' && (
                      <Badge variant="outline" className="text-xs">
                        <Mail className="w-3 h-3 mr-1" />
                        Sent
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Daily Sales Chart Preview */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-glow">
            <PieChart className="w-6 h-6 text-accent-cyan" />
          </div>
          <div>
            <h3 className="text-display font-semibold text-text-primary">Sales Trend (Last 7 Days)</h3>
            <p className="text-sm text-text-secondary">Daily sales performance</p>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-6">
          {reportData.dailySales.map((day, index) => (
            <div key={day.date} className="text-center">
              <div className="h-20 bg-surface-800/30 rounded-lg mb-2 flex items-end justify-center p-2">
                <div 
                  className="bg-primary rounded-sm w-full transition-all duration-500"
                  style={{ 
                    height: `${(day.sales / Math.max(...reportData.dailySales.map(d => d.sales))) * 100}%`,
                    minHeight: '4px'
                  }}
                />
              </div>
              <p className="text-xs text-text-secondary">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
              <p className="text-sm font-medium text-text-primary">{day.sales}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {reportData.paymentMethods.map((method) => (
            <div key={method.method} className="text-center p-3 bg-surface-800/30 rounded-lg">
              <p className="text-sm text-text-secondary">{method.method}</p>
              <p className="text-lg font-bold text-text-primary">{method.percentage}%</p>
              <p className="text-xs text-text-tertiary">{method.count} transactions</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
