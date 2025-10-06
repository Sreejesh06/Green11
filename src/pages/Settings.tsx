import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Bell, Shield, Palette } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile, uploadAvatar } from "@/lib/api/profiles";
import supabase from "@/lib/supabaseClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const queryClient = useQueryClient();
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getMyProfile,
  });
  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username ?? "");
      const parts = (profileData.full_name ?? "").split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
    }
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    setLoading(false);
  }, [profileData]);

  const saveProfileMutation = useMutation({
    mutationFn: async () =>
      updateMyProfile({
        username: username || null,
        full_name: [firstName, lastName].filter(Boolean).join(" ") || null,
      }),
    onMutate: async () => {
      const prev = queryClient.getQueryData<any>(queryKeys.profile);
      queryClient.setQueryData(queryKeys.profile, (old: any) => ({
        ...(old || {}),
        username,
        full_name: [firstName, lastName].filter(Boolean).join(" ") || null,
      }));
      setSaving(true);
      return { prev };
    },
    onError: (err, _, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKeys.profile, ctx.prev);
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    },
    onSuccess: () => {
      toast.success("Profile saved! ✅");
    },
    onSettled: () => {
      setSaving(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // optimistic preview by setting profile cache
    const objectUrl = URL.createObjectURL(file);
    const prev = queryClient.getQueryData<any>(queryKeys.profile);
    queryClient.setQueryData(queryKeys.profile, (old: any) => ({ ...(old || {}), avatar_url: objectUrl }));
    try {
      const url = await uploadAvatar(file);
      await updateMyProfile({ avatar_url: url });
      toast.success("Avatar updated");
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    } catch (e) {
      if (prev) queryClient.setQueryData(queryKeys.profile, prev);
      toast.error(e instanceof Error ? e.message : "Failed to update avatar");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update password"),
    onSuccess: () => toast.success("Password updated"),
  });

  const onChangePassword = async () => {
    const current = (document.getElementById("currentPassword") as HTMLInputElement)?.value;
    const next = (document.getElementById("newPassword") as HTMLInputElement)?.value;
    const confirm = (document.getElementById("confirmPassword") as HTMLInputElement)?.value;
    if (!next || next !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    await changePasswordMutation.mutateAsync(next).finally(() => setSaving(false));
  };

  function handleSave(section: string) {
    toast.success(`${section} preferences saved`);
  }

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
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="glass-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled className="glass-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="glass-input" />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => saveProfileMutation.mutate()} disabled={saving || loadingProfile} className="bg-primary hover:bg-primary/90">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <label>
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              <Button type="button" variant="outline">Update Avatar</Button>
            </label>
          </div>
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
          <Button onClick={onChangePassword} variant="destructive" disabled={saving}>{saving ? "Updating..." : "Update Password"}</Button>
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
