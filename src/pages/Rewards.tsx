import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, ShoppingBag, Coffee, Book, Shirt, Bike, Leaf, Star, Filter } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { getRewards, redeemReward, type Reward as RewardType } from "@/lib/api/rewards";
import { getMyPoints } from "@/lib/api/profiles";
import supabase from "@/lib/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";

// Build categories dynamically from data so filters always work with real categories

export default function Rewards() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const queryClient = useQueryClient();
  const { data: rewards = [], isLoading: loadingRewards, error: rewardsError } = useQuery({
    queryKey: queryKeys.rewards,
    queryFn: getRewards,
  });
  const { data: userPoints = 0 } = useQuery({
    queryKey: queryKeys.myPoints,
    queryFn: getMyPoints,
  });

  useEffect(() => {
    const channel = supabase
      .channel("points-rewards")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, async () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.myPoints });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (rewards || []).forEach(r => { if (r.category) set.add(r.category); });
    return ["All", ...Array.from(set)];
  }, [rewards]);

  const filtered = useMemo(() => {
    const list = rewards;
    if (selectedCategory === "All") return list;
    return list.filter((r) => (r.category || "") === selectedCategory);
  }, [rewards, selectedCategory]);

  const redeemMutation = useMutation({
    mutationFn: async (reward: RewardType) => redeemReward(reward.id, reward.cost),
    onMutate: async (reward) => {
      // Optimistically update points
      const prev = queryClient.getQueryData<number>(queryKeys.myPoints);
      if (typeof prev === "number") {
        queryClient.setQueryData<number>(queryKeys.myPoints, Math.max(0, prev - reward.cost));
      }
      return { prevPoints: prev };
    },
    onError: (err, reward, ctx) => {
      if (typeof ctx?.prevPoints === "number") {
        queryClient.setQueryData<number>(queryKeys.myPoints, ctx.prevPoints);
      }
      toast.error(err instanceof Error ? err.message : "Redemption failed");
    },
    onSuccess: (_data, reward) => {
      toast.success(`Successfully redeemed ${reward.name}! 🎉`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myPoints });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2"><span className="text-gradient">Reward Marketplace</span></h1>
          <p className="text-muted-foreground">Redeem your Green Points for awesome rewards! 🎁</p>
        </div>
        <Card className="glass-card w-fit">
          <CardContent className="p-4 text-center">
            <div className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-accent" /><p className="text-sm text-muted-foreground">Balance</p></div>
            <p className="text-4xl font-bold text-gradient-accent">{userPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">GP</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Button key={cat} variant={cat === selectedCategory ? "default" : "outline"} size="sm" className={cat === selectedCategory ? "bg-primary hover:bg-primary/90" : ""} onClick={() => setSelectedCategory(cat)}>{cat}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loadingRewards ? (
          <div className="p-4 text-sm text-muted-foreground">Loading rewards...</div>
        ) : rewardsError ? (
          <div className="p-4 text-sm text-destructive">{(rewardsError as Error).message}</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No rewards found.</div>
        ) : (
          filtered.map((reward) => {
          const canAfford = userPoints >= reward.cost;
          return (
            <Card key={reward.id} className="glass-card transition-all hover:scale-105 hover:shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {reward.image_url ? (
                      <img src={reward.image_url} alt={reward.name} className="w-16 h-16 object-cover rounded-2xl" />
                    ) : (
                      <Gift className="w-8 h-8 text-primary" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <CardDescription className="text-xs">&nbsp;</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground min-h-[40px]">{reward.description}</p>
                <div className="flex items-end justify-between pt-2 border-t border-white/5">
                  <div><div className="text-3xl font-bold text-accent">{reward.cost}</div><div className="text-xs text-muted-foreground">GP</div></div>
                  <Button variant={canAfford ? "default" : "outline"} size="sm" disabled={!canAfford || redeemMutation.isPending} onClick={() => redeemMutation.mutate(reward)} className={canAfford ? "bg-primary hover:bg-primary/90" : ""}>{redeemMutation.isPending ? "Redeeming..." : canAfford ? "Redeem" : "Locked"}</Button>
                </div>
              </CardContent>
            </Card>
          );
          })
        )}
      </div>
    </div>
  );
}
