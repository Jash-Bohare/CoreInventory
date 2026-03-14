import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { productsApi } from "@/services/api";
import { PageSpinner } from "@/components/Spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, List } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([productsApi.get(id), productsApi.stock(id)])
      .then(([p, s]) => { setProduct(p); setStock(s); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><TopBar title="Product Detail" /><PageSpinner /></>;
  if (!product) return <><TopBar title="Product Not Found" /><p className="p-6 text-muted-foreground">Product not found.</p></>;

  return (
    <>
      <TopBar title={product.name} actions={
        <Button variant="outline" asChild>
          <Link to={`/movements?productId=${id}`}><List className="h-4 w-4 mr-1.5" /> Movements</Link>
        </Button>
      } />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-6">
        <Button variant="ghost" size="sm" asChild><Link to="/products"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ["SKU", product.sku],
            ["Category", product.category],
            ["Unit", product.unit],
            ["Total Qty", stock?.totalQty ?? "—"],
          ].map(([label, val]) => (
            <div key={label as string} className="shadow-card rounded-xl bg-card p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">{label}</p>
              <p className="text-lg font-bold tabular-nums mt-1">{val}</p>
            </div>
          ))}
        </div>

        <div className="shadow-card rounded-xl bg-card overflow-hidden">
          <div className="p-4 border-b"><h2 className="text-sm font-semibold">Stock by Warehouse</h2></div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Warehouse</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!stock?.locations || stock.locations.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 align-middle">
                    <EmptyState 
                      icon={Database} 
                      title="No Stock Records" 
                      description="This product isn't currently located in any warehouse." 
                    />
                  </TableCell>
                </TableRow>
              )}
              {stock?.locations?.map((loc: any) => (
                <TableRow key={loc.warehouseId}>
                  <TableCell className="font-medium">{loc.warehouseName}</TableCell>
                  <TableCell>{loc.location}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{loc.qty}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{loc.updatedAt ? new Date(loc.updatedAt).toLocaleDateString() : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}
