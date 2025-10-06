import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSession, signOut } from "@/lib/api/auth";
import { getMyPoints } from "@/lib/api/profiles";
import supabase from "@/lib/supabaseClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getRecentActivities, type Activity } from "@/lib/api/activities";

export const TopBar = () => {
  const [email, setEmail] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: points = 0, refetch } = useQuery({
    queryKey: queryKeys.myPoints,
    queryFn: getMyPoints,
    enabled: false,
  });

  useEffect(() => {
    getSession()
      .then(async (session) => {
        const em = session?.user?.email ?? null;
        setEmail(em);
        if (em) { await refetch(); }
      })
      .catch(() => setEmail(null));

    const channel = supabase
      .channel("points-topbar")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, async () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.myPoints });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setEmail(null);
      toast.success("Logged out");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to logout";
      toast.error(message);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search challenges..."
              className="w-full pl-10 pr-4 py-2 bg-input border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationsPopover />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground">{email ?? "Guest User"}</p>
              <p className="text-xs text-muted-foreground">{email ? `${points.toLocaleString()} GP` : "No authentication"}</p>
            </div>
            <Avatar className="h-11 w-11 ring-2 ring-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-base">
                {email ? (email[0] || "U").toUpperCase() : "G"}
              </AvatarFallback>
            </Avatar>
            {email && (
              <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

function NotificationsPopover() {
  const queryClient = useQueryClient();
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: queryKeys.activities,
    queryFn: () => getRecentActivities(5),
  });
  useEffect(() => {
    const channel = supabase
      .channel("topbar-activities-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border font-semibold">Notifications</div>
        <div className="max-h-80 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-3 text-sm text-destructive">{(error as Error).message}</div>
          ) : activities.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">No recent activity</div>
          ) : (
            <div className="divide-y divide-border">
              {activities.map((a: Activity) => {
                const text = a.type === "reward_redeemed"
                  ? "Redeemed a reward"
                  : a.type === "admin_submission_moderated"
                  ? `Submission ${a.metadata?.new_status || "updated"}`
                  : a.type === "submission_created"
                  ? "Submitted a challenge"
                  : a.type.replaceAll("_", " ");
                return (
                  <div key={a.id} className="p-3 text-sm">
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
