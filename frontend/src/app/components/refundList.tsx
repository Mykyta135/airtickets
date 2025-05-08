import { Refund, RefundStatus } from "@/src/app/[locale]/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/app/components/ui/table";
import { Button } from "@/src/app/components/ui/button";

import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import RefundStatusBadge from "./refundStateBadge";

interface RefundListProps {
  refunds: Refund[];
  onDelete: (refundId: string) => void;
}

export default function RefundList({ refunds, onDelete }: RefundListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request Date</TableHead>
            <TableHead>Ticket Number</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processed Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.map((refund) => (
            <TableRow key={refund.id}>
              <TableCell>
                {new Date(refund.requestDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {refund.ticket?.ticketNumber || "Unknown"}
              </TableCell>
              <TableCell>{refund.amount}</TableCell>
              <TableCell>
                <RefundStatusBadge status={refund.status} />
              </TableCell>
              <TableCell>
                {refund.processedDate
                  ? new Date(refund.processedDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/refunds/${refund.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {refund.status === RefundStatus.PENDING && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(refund.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}