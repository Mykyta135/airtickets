import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/app/components/ui/form";
import { Input } from "@/src/app/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/src/app/components/ui/radio-group";
import { useTranslations } from "next-intl";

// Form schema matching our DTO
const paymentSchema = z.object({
  paymentMethod: z.enum(["CREDIT_CARD", "PAYPAL", "BANK_TRANSFER"], {
    required_error: "Please select a payment method",
  }),
  cardDetails: z.object({
    number: z.string().min(16, "Card number must be 16 digits").max(19),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry must be in format MM/YY"),
    cvv: z.string().min(3, "CVV must be 3 or 4 digits").max(4),
  }).optional(),
});

interface PaymentStepProps {
  totalAmount: string;
  onSubmit: (data: z.infer<typeof paymentSchema>) => void;
  loading: boolean;
}

export default function PaymentStep({ 
  totalAmount, 
  onSubmit, 
  loading 
}: PaymentStepProps) {
  const [showCardFields, setShowCardFields] = useState(false);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "CREDIT_CARD",
      cardDetails: {
        number: "",
        expiry: "",
        cvv: "",
      },
    },
  });

  const handlePaymentMethodChange = (value: string) => {
    setShowCardFields(value === "CREDIT_CARD");
  };

  const handleSubmit = (data: z.infer<typeof paymentSchema>) => {
    onSubmit(data);
  };
const t = useTranslations()
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("PaymentStep.title")}</h2>
        <p className="text-muted-foreground">
          {t("PaymentStep.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("PaymentStep.amountDue")}</CardTitle>
          <CardDescription>{t("PaymentStep.cardNumber")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <span className="text-3xl font-bold">${totalAmount}</span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t("PaymentStep.paymentMethod")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          handlePaymentMethodChange(value);
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                       
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="PAYPAL" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            PayPal
                          </FormLabel>
                        </FormItem>
                       
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

          
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardDetails.number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("PaymentStepform.errors.cardNumber")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="4111 1111 1111 1111"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cardDetails.expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("PaymentStep.expiryDate")}</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cardDetails.cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              

              <FormDescription className="text-sm text-muted-foreground">
               {t("PaymentStep.secureDescription")}
              </FormDescription>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                   
                    {t("PaymentStep.processing")}
                  </>
                ) : (
                  t("PaymentStep.payNow")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}