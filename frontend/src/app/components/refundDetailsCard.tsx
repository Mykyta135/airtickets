import { Refund } from "@/src/app/[locale]/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import RefundStatusBadge from "./refundStateBadge";


interface RefundDetailsCardProps {
  refund: Refund;
}

export default function RefundDetailsCard({ refund }: RefundDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Refund #{refund.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              Requested on {new Date(refund.requestDate).toLocaleString()}
            </CardDescription>
          </div>
          <RefundStatusBadge status={refund.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <div className="text-sm font-medium">Refund Amount</div>
          <div className="text-2xl font-bold">{refund.amount}</div>
        </div>

        <div className="grid gap-2">
          <div className="text-sm font-medium">Reason for Refund</div>
          <div className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/50">
            {refund.reason || "No reason provided"}
          </div>
        </div>

        {refund.ticket && (
          <div className="grid gap-4">
            <div className="text-sm font-medium">Ticket Information</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Ticket Number</div>
                <div className="font-medium">{refund.ticket.ticketNumber}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Issue Date</div>
                <div className="font-medium">
                  {new Date(refund.ticket.issueDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Original Status</div>
                <div className="font-medium">{refund.ticket.status}</div>
              </div>
            </div>
          </div>
        )}

        {refund.processedDate && (
          <div className="grid gap-2">
            <div className="text-sm font-medium">Processed Date</div>
            <div className="font-medium">
              {new Date(refund.processedDate).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}