import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Globe, Mail, Palette, Shield, User } from "lucide-react";

import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type SettingsToggle = {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
};

type SettingsResponse = {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  emailPreferences: SettingsToggle[];
  pushNotifications: SettingsToggle[];
  privacy: {
    toggles: SettingsToggle[];
    passwordPlaceholders: {
      current: string;
      next: string;
      confirm: string;
    };
  };
  appearance: {
    darkModeDefault: boolean;
    languages: Array<{ value: string; label: string }>;
  };
};

const Settings = () => {
  const { token } = useAuth();
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload: SettingsResponse = await response.json();
        if (isMounted) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load settings");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved! ✅`);
  };

  const languageOptions = data?.appearance.languages ?? [];
  const defaultLanguage = useMemo(() => languageOptions[0]?.value ?? "en", [languageOptions]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-white/10 bg-card/40 px-6 py-4 text-center text-sm text-muted-foreground">
          Loading settings...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-center text-sm text-destructive">
          Could not load settings: {error}
        </div>
      )}

      {data && (
        <>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={data.profile.firstName}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={data.profile.lastName}
                    className="glass-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={data.profile.email}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  defaultValue={data.profile.username}
                  className="glass-input"
                />
              </div>
              <Button
                onClick={() => handleSave("Profile")}
                className="bg-primary hover:bg-primary/90"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-accent" />
                Email Preferences
              </CardTitle>
              <CardDescription>Manage your email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.emailPreferences.map((preference) => (
                <div key={preference.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{preference.label}</Label>
                      <p className="text-sm text-muted-foreground">{preference.description}</p>
                    </div>
                    <Switch defaultChecked={preference.defaultChecked} />
                  </div>
                  {preference.id !== data.emailPreferences[data.emailPreferences.length - 1].id && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              <Button
                onClick={() => handleSave("Email")}
                className="bg-accent hover:bg-accent/90"
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-secondary" />
                Push Notifications
              </CardTitle>
              <CardDescription>Control your in-app notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.pushNotifications.map((notification) => (
                <div key={notification.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{notification.label}</Label>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <Switch defaultChecked={notification.defaultChecked} />
                  </div>
                  {notification.id !== data.pushNotifications[data.pushNotifications.length - 1].id && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              <Button
                onClick={() => handleSave("Notification")}
                className="bg-secondary hover:bg-secondary/90"
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.privacy.toggles.map((toggle) => (
                <div key={toggle.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{toggle.label}</Label>
                      <p className="text-sm text-muted-foreground">{toggle.description}</p>
                    </div>
                    <Switch defaultChecked={toggle.defaultChecked} />
                  </div>
                  {toggle.id !== data.privacy.toggles[data.privacy.toggles.length - 1].id && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Change Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder={data.privacy.passwordPlaceholders.current}
                  className="glass-input"
                />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder={data.privacy.passwordPlaceholders.next}
                  className="glass-input"
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={data.privacy.passwordPlaceholders.confirm}
                  className="glass-input"
                />
              </div>
              <Button onClick={() => handleSave("Security")} variant="destructive">
                Update Password
              </Button>
            </CardContent>
          </Card>

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
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch defaultChecked={data.appearance.darkModeDefault} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Preferred Language
                </Label>
                <select
                  id="language"
                  defaultValue={defaultLanguage}
                  className="glass-input w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {languageOptions.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => handleSave("Appearance")}
                className="bg-primary hover:bg-primary/90"
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Settings;
