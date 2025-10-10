import { Bell, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const TopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name
    ?.split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "G";

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-foreground">{user?.name ?? "Green11 Member"}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "Signed in"}</p>
            </div>
            <Avatar className="h-11 w-11 ring-2 ring-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-base">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
