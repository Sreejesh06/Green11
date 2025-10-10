import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <TopBar />
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
