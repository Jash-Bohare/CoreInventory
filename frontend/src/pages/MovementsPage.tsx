import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { movementsApi } from "@/services/api";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSpinner } from "@/components/Spinner";
import { StatusBadge, AnchoredBadge } from "@/components/StatusBadge";
import { VerifyModal } from "@/components/VerifyModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ChevronLeft, ChevronRight, List } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function MovementsPage() {
  const [searchParams] = useSearchParams();
  const { products, warehouses, fetchProducts, fetchWarehouses, productsLoaded, warehousesLoaded } = useData();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [verifyId, setVerifyId] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);

  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    status: "",
    productId: searchParams.get("productId") || "",
    warehouseId: "",
    sort: "-createdAt",
  });

  useEffect(() => {
    if (!productsLoaded) fetchProducts();
    if (!warehousesLoaded) fetchWarehouses();
  }, []);

  useEffect(() => { loadItems(); }, [page, filters]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await movementsApi.list({ ...filters, page, limit: 20 });
      setItems(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch { }
    finally { setLoading(false); }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <>
      <TopBar title="Movement Ledger" />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filters.type} onValueChange={(v) => updateFilter("type", v === "all" ? "" : v)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => updateFilter("status", v === "all" ? "" : v)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.sort} onValueChange={(v) => updateFilter("sort", v)}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? <PageSpinner /> : (
          <>
            <div className="shadow-card rounded-xl overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-20">Verify</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 align-middle">
                        <EmptyState 
                          icon={List} 
                          title="Ledger is Empty" 
                          description="Once products move, immutable records will appear here." 
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((m: any) => (
                    <TableRow key={m._id} className={`${m.tampered ? 'bg-destructive/15 hover:bg-destructive/25' : 'hover:bg-muted/30'} transition-colors group`}>
                      <TableCell className="capitalize text-xs font-medium">{m.type}</TableCell>
                      <TableCell className="font-medium">{m.productId?.name || "—"}</TableCell>
                      <TableCell>{m.fromWarehouseId?.name || "—"}</TableCell>
                      <TableCell>{m.toWarehouseId?.name || "—"}</TableCell>
                      <TableCell className={`text-right tabular-nums font-semibold ${m.tampered ? 'text-destructive' : ''}`}>{m.qty}</TableCell>
                      <TableCell>
                        <StatusBadge status={m.status} /> <AnchoredBadge anchored={m.anchored} />
                        {m.tampered && <span className="ml-1 inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold border-transparent bg-destructive text-destructive-foreground animate-pulse">TAMPERED</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => { setVerifyId(m._id); setVerifyOpen(true); }}>
                          <Shield className={`h-4 w-4 ${m.tampered ? 'text-destructive animate-bounce' : m.anchored ? 'text-success' : 'text-muted-foreground'}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{total} total movements</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm tabular-nums">{page} / {pages}</span>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <VerifyModal movementId={verifyId} open={verifyOpen} onOpenChange={setVerifyOpen} />
    </>
  );
}
