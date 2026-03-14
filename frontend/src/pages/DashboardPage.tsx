import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { dashboardApi, anchorApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Spinner, PageSpinner } from "@/components/Spinner";
import { StatusBadge, AnchoredBadge } from "@/components/StatusBadge";
import { VerifyModal } from "@/components/VerifyModal";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Package, AlertTriangle, ArrowDownToLine, Truck, ArrowLeftRight, Anchor, Shield,
} from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchoring, setAnchoring] = useState(false);
  const [verifyId, setVerifyId] = useState<string>("");
  const [verifyOpen, setVerifyOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      dashboardApi.summary(), 
      dashboardApi.recentMovements(8),
      dashboardApi.lowStock(10, 5)
    ])
      .then(([s, m, l]) => { 
        setSummary(s); 
        setMovements(m); 
        setLowStockItems(l.data || []);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const handleAnchor = async () => {
    setAnchoring(true);
    try {
      const res = await anchorApi.batch(20);
      toast.success(`Anchored ${res.movementCount} movements`, {
        description: `TX: ${res.txHash?.slice(0, 16)}...`,
        action: res.txHash ? {
          label: "View on Explorer",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${res.txHash}`, "_blank"),
        } : undefined,
      });
      // Refresh
      const m = await dashboardApi.recentMovements(8);
      setMovements(m);
    } catch (e: any) {
      toast.error(e.message || "Anchoring failed");
    } finally {
      setAnchoring(false);
    }
  };

  const handleVerify = (id: string) => {
    setVerifyId(id);
    setVerifyOpen(true);
  };

  if (loading) return <><TopBar title="Dashboard" /><PageSpinner /></>;

  const kpis = [
    { label: "Total Products", value: summary?.totalProducts ?? 0, icon: Package },
    { label: "Low Stock", value: summary?.lowStock ?? 0, icon: AlertTriangle },
    { label: "Total Receipts", value: summary?.pendingReceipts ?? 0, icon: ArrowDownToLine },
    { label: "Total Deliveries", value: summary?.pendingDeliveries ?? 0, icon: Truck },
    { label: "Total Transfers", value: summary?.transfersScheduled ?? 0, icon: ArrowLeftRight },
  ];

  const typeIcons: Record<string, any> = {
    receipt: ArrowDownToLine, delivery: Truck, transfer: ArrowLeftRight, adjustment: AlertTriangle,
  };

  return (
    <>
      <TopBar
        title="Dashboard"
        actions={
          <Button onClick={handleAnchor} disabled={anchoring} className="active:scale-[0.98] transition-transform">
            {anchoring ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <Anchor className="h-4 w-4 mr-1.5" />}
            Anchor Batch
          </Button>
        }
      />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="shadow-card hover:shadow-card-hover transition-shadow rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium uppercase text-muted-foreground tracking-wide">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums tracking-tight">{kpi.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Recent Movements */}
        <div className="shadow-card rounded-xl">
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold">Recent Movements</h2>
          </div>
          <div className="divide-y">
            {movements.length === 0 && (
              <div className="py-8">
                <EmptyState 
                  icon={List} 
                  title="Ledger is Empty" 
                  description="Awaiting first movement." 
                />
              </div>
            )}
            {movements.map((m: any) => {
              const Icon = typeIcons[m.type] || Package;
              const productName = m.productId?.name || "Unknown";
              const productId = m.productId?._id;
              const from = m.fromWarehouseId?.name;
              const to = m.toWarehouseId?.name;
              const isPositive = m.type === "receipt" || m.type === "adjustment";

              return (
                <div key={m._id} className={`flex items-center gap-3 p-3 transition-colors group ${m.tampered ? 'bg-destructive/15 hover:bg-destructive/25' : 'hover:bg-muted/30'}`}>
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {productId ? (
                        <Link to={`/products/${productId}`} className="text-sm font-medium hover:text-primary truncate">{productName}</Link>
                      ) : (
                        <span className="text-sm font-medium truncate">{productName}</span>
                      )}
                      <StatusBadge status={m.status} />
                      <AnchoredBadge anchored={m.anchored} />
                      {m.tampered && <span className="inline-flex items-center rounded-sm border px-1.5 py-0 text-[10px] font-bold border-transparent bg-destructive text-destructive-foreground animate-pulse">TAMPERED</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {from && to ? `${from} → ${to}` : from || to || ""}
                      {m.createdAt && ` · ${new Date(m.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${m.tampered ? "text-destructive" : isPositive ? "text-success" : "text-destructive"}`}>
                    {isPositive ? "+" : "−"}{m.qty}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerify(m._id)}
                  >
                    <Shield className={`h-4 w-4 mr-1 ${m.tampered ? 'text-destructive animate-bounce' : m.anchored ? 'text-success' : 'text-muted-foreground'}`} /> Verify
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="shadow-card rounded-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
              </h2>
              <Link to="/products" className="text-xs text-primary hover:underline">View all products</Link>
            </div>
            <div className="divide-y">
              {lowStockItems.map((item: any) => (
                <div key={item.productId} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <Link to={`/products/${item.productId}`} className="text-sm font-medium hover:text-primary">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-destructive tabular-nums">{item.totalQty}</span>
                    <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <VerifyModal movementId={verifyId} open={verifyOpen} onOpenChange={setVerifyOpen} />
    </>
  );
}
