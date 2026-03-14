import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  validated: "bg-success/10 text-success ring-1 ring-inset ring-success/20",
  pending: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/20",
  cancelled: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize", statusStyles[status] || statusStyles.pending, className)}>
      {status}
    </span>
  );
}

export function AnchoredBadge({ anchored }: { anchored: boolean }) {
  if (!anchored) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
      ⛓ Anchored
    </span>
  );
}
