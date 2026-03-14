import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { anchorApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";
import { Anchor as AnchorIcon, ExternalLink } from "lucide-react";

export default function AnchorPage() {
  const [anchoring, setAnchoring] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnchor = async () => {
    setAnchoring(true);
    try {
      const res = await anchorApi.batch(20);
      setResult(res);
      toast.success(`Anchored ${res.movementCount} movements`);
    } catch (e: any) {
      toast.error(e.message || "Anchoring failed");
    } finally { setAnchoring(false); }
  };

  return (
    <>
      <TopBar title="Anchor" />
      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="shadow-card rounded-xl bg-card p-8 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <AnchorIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Anchor Batch to Blockchain</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Anchor the latest unanchored movements into a Merkle tree and commit the root hash to an Ethereum smart contract.
          </p>
          <Button onClick={handleAnchor} disabled={anchoring} size="lg" className="active:scale-[0.98] transition-transform">
            {anchoring ? <Spinner className="h-4 w-4 text-primary-foreground mr-2" /> : <AnchorIcon className="h-4 w-4 mr-2" />}
            {anchoring ? "Anchoring..." : "Anchor Batch"}
          </Button>
        </div>

        {result && (
          <div className="shadow-card rounded-xl bg-card p-6 space-y-3 animate-fade-in">
            <h3 className="text-sm font-semibold">Last Anchor Result</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Movements:</span> <span className="font-semibold tabular-nums">{result.movementCount}</span></div>
              <div><span className="text-muted-foreground">Block:</span> <span className="font-semibold tabular-nums">{result.blockNumber}</span></div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Merkle Root</span>
              <code className="block mt-1 text-xs font-mono bg-muted rounded-lg p-2.5 break-all">{result.root}</code>
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">TX Hash</span>
              <code className="block mt-1 text-xs font-mono bg-muted rounded-lg p-2.5 break-all">{result.txHash}</code>
            </div>
            {result.txHash && (
              <Button variant="outline" asChild>
                <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1.5" /> View on Etherscan
                </a>
              </Button>
            )}
          </div>
        )}
      </main>
    </>
  );
}
