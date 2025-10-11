import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Calendar, CheckCircle2, ChevronLeft, Flame, Leaf, MapPin, Trophy } from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  points: number;
  deadline: string;
  icon: string;
  difficulty: string;
  progress: number;
}

interface DashboardPayload {
  activeChallenges: Challenge[];
}

function buildHeroImage(challengeId: number): string {
  const images = [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
  ];

  const safeId = Number.isFinite(challengeId) ? Math.abs(Math.trunc(challengeId)) : 0;
  return images[safeId % images.length];
}

function buildDetailHighlights(points: number) {
  return [
    {
      label: "Recommended Location",
      icon: MapPin,
      value: "Campus grounds or local community",
    },
    {
      label: "Community Impact",
      icon: Flame,
      value: "High",
    },
    {
      label: "Completion Bonus",
      icon: Trophy,
      value: `+${points} Green Points`,
    },
  ] as const;
}

export default function ChallengeDetails() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(() => {
    const stateData = location.state as { challenge?: Challenge } | null;
    return stateData?.challenge ?? null;
  });
  const [isLoading, setIsLoading] = useState(!challenge);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (challenge || !token || !challengeId) {
      return;
    }

    const controller = new AbortController();

    const fetchChallenge = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload = (await response.json()) as DashboardPayload;
        const found = payload.activeChallenges?.find((item) => item.id === Number.parseInt(challengeId, 10));

        if (!found) {
          setError("We couldn't find that challenge. It may have expired.");
          return;
        }

        setChallenge(found);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load challenge details.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchChallenge();

    return () => controller.abort();
  }, [challenge, challengeId, token]);

  const heroImage = useMemo(() => buildHeroImage(Number.parseInt(challengeId ?? "0", 10)), [challengeId]);

  const handleStartChallenge = () => {
    if (!challenge) {
      toast.error("Challenge data unavailable.");
      return;
    }

    navigate("/dashboard", {
      state: { focusChallengeId: challenge.id, openSubmission: true },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" className="group w-fit" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to dashboard
        </Button>
        <Card className="glass-card">
          <CardContent className="p-8 text-muted-foreground">Loading challenge details...</CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" className="group w-fit" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to dashboard
        </Button>
        <Card className="glass-card">
          <CardContent className="p-8 text-muted-foreground">
            {error ?? "We couldn't find this challenge."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" className="group w-fit" onClick={() => navigate(-1)}>
        <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to dashboard
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald-200/40 to-emerald-400/20">
              <img src={heroImage} alt={challenge.title} className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>

          <Card className="glass-card">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl">{challenge.icon}</span>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{challenge.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="bg-primary/15 text-primary">
                      {challenge.difficulty}
                    </Badge>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Complete by {challenge.deadline}
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      {challenge.progress}% teams finished
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Bring your team together for a real-world sustainability win. Treat this challenge like a featured product—review
                  the specs, gather what you need, and head out to complete the mission. Every action counts toward your league's
                  ranking and unlocks exclusive rewards in the marketplace.
                </p>
                <p>
                  We recommend kicking things off with a quick team stand-up. Assign roles, capture proof with clear photos, and
                  submit your story for maximum impact. Finishing before the deadline will secure priority review and spotlight your
                  team in the leaderboard feed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <FollowerPointerCard
            className="block"
            title={
              <div className="flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-emerald-500" />
                Eco action spotlight
              </div>
            }
          >
            <Card className="glass-card">
              <CardContent className="space-y-5 p-6">
                <div>
                  <span className="text-sm text-muted-foreground">Reward value</span>
                  <p className="text-3xl font-bold text-accent">+{challenge.points} GP</p>
                </div>
                <div className="rounded-xl border border-emerald-300/40 bg-emerald-100/30 p-4 text-sm text-emerald-800">
                  Completing this challenge unlocks a featured slot in the rewards store. Make sure to upload high-quality proof for a
                  chance to be highlighted in the community feed.
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleStartChallenge}>
                  Start this challenge
                </Button>
              </CardContent>
            </Card>
          </FollowerPointerCard>

          <Card className="glass-card">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-foreground">Quick facts</h2>
              <div className="space-y-3">
                {buildDetailHighlights(challenge.points).map(({ label, icon: Icon, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-card/50 p-3 text-sm text-muted-foreground"
                  >
                    <Icon className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary/80">{label}</p>
                      <p className="font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-foreground">How to earn full points</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary" />
                  Capture clear before-and-after photos and include your team in the frame.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary" />
                  Provide a short write-up explaining the impact and any partners involved.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary" />
                  Submit by {challenge.deadline} to qualify for spotlight consideration.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
