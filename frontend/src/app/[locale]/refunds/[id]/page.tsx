"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefundAPI } from "@/lib/api-client";
import { Refund, RefundStatus } from "@/src/app/[locale]/types";
import { Button } from "@/src/app/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import RefundDetailsCard from "@/src/app/components/refundDetailsCard";

export default function RefundDetailsPage({ params }: { params: { id: string } }) {
  const [refund, setRefund] = useState<Refund | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  useEffect(() => {
    const fetchRefund = async () => {
      try {
        setLoading(true);
        const data = await RefundAPI.getRefundById(params.id);
        setRefund(data);
      } catch (error) {
        console.error("Failed to fetch refund details:", error);
        toast("Error",{
        
          description: "Failed to load refund details. The refund may not exist or you may not have permission to view it.",
      
        });
        router.push("/refunds");
      } finally {
        setLoading(false);
      }
    };

    fetchRefund();
  }, [params.id, router, toast]);

  const handleCancelRefund = async () => {
    if (!refund) return;

    try {
      await RefundAPI.deleteRefund(refund.id);
      toast( "Success",{
     
        description: "Refund request canceled successfully.",
      });
      router.push("/refunds");
    } catch (error) {
      console.error("Failed to cancel refund:", error);
      toast("Error",{
      
        description: "Failed to cancel refund request. Only pending refunds can be canceled.",
       
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!refund) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Link href="/refunds">
        <Button variant="ghost" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Refunds
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-6">Refund Details</h1>

      <RefundDetailsCard refund={refund} />

      {refund.status === RefundStatus.PENDING && (
        <div className="mt-6 flex justify-end">
          <Button variant="destructive" onClick={handleCancelRefund}>
            Cancel Refund Request
          </Button>
        </div>
      )}
    </div>
  );
}