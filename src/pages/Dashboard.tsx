import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Trophy, Camera, Clock, CheckCircle2, Target, Zap, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createSubmission } from "@/lib/api/submissions";
import { getActiveChallenges, type Challenge, getMySubmissionsByChallenge } from "@/lib/api/challenges";
import { getRecentActivities, type Activity } from "@/lib/api/activities";
import supabase from "@/lib/supabaseClient";
import { queryKeys } from "@/lib/api/queryKeys";
import { getMyProfile, getMyPoints } from "@/lib/api/profiles";

// removed mock data; all data comes from Supabase via api helpers

export default function Dashboard() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressByChallenge, setProgressByChallenge] = useState<Record<number, { count: number; approved: number }>>({});
  const queryClient = useQueryClient();
  const challengesQuery = useQuery({ queryKey: queryKeys.challenges, queryFn: getActiveChallenges });
  const activitiesQuery = useQuery({ queryKey: queryKeys.activities, queryFn: () => getRecentActivities(10) });
  const progressQuery = useQuery({ queryKey: queryKeys.submissionsProgress, queryFn: getMySubmissionsByChallenge });
  const profileQuery = useQuery({ queryKey: queryKeys.profile, queryFn: getMyProfile });
  const myPointsQuery = useQuery({ queryKey: queryKeys.myPoints, queryFn: getMyPoints });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const [chs, acts, prog] = await Promise.all([
          challengesQuery.refetch().then(r => r.data ?? []),
          activitiesQuery.refetch().then(r => r.data ?? []),
          progressQuery.refetch().then(r => r.data ?? {}),
        ]);
        if (!isMounted) return;
        setChallenges(chs);
        setActivities(acts);
        setProgressByChallenge(prog);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load data";
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();

    // realtime subscriptions
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "submissions" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.submissionsProgress });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "submissions" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.submissionsProgress });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.myPoints });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  function formatActivity(a: Activity): string {
    try {
      if (a.type === "reward_redeemed") {
        const name = (a.metadata && a.metadata.reward_name) || "a reward";
        return `Redeemed ${name}`;
      }
      if (a.type === "admin_submission_moderated") {
        const status = a.metadata?.new_status || "updated";
        return `Submission ${status}`;
      }
      if (a.type === "submission_created") {
        return "Submitted a challenge";
      }
      return a.type.split("_").join(" ");
    } catch {
      return a.type;
    }
  }

  const submissionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("Please select a photo to upload");
      return await createSubmission({
        challengeId: selectedChallengeId,
        file: selectedFile,
        description,
      });
    },
    onSuccess: () => {
      toast.success("Challenge submission sent for approval! 🎉");
      // reset form and close dialog
      setSelectedFile(null);
      setDescription("");
      setIsSubmitOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.submissionsProgress });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submissionMutation.mutate();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="text-gradient">{profileQuery.data?.full_name || profileQuery.data?.username || ""}</span>
        </h1>
        <p className="text-muted-foreground">
          Stay consistent and keep earning Green Points 🚀
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              +12%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Green Points</p>
          <p className="text-3xl font-bold text-gradient">{(myPointsQuery.data ?? 0).toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
              ↑ 2
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Team Rank</p>
          <p className="text-3xl font-bold text-accent">#3</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/30">
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Challenges</p>
          <p className="text-3xl font-bold text-secondary">{(challenges ?? []).length}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              8/8
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Team Members</p>
          <p className="text-3xl font-bold text-gradient">Active</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Challenges */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Active Challenges</CardTitle>
                  <CardDescription>Pick a challenge and earn GP!</CardDescription>
                </div>
                <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                      <Camera className="mr-2 h-4 w-4" />
                      Submit Proof
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card">
                    <DialogHeader>
                      <DialogTitle>Submit Challenge Proof</DialogTitle>
                      <DialogDescription>
                        Upload a photo and description to complete your challenge
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Challenge</label>
                        <select
                          className="w-full glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={selectedChallengeId}
                          onChange={(e) => setSelectedChallengeId(String(e.target.value))}
                        >
                          {(challenges ?? []).map((challenge) => (
                            <option key={challenge.id} value={challenge.id}>
                              {challenge.title} (+{challenge.points} GP)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Photo</label>
                        <Input
                          type="file"
                          accept="image/*"
                          className="glass-input"
                          required
                          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                          placeholder="Tell us about your sustainable action..."
                          className="glass-input resize-none"
                          rows={3}
                          required
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={submissionMutation.isPending}>
                        {submissionMutation.isPending ? "Submitting..." : "Submit for Approval"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-6 text-sm text-muted-foreground">Loading challenges...</div>
              ) : error ? (
                <div className="p-6 text-sm text-destructive">{error}</div>
              ) : (
                <div className="space-y-4">
                {(challenges ?? []).map((challenge) => (
                  <div
                    key={challenge.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-card to-card/50 border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{challenge.title}</h4>
                          <div className="flex items-center gap-2">
                            {/* difficulty not present in schema */}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {challenge.end_date ? new Date(challenge.end_date).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-bold text-xl">+{challenge.points}</div>
                        <div className="text-xs text-muted-foreground">GP</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {(() => {
                            const p = progressByChallenge[challenge.id];
                            if (!p) return "0%";
                            return p.approved > 0 ? "100%" : p.count > 0 ? "50%" : "0%";
                          })()}
                        </span>
                      </div>
                      <Progress value={(progressByChallenge[String(challenge.id)]?.approved ?? 0) > 0 ? 100 : (progressByChallenge[String(challenge.id)]?.count ?? 0) > 0 ? 50 : 0} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Live Feed
              </CardTitle>
              <CardDescription>Recent actions from your league</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading activity...</div>
              ) : error ? (
                <div className="p-4 text-sm text-destructive">{error}</div>
              ) : (
                <div className="space-y-4">
                  {(activities ?? []).map((activity) => (
                    <div key={activity.id} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                        {/* Placeholder initials */}
                        A
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {formatActivity(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      {/* points not present in activities schema */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/30">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-bold text-primary text-lg">7</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/30">
                  <span className="text-sm text-muted-foreground">GP Earned</span>
                  <span className="font-bold text-accent text-lg">420</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/30">
                  <span className="text-sm text-muted-foreground">Team Share</span>
                  <span className="font-bold text-secondary text-lg">35%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
