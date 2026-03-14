import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  ClipboardCheck,
  List,
  Anchor,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  { title: "Warehouses", url: "/warehouses", icon: Warehouse },
];

const operationItems = [
  { title: "Receipts", url: "/operations/receipts", icon: ArrowDownToLine },
  { title: "Deliveries", url: "/operations/deliveries", icon: Truck },
  { title: "Transfers", url: "/operations/transfers", icon: ArrowLeftRight },
  { title: "Adjustments", url: "/operations/adjustments", icon: ClipboardCheck },
];

const ledgerItems = [
  { title: "Movement Ledger", url: "/movements", icon: List },
  { title: "Anchor", url: "/anchor", icon: Anchor },
];

function NavGroup({ label, items }: { label: string; items: typeof mainItems }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="hover:bg-accent/10 hover:text-accent transition-all duration-300 rounded-lg group"
                  activeClassName="bg-primary/10 text-primary font-medium shadow-[inset_2px_0_0_0_hsl(var(--primary))] bg-gradient-to-r from-primary/10 to-transparent"
                >
                  <item.icon className="mr-2 h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Anchor className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">CoreInventory</span>
        </div>
        <NavGroup label="Overview" items={mainItems} />
        <NavGroup label="Operations" items={operationItems} />
        <NavGroup label="Blockchain" items={ledgerItems} />
      </SidebarContent>
    </Sidebar>
  );
}
