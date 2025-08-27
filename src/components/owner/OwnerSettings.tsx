import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  MapPin, 
  Users, 
  Bell,
  Wallet,
  Globe,
  Eye,
  EyeOff,
  Copy,
  Key,
  Smartphone,
  CreditCard,
  Zap
} from 'lucide-react';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  storeLocation: string;
  timezone: string;
  currency: string;
  language: string;
  autoPayouts: boolean;
  payoutThreshold: number;
  payoutFrequency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlerts: boolean;
  salesReports: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  apiKey: string;
  webhookUrl: string;
  allowedIPs: string[];
  sessionTimeout: number;
}

export const OwnerSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'payments' | 'notifications'>('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'TapLink Demo Store',
    storeDescription: 'Premium NFC-enabled point of sale experience',
    storeLocation: 'Seoul, South Korea',
    timezone: 'Asia/Seoul',
    currency: 'KRW',
    language: 'en',
    autoPayouts: true,
    payoutThreshold: 500000,
    payoutFrequency: 'weekly',
    emailNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    salesReports: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    apiKey: 'sk_live_abc123def456ghi789jkl',
    webhookUrl: 'https://your-store.com/webhooks/taplink',
    allowedIPs: ['192.168.1.100', '10.0.0.50'],
    sessionTimeout: 30
  });

  const [newIP, setNewIP] = useState('');

  const handleStoreSettingChange = (key: keyof StoreSettings, value: any) => {
    setStoreSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecuritySettingChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const addAllowedIP = () => {
    if (newIP && !securitySettings.allowedIPs.includes(newIP)) {
      setSecuritySettings(prev => ({
        ...prev,
        allowedIPs: [...prev.allowedIPs, newIP]
      }));
      setNewIP('');
    }
  };

  const removeAllowedIP = (ip: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      allowedIPs: prev.allowedIPs.filter(allowedIP => allowedIP !== ip)
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateNewApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 25);
    setSecuritySettings(prev => ({ ...prev, apiKey: newKey }));
  };

  const saveSettings = () => {
    // Simulate saving settings
    console.log('Saving settings...', { storeSettings, securitySettings });
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'payments' as const, label: 'Payments', icon: Wallet },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell }
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-display text-2xl font-bold text-text-primary">Store Settings</h2>
          <p className="text-text-secondary">Manage your store configuration, security, and preferences</p>
        </div>
        
        <FuturisticButton variant="primary" onClick={saveSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Save Changes
        </FuturisticButton>
      </div>

      {/* Tab Navigation */}
      <GlassCard className="p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <Globe className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">Store Information</h3>
                <p className="text-sm text-text-secondary">Basic store details</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeSettings.storeName}
                  onChange={(e) => handleStoreSettingChange('storeName', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="storeDescription">Description</Label>
                <Textarea
                  id="storeDescription"
                  value={storeSettings.storeDescription}
                  onChange={(e) => handleStoreSettingChange('storeDescription', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="storeLocation">Location</Label>
                <Input
                  id="storeLocation"
                  value={storeSettings.storeLocation}
                  onChange={(e) => handleStoreSettingChange('storeLocation', e.target.value)}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <Globe className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">Regional Settings</h3>
                <p className="text-sm text-text-secondary">Timezone, currency & language</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={storeSettings.timezone} onValueChange={(value) => handleStoreSettingChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Seoul">Asia/Seoul (KST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={storeSettings.currency} onValueChange={(value) => handleStoreSettingChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KRW">Korean Won (₩)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={storeSettings.language} onValueChange={(value) => handleStoreSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <Shield className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">Access Control</h3>
                <p className="text-sm text-text-secondary">Authentication & access settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">Two-Factor Authentication</p>
                  <p className="text-sm text-text-secondary">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorEnabled', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={securitySettings.webhookUrl}
                  onChange={(e) => handleSecuritySettingChange('webhookUrl', e.target.value)}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <Key className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">API & Security</h3>
                <p className="text-sm text-text-secondary">API keys and IP restrictions</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex space-x-2">
                    <FuturisticButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </FuturisticButton>
                    <FuturisticButton
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(securitySettings.apiKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </FuturisticButton>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={securitySettings.apiKey}
                    readOnly
                    className="flex-1"
                  />
                  <FuturisticButton
                    variant="secondary"
                    onClick={generateNewApiKey}
                  >
                    Generate New
                  </FuturisticButton>
                </div>
              </div>
              
              <div>
                <Label htmlFor="allowedIPs">Allowed IP Addresses</Label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    id="newIP"
                    placeholder="192.168.1.100"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                  />
                  <FuturisticButton variant="secondary" onClick={addAllowedIP}>
                    Add
                  </FuturisticButton>
                </div>
                <div className="flex flex-wrap gap-2">
                  {securitySettings.allowedIPs.map((ip) => (
                    <Badge
                      key={ip}
                      variant="outline"
                      className="cursor-pointer hover:bg-status-danger hover:text-white"
                      onClick={() => removeAllowedIP(ip)}
                    >
                      {ip} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <Wallet className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">Auto-Payouts</h3>
                <p className="text-sm text-text-secondary">Automated withdrawal settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">Enable Auto-Payouts</p>
                  <p className="text-sm text-text-secondary">Automatically transfer funds</p>
                </div>
                <Switch
                  checked={storeSettings.autoPayouts}
                  onCheckedChange={(checked) => handleStoreSettingChange('autoPayouts', checked)}
                />
              </div>
              
              {storeSettings.autoPayouts && (
                <>
                  <div>
                    <Label htmlFor="payoutThreshold">Payout Threshold (₩)</Label>
                    <Input
                      id="payoutThreshold"
                      type="number"
                      value={storeSettings.payoutThreshold}
                      onChange={(e) => handleStoreSettingChange('payoutThreshold', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                    <Select value={storeSettings.payoutFrequency} onValueChange={(value) => handleStoreSettingChange('payoutFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <CreditCard className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">Payment Methods</h3>
                <p className="text-sm text-text-secondary">Accepted payment types</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { method: 'Credit Cards', enabled: true, fee: '2.9%' },
                { method: 'Cryptocurrency', enabled: true, fee: '0.5%' },
                { method: 'Bank Transfers', enabled: true, fee: '0.1%' },
                { method: 'Mobile Payments', enabled: false, fee: '1.5%' }
              ].map((payment) => (
                <div key={payment.method} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">{payment.method}</p>
                    <p className="text-sm text-text-secondary">Fee: {payment.fee}</p>
                  </div>
                  <Switch defaultChecked={payment.enabled} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <Bell className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">Alert Preferences</h3>
                <p className="text-sm text-text-secondary">Choose how you want to be notified</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">Email Notifications</p>
                  <p className="text-sm text-text-secondary">Receive alerts via email</p>
                </div>
                <Switch
                  checked={storeSettings.emailNotifications}
                  onCheckedChange={(checked) => handleStoreSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">SMS Notifications</p>
                  <p className="text-sm text-text-secondary">Receive alerts via SMS</p>
                </div>
                <Switch
                  checked={storeSettings.smsNotifications}
                  onCheckedChange={(checked) => handleStoreSettingChange('smsNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">Low Stock Alerts</p>
                  <p className="text-sm text-text-secondary">Alert when inventory is low</p>
                </div>
                <Switch
                  checked={storeSettings.lowStockAlerts}
                  onCheckedChange={(checked) => handleStoreSettingChange('lowStockAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                <div>
                  <p className="font-medium text-text-primary">Sales Reports</p>
                  <p className="text-sm text-text-secondary">Weekly sales summaries</p>
                </div>
                <Switch
                  checked={storeSettings.salesReports}
                  onCheckedChange={(checked) => handleStoreSettingChange('salesReports', checked)}
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-glow">
                <Smartphone className="w-6 h-6 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-display font-semibold text-text-primary">Mobile App</h3>
                <p className="text-sm text-text-secondary">Mobile dashboard settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent-cyan/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-text-primary">TapLink Mobile</h4>
                  <Badge className="bg-status-success text-white">Connected</Badge>
                </div>
                <p className="text-sm text-text-secondary mb-3">
                  Manage your store on the go with push notifications
                </p>
                <FuturisticButton variant="secondary" size="sm">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Configure Push Notifications
                </FuturisticButton>
              </div>
              
              <div className="space-y-3">
                {[
                  'New sales alerts',
                  'Inventory warnings',
                  'System updates',
                  'Security alerts'
                ].map((notification) => (
                  <div key={notification} className="flex items-center justify-between p-3 bg-surface-800/30 rounded-lg">
                    <p className="text-text-primary">{notification}</p>
                    <Switch defaultChecked={true} />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <FuturisticButton variant="secondary">
          Reset to Defaults
        </FuturisticButton>
        <FuturisticButton variant="primary" onClick={saveSettings}>
          <Zap className="w-4 h-4 mr-2" />
          Save All Settings
        </FuturisticButton>
      </div>
    </div>
  );
};
