import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Award, Target, TrendingUp, Leaf, Users, 
  Calendar, CheckCircle2, Star, Flame, Crown, Medal, Zap, Share2, Settings
} from "lucide-react";

const achievements = [
  { id: 1, name: "First Steps", description: "Complete your first challenge", icon: CheckCircle2, earned: true, rarity: "common" },
  { id: 2, name: "Eco Warrior", description: "Earn 1000 Green Points", icon: Trophy, earned: true, rarity: "rare" },
  { id: 3, name: "Team Player", description: "Help your team reach top 5", icon: Users, earned: true, rarity: "epic" },
  { id: 4, name: "Consistency King", description: "Log actions for 7 days straight", icon: Flame, earned: true, rarity: "rare" },
  { id: 5, name: "Point Master", description: "Earn 5000 Green Points", icon: Star, earned: false, rarity: "legendary" },
  { id: 6, name: "Champion", description: "Reach #1 on leaderboard", icon: Crown, earned: false, rarity: "legendary" },
];

const stats = [
  { label: "Total GP", value: "1,247", icon: Leaf, color: "text-primary" },
  { label: "Completed", value: "23", icon: Target, color: "text-secondary" },
  { label: "Streak", value: "5 days", icon: Flame, color: "text-accent" },
  { label: "Rank", value: "#3", icon: Trophy, color: "text-accent" },
];

const recentChallenges = [
  { name: "Zero Waste Lunch", completed: true, points: 50, date: "2 days ago" },
  { name: "Bike to Campus", completed: true, points: 30, date: "3 days ago" },
  { name: "Reusable Bottle", completed: true, points: 25, date: "4 days ago" },
  { name: "Plant Trees", completed: false, points: 150, date: "In progress" },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common": return "border-muted-foreground/30 bg-muted/20";
    case "rare": return "border-secondary/50 bg-secondary/10";
    case "epic": return "border-primary/50 bg-primary/10";
    case "legendary": return "border-accent/50 bg-accent/10";
    default: return "border-muted-foreground/30 bg-muted/20";
  }
};

export default function Profile() {
  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-28 h-28 ring-4 ring-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary via-primary-glow to-secondary text-primary-foreground text-4xl font-bold">
                AK
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Arjun Kumar</h1>
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
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trophy Case */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Trophy Case
            </CardTitle>
            <CardDescription>
              {achievements.filter(a => a.earned).length} of {achievements.length} achievements unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-5 rounded-xl border transition-all ${
                      achievement.earned
                        ? `${getRarityColor(achievement.rarity)} hover:scale-105 cursor-pointer`
                        : "border-muted/30 bg-muted/5 opacity-40 grayscale"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Icon className={`w-7 h-7 ${
                          achievement.earned ? "text-accent" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Challenges
            </CardTitle>
            <CardDescription>Your latest sustainability actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChallenges.map((challenge, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-white/5 hover:bg-card/60 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      challenge.completed 
                        ? "bg-gradient-to-br from-primary/20 to-secondary/20" 
                        : "bg-muted/20"
                    }`}>
                      {challenge.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Target className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{challenge.name}</h4>
                      <p className="text-xs text-muted-foreground">{challenge.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-accent font-bold text-lg">+{challenge.points}</div>
                    <div className="text-xs text-muted-foreground">GP</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Team Overview - SustainSquad
          </CardTitle>
          <CardDescription>Your team's performance this season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 text-center">
              <p className="text-sm text-muted-foreground mb-1">Team Rank</p>
              <p className="text-4xl font-bold text-gradient">#3</p>
            </div>
            <div className="p-4 rounded-xl bg-card/40 border border-white/5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Points</p>
              <p className="text-2xl font-bold">8,388</p>
            </div>
            <div className="p-4 rounded-xl bg-card/40 border border-white/5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Members</p>
              <p className="text-2xl font-bold">8/8</p>
            </div>
            <div className="p-4 rounded-xl bg-card/40 border border-white/5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Avg GP/Player</p>
              <p className="text-2xl font-bold">1,049</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
