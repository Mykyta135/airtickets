// app/info/check-in/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Separator } from "@/src/app/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/src/app/components/ui/alert";
import {
  Clock,
  CheckCircle,
  Smartphone,
  Laptop,
  Users,
  AlertCircle,
} from "lucide-react";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/src/app/components/ui/stepper";
import { useTranslations } from "next-intl";

export default function CheckInPage() {
  const t = useTranslations("CheckIn");
  return (
    <div className="container py-8 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("description")}
      </p>

      <Tabs defaultValue="online" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="online">{t("tabs.online")}</TabsTrigger>
          <TabsTrigger value="airport">{t("tabs.airport")}</TabsTrigger>
          <TabsTrigger value="special">{t("tabs.special")}</TabsTrigger>
        </TabsList>

        <TabsContent value="online" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5" /> {t("online.title")}
              </CardTitle>
              <CardDescription>
                {t("online.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                 {t("online.whenTitle")}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p>
                    {t("online.whenText")}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">
              {t("online.processTitle")}
              </h3>
              <Stepper defaultValue={1} orientation="vertical" className="mb-8">
                {[
                  {
                    step: 1,
                    title: t("online.steps.1.title"),
                    description:t("online.steps.1.desc"),
                  },
                  {
                    step: 2,
                    title: t("online.steps.2.title"),
                    description: t("online.steps.2.desc"),
                  },
                  {
                    step: 3,
                    title: t("online.steps.3.title"),
                    description: t("online.steps.3.desc"),
                  },
                  {
                    step: 4,
                    title: t("online.steps.4.title"),
                    description: t("online.steps.4.desc"),
                  },
                  {
                    step: 5,
                    title: t("online.steps.5.title"),
                    description:
                    t("online.steps.5.desc"),
                  },
                ].map(({ step, title, description }) => (
                  <StepperItem
                    key={step}
                    step={step}
                    className="relative items-start not-last:flex-1"
                  >
                    <StepperTrigger className="items-start rounded pb-12 last:pb-0">
                      <StepperIndicator />
                      <div className="mt-0.5 space-y-0.5 px-2 text-left">
                        <StepperTitle>{title}</StepperTitle>
                        <StepperDescription className="max-sm:hidden">
                          {description}
                        </StepperDescription>
                      </div>
                    </StepperTrigger>
                    {step < 5 && (
                      <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                    )}
                  </StepperItem>
                ))}
              </Stepper>

              <h3 className="text-lg font-semibold mb-4">{t("online.optionsTitle")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Laptop className="h-4 w-4" /> {t("online.options.web.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm">
                    <p>
                      {t("online.options.web.desc")}
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>{t("online.options.web.steps.1")}</li>
                      <li>{t("online.options.web.steps.2")}</li>
                      <li>{t("online.options.web.steps.3")}</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> {t("online.options.app.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm">
                    <p>
                     {t("online.options.app.desc")}
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>{t("online.options.app.steps.1")}</li>
                      <li>{t("online.options.app.steps.2")}</li>
                      <li>{t("online.options.app.steps.3")}</li>
                      <li>{t("online.options.app.steps.4")}</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Alert className="mt-6">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>{t("online.alert.title")}</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2">
                    <li>{t("online.alert.items.1")}</li>
                    <li>{t("online.alert.items.2")}</li>
                    <li>{t("online.alert.items.3")}</li>
                    <li>
                      {t("online.alert.items.4")}
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="airport" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> {t("airport.title")}
              </CardTitle>
              <CardDescription>
               {t("airport.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                 {t("airport.whenTitle")}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <p>
                    {t("airport.when.domestic")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <p>
                      {t("airport.when.international")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">
              {t("airport.optionsTitle")}
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">{t("airport.counter.title")}</h4>
                  <p className="text-sm mb-2">
                   {t("airport.counter.desc")}
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>{t("airport.counter.steps.1")}</li>
                    <li>
                    {t("airport.counter.steps.2")}
                    </li>
                    <li>{t("airport.counter.steps.3")}</li>
                    <li>{t("airport.counter.steps.4")}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("airport.kiosk.title")}</h4>
                  <p className="text-sm mb-2">
                    {t("airport.kiosk.desc")}
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>{t("airport.kiosk.steps.1")}</li>
                    <li>{t("airport.kiosk.steps.2")}</li>
                    <li>{t("airport.kiosk.steps.3")}</li>
                    <li>{t("airport.kiosk.steps.4")}</li>
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">{t("airport.docsTitle")}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{t("airport.docs.domestic.title")}</h4>
                  <ul className="list-disc pl-5 text-sm">
                    <li>{t("airport.docs.domestic.items.1")}</li>
                    <li>{t("airport.docs.domestic.items.2")}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("airport.docs.international.title")}</h4>
                  <ul className="list-disc pl-5 text-sm">
                    <li>
                     {t("airport.docs.international.items.1")}
                    </li>
                    <li>{t("airport.docs.international.items.2")}</li>
                    <li>{t("airport.docs.international.items.3")}</li>
                    <li>{t("airport.docs.international.items.4")}</li>
                  </ul>
                </div>
              </div>

              <Alert className="mt-6" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("airport.alert.title")}</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{t("airport.alert.desc.1")}</p>
                  <ul className="list-disc pl-5">
                    <li>{t("airport.alert.desc.items.1")}</li>
                    <li>
                      {t("airport.alert.desc.items.2")}
                    </li>
                  </ul>
                  <p className="mt-2 font-medium">
                   {t("airport.alert.desc.2")}
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> {t("special.title")}
              </CardTitle>
              <CardDescription>
               {t("special.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("special.alert.title")}</AlertTitle>
                <AlertDescription>
                  {t("special.alert.desc")}
                </AlertDescription>
              </Alert>

              <h3 className="text-lg font-semibold mb-4">
               {t("special.types.title")}
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">{t("special.types.mobility.title")}</h4>
                  <p className="text-sm mb-2">
                   {t("special.types.mobility.desc")}
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>{t("special.types.mobility.items.1")}</li>
                    <li>{t("special.types.mobility.items.2")}</li>
                    <li>{t("special.types.mobility.items.3")}</li>
                    <li>{t("special.types.mobility.items.4")}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("special.types.medical.title")}</h4>
                  <p className="text-sm mb-2">
                    {t("special.types.medical.desc")}
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>{t("special.types.medical.items.1")}</li>
                    <li>{t("special.types.medical.items.2")}</li>
                    <li>{t("special.types.medical.items.3")}</li>
                    <li>{t("special.types.medical.items.4")}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("special.types.title")}</h4>
                  <p className="text-sm mb-2">{t("special.types.desc")}</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>{t("special.types.items.1")}</li>
                    <li>{t("special.types.items.2")}</li>
                    <li>{t("special.types.items.3")}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("special.types.animals.title")}</h4>
                  <p className="text-sm mb-2">
                   {t("special.types.animals.desc")}
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>
                      {t("special.types.animals.items.1")}
                    </li>
                    <li>{t("special.types.animals.items.2")}</li>
                    <li>{t("special.types.animals.items.3")}</li>
                  </ul>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">
                {t("special.processTitle")}
              </h3>
              <p className="mb-4">
               {t("special.process.desc")}
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                {t("special.process.steps.1")}
                </li>
                <li>
                 {t("special.process.steps.2")}
                </li>
                <li>
                 {t("special.process.steps.3")}
                </li>
                <li>
                 {t("special.process.steps.4")}
                </li>
                <li>
                 {t("special.process.steps.5")}
                </li>
              </ol>

              <div className="mt-6 p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">{t("special.contact.title")}</h4>
                <p className="text-sm">
                {t("special.contact.desc")}
                </p>
                <ul className="text-sm mt-2">
                  <li>
                    <strong>{t("special.contact.phone")}:</strong> +1-800-555-1234
                  </li>
                  <li>
                    <strong>{t("special.contact.email")}:</strong> special.assistance@skyjet.com
                  </li>
                  <li>
                    {t("special.contact.online")}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
