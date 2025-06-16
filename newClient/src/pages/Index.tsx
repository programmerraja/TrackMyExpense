
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/income')) return 'Income';
    if (path.startsWith('/expenses')) return 'Expenses';
    if (path.startsWith('/debts')) return 'Debts';
    if (path.startsWith('/investments')) return 'Investments';
    if (path.startsWith('/market')) return 'Live Market';
    if (path.startsWith('/settings')) return 'Settings';
    return 'FinanceTracker';
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-card px-3 sm:px-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <SidebarTrigger className="-ml-1 p-2 hover:bg-accent rounded-lg transition-colors" />
              <h1 className="text-lg sm:text-2xl font-bold text-card-foreground truncate">
                {getTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <ThemeToggle />
              {!isMobile && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="truncate max-w-32 lg:max-w-none">{user?.email}</span>
                </div>
              )}
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"}
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2"
              >
                <LogOut className="h-4 w-4" />
                {!isMobile && <span>Sign Out</span>}
              </Button>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            <Outlet/>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
