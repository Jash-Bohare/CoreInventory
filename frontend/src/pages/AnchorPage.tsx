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
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="shadow-card rounded-xl bg-card p-8 text-center space-y-4 border border-border/40">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <AnchorIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Anchor Batch to Blockchain</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Commit your latest movements to the Ethereum blockchain to ensure permanent immutability and mathematical proof of existence.
              </p>
              <Button onClick={handleAnchor} disabled={anchoring} size="lg" className="active:scale-[0.98] transition-all px-8">
                {anchoring ? <Spinner className="h-4 w-4 text-primary-foreground mr-2" /> : <AnchorIcon className="h-4 w-4 mr-2" />}
                {anchoring ? "Mining Transaction..." : "Anchor All Movements"}
              </Button>
            </div>

            {result && (
              <div className="shadow-card rounded-xl bg-card p-6 space-y-4 animate-fade-in border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Last Anchor Result
                  </h3>
                  <span className="text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded-full uppercase tracking-widest">Confirmed</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Movements Processed</p>
                    <p className="text-lg font-bold tabular-nums">{result.movementCount}</p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-lg border border-border/40">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Block Number</p>
                    <p className="text-lg font-bold tabular-nums">{result.blockNumber}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Merkle Root (State Hash)</span>
                  <code className="block text-[11px] font-mono bg-background rounded-lg p-3 break-all border border-border/40 ring-1 ring-inset ring-white/5">{result.root}</code>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Transaction Hash</span>
                  <code className="block text-[11px] font-mono bg-background rounded-lg p-3 break-all border border-border/40 ring-1 ring-inset ring-white/5">{result.txHash}</code>
                </div>

                {result.txHash && (
                  <Button variant="outline" className="w-full bg-background" asChild>
                    <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1.5" /> Verify on Etherscan
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="shadow-card rounded-xl bg-card p-6 border border-border/40 space-y-4">
              <h3 className="text-sm font-semibold">How it Works</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground block mb-0.5">Hash Generation</strong>
                    Every entry in the database is uniquely converted into a Keccak-256 cryptographic hash.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground block mb-0.5">Merkle Tree Packing</strong>
                    Hashes are organized into a Merkle Tree structure, creating a single "Root Hash" that represents the entire batch.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground block mb-0.5">Ethereum Anchoring</strong>
                    The Root Hash is sent to an Ethereum Smart Contract, providing an immutable, publicly verifiable timestamp.
                  </p>
                </div>
              </div>
            </div>

            <div className="shadow-card rounded-xl bg-primary p-6 space-y-2 text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AnchorIcon className="h-24 w-24" />
              </div>
              <h3 className="text-sm font-bold relative z-10">Zero-Trust Protocol</h3>
              <p className="text-xs opacity-90 relative z-10 leading-relaxed">
                By anchoring movements, you provide your clients and auditors with mathematical proof that your records have not been altered.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
