import { useEffect, useState } from "react";
import { FlightAPI, RefundAPI, TicketAPI } from "@/lib/api-client";
import { Booking, Flight, Ticket } from "@/src/app/[locale]/types";

import { Input } from "@/src/app/components/ui/input";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/app/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/app/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  bookingId: z.string().min(1, { message: "Please select a booking" }),
  ticketId: z.string().min(1, { message: "Please select a ticket" }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be greater than zero" }),
  reason: z.string().min(5, {
    message: "Please provide a reason with at least 5 characters",
  }),
});

type RefundFormValues = z.infer<typeof formSchema>;

interface RefundRequestFormProps {
  bookings: Booking[];
  onBookingSelect: (bookingId: string) => void;
  onSuccess: () => void;
  loading: boolean;
}

export default function RefundRequestForm({
  bookings,
  onBookingSelect,
  onSuccess,
  loading,
}: RefundRequestFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [flight, setFlight] = useState<Flight | null>(null);

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingId: "",
      ticketId: "",
      amount: 0,
      reason: "",
    },
  });

  const watchBookingId = form.watch("bookingId");
  const watchTicketId = form.watch("ticketId");
  useEffect(() => {
    const fetchTicketsAndFlight = async () => {
      if (!watchBookingId) {
        setTickets([]);
        setFlight(null);
        return;
      }

      const booking = bookings.find((b) => b.id === watchBookingId);
      if (!booking) return;

      try {
        const [fetchedTickets, fetchedFlight] = await Promise.all([
          TicketAPI.getTicketByBookingId(booking.id),
          FlightAPI.searchFlightsById(booking.flightId),
        ]);

        setTickets(fetchedTickets);
        setFlight(fetchedFlight);
      } catch (error) {
        console.error("Error fetching tickets or flight:", error);
        setTickets([]);
        setFlight(null);
      }
    };

    fetchTicketsAndFlight();
    onBookingSelect(watchBookingId); // callback to notify parent
    form.setValue("ticketId", "");
  }, [watchBookingId]);

  const handleTicketChange = (ticketId: string) => {
    if (!ticketId) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket && flight) {
      const seat = flight.flightSeats.find((s) => s.id === ticket.flightSeatId);
      if (seat) {
        const refundAmount = parseFloat(seat.price) * 0.7;
        form.setValue("amount", refundAmount);
      }
    }
  };

  const onSubmit = async (values: RefundFormValues) => {
    try {
      setSubmitting(true);
      await RefundAPI.requestRefund(
        values.ticketId,
        values.amount,
        values.reason
      );
      toast("Success", {
        description: "Refund request submitted successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to submit refund request:", error);
      toast("Error", {
        description: "Failed to submit refund request. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    console.log("Selected booking ID:", watchBookingId);
  }, [watchBookingId]);

  useEffect(() => {
    console.log("Selected ticket ID:", form.watch("ticketId"));
  }, [form.watch("ticketId")]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bookingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Booking</FormLabel>
              <Select
                disabled={loading || submitting}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a booking" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.bookingReference} -{" "}
                      {new Date(booking.bookingDate).toLocaleDateString()} -{" "}
                      {booking.flight.departureAirportId} to{" "}
                      {booking.flight.arrivalAirportId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the booking containing the ticket you want to refund
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ticketId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Ticket</FormLabel>
              <Select
                disabled={!watchBookingId || loading || submitting}
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTicketChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ticket" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tickets.map((ticket) => {
                    return (
                      <SelectItem key={ticket.ticketId} value={ticket.ticketId}>
                        Seat {ticket.seat.number || "—"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
                ``
              </Select>
              <FormDescription>
                Select the ticket you want to refund
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Refund Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  disabled={!watchTicketId || submitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The refundable amount (up to 70% of the original ticket price)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Refund</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please explain why you are requesting a refund"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about why you're requesting a refund
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={submitting || loading}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
            </>
          ) : (
            "Submit Refund Request"
          )}
        </Button>
      </form>
    </Form>
  );
}
