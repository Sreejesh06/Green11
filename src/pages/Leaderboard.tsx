import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, TrendingUp, TrendingDown, Minus, Search, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { API_BASE_URL } from "@/lib/api";

type Trend = "up" | "down" | "same";

type IndividualLeader = {
  rank: number;
  name: string;
  points: number;
  trend: Trend;
  change: number;
  team: string;
  avatar: string;
  seasonScore: number;
};

type TeamLeader = {
  rank: number;
  name: string;
  points: number;
  members: number;
  avgPoints: number;
  trend: Trend;
  change: number;
};

type LeaderboardResponse = {
  header: {
    title: string;
    description: string;
  };
  individualLeaders: IndividualLeader[];
  teamLeaders: TeamLeader[];
  myStats: {
    seasonRank: number;
    totalPlayers: number;
    seasonScore: number;
    points: number;
    position: string;
  };
  seasonStats: Array<{ label: string; value: string }>;
};

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
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLeaderboard() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload: LeaderboardResponse = await response.json();
        if (isMounted) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load leaderboard data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const header = data?.header;
  const individualLeaders = data?.individualLeaders ?? [];
  const teamLeaders = data?.teamLeaders ?? [];
  const myStats = data?.myStats;
  const seasonStats = data?.seasonStats ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-gradient">{header?.title ?? "Leaderboard"}</span>
          </h1>
          <p className="text-muted-foreground">
            {header?.description ?? "See how you stack up against the competition 🏆"}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Trophy className="h-4 w-4" />
          Jump to My Rank
        </Button>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-white/10 bg-card/40 p-4 text-sm text-muted-foreground">
          Loading leaderboard standings...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load leaderboard data: {error}
        </div>
      )}

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
                        className="pl-10 pr-4 py-2 bg-input border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {individualLeaders.map((player) => {
                      const rankDisplay = getRankDisplay(player.rank);
                      return (
                        <div
                          key={player.rank}
                          className={`leaderboard-row ${
                            player.rank <= 3 ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30" : ""
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
                                {player.avatar}
                              </AvatarFallback>
                            </Avatar>

                            {/* Player Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-lg">{player.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {player.team}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Season Score: {player.seasonScore}
                                </span>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-accent font-bold text-2xl">
                                  {player.points.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">PTS</div>
                              </div>

                              {/* Trend */}
                              <div className="flex items-center gap-1 min-w-[50px] justify-end">
                                {getTrendIcon(player.trend)}
                                {player.change !== 0 && (
                                  <span className={`text-sm font-medium ${
                                    player.trend === "up" ? "text-primary" : "text-destructive"
                                  }`}>
                                    {Math.abs(player.change)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                  <div className="space-y-3">
                    {teamLeaders.map((team) => {
                      const rankDisplay = getRankDisplay(team.rank);
                      return (
                        <div
                          key={team.rank}
                          className={`leaderboard-row ${
                            team.rank <= 3 ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className="flex-shrink-0 w-14 flex items-center justify-center">
                              {rankDisplay.icon}
                            </div>

                            {/* Team Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground text-xl">{team.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {team.members} members
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Avg: {team.avgPoints} GP per player
                                </span>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-accent font-bold text-2xl">
                                  {team.points.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">Total PTS</div>
                              </div>

                              {/* Trend */}
                              <div className="flex items-center gap-1 min-w-[50px] justify-end">
                                {getTrendIcon(team.trend)}
                                {team.change !== 0 && (
                                  <span className={`text-sm font-medium ${
                                    team.trend === "up" ? "text-primary" : "text-destructive"
                                  }`}>
                                    {Math.abs(team.change)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                  <p className="text-4xl font-bold text-gradient">{myStats?.seasonRank ?? "--"}</p>
                  <p className="text-xs text-muted-foreground mt-1">/ {myStats?.totalPlayers?.toLocaleString() ?? "--"} players</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-card/30">
                    <span className="text-sm text-muted-foreground">Season Score</span>
                    <span className="font-bold text-primary">{myStats?.seasonScore ?? "--"}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-card/30">
                    <span className="text-sm text-muted-foreground">Points</span>
                    <span className="font-bold text-accent">{myStats ? myStats.points.toLocaleString() : "--"}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-card/30">
                    <span className="text-sm text-muted-foreground">Position</span>
                    <span className="font-bold text-secondary">{myStats?.position ?? "--"}</span>
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
                {seasonStats.map((stat) => (
                  <div key={stat.label} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <span className="font-bold">{stat.value}</span>
                  </div>
                ))}
                {!seasonStats.length && (
                  <p className="text-sm text-muted-foreground">
                    Season statistics will appear as soon as the data is published.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
