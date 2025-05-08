import { Button } from "@/src/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface ConfirmationStepProps {
  bookingReference: string;
  passengers: any[];
}

export default function ConfirmationStep({
  bookingReference,
  passengers
}: ConfirmationStepProps) {
  const t = useTranslations('ConfirmationStep');
  return (
    <div className="space-y-6">
      <div className="text-center pt-4 pb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
         {t('subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cardTitle')}</CardTitle>
          <CardDescription>{t('cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">{t('bookingReferenceLabel')}</div>
            <div className="text-2xl font-mono font-bold tracking-wider">{bookingReference}</div>
            <div className="text-sm text-muted-foreground mt-2">
            {t('bookingReferenceNote')}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">{t('passengerInfoTitle')}</h3>
            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div key={index} className="flex justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{passenger.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{t('eticketIssued')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button asChild className="flex-1">
              <Link href="/bookings">{t('viewTickets')}</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">{t('returnHome')}</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>
        {t('supportMessage')} <a href="mailto:support@skyways.com">support@skyways.com</a>
        </p>
      </div>
    </div>
  );
}