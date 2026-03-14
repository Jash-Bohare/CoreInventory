import { useState, useEffect } from "react";
import { anchorApi } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
import { Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VerifyModalProps {
  movementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyModal({ movementId, open, onOpenChange }: VerifyModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const loadProof = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await anchorApi.verify(movementId);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Not anchored yet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && movementId) loadProof();
  }, [open, movementId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Cryptographic Proof
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-4">
            <ProofField label="Movement Hash" value={data.movementHash} onCopy={copyToClipboard} />
            <ProofField label="Merkle Root" value={data.merkleRoot} onCopy={copyToClipboard} />

            <div>
              <label className="text-xs font-medium uppercase text-muted-foreground tracking-wide">Merkle Proof</label>
              <div className="mt-1 rounded-lg bg-muted p-3 space-y-1 max-h-40 overflow-auto">
                {data.merkleProof?.map((hash: string, i: number) => (
                  <div key={i} className="flex items-center justify-between group">
                    <code className="text-xs font-mono text-foreground truncate flex-1">{hash}</code>
                    <button onClick={() => copyToClipboard(hash)} className="transition-opacity ml-2 text-muted-foreground hover:text-foreground">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {data.txHash && (
              <ProofField label="Transaction Hash" value={data.txHash} onCopy={copyToClipboard} />
            )}

            {data.explorer && (
              <Button asChild variant="outline" className="w-full">
                <a href={data.explorer} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </a>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProofField({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase text-muted-foreground tracking-wide">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-lg bg-muted p-2.5">
        <code className="text-xs font-mono text-foreground truncate flex-1">{value}</code>
        <button onClick={() => onCopy(value)} className="hover:text-foreground text-muted-foreground transition-colors">
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
