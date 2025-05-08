// app/info/baggage/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/app/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/app/components/ui/table";
import { Separator } from "@/src/app/components/ui/separator";
import { Luggage, AlertCircle, Info, PlaneTakeoff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/src/app/components/ui/alert";
import { useTranslations } from "next-intl";

export default function BaggagePage() {
  const [activeTab, setActiveTab] = useState("allowance");
const t = useTranslations()
  return (
    <div className="container py-8 max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-2">{t("baggage.title")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("baggage.subtitle")}
      </p>

      <Tabs defaultValue="allowance" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="allowance">{t("baggage.tabs.allowance")}</TabsTrigger>
          <TabsTrigger value="special">{t("baggage.tabs.special")}</TabsTrigger>
          <TabsTrigger value="restrictions">{t("baggage.tabs.restrictions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="allowance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Luggage className="h-5 w-5" /> {t("baggage.allowance.title")}
              </CardTitle>
              <CardDescription>
             {t("baggage.allowance.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("baggage.allowance.table.class")}</TableHead>
                    <TableHead>{t("baggage.allowance.table.carry_on")}</TableHead>
                    <TableHead>{t("baggage.allowance.table.checked")}</TableHead>
                    <TableHead>{t("baggage.allowance.table.weight")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.table.economy")}</TableCell>
                    <TableCell>1 bag + personal item</TableCell>
                    <TableCell>1 bag</TableCell>
                    <TableCell>23kg (50lbs)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.table.premium")}</TableCell>
                    <TableCell>1 bag + personal item</TableCell>
                    <TableCell>2 bags</TableCell>
                    <TableCell>23kg (50lbs)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.table.business")}</TableCell>
                    <TableCell>2 bags + personal item</TableCell>
                    <TableCell>2 bags</TableCell>
                    <TableCell>32kg (70lbs)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.table.first")}</TableCell>
                    <TableCell>2 bags + personal item</TableCell>
                    <TableCell>3 bags</TableCell>
                    <TableCell>32kg (70lbs)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("baggage.allowance.important.title")}</AlertTitle>
                <AlertDescription>
                {t("baggage.allowance.important.description")} </AlertDescription>
              </Alert>

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">{t("baggage.allowance.fees.title")}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("baggage.allowance.fees.extra_bag")}</TableHead>
                    <TableHead>{t("baggage.allowance.fees.short")}</TableHead>
                    <TableHead>{t("baggage.allowance.fees.medium")}</TableHead>
                    <TableHead>{t("baggage.allowance.fees.long")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.fees.first")}</TableCell>
                    <TableCell>$30</TableCell>
                    <TableCell>$50</TableCell>
                    <TableCell>$75</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.fees.second")}</TableCell>
                    <TableCell>$50</TableCell>
                    <TableCell>$75</TableCell>
                    <TableCell>$100</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.fees.each")}</TableCell>
                    <TableCell>$100</TableCell>
                    <TableCell>$150</TableCell>
                    <TableCell>$200</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t("baggage.allowance.fees.overweight")} (23-32kg)</TableCell>
                    <TableCell>$50</TableCell>
                    <TableCell>$75</TableCell>
                    <TableCell>$100</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" /> {t("baggage.special.title")}
              </CardTitle>
              <CardDescription>
               {t("baggage.special.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{t("baggage.special.accordion.sports.title")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>{t("baggage.special.accordion.sports.text")}:</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("baggage.special.accordion.sports.table.item")}</TableHead>
                            <TableHead>{t("baggage.special.accordion.sports.table.fee")}</TableHead>
                            <TableHead>{t("baggage.special.accordion.sports.table.notes")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{t("baggage.special.accordion.sports.table.golf")}</TableCell>
                            <TableCell>$30</TableCell>
                          <TableCell>{t("baggage.special.accordion.sports.table.golf_notes")}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{t("baggage.special.accordion.sports.table.ski")}</TableCell>
                            <TableCell>$30</TableCell>
                            <TableCell>{t("baggage.special.accordion.sports.table.ski_notes")}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{t("baggage.special.accordion.sports.table.bike")}</TableCell>
                            <TableCell>$50</TableCell>
                            <TableCell>{t("baggage.special.accordion.sports.table.bike_notes")}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>{t("baggage.special.accordion.sports.table.surf")}</TableCell>
                            <TableCell>$50</TableCell>
                            <TableCell>{t("baggage.special.accordion.sports.table.surf_notes")}bag</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>{t("baggage.special.accordion.instruments.title")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>{t("baggage.special.accordion.instruments.text")}</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>{t("baggage.special.accordion.instruments.small")}</li>
                        <li>{t("baggage.special.accordion.instruments.medium")}</li>
                        <li>{t("baggage.special.accordion.instruments.large")}</li>
                      </ul>
                      <p>{t("baggage.special.accordion.instruments.note")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>{t("baggage.special.accordion.medical.title")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>{t("baggage.special.accordion.medical.text")}</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>{t("baggage.special.accordion.medical.list.mobility")}</li>
                        <li>{t("baggage.special.accordion.medical.list.cpap")}</li>
                        <li>{t("baggage.special.accordion.medical.list.oxygen")}</li>
                      </ul>
                      <p className="font-medium">{t("baggage.special.accordion.medical.notice")
                      }</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>{t("baggage.special.accordion.title")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>{t("baggage.special.accordion.text1")}</p>
                      <p>{t("baggage.special.accordion.text2")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> {t("baggage.restrictions.title")}
              </CardTitle>
              <CardDescription>
                {t("baggage.restrictions.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("baggage.restrictions.notice.title")}</AlertTitle>
                <AlertDescription>
                  {t("baggage.restrictions.notice.description")}
                </AlertDescription>
              </Alert>

              <h3 className="text-lg font-semibold mb-3">{t("baggage.restrictions.prohibited.title")}</h3>
              <p className="mb-4">{t("baggage.restrictions.prohibited.text")}</p>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>{t("baggage.restrictions.prohibited.list.0")}</li>
                <li>{t("baggage.restrictions.prohibited.list.1")}</li>
                <li>{t("baggage.restrictions.prohibited.list.2")}</li>
                <li>{t("baggage.restrictions.prohibited.list.3")}</li>
                <li>{t("baggage.restrictions.prohibited.list.4")}</li>
                <li>{t("baggage.restrictions.prohibited.list.5")
                }</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("baggage.restrictions.carry_on.title")}</h3>
              <p className="mb-4">{t("baggage.restrictions.carry_on.text")}</p>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>{t("baggage.restrictions.carry_on.list.0")}</li>
                <li>{t("baggage.restrictions.carry_on.list.1")}</li>
                <li>{t("baggage.restrictions.carry_on.list.2")}</li>
                <li>{t("baggage.restrictions.carry_on.list.3")}</li>
                <li>{t("baggage.restrictions.carry_on.list.4")
                }</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">{t("baggage.restrictions.liquids.title")}</h3>
              <p className="mb-4">{t("baggage.restrictions.liquids.text")}</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t("baggage.restrictions.liquids.list.0")}</li>
                <li>{t("baggage.restrictions.liquids.list.1")}</li>
                <li>{t("baggage.restrictions.liquids.list.2")}</li>
              </ul>
              
              <p className="mt-4">
                {t("baggage.restrictions.liquids.exceptions")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
