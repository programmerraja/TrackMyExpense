
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PiggyBank, 
  BarChart3,
  Wallet,
  Settings
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "income", title: "Income", icon: TrendingUp, path: "/income" },
  { id: "expenses", title: "Expenses", icon: TrendingDown, path: "/expenses" },
  { id: "debts", title: "Debts", icon: CreditCard, path: "/debts" },
  { id: "investments", title: "Investments", icon: PiggyBank, path: "/investments" },
  { id: "market", title: "Live Market", icon: BarChart3, path: "/market" },
  { id: "settings", title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar className="border-r bg-card">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-4 text-lg font-bold text-card-foreground flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && "FinanceTracker"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3 pt-6">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <NavLink to={item.path} end={item.path === "/"} className="block">
                    {({ isActive }) => (
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={isCollapsed ? item.title : undefined}
                        className={`
                          relative group h-11 rounded-lg transition-all duration-200 w-full
                          ${isActive 
                            ? 'bg-accent text-accent-foreground border-r-2 border-primary' 
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        <div className={`
                          p-1.5 rounded-md transition-all duration-200
                          ${isActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-muted-foreground group-hover:text-foreground'
                          }
                        `}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        {!isCollapsed && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
