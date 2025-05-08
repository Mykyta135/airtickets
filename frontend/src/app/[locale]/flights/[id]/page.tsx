// app/purchase/[flightId]/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/app/components/ui/tabs";
import { Separator } from "@/src/app/components/ui/separator";
import { toast } from "sonner";

import {
  Booking,
  Flight,
  FlightSeat,
  Passenger,
} from "@/src/app/[locale]/types";
import SelectSeatsStep from "@/src/app/components/purchase/select-seat-step";
import PassengersStep from "@/src/app/components/purchase/passangers-step";
import ReviewBookingStep from "@/src/app/components/purchase/review-booking-step";
import PaymentStep from "@/src/app/components/purchase/payment-step";
import ConfirmationStep from "@/src/app/components/purchase/confirmation-step";
import { FlightAPI, PurchaseAPI } from "@/lib/api-client";
import { Button } from "@/src/app/components/ui/button";
import { useTranslations } from "next-intl";

// Steps in the purchase process
const STEPS = ["seats", "passengers", "review", "payment", "confirmation"];

export default function PurchasePage() {
  const t = useTranslations();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  console.log(id);
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [availableSeats, setAvailableSeats] = useState<FlightSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<FlightSeat[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passengers, setPassengers] = useState<any[]>([]);

  // Fetch flight details and available seats
  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);
        // Fetch flight details
        const flightData = await FlightAPI.searchFlightsById(id);

        // Fetch available seats
        const seatsData = await PurchaseAPI.getAvailableSeats(id);

        setFlight(flightData);
        setAvailableSeats(seatsData);
      } catch (error) {
        console.error("Error fetching flight data:", error);
        toast("Error", {
          description: t("errors.loadFlight"),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
  }, [id, toast]);

  // Handle seat selection
  const handleSeatSelection = (seat: FlightSeat) => {
    setSelectedSeats((prev) => {
      // If already selected, remove it
      if (prev.some((s) => s.id === seat.id)) {
        return prev.filter((s) => s.id !== seat.id);
      }
      // Otherwise add it (up to max 9 seats)
      if (prev.length < 9) {
        return [...prev, seat];
      }
      return prev;
    });
  };

  // Reserve seats and create initial booking
  const handleReservation = async () => {
    if (selectedSeats.length === 0) {
      toast("No seats selected", {
        description: t("errors.noSeatsSelected"),
      });
      return;
    }

    try {
      setLoading(true);
      const response = await PurchaseAPI.reserveSeats(
        id,
        selectedSeats.map((seat) => seat.seatNumber) // or seat.id, depending on your model
      );
      const booking = await PurchaseAPI.getBookingById(response.bookingId);
      setBooking(booking);

      // Move to next step
      nextStep();
    } catch (error: any) {
      console.error(t("errors.reservationFailed"), error);
      toast("Reservation failed", {
        description:
          error.message || t("errors.reservationFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Update passenger information
  const handlePassengerSubmit = async (passengersData: Passenger[]) => {
    if (!booking) return;

    try {
      setLoading(true);
      await PurchaseAPI.submitPassengers(booking.id, passengersData);
      setPassengers(passengersData);

      // Move to next step
      nextStep();
    } catch (error: any) {
      console.error("Error adding passengers:", error);
      toast("Could not add passengers", {
        description: error.message || t("errors.passengerFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!booking) return;

    try {
      setLoading(true);
      const response = await PurchaseAPI.confirmBooking(booking.id);
      setBookingReference(response.bookingReference);

      // Move to next step
      nextStep();
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      toast("Confirmation failed", {
        description: error.message || t("errors.confirmationFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Process payment
  const handlePayment = async (data: {
    paymentMethod: "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER";
    cardDetails?: {
      number: string;
      expiry: string;
      cvv: string;
    };
  }): Promise<void> => {
    const { paymentMethod, cardDetails } = data;
    if (!booking) return;

    try {
      setLoading(true);
      const paymentData: any = { paymentMethod };
      if (paymentMethod === "CREDIT_CARD" && cardDetails) {
        paymentData.cardDetails = cardDetails;
      }
      console.log(booking.id, paymentData);
      await PurchaseAPI.pay(booking.id, paymentData);

      // Move to confirmation step
      nextStep();
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast("Payment failed", {
        description: error.message || t("errors.paymentFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigation between steps
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Return to flights
  const handleBackToFlights = () => {
    router.push("/");
  };

  if (loading && flight) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading flight details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackToFlights}>
          {t("purchase.backToFlights")}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
          {t("purchase.title")}: {flight?.flightNumber}
          </CardTitle>
          <div className="text-muted-foreground">
            {flight && (
             t("purchase.dateRange", {
              departure: new Date(flight.departureTime).toLocaleString(),
              arrival: new Date(flight.arrivalTime).toLocaleString(),
            }) 
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Stepper */}
          <div className="mb-8">
            <Tabs value={STEPS[currentStep]} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger
                  value="seats"
                  disabled={currentStep !== 0}
                  className={
                    currentStep >= 0
                      ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      : ""
                  }
                >
                  1. {t("stepper.seats") }
                </TabsTrigger>
                <TabsTrigger
                  value="passengers"
                  disabled={currentStep !== 1}
                  className={
                    currentStep >= 1
                      ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      : ""
                  }
                >
                  2. {t("stepper.passengers")}
                </TabsTrigger>
                <TabsTrigger
                  value="review"
                  disabled={currentStep !== 2}
                  className={
                    currentStep >= 2
                      ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      : ""
                  }
                >
                  3. {t("stepper.review")}
                </TabsTrigger>
                <TabsTrigger
                  value="payment"
                  disabled={currentStep !== 3}
                  className={
                    currentStep >= 3
                      ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      : ""
                  }
                >
                  4. {t("stepper.payment")}
                </TabsTrigger>
                <TabsTrigger
                  value="confirmation"
                  disabled={currentStep !== 4}
                  className={
                    currentStep >= 4
                      ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      : ""
                  }
                >
                  5. {t("stepper.confirmation")}
                </TabsTrigger>
              </TabsList>

              {/* Step Content */}
              <TabsContent value="seats" className="mt-6">
                <SelectSeatsStep
                  availableSeats={availableSeats}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelection}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="passengers" className="mt-6">
                <PassengersStep
                  selectedSeats={selectedSeats}
                  onSubmit={handlePassengerSubmit}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="review" className="mt-6">
                {flight && (
                  <ReviewBookingStep
                    flight={flight}
                    selectedSeats={selectedSeats}
                    passengers={passengers}
                    onConfirm={handleConfirmBooking}
                    loading={loading}
                  />
                )}
              </TabsContent>

              <TabsContent value="payment" className="mt-6">
                <PaymentStep
                  totalAmount={selectedSeats
                    .reduce((sum, seat) => sum + parseFloat(seat.price), 0)
                    .toFixed(2)}
                  onSubmit={handlePayment}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="confirmation" className="mt-6">
                {bookingReference && (
                  <ConfirmationStep
                    bookingReference={bookingReference}
                    passengers={passengers}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          {currentStep > 0 && currentStep < 4 && (
            <Button variant="outline" onClick={prevStep} disabled={loading}>
              {t("buttons.back")}
            </Button>
          )}

          {currentStep === 0 && (
            <Button
              onClick={handleReservation}
              disabled={selectedSeats.length === 0 || loading}
              className="ml-auto"
            >
              {loading ? t("buttons.reserving") : t("buttons.continuePassengers")}
            </Button>
          )}

          {currentStep === 4 && (
            <Button
              onClick={() => router.push("/bookings")}
              className="ml-auto"
            >
              {t("buttons.viewTickets")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
