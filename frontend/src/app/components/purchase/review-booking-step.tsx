
import { Flight, FlightSeat } from "@/src/app/[locale]/types";
import { Button } from "@/src/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { Label } from "@/src/app/components/ui/label";
import { Separator } from "@/src/app/components/ui/separator";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ReviewBookingStepProps {
  flight: Flight;
  selectedSeats: FlightSeat[];
  passengers: any[];
  onConfirm: () => void;
  loading: boolean;
}

export default function ReviewBookingStep({
  flight,
  selectedSeats,
  passengers,
  onConfirm,
  loading
}: ReviewBookingStepProps) {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const totalAmount = selectedSeats.reduce(
    (sum, seat) => sum + parseFloat(seat.price),
    0
  ).toFixed(2);

  // Calculate flight duration
  const getDuration = () => {
    const departure = new Date(flight.departureTime);
    const arrival = new Date(flight.arrivalTime);
    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleConfirm = () => {
    if (agreeToTerms) {
      onConfirm();
    }
  };
const t = useTranslations('ReviewBookingStep')
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("reviewBooking")}</h2>
        <p className="text-muted-foreground">
         {t("reviewFlightDetails")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("flightDetails")}</CardTitle>
          <CardDescription>
            {flight.airline.name} • {flight.flightNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <p className="text-2xl font-bold">{flight.departureAirport.code}</p>
              <p className="text-muted-foreground">
                {flight.departureAirport.city}, {flight.departureAirport.country}
              </p>
              <p className="text-sm mt-1">
                {format(new Date(flight.departureTime), "EEE, MMM d • h:mm a")}
              </p>
            </div>

            <div className="flex flex-col items-center my-4 md:my-0">
              <p className="text-sm text-muted-foreground">{getDuration()}</p>
              <div className="relative w-24 md:w-40">
                <Separator className="my-2" />
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-primary"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <p className="text-sm text-muted-foreground">{t("directFlight")}</p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold">{flight.arrivalAirport.code}</p>
              <p className="text-muted-foreground">
                {flight.arrivalAirport.city}, {flight.arrivalAirport.country}
              </p>
              <p className="text-sm mt-1">
                {format(new Date(flight.arrivalTime), "EEE, MMM d • h:mm a")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("passengerInformation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {passengers.map((passenger, index) => {
              const seat = selectedSeats.find(s => s.id === passenger.seatId);
              
              return (
                <div key={index} className="flex flex-col md:flex-row justify-between pb-4 border-b last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{passenger.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Passport: {passenger.passportNumber}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 text-right">
                    <p className="font-medium">Seat {seat?.seatNumber}</p>
                    <p className="text-sm text-muted-foreground">{seat?.seatClass} Class</p>
                    <p className="text-sm font-semibold">${seat?.price}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("paymentSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {selectedSeats.map((seat, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  Seat {seat.seatNumber} ({seat.seatClass})
                </span>
                <span>${seat.price}</span>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${totalAmount}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms} 
              onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
            />
            <Label htmlFor="terms">
              {t("termsAndConditions")}
            </Label>
          </div>
          <Button 
            onClick={handleConfirm} 
            disabled={!agreeToTerms || loading} 
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                
                {t("processingBooking")}
              </>
            ) : (
              t("confirmBooking")
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}