import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Trophy, Camera, Clock, Target, Zap, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

type Challenge = {
  id: number;
  title: string;
  points: number;
  deadline: string;
  icon: string;
  difficulty: string;
  progress: number;
};

type Activity = {
  id: number;
  user: string;
  action: string;
  time: string;
  points: number;
  avatar: string;
};

type Highlight = {
  id: number;
  label: string;
  value: number;
  unit: string;
};

type DashboardResponse = {
  welcome: {
    userName: string;
    message: string;
  };
  stats: {
    totalGreenPoints: { value: number; changePercent: number };
    teamRank: { value: number; delta: number };
    challenges: { completed: number; total: number; status: string };
    teamMembers: { active: number; total: number; status: string };
  };
  activeChallenges: Challenge[];
  recentActivities: Activity[];
  weeklyHighlights: Highlight[];
};

export default function Dashboard() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard`);

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload: DashboardResponse = await response.json();
        if (isMounted) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Challenge submission sent for approval! 🎉");
    setIsSubmitOpen(false);
  };

  const activeChallenges = data?.activeChallenges ?? [];
  const recentActivities = data?.recentActivities ?? [];
  const weeklyHighlights = data?.weeklyHighlights ?? [];
  const stats = data?.stats;
  const welcome = data?.welcome;

  const totalGreenPointsDisplay = stats ? stats.totalGreenPoints.value.toLocaleString() : "--";
  const totalGreenPointsDelta = stats ? `+${stats.totalGreenPoints.changePercent}%` : "--";
  const teamRankDelta = stats ? `↑ ${stats.teamRank.delta}` : "--";
  const teamRankDisplay = stats ? `#${stats.teamRank.value}` : "--";
  const challengesDisplay = stats ? `${stats.challenges.completed}/${stats.challenges.total}` : "--";
  const teamMembersDelta = stats ? `${stats.teamMembers.active}/${stats.teamMembers.total}` : "--";
  const teamMembersStatus = stats?.teamMembers.status ?? "--";

  const highlightAccentClass = (label: string) => {
    switch (label) {
      case "Completed":
        return "text-primary";
      case "GP Earned":
        return "text-accent";
      case "Team Share":
        return "text-secondary";
      default:
        return "text-foreground";
    }
  };

  const formatHighlightValue = (highlight: Highlight) => {
    const formatted = highlight.value.toLocaleString();

    if (highlight.unit === "percent") {
      return `${formatted}%`;
    }

    if (highlight.unit === "points") {
      return formatted;
    }

    return formatted;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="text-gradient">{welcome?.userName ?? ""}!</span>
        </h1>
        <p className="text-muted-foreground">
          {welcome?.message ?? "Loading personalized insights..."}
        </p>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-white/10 bg-card/40 p-4 text-sm text-muted-foreground">
          Fetching the latest sustainability stats...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load dashboard data: {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              {totalGreenPointsDelta}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Green Points</p>
          <p className="text-3xl font-bold text-gradient">{totalGreenPointsDisplay}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
              {teamRankDelta}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Team Rank</p>
          <p className="text-3xl font-bold text-accent">{teamRankDisplay}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/30">
              {stats?.challenges.status ?? "--"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Challenges</p>
          <p className="text-3xl font-bold text-secondary">{challengesDisplay}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              {teamMembersDelta}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Team Members</p>
          <p className="text-3xl font-bold text-gradient">{teamMembersStatus}</p>
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
                        <select className="w-full glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                          {activeChallenges.map((challenge) => (
                            <option key={challenge.id} value={challenge.id}>
                              {challenge.icon} {challenge.title} (+{challenge.points} GP)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Photo</label>
                        <Input type="file" accept="image/*" className="glass-input" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                          placeholder="Tell us about your sustainable action..."
                          className="glass-input resize-none"
                          rows={3}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                        Submit for Approval
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-card to-card/50 border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{challenge.icon}</div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{challenge.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {challenge.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {challenge.deadline}
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
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.user}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {activity.time}
                      </p>
                    </div>
                    {activity.points > 0 && (
                      <div className="flex-shrink-0 text-accent font-bold text-sm">
                        +{activity.points}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                {weeklyHighlights.map((highlight) => (
                  <div key={highlight.id} className="flex justify-between items-center p-3 rounded-lg bg-card/30">
                    <span className="text-sm text-muted-foreground">{highlight.label}</span>
                    <span className={`font-bold text-lg ${highlightAccentClass(highlight.label)}`}>
                      {formatHighlightValue(highlight)}
                    </span>
                  </div>
                ))}
                {!weeklyHighlights.length && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-card/30 text-sm text-muted-foreground">
                    Weekly highlights will appear once new activity is logged.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
