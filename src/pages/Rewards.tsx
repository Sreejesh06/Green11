import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const Rewards = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState<RewardsResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemingRewardId, setRedeemingRewardId] = useState<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadRazorpayCheckout = useCallback(async () => {
    if (window.Razorpay) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const fetchRewards = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/rewards`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const payload: RewardsResponse = await response.json();
      if (isMountedRef.current) {
        setData(payload);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load rewards");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

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

  const handleRedeem = useCallback(async (reward: RewardItem) => {
    if (!token) {
      toast.error("Please sign in to redeem rewards.");
      return;
    }

    if (userPoints < reward.cost) {
      toast.error(`You need ${numberFormatter.format(reward.cost - userPoints)} more GP to redeem this item.`);
      return;
    }

    try {
      setRedeemingRewardId(reward.id);

      const response = await fetch(`${API_BASE_URL}/api/rewards/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
          const payload = await response.json();
          if (typeof payload.message === "string") {
            message = payload.message;
          }
        } catch (_err) {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        key: string;
        order: { id: string; amount: number; currency: string };
      };

      const scriptLoaded = await loadRazorpayCheckout();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Please try again.");
      }

      const { order } = payload;

      const razorpay = new window.Razorpay({
        key: payload.key,
        amount: order.amount,
        currency: order.currency,
        name: "Green11 Rewards",
        description: reward.name,
        order_id: order.id,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
        },
        theme: {
          color: "#10B981",
        },
        notes: {
          rewardId: String(reward.id),
          rewardName: reward.name,
        },
        handler: async (paymentResponse: Record<string, string>) => {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/api/rewards/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId: order.id,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              let message = "Payment verification failed.";
              try {
                const verifyPayload = await verifyResponse.json();
                if (typeof verifyPayload.message === "string") {
                  message = verifyPayload.message;
                }
              } catch (_err) {
                // ignore JSON parse errors
              }
              throw new Error(message);
            }

            toast.success(`Payment captured for ${reward.name}! 🎉`);
            await fetchRewards();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Unable to verify payment.");
          } finally {
            setRedeemingRewardId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setRedeemingRewardId(null);
          },
        },
      });

      razorpay.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to start checkout.");
      setRedeemingRewardId(null);
    }
  }, [token, user, userPoints, numberFormatter, loadRazorpayCheckout, fetchRewards]);

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
              const isRedeeming = redeemingRewardId === reward.id;

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
                        disabled={!canAfford || isRedeeming}
                        onClick={() => void handleRedeem(reward)}
                        className={canAfford ? "bg-primary hover:bg-primary/90" : ""}
                      >
                        {isRedeeming ? "Processing..." : canAfford ? "Redeem" : "Locked"}
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
