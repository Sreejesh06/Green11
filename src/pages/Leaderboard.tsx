import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus, Search, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useMemo, useState } from "react";
import { getTopProfiles } from "@/lib/api/leaderboard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "@/lib/supabaseClient";
import { queryKeys } from "@/lib/api/queryKeys";

// removed mock data for individual and team leaders

const getRankDisplay = (rank: number) => {
  if (rank === 1) return { icon: <Crown className="w-7 h-7 text-accent" />, badge: "1st", color: "text-accent" };
  if (rank === 2) return { icon: <Medal className="w-7 h-7 text-gray-400" />, badge: "2nd", color: "text-gray-400" };
  if (rank === 3) return { icon: <Medal className="w-7 h-7 text-amber-600" />, badge: "3rd", color: "text-amber-600" };
  return { icon: <span className="text-muted-foreground font-bold text-xl">#{rank}</span>, badge: `${rank}th`, color: "text-muted-foreground" };
};

const getTrendIcon = (trend: string) => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-primary" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

export default function Leaderboard() {
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: () => getTopProfiles(100),
  });

  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const filtered = useMemo(() => {
    if (!q) return entries;
    const s = q.toLowerCase();
    return entries.filter((e) => (e.full_name || e.username || "").toLowerCase().includes(s));
  }, [entries, q]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">
            See how you stack up against the competition 🏆
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Trophy className="h-4 w-4" />
          Jump to My Rank
        </Button>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="glass-card w-full md:w-auto mb-6">
          <TabsTrigger value="individual" className="flex-1 md:flex-none">
            Individual Rankings
          </TabsTrigger>
          <TabsTrigger value="team" className="flex-1 md:flex-none">
            Team Rankings
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            <TabsContent value="individual" className="mt-0">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Top Players</CardTitle>
                      <CardDescription>Most Green Points earned this season</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search player..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-input border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                  ) : error ? (
                    <div className="p-4 text-sm text-destructive">{(error as Error).message}</div>
                  ) : (
                    <div className="space-y-3">
                    {filtered.map((player, idx) => {
                      const rank = idx + 1;
                      const rankDisplay = getRankDisplay(rank);
                      return (
                        <div
                          key={player.id}
                          className={`leaderboard-row ${
                            rank <= 3 ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className="flex-shrink-0 w-14 flex items-center justify-center">
                              {rankDisplay.icon}
                            </div>

                            {/* Avatar */}
                            <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold text-lg">
                                {(player.full_name?.[0] || player.username?.[0] || "U").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-lg">{player.full_name || player.username || "Unknown"}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  ID: {player.id.slice(0, 6)}
                                </Badge>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-accent font-bold text-2xl">
                                  {(player.points ?? 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">PTS</div>
                              </div>

                              {/* Trend */}
                              <div className="flex items-center gap-1 min-w-[50px] justify-end">
                                {getTrendIcon("same")}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Top Teams</CardTitle>
                  <CardDescription>Combined Green Points by team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 text-sm text-muted-foreground">Team rankings will appear once team data is available.</div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* My Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  My Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
                  <p className="text-sm text-muted-foreground mb-1">Season Rank</p>
                  <p className="text-4xl font-bold text-gradient">3</p>
                  <p className="text-xs text-muted-foreground mt-1">/ 1,243 players</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-card/30">
                    <span className="text-sm text-muted-foreground">Season Score</span>
                    <span className="font-bold text-primary">7</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-card/30">
                    <span className="text-sm text-muted-foreground">Points</span>
                    <span className="font-bold text-accent">2,401</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-card/30">
                    <span className="text-sm text-muted-foreground">Position</span>
                    <span className="font-bold text-secondary">Stable</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Season Stats */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Season 2 Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Players</span>
                  <span className="font-bold">1,243</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Challenges</span>
                  <span className="font-bold">440,730</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">PTS Converted</span>
                  <span className="font-bold">26.3M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time Left</span>
                  <span className="font-bold">390d 2h</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
