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
                  className="hover:bg-accent/50"
                  activeClassName="bg-accent text-primary font-medium"
                >
                  <item.icon className="mr-2 h-5 w-5" strokeWidth={1.5} />
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
        <div className="px-4 py-5">
          <span className="text-lg font-bold tracking-tight text-foreground">CoreInventory</span>
        </div>
        <NavGroup label="Overview" items={mainItems} />
        <NavGroup label="Operations" items={operationItems} />
        <NavGroup label="Blockchain" items={ledgerItems} />
      </SidebarContent>
    </Sidebar>
  );
}
