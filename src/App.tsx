import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Routes with Sidebar/TopBar */}
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen w-full bg-background">
                <Sidebar />
                <div className="flex-1 md:ml-64">
                  <TopBar />
                  <main className="min-h-[calc(100vh-4rem)]">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/rewards" element={<Rewards />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
