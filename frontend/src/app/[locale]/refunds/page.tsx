"use client";

import { useEffect, useState } from "react";
import { RefundStatus } from "@/src/app/[locale]/types";
import { RefundAPI } from "@/lib/api-client";

import { Button } from "@/src/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import RefundList from "@/src/app/components/refundList";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status?: string; ticketId?: string }>({});
  

  useEffect(() => {
    fetchRefunds();
  }, [filter]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const data = await RefundAPI.getRefunds(filter);
      setRefunds(data);
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
      toast( "Error",{
       
        description: "Failed to load refunds. Please try again.",
      
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (refundId: string) => {
    try {
      await RefundAPI.deleteRefund(refundId);
      toast( "Success",{
      
        description: "Refund request canceled successfully.",
      });
      fetchRefunds();
    } catch (error) {
      console.error("Failed to delete refund:", error);
      toast( "Error",{
      
        description: "Failed to cancel refund request. Only pending refunds can be canceled.",
    
      });
    }
  };

  const handleFilterChange = (status?: RefundStatus) => {
    setFilter((prev) => ({
      ...prev,
      status: status,
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Refund Requests</h1>
        <Link href="/refunds/request">
          <Button>Request New Refund</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Refund History</CardTitle>
           
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : refunds.length > 0 ? (
            <RefundList refunds={refunds} onDelete={handleDelete} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No refund requests found. You can request a refund for an eligible ticket.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}