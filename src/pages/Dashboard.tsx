import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Trophy, Camera, Clock, CheckCircle2, Target, Zap, Users } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const activeChallenges = [
  { id: 1, title: "Zero Waste Lunch", points: 50, deadline: "2 days left", icon: "🥗", difficulty: "Easy", progress: 75 },
  { id: 2, title: "Bike to Campus Week", points: 100, deadline: "5 days left", icon: "🚴", difficulty: "Medium", progress: 40 },
  { id: 3, title: "Plant 5 Trees", points: 150, deadline: "7 days left", icon: "🌳", difficulty: "Hard", progress: 20 },
  { id: 4, title: "Reusable Water Bottle", points: 25, deadline: "1 day left", icon: "💧", difficulty: "Easy", progress: 90 },
];

const recentActivities = [
  { user: "Priya S.", action: "Completed 'Zero Waste Lunch'", time: "2 hours ago", points: 50, avatar: "PS" },
  { user: "Rahul M.", action: "Planted 3 trees", time: "4 hours ago", points: 90, avatar: "RM" },
  { user: "Your Team", action: "Climbed to Rank #3", time: "6 hours ago", points: 0, avatar: "TS" },
  { user: "Sneha P.", action: "Completed 'Bike Challenge'", time: "8 hours ago", points: 100, avatar: "SP" },
];

export default function Dashboard() {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Challenge submission sent for approval! 🎉");
    setIsSubmitOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, <span className="text-gradient">Arjun!</span>
        </h1>
        <p className="text-muted-foreground">
          Your team is crushing it! Keep the momentum going 🚀
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
          <p className="text-3xl font-bold text-gradient">1,247</p>
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
          <p className="text-3xl font-bold text-secondary">7/10</p>
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
                        <select className="w-full glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                          {activeChallenges.map(challenge => (
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
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex gap-3 items-start">
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
