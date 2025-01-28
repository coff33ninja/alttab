import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const SecuritySettings = () => {
  const { currentUser, changePassword, enableTwoFactor, disableTwoFactor, verifyTwoFactor } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    const success = await changePassword(currentPassword, newPassword);
    
    toast({
      title: success ? "Password updated" : "Update failed",
      description: success
        ? "Your password has been updated successfully."
        : "There was an error updating your password.",
      variant: success ? "default" : "destructive",
    });

    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleTwoFactorToggle = async () => {
    if (!currentUser?.twoFactorEnabled) {
      const result = await enableTwoFactor();
      if (result.success && result.qrCode) {
        setQrCode(result.qrCode);
        setShowTwoFactorInput(true);
      }
    } else {
      const success = await disableTwoFactor();
      toast({
        title: success ? "2FA Disabled" : "Error",
        description: success
          ? "Two-factor authentication has been disabled."
          : "Failed to disable two-factor authentication.",
        variant: success ? "default" : "destructive",
      });
    }
  };

  const handleVerifyTwoFactor = async () => {
    const success = await verifyTwoFactor(twoFactorCode);
    toast({
      title: success ? "2FA Enabled" : "Verification Failed",
      description: success
        ? "Two-factor authentication has been enabled."
        : "Failed to verify the code. Please try again.",
      variant: success ? "default" : "destructive",
    });
    if (success) {
      setShowTwoFactorInput(false);
      setQrCode(null);
      setTwoFactorCode("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password
          </CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Password</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handlePasswordChange}>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
            <Switch
              id="2fa"
              checked={currentUser?.twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
          
          {showTwoFactorInput && (
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code for 2FA" className="max-w-[200px]" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Enter Verification Code</Label>
                <Input
                  id="code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                />
              </div>
              <Button onClick={handleVerifyTwoFactor}>Verify</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
