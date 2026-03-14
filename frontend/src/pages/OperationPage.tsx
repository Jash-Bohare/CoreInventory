import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { movementsApi } from "@/services/api";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSpinner, Spinner } from "@/components/Spinner";
import { StatusBadge, AnchoredBadge } from "@/components/StatusBadge";
import { VerifyModal } from "@/components/VerifyModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Shield } from "lucide-react";

interface OperationPageProps {
  type: "receipt" | "delivery" | "transfer" | "adjustment";
  title: string;
}

export default function OperationPage({ type, title }: OperationPageProps) {
  const { products, warehouses, fetchProducts, fetchWarehouses, productsLoaded, warehousesLoaded } = useData();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifyId, setVerifyId] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);

  const [form, setForm] = useState({
    productId: "", warehouseId: "", fromWarehouseId: "", toWarehouseId: "", qty: "", countedQty: "",
  });

  useEffect(() => {
    if (!productsLoaded) fetchProducts();
    if (!warehousesLoaded) fetchWarehouses();
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await movementsApi.list({ type, limit: 50 });
      setItems(res.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      if (type === "receipt") {
        await movementsApi.createReceipt({ productId: form.productId, warehouseId: form.warehouseId, qty: Number(form.qty) });
      } else if (type === "delivery") {
        await movementsApi.createDelivery({ productId: form.productId, warehouseId: form.warehouseId, qty: Number(form.qty) });
      } else if (type === "transfer") {
        await movementsApi.createTransfer({ productId: form.productId, fromWarehouseId: form.fromWarehouseId, toWarehouseId: form.toWarehouseId, qty: Number(form.qty) });
      } else {
        await movementsApi.createAdjustment({ productId: form.productId, warehouseId: form.warehouseId, countedQty: Number(form.countedQty) });
      }
      toast.success(`${title} created`);
      setModalOpen(false);
      setForm({ productId: "", warehouseId: "", fromWarehouseId: "", toWarehouseId: "", qty: "", countedQty: "" });
      loadItems();
    } catch (e: any) {
      toast.error(e.message || "Failed to create");
    } finally { setSaving(false); }
  };

  const isFormValid = () => {
    if (!form.productId) return false;
    if (type === "transfer") return !!form.fromWarehouseId && !!form.toWarehouseId && Number(form.qty) > 0;
    if (type === "adjustment") return !!form.warehouseId && form.countedQty !== "";
    return !!form.warehouseId && Number(form.qty) > 0;
  };

  return (
    <>
      <TopBar title={title} actions={
        <Button onClick={() => setModalOpen(true)} className="active:scale-[0.98]"><Plus className="h-4 w-4 mr-1.5" /> Create {title.slice(0, -1)}</Button>
      } />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        {loading ? <PageSpinner /> : (
          <div className="shadow-card rounded-xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Product</TableHead>
                  {type === "transfer" ? (
                    <><TableHead>From</TableHead><TableHead>To</TableHead></>
                  ) : (
                    <TableHead>Warehouse</TableHead>
                  )}
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={type === "transfer" ? 7 : 6} className="text-center text-muted-foreground py-8">No {title.toLowerCase()} yet</TableCell></TableRow>
                )}
                {items.map((m: any) => (
                  <TableRow key={m._id} className={`${m.tampered ? 'bg-destructive/15 hover:bg-destructive/25' : 'hover:bg-muted/30'} transition-colors group`}>
                    <TableCell className="font-medium">{m.productId?.name || "—"}</TableCell>
                    {type === "transfer" ? (
                      <><TableCell>{m.fromWarehouseId?.name || "—"}</TableCell><TableCell>{m.toWarehouseId?.name || "—"}</TableCell></>
                    ) : (
                      <TableCell>{(m.toWarehouseId?.name || m.fromWarehouseId?.name) || "—"}</TableCell>
                    )}
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
        )}
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="animate-fade-in">
          <DialogHeader><DialogTitle>Create {title.slice(0, -1)}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => <SelectItem key={p._id} value={p._id}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {type === "transfer" ? (
              <>
                <div>
                  <Label>From Warehouse</Label>
                  <Select value={form.fromWarehouseId} onValueChange={(v) => setForm({ ...form, fromWarehouseId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w: any) => <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Warehouse</Label>
                  <Select value={form.toWarehouseId} onValueChange={(v) => setForm({ ...form, toWarehouseId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w: any) => <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div>
                <Label>Warehouse</Label>
                <Select value={form.warehouseId} onValueChange={(v) => setForm({ ...form, warehouseId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w: any) => <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "adjustment" ? (
              <div><Label>Counted Qty</Label><Input type="number" value={form.countedQty} onChange={(e) => setForm({ ...form, countedQty: e.target.value })} placeholder="0" /></div>
            ) : (
              <div><Label>Quantity</Label><Input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="0" /></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !isFormValid()} className="active:scale-[0.98]">
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VerifyModal movementId={verifyId} open={verifyOpen} onOpenChange={setVerifyOpen} />
    </>
  );
}
