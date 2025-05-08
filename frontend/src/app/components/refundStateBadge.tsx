import { RefundStatus } from "@/src/app/[locale]/types";
import { Badge } from "@/src/app/components/ui/badge";
import { Clock, CheckCircle, CreditCard } from "lucide-react";

interface RefundStatusBadgeProps {
  status: RefundStatus;
}

export default function RefundStatusBadge({ status }: RefundStatusBadgeProps) {
  let variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | null
    | undefined = "default";
  let icon = null;
  
  switch (status) {
    case RefundStatus.PENDING:
      variant = "secondary";
      icon = <Clock className="h-3.5 w-3.5 mr-1" />;
      break;
    case RefundStatus.APPROVED:
      variant = "default";
      icon = <CheckCircle className="h-3.5 w-3.5 mr-1" />;
      break;
    case RefundStatus.PROCESSED:
      variant = "outline";
      icon = <CreditCard className="h-3.5 w-3.5 mr-1" />;
      break;
    case RefundStatus.REJECTED:
      variant = "destructive";
 
      break;
  }

  return (
    <Badge variant={variant} className="flex items-center w-fit">
      {icon}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}