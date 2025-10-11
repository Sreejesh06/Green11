import { useCallback, useEffect, useState } from "react";
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
  enabled: boolean;
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
    darkMode: boolean;
    selectedLanguage: string;
    languages: Array<{ value: string; label: string }>;
  };
};

const Settings = () => {
  const { token, refreshUser } = useAuth();
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

  const updateProfileField = (field: keyof SettingsResponse["profile"], value: string) => {
    setData((prev) => (prev ? { ...prev, profile: { ...prev.profile, [field]: value } } : prev));
  };

  const updateToggle = (
    section: "emailPreferences" | "pushNotifications",
    toggleId: string,
    enabled: boolean
  ) => {
    setData((prev) => {
      if (!prev) {
        return prev;
      }

      const updated = prev[section].map((item) =>
        item.id === toggleId ? { ...item, enabled } : item
      );

      return { ...prev, [section]: updated };
    });
  };

  const updatePrivacyToggle = (toggleId: string, enabled: boolean) => {
    setData((prev) => {
      if (!prev) {
        return prev;
      }

      const toggles = prev.privacy.toggles.map((item) =>
        item.id === toggleId ? { ...item, enabled } : item
      );

      return { ...prev, privacy: { ...prev.privacy, toggles } };
    });
  };

  const updateAppearance = (updates: Partial<SettingsResponse["appearance"]>) => {
    setData((prev) => (prev ? { ...prev, appearance: { ...prev.appearance, ...updates } } : prev));
  };

  const sendUpdate = useCallback(
    async <T,>(path: string, body: unknown) => {
      if (!token) {
        throw new Error("You must be signed in to update settings.");
      }

      const response = await fetch(`${API_BASE_URL}/api/settings${path}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
          const errorPayload = await response.json();
          if (typeof errorPayload.message === "string") {
            message = errorPayload.message;
          }
        } catch (_error) {
          // ignore parse errors
        }
        throw new Error(message);
      }

      return (await response.json()) as T;
    },
    [token]
  );

  const handleProfileSave = async () => {
    if (!data) {
      return;
    }

    try {
      const payload = await sendUpdate<{ profile: SettingsResponse["profile"] }>(
        "/profile",
        data.profile
      );
      setData((prev) => (prev ? { ...prev, profile: payload.profile } : prev));
      await refreshUser();
      toast.success("Profile settings saved! ✅");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save profile");
    }
  };

  const handleEmailPreferencesSave = async () => {
    if (!data) {
      return;
    }

    try {
      const payload = await sendUpdate<{ emailPreferences: SettingsToggle[] }>(
        "/email-preferences",
        {
          emailPreferences: data.emailPreferences.map(({ id, enabled }) => ({ id, enabled })),
        }
      );
      setData((prev) => (prev ? { ...prev, emailPreferences: payload.emailPreferences } : prev));
      toast.success("Email preferences saved! ✅");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save email preferences");
    }
  };

  const handlePushNotificationsSave = async () => {
    if (!data) {
      return;
    }

    try {
      const payload = await sendUpdate<{ pushNotifications: SettingsToggle[] }>(
        "/push-notifications",
        {
          pushNotifications: data.pushNotifications.map(({ id, enabled }) => ({ id, enabled })),
        }
      );
      setData((prev) => (prev ? { ...prev, pushNotifications: payload.pushNotifications } : prev));
      toast.success("Notification settings saved! ✅");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save notifications");
    }
  };

  const handlePrivacySave = async () => {
    if (!data) {
      return;
    }

    try {
      const payload = await sendUpdate<{ privacy: SettingsResponse["privacy"] }>("/privacy", {
        toggles: data.privacy.toggles.map(({ id, enabled }) => ({ id, enabled })),
      });
      setData((prev) => (prev ? { ...prev, privacy: payload.privacy } : prev));
      toast.success("Privacy settings saved! ✅");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save privacy settings");
    }
  };

  const handleAppearanceSave = async () => {
    if (!data) {
      return;
    }

    try {
      const payload = await sendUpdate<{ appearance: SettingsResponse["appearance"] }>(
        "/appearance",
        {
          darkMode: data.appearance.darkMode,
          language: data.appearance.selectedLanguage,
        }
      );
      setData((prev) => (prev ? { ...prev, appearance: payload.appearance } : prev));
      toast.success("Appearance preferences saved! ✅");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save appearance settings");
    }
  };

  const handlePasswordUpdate = () => {
    toast.info("Password updates are not available yet.");
  };

  const languageOptions = data?.appearance.languages ?? [];
  const selectedLanguage = data?.appearance.selectedLanguage ?? languageOptions[0]?.value ?? "en";

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
                    value={data.profile.firstName}
                    onChange={(event) => updateProfileField("firstName", event.target.value)}
                    className="glass-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={data.profile.lastName}
                    onChange={(event) => updateProfileField("lastName", event.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.profile.email}
                  onChange={(event) => updateProfileField("email", event.target.value)}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={data.profile.username}
                  onChange={(event) => updateProfileField("username", event.target.value)}
                  className="glass-input"
                />
              </div>
              <Button
                onClick={handleProfileSave}
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
                    <Switch
                      checked={preference.enabled}
                      onCheckedChange={(checked) =>
                        updateToggle("emailPreferences", preference.id, checked)
                      }
                    />
                  </div>
                  {preference.id !== data.emailPreferences[data.emailPreferences.length - 1].id && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              <Button
                onClick={handleEmailPreferencesSave}
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
                    <Switch
                      checked={notification.enabled}
                      onCheckedChange={(checked) =>
                        updateToggle("pushNotifications", notification.id, checked)
                      }
                    />
                  </div>
                  {notification.id !== data.pushNotifications[data.pushNotifications.length - 1].id && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              <Button
                onClick={handlePushNotificationsSave}
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
                    <Switch
                      checked={toggle.enabled}
                      onCheckedChange={(checked) => updatePrivacyToggle(toggle.id, checked)}
                    />
                  </div>
                  {toggle.id !== data.privacy.toggles[data.privacy.toggles.length - 1].id && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              <Button
                onClick={handlePrivacySave}
                className="bg-primary hover:bg-primary/90"
              >
                Save Privacy Preferences
              </Button>
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
              <Button onClick={handlePasswordUpdate} variant="destructive">
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
                <Switch
                  checked={data.appearance.darkMode}
                  onCheckedChange={(checked) => updateAppearance({ darkMode: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Preferred Language
                </Label>
                <select
                  id="language"
                  value={selectedLanguage}
                  onChange={(event) =>
                    updateAppearance({ selectedLanguage: event.target.value })
                  }
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
                onClick={handleAppearanceSave}
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
