import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { productsApi } from "@/services/api";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSpinner } from "@/components/Spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const { products, fetchProducts, productsLoaded } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "", unit: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!productsLoaded) fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", sku: "", category: "", unit: "" });
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, category: p.category, unit: p.unit });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await productsApi.update(editing._id, form);
        toast.success("Product updated");
      } else {
        await productsApi.create(form);
        toast.success("Product created");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productsApi.delete(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <>
      <TopBar title="Products" actions={
        <Button onClick={openCreate} className="active:scale-[0.98]">
          <Plus className="h-4 w-4 mr-1.5" /> Add Product
        </Button>
      } />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        {!productsLoaded ? <PageSpinner /> : (
          <div className="shadow-card rounded-xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No products yet</TableCell></TableRow>
                )}
                {products.map((p: any) => (
                  <TableRow key={p._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Link to={`/products/${p._id}`} className="font-medium hover:text-primary">{p.name}</Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">{p.sku}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Steel Rod" /></div>
            <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="STL-001" /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Raw Material" /></div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.sku} className="active:scale-[0.98]">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
