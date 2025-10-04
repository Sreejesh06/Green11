import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Bell, Shield, Palette, Globe } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const handleSave = (section: string) => {
    toast.success(`${section} settings saved! ✅`);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Arjun" className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Patel" className="glass-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="arjun@example.com" className="glass-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="@arjun_green" className="glass-input" />
          </div>
          <Button onClick={() => handleSave("Profile")} className="bg-primary hover:bg-primary/90">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            Email Preferences
          </CardTitle>
          <CardDescription>Manage your email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Summary</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your activities
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Challenge Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new challenges
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Team Activity</Label>
              <p className="text-sm text-muted-foreground">
                Updates about your team's progress
              </p>
            </div>
            <Switch />
          </div>
          <Button onClick={() => handleSave("Email")} className="bg-accent hover:bg-accent/90">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-secondary" />
            Push Notifications
          </CardTitle>
          <CardDescription>Control your in-app notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Challenge Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Reminder before challenges expire
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Leaderboard Updates</Label>
              <p className="text-sm text-muted-foreground">
                When your team's rank changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rewards Available</Label>
              <p className="text-sm text-muted-foreground">
                When you can claim new rewards
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button onClick={() => handleSave("Notification")} className="bg-secondary hover:bg-secondary/90">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Manage your privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Activity Status</Label>
              <p className="text-sm text-muted-foreground">
                Let others see when you're online
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Change Password</Label>
            <Input id="currentPassword" type="password" placeholder="Current password" className="glass-input" />
            <Input id="newPassword" type="password" placeholder="New password" className="glass-input" />
            <Input id="confirmPassword" type="password" placeholder="Confirm new password" className="glass-input" />
          </div>
          <Button onClick={() => handleSave("Security")} variant="destructive">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Switch to dark theme
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select id="language" className="w-full glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
          <Button onClick={() => handleSave("Appearance")} className="bg-primary hover:bg-primary/90">
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
