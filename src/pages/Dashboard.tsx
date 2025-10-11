import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Trophy, Camera, Clock, Target, Zap, Users } from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getAvatarIcon } from "@/lib/avatar-icons";

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
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as { focusChallengeId?: number; openSubmission?: boolean } | null) ?? null;
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileInputResetKey, setFileInputResetKey] = useState(0);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      if (isMountedRef.current) {
        setData(null);
        setError(null);
        setIsLoading(false);
      }
      return;
    }

    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }

      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const payload: DashboardResponse = await response.json();

      if (isMountedRef.current) {
        setData(payload);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!data?.activeChallenges?.length) {
      setSelectedChallengeId(null);
      return;
    }

    const focusId = locationState?.focusChallengeId;
    if (typeof focusId === "number" && data.activeChallenges.some((challenge) => challenge.id === focusId)) {
      setSelectedChallengeId(focusId);
      return;
    }

    setSelectedChallengeId((previous) => {
      if (previous !== null && data.activeChallenges.some((challenge) => challenge.id === previous)) {
        return previous;
      }

      return data.activeChallenges[0].id;
    });
  }, [data, locationState]);

  useEffect(() => {
    if (locationState?.openSubmission) {
      setIsSubmitOpen(true);
    }

    if (locationState) {
      navigate(".", { replace: true, state: null });
    }
  }, [locationState, navigate]);

  useEffect(() => {
    if (!isSubmitOpen) {
      setProofFile(null);
      setSubmissionDescription("");
      setFileInputResetKey((key) => key + 1);
    }
  }, [isSubmitOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("You need to be signed in to submit proof.");
      return;
    }

    if (!selectedChallengeId) {
      toast.error("Please choose a challenge to submit.");
      return;
    }

    if (!proofFile) {
      toast.error("Please attach a photo or screenshot as proof.");
      return;
    }

    if (!submissionDescription.trim()) {
      toast.error("Add a short description so we can verify your submission.");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (proofFile.size > MAX_SIZE) {
      toast.error("Proof file is too large (limit 5MB).");
      return;
    }

    const toBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== "string") {
            reject(new Error("Failed to read proof file."));
            return;
          }
          const [, base64] = result.split(",");
          resolve(base64 || result);
        };
        reader.onerror = () => reject(new Error("Failed to read proof file."));
        reader.readAsDataURL(file);
      });

    try {
      setIsSubmitting(true);

      const proofData = await toBase64(proofFile);

      const response = await fetch(`${API_BASE_URL}/api/dashboard/challenges/${selectedChallengeId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: submissionDescription.trim(),
          proof: {
            originalName: proofFile.name,
            mimeType: proofFile.type,
            size: proofFile.size,
            data: proofData,
          },
        }),
      });

      if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
          const payload = await response.json();
          if (payload?.message) {
            message = payload.message;
          }
        } catch (_error) {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

  toast.success("Challenge submission sent for approval! 🎉");

  setIsSubmitOpen(false);

      await loadDashboard();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit proof.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeChallenges = data?.activeChallenges ?? [];
  const recentActivities = data?.recentActivities ?? [];
  const weeklyHighlights = data?.weeklyHighlights ?? [];
  const stats = data?.stats;
  const welcome = data?.welcome;
  const welcomeName = welcome?.userName ?? user?.firstName ?? user?.name ?? "";
  const welcomeMessage = welcome?.message ?? "Loading personalized insights...";

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
          Welcome back, <span className="text-gradient">{welcomeName}!</span>
        </h1>
        <p className="text-muted-foreground">
          {welcomeMessage}
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
                        <select
                          className="w-full glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={selectedChallengeId !== null ? selectedChallengeId.toString() : ""}
                          onChange={(event) => {
                            const value = Number.parseInt(event.target.value, 10);
                            setSelectedChallengeId(Number.isNaN(value) ? null : value);
                          }}
                          disabled={!activeChallenges.length}
                        >
                          {!activeChallenges.length && <option value="">No active challenges available</option>}
                          {activeChallenges.map((challenge) => (
                            <option key={challenge.id} value={challenge.id}>
                              {challenge.icon} {challenge.title} (+{challenge.points} GP)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Upload Photo</label>
                        <Input
                          key={fileInputResetKey}
                          type="file"
                          accept="image/*"
                          className="glass-input"
                          required
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const file = event.target.files?.[0] ?? null;
                            setProofFile(file);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                          placeholder="Tell us about your sustainable action..."
                          className="glass-input resize-none"
                          rows={3}
                          required
                          value={submissionDescription}
                          onChange={(event) => setSubmissionDescription(event.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isSubmitting || selectedChallengeId === null}
                      >
                        {isSubmitting ? "Submitting..." : "Submit for Approval"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeChallenges.map((challenge) => {
                  const isSelected = challenge.id === selectedChallengeId;

                  const handleNavigate = () => {
                    setSelectedChallengeId(challenge.id);
                    navigate(`/dashboard/challenges/${challenge.id}`, {
                      state: { challenge },
                    });
                  };

                  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleNavigate();
                    }
                  };

                  return (
                    <div
                      key={challenge.id}
                      role="button"
                      tabIndex={0}
                      onClick={handleNavigate}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        "group rounded-xl border bg-gradient-to-r from-card to-card/50 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40",
                        isSelected ? "border-primary/60 shadow-lg" : "border-white/5 hover:border-primary/30"
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{challenge.icon}</div>
                          <div>
                            <h4 className="mb-1 font-semibold text-foreground">{challenge.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {challenge.difficulty}
                              </Badge>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {challenge.deadline}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-accent">+{challenge.points}</div>
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
                  );
                })}
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
                {recentActivities.map((activity) => {
                  const activityAvatar = getAvatarIcon(activity.avatar);

                  return (
                    <div key={activity.id} className="flex gap-3 items-start">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        {activityAvatar ? (
                          <AvatarImage src={activityAvatar.src} alt={activityAvatar.alt} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-sm font-bold text-primary-foreground">
                          {activity.avatar}
                        </AvatarFallback>
                      </Avatar>
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
                  );
                })}
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
