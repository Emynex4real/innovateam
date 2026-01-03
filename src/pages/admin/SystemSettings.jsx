import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Save, Database, Shield, Bell } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'JAMB Course Advisor',
    apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY ? 'sk-****************************' : '',
    enableNotifications: true,
    enableAnalytics: true,
    maintenanceMode: false,
    maxUsers: 10000,
    backupFrequency: 'daily',
  });

  const handleSave = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const handleBackup = () => {
    console.log('Creating backup...');
    alert('Backup created successfully!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="apiKey">DeepSeek API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="maxUsers">Maximum Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={settings.maxUsers}
                onChange={(e) => setSettings({...settings, maxUsers: parseInt(e.target.value)})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Feature Toggles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({...settings, enableNotifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="analytics">Enable Analytics</Label>
              <Switch
                id="analytics"
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) => setSettings({...settings, enableAnalytics: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <Switch
                id="maintenance"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
            
            <div>
              <Label htmlFor="backup">Backup Frequency</Label>
              <select
                id="backup"
                value={settings.backupFrequency}
                onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
            
            <Button onClick={handleBackup} variant="outline" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Create Backup
            </Button>
            
            <Button variant="destructive" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Version:</p>
              <p className="text-muted-foreground">v1.2.3</p>
            </div>
            <div>
              <p className="font-medium">Last Backup:</p>
              <p className="text-muted-foreground">2024-01-15 10:30 AM</p>
            </div>
            <div>
              <p className="font-medium">Database Size:</p>
              <p className="text-muted-foreground">245 MB</p>
            </div>
            <div>
              <p className="font-medium">Uptime:</p>
              <p className="text-muted-foreground">15 days, 4 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;