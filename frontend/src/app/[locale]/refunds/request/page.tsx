"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingAPI, TicketAPI } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/src/app/components/ui/alert";
import { Button } from "@/src/app/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Booking, Ticket } from "@/src/app/[locale]/types";
import RefundRequestForm from "@/src/app/components/refundRequest";

export default function RequestRefundPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data: Booking[] = await BookingAPI.getMyBookings();
        // Filter to only show completed bookings with eligible tickets
        const eligibleBookings = data.filter(
          (booking) => booking.status === "COMPLETED" 
        );
        setBookings(eligibleBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!selectedBookingId) {
        setTickets([]);
        return;
      }

      try {
        setLoading(true);
        console.log('selectedBookingId: ' + selectedBookingId)
        const data = await TicketAPI.getTicketByBookingId(selectedBookingId);
        // Filter to only show refundable tickets (not already refunded)
        const refundableTickets = data.filter((ticket) => ticket.status !== "REFUNDED");
        setTickets(refundableTickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [selectedBookingId]);

  const handleSuccess = () => {
    router.push("/refunds");
  };

  return (
    <div className="container mx-auto py-8">
      <Link href="/refunds">
        <Button variant="ghost" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Refunds
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Request a Refund</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 && !loading ? (
            <Alert>
              <AlertTitle>No eligible bookings</AlertTitle>
              <AlertDescription>
                You don't have any completed bookings that are eligible for refunds.
              </AlertDescription>
            </Alert>
          ) : (
            <RefundRequestForm
              bookings={bookings}
            
              onBookingSelect={setSelectedBookingId}
              onSuccess={handleSuccess}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}