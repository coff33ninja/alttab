import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Save,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    appName: "UpSnap",
    faviconUrl: "",
    darkMode: true, // Enable dark mode by default
    accentColor: "#00ff00", // Green accent color
    networkSubnet: "192.168.1.0/24",
    autoScan: true,
    deviceNotifications: true,
    securityAlerts: true,
    twoFactor: false,
    auditLog: true
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4">
          <TabsTrigger value="general" className="space-x-2">
            <Globe className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="space-x-2">
            <Network className="h-4 w-4" />
            <span>Network</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Globe className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Application</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input 
                  id="app-name" 
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input 
                  id="favicon" 
                  placeholder="URL to your favicon.ico"
                  value={settings.faviconUrl}
                  onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Palette className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Enable dark mode</Label>
                <Switch 
                  id="dark-mode" 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="accent-color" 
                    type="color" 
                    className="h-10 w-20"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setSettings({ ...settings, accentColor: "#0066ff" })}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Network className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Network Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subnet">Network Subnet</Label>
                <Input 
                  id="subnet" 
                  value={settings.networkSubnet}
                  onChange={(e) => setSettings({ ...settings, networkSubnet: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scan">Enable automatic network scanning</Label>
                <Switch 
                  id="auto-scan" 
                  checked={settings.autoScan}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoScan: checked })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Bell className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="device-notifications">Device status notifications</Label>
                <Switch 
                  id="device-notifications" 
                  checked={settings.deviceNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, deviceNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="security-alerts">Security alerts</Label>
                <Switch 
                  id="security-alerts" 
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, securityAlerts: checked })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor">Enable two-factor authentication</Label>
                <Switch 
                  id="two-factor" 
                  checked={settings.twoFactor}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="audit-log">Enable audit logging</Label>
                <Switch 
                  id="audit-log" 
                  checked={settings.auditLog}
                  onCheckedChange={(checked) => setSettings({ ...settings, auditLog: checked })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isLoading ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </Layout>
  );
};

export default Settings;