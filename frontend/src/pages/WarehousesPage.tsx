import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { warehousesApi } from "@/services/api";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSpinner } from "@/components/Spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Warehouse } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function WarehousesPage() {
  const { warehouses, fetchWarehouses, warehousesLoaded } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", location: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!warehousesLoaded) fetchWarehouses(); }, []);

  const openEdit = (w: any) => {
    setEditing(w);
    setForm({ name: w.name, location: w.location });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", location: "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await warehousesApi.update(editing._id, form);
        toast.success("Warehouse updated");
      } else {
        await warehousesApi.create(form);
        toast.success("Warehouse created");
      }
      setModalOpen(false);
      fetchWarehouses();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this warehouse?")) return;
    try {
      await warehousesApi.delete(id);
      toast.success("Warehouse deleted");
      fetchWarehouses();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <>
      <TopBar title="Warehouses" actions={
        <Button onClick={openCreate} className="active:scale-[0.98]"><Plus className="h-4 w-4 mr-1.5" /> Add Warehouse</Button>
      } />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        {!warehousesLoaded ? <PageSpinner /> : (
          <div className="shadow-card rounded-xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-64 align-middle">
                      <EmptyState 
                        icon={Warehouse} 
                        title="No Warehouses Found" 
                        description="Get started by deploying your first tracking facility." 
                      />
                    </TableCell>
                  </TableRow>
                )}
                {warehouses.map((w: any) => (
                  <TableRow key={w._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>{w.location}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(w)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(w._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Warehouse" /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Factory Building A" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name} className="active:scale-[0.98]">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
