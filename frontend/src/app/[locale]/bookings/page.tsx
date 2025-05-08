"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TicketAPI,
  BookingAPI,
  FlightAPI,
  AirportAPI,
  AirLineAPI,
} from "@/lib/api-client";
import { Booking, Ticket, Flight, Airport, Airline } from "@/src/app/[locale]/types";

// Import shadcn components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { Badge } from "@/src/app/components/ui/badge";
import { Button } from "@/src/app/components/ui/button";
import { Separator } from "@/src/app/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import {
  Loader2,
  ArrowRight,
  Calendar,
  Clock,
  Plane,
  User,
} from "lucide-react";
// Import TicketIcon separately to avoid name collision with the Ticket type
import { Ticket as TicketIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
const renderRefundButton = (ticket: Ticket) => {
  const t = useTranslations()
  // Only show refund button for eligible tickets
  if (ticket.status === "ISSUED" || ticket.status === "CANCELLED") {
    return (
      <Link href={`/bookings/${ticket.bookingId}/refund?ticketId=${ticket.id}`}>
        <Button variant="outline" className="ml-2">
          {t('myTickets.requestRefund')}
        </Button>
      </Link>
    );
  }
  return null;
};
export default function MyTickets() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<{ [key: string]: Ticket[] }>({});
  const [airports, setAirports] = useState<{ [key: string]: Airport }>({});
  const [airlines, setAirlines] = useState<{ [key: string]: Airline }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchBookingsAndRelatedData() {
      try {
        setLoading(true);
        // Fetch all bookings
        const fetchedBookings = await BookingAPI.getMyBookings();
        setBookings(fetchedBookings);

        // Collect unique IDs for airports and airlines
        const airportIds = new Set<string>();
        const airlineIds = new Set<string>();

        fetchedBookings.forEach((booking) => {
          if (booking.flight) {
            if (booking.flight.departureAirportId)
              airportIds.add(booking.flight.departureAirportId);
            if (booking.flight.arrivalAirportId)
              airportIds.add(booking.flight.arrivalAirportId);
            if (booking.flight.airlineId)
              airlineIds.add(booking.flight.airlineId);
          }
        });

        // Fetch tickets for each booking
        const ticketsData: { [key: string]: Ticket[] } = {};
        for (const booking of fetchedBookings) {
          const bookingTickets = await TicketAPI.getTicketByBookingId(
            booking.id
          );
          ticketsData[booking.id] = bookingTickets;
        }
        setTickets(ticketsData);

        // Fetch airport data
        const airportsData: { [key: string]: Airport } = {};
        for (const airportId of Array.from(airportIds)) {
          try {
            // Using fetch directly since there's no dedicated airport-by-id API function
            const response = await AirportAPI.searchAirportById(airportId);

            airportsData[airportId] = response;
          } catch (err) {
            console.error(`Error fetching airport ${airportId}:`, err);
          }
        }
        setAirports(airportsData);

        // Fetch airline data
        const airlinesData: { [key: string]: Airline } = {};
        for (const airlineId of Array.from(airlineIds)) {
          try {
            const airlineData = await AirLineAPI.getById(airlineId);
            airlinesData[airlineId] = airlineData;
          } catch (err) {
            console.error(`Error fetching airline ${airlineId}:`, err);
          }
        }
        setAirlines(airlinesData);

        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load your tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookingsAndRelatedData();
  }, []);

  // Helper function to get auth header
  function getAuthHeader() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
  }
  const t = useTranslations()
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-amber-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const formatDateTime = (dateTime: Date) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const viewBookingDetails = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">{ t('myTickets.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
         {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{t('myTickets.title')}</h1>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-64">
            <TicketIcon className="h-16 w-16 text-slate-400 mb-4" />
            <p className="text-xl text-center">
            {t('myTickets.noTickets')}
            </p>
            <Button className="mt-6" onClick={() => router.push("/flights")}>
              {t('myTickets.bookFlight')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="Cancelled">{t('status.cancelled')}</TabsTrigger>
            <TabsTrigger value="Confirmed">{t('status.confirmed')}</TabsTrigger>
            <TabsTrigger value="all"> {t('myTickets.all')}</TabsTrigger>
          </TabsList>

          <TabsContent value="Cancelled">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings
                .filter((booking) => booking.status === "CANCELLED")
                .map((booking) => (
                  <TicketCard
                    key={booking.id}
                    booking={booking}
                    tickets={tickets[booking.id] || []}
                    airports={airports}
                    airlines={airlines}
                    onViewDetails={() => viewBookingDetails(booking.id)}
                  />
                ))}
              {bookings.filter(
                (booking) => new Date(booking.flight.departureTime) > new Date()
              ).length === 0 && (
                <p className="col-span-2 text-center text-slate-500 py-6">
                  {t('myTickets.noUpcoming')}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="Confirmed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings
                .filter((booking) => booking.status === "CONFIRMED")
                .map((booking) => (
                  <TicketCard
                    key={booking.id}
                    booking={booking}
                    tickets={tickets[booking.id] || []}
                    airports={airports}
                    airlines={airlines}
                    onViewDetails={() => viewBookingDetails(booking.id)}
                  />
                ))}
              {bookings.filter(
                (booking) =>
                  new Date(booking.flight.departureTime) <= new Date()
              ).length === 0 && (
                <p className="col-span-2 text-center text-slate-500 py-6">
                {t('myTickets.noPast')}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <TicketCard
                  key={booking.id}
                  booking={booking}
                  tickets={tickets[booking.id] || []}
                  airports={airports}
                  airlines={airlines}
                  onViewDetails={() => viewBookingDetails(booking.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function TicketCard({
  booking,
  tickets,
  airports,
  airlines,
  onViewDetails,
}: {
  booking: Booking;
  tickets: Ticket[];
  airports: { [key: string]: Airport };
  airlines: { [key: string]: Airline };
  onViewDetails: () => void;
}) {
  const flight = booking.flight;
  const isPast = new Date(flight.departureTime) < new Date();

  // Get related objects using their IDs
  const departureAirport = airports[flight.departureAirportId];
  const arrivalAirport = airports[flight.arrivalAirportId];
  const airline = airlines[flight.airlineId];
  const t = useTranslations()
  return (
    <Card
      className={`transition-all hover:shadow-md ${
        isPast ? "bg-slate-800" : "bg-white"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>{airline?.name || flight.airlineId}</span>
              <Badge className={`${getStatusColor(booking.status)} text-white`}>
                {booking.status}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {t('myTickets.ref')}: {booking.bookingReference} • {flight.flightNumber}
            </CardDescription>
          </div>
          {airline?.logoUrl && (
            <div className="w-12 h-12">
              <img
                src={airline.logoUrl}
                alt={`${airline.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="my-4 flex justify-between items-center">
          <div className="text-left">
            <p className="text-2xl font-bold">
              {departureAirport?.code || "N/A"}
            </p>
            <p className="text-sm text-slate-500">
              {departureAirport?.city || t('common.unknown')}
            </p>
          </div>

          <div className="flex-1 px-4">
            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full" />
              <div className="z-10 px-2">
                <Plane className="h-5 w-5 text-primary rotate-90" />
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">
              {arrivalAirport?.code || "N/A"}
            </p>
            <p className="text-sm text-slate-500">
              {arrivalAirport?.city || "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-6 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>
              {new Date(flight.departureTime).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>
              {new Date(flight.departureTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}{" "}
              -
              {new Date(flight.arrivalTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm">
         { t('myTickets.passenger', { count: tickets.length })}{tickets.length !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <p className="font-semibold">
          {t('myTickets.total')}: ${parseFloat(booking.totalAmount).toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-green-500";
    case "pending":
      return "bg-amber-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
}
