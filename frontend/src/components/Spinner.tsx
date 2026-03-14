import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-5 w-5 animate-spin text-primary", className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
