import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/app/components/ui/form";
import { Input } from "@/src/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";

import { FlightSeat } from "@/src/app/[locale]/types";
import { useTranslations } from "next-intl";

// Define form schema based on controller expectations
const passengerSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  passportNumber: z.string().min(5, { message: "Valid passport number is required" }),
  dateOfBirth: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Valid date is required"
  }),
  nationality: z.string().min(2, { message: "Nationality is required" }),
  seatId: z.string().optional()
});

// Create array schema for multiple passengers
const passengersSchema = z.array(passengerSchema).min(1);

interface PassengerFormProps {
  selectedSeats: FlightSeat[];
  onSubmit: (passengers: any[]) => void;
  loading: boolean;
}

export default function PassengersStep({ selectedSeats, onSubmit, loading }: PassengerFormProps) {
  const [passengers, setPassengers] = useState<any[]>(
    Array(selectedSeats.length).fill({}).map(() => ({}))
  );

  // Initialize forms for each passenger
  const forms = selectedSeats.map((_, index) => {
    return useForm<z.infer<typeof passengerSchema>>({
      resolver: zodResolver(passengerSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        passportNumber: "",
        dateOfBirth: "",
        nationality: "",
        seatId: selectedSeats[index]?.id
      }
    });
  });

  const handleSubmit = () => {
    // Collect and validate all form data
    let isValid = true;
    const passengerData: any[] = [];

    forms.forEach((form, index) => {
      const result = form.trigger();
      if (!result) {
        isValid = false;
      } else {
        passengerData.push(form.getValues());
      }
    });

    if (isValid) {
      onSubmit(passengerData);
    }
  };
  const t  = useTranslations();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">{t("PassengersStep.title")}</h2>
        <p className="text-muted-foreground">
         {t("PassengersStep.subtitle")}
        </p>
      </div>

      {selectedSeats.map((seat, index) => (
        <Card key={index} className="mb-6">
          <CardHeader>
            <CardTitle>{t("PassengersStep.passenger")} {index + 1}</CardTitle>
            <CardDescription>
              {t("PassengersStep.seat")} {seat.seatNumber} • {seat.seatClass} {t("PassengersStep.class")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...forms[index]}>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={forms[index].control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PassengersStep.firstName")}</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forms[index].control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PassengersStep.lastName")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forms[index].control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PassengersStep.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forms[index].control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PassengersStep.passportNumber")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Passport number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forms[index].control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PassengersStep.dateOfBirth")}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forms[index].control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PassengersStep.nationality")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Country of citizenship" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forms[index].control}
                  name="seatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("PassengersStep.seatAssignment")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={seat.id}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("PassengersStep.selectSeat")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedSeats.map((seatOption) => (
                            <SelectItem key={seatOption.id} value={seatOption.id}>
                              {seatOption.seatNumber} ({seatOption.seatClass})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
             
             {t("PassengersStep.processing")}
            </>
          ) : (
            t("PassengersStep.continue")
          )}
        </Button>
      </div>
    </div>
  );
}