import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Filter, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getLucideIcon } from "@/lib/icon-map";

type RewardItem = {
  id: number;
  name: string;
  cost: number;
  iconName: string;
  category: string;
  stock: number;
  description: string;
  rarity?: string;
};

type RewardsResponse = {
  userPoints: number;
  categories: string[];
  rewards: RewardItem[];
};

const rarityAccent: Record<string, string> = {
  common: "",
  rare: "shadow-[0_0_20px_-8px_rgba(14,165,233,0.5)]",
  epic: "shadow-[0_0_25px_-10px_rgba(168,85,247,0.6)]",
  legendary: "shadow-[0_0_30px_-8px_rgba(234,179,8,0.7)]"
};

const Rewards = () => {
  const { token } = useAuth();
  const [data, setData] = useState<RewardsResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRewards() {
      if (!token) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/rewards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload: RewardsResponse = await response.json();
        if (isMounted) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load rewards");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRewards();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-IN"), []);
  const userPoints = data?.userPoints ?? 0;
  const categories = data?.categories ?? [];

  const filteredRewards = useMemo(() => {
    if (!data) {
      return [] as RewardItem[];
    }

    if (selectedCategory === "All") {
      return data.rewards;
    }

    return data.rewards.filter((reward) => reward.category === selectedCategory);
  }, [data, selectedCategory]);

  const handleRedeem = (reward: RewardItem) => {
    if (userPoints >= reward.cost) {
      toast.success(`Successfully redeemed ${reward.name}! 🎉`);
    } else {
      toast.error(`You need ${numberFormatter.format(reward.cost - userPoints)} more GP to redeem this item.`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">
            <span className="text-gradient">Reward Marketplace</span>
          </h1>
          <p className="text-muted-foreground">Redeem your Green Points for awesome rewards! 🎁</p>
        </div>
        <Card className="glass-card w-fit">
          <CardContent className="p-4 text-center">
            <div className="mb-1 flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              <p className="text-sm text-muted-foreground">Balance</p>
            </div>
            <p className="text-4xl font-bold text-gradient-accent">
              {numberFormatter.format(userPoints)}
            </p>
            <p className="text-xs text-muted-foreground">GP</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-white/10 bg-card/40 px-6 py-4 text-center text-sm text-muted-foreground">
          Loading rewards...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-center text-sm text-destructive">
          Could not load rewards: {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {["All", ...categories].map((cat) => (
                <Button
                  key={cat}
                  variant={cat === selectedCategory ? "default" : "outline"}
                  size="sm"
                  className={cat === selectedCategory ? "bg-primary hover:bg-primary/90" : ""}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRewards.map((reward) => {
              const Icon = getLucideIcon(reward.iconName ?? "Gift");
              const canAfford = userPoints >= reward.cost;
              const rarityGlow = reward.rarity ? rarityAccent[reward.rarity] ?? "" : "";

              return (
                <Card
                  key={reward.id}
                  className={`glass-card transition-all hover:scale-105 hover:shadow-2xl ${rarityGlow}`}
                >
                  <CardHeader>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {reward.stock} left
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <CardDescription className="text-xs">{reward.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="min-h-[40px] text-sm text-muted-foreground">{reward.description}</p>
                    <div className="flex items-end justify-between border-t border-white/5 pt-2">
                      <div>
                        <div className="text-3xl font-bold text-accent">
                          {numberFormatter.format(reward.cost)}
                        </div>
                        <div className="text-xs text-muted-foreground">GP</div>
                      </div>
                      <Button
                        variant={canAfford ? "default" : "outline"}
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => handleRedeem(reward)}
                        className={canAfford ? "bg-primary hover:bg-primary/90" : ""}
                      >
                        {canAfford ? "Redeem" : "Locked"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!filteredRewards.length && (
            <div className="rounded-lg border border-white/10 bg-card/40 px-6 py-4 text-center text-sm text-muted-foreground">
              No rewards available in this category yet.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Rewards;
