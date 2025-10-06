import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, TrendingUp, Leaf, Users, 
  Calendar, Share2, Settings
} from "lucide-react";
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile, uploadAvatar } from "@/lib/api/profiles";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import supabase from "@/lib/supabaseClient";
import { toast } from "sonner";
import { getRecentActivities, type Activity } from "@/lib/api/activities";

// Stats now derive from live data where possible

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: loading, error } = useQuery({ queryKey: queryKeys.profile, queryFn: getMyProfile });
  useEffect(() => {
    const channel = supabase
      .channel("profile-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: activities = [], isLoading: loadingActivities, error: activitiesError } = useQuery({
    queryKey: queryKeys.activities,
    queryFn: () => getRecentActivities(10),
  });
  useEffect(() => {
    const channel = supabase
      .channel("profile-activities-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = await uploadAvatar(file);
      await updateMyProfile({ avatar_url: url });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Avatar updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update avatar";
      toast.error(message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-28 h-28 ring-4 ring-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary via-primary-glow to-secondary text-primary-foreground text-4xl font-bold">
                {(profile?.full_name?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{profile?.full_name || profile?.username || "Your Name"}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="outline" className="bg-primary/20 border-primary/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Level 12
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/20 border-secondary/30">
                    <Users className="w-3 h-3 mr-1" />
                    SustainSquad
                  </Badge>
                  <Badge variant="outline" className="bg-accent/20 border-accent/30">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined Mar 2024
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level Progress</span>
                  <span className="text-foreground font-medium">247 / 1,500 GP</span>
                </div>
                <Progress value={16} className="h-3" />
                <p className="text-xs text-muted-foreground">1,253 GP until Level 13</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => window.location.assign('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => {
                const shareData = { title: 'Green11 Profile', text: 'Check out my Green11 profile!', url: window.location.href };
                if ((navigator as any).share) {
                  (navigator as any).share(shareData).catch(() => {});
                } else {
                  navigator.clipboard.writeText(shareData.url).then(() => toast.success('Profile URL copied')); }
              }}>
                <Share2 className="h-4 w-4" />
              </Button>
              <label>
                <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                <Button className="bg-primary hover:bg-primary/90" asChild={false}>
                  Upload Avatar
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - minimal until full stats API exists */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Total GP", value: profile?.points ?? 0, icon: Leaf, color: "text-primary" }].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold mb-1">{String(stat.value)}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions from you and your peers</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActivities ? (
              <div className="p-4 text-sm text-muted-foreground">Loading activity...</div>
            ) : activitiesError ? (
              <div className="p-4 text-sm text-destructive">{(activitiesError as Error).message}</div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: Activity) => {
                  const text = (() => {
                    if (activity.type === "reward_redeemed") return "Redeemed a reward";
                    if (activity.type === "admin_submission_moderated") return `Submission ${activity.metadata?.new_status || "updated"}`;
                    if (activity.type === "submission_created") return "Submitted a challenge";
                    return activity.type.split("_").join(" ");
                  })();
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-white/5 hover:bg-card/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20" />
                        <div>
                          <h4 className="font-medium text-sm">{text}</h4>
                          <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
