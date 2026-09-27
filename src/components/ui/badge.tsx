import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-red-50 text-red-700",
        info: "bg-sky-50 text-sky-700",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function statusBadgeVariant(
  status: string
): VariantProps<typeof badgeVariants>["variant"] {
  const map: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
    ACTIVE: "success",
    PAID: "success",
    PUBLISHED: "success",
    CONNECTED: "success",
    DELIVERED: "success",
    PENDING: "warning",
    PAYMENT_PENDING: "warning",
    REQUIREMENTS_PENDING: "warning",
    TESTING: "warning",
    TRIAL: "warning",
    PROCESSING: "info",
    IN_DEVELOPMENT: "info",
    CONFIRMED: "info",
    SYNCING: "info",
    SHIPPED: "info",
    READY_TO_PUBLISH: "info",
    SUSPENDED: "danger",
    INACTIVE: "muted",
    FAILED: "danger",
    CANCELLED: "danger",
    REJECTED: "danger",
    DISCONNECTED: "muted",
    CONNECTION_ERROR: "danger",
    REFUNDED: "secondary",
    NOT_STARTED: "muted",
    REVISION_REQUIRED: "warning",
    REVISION: "warning",
  };
  return map[status] ?? "secondary";
}
