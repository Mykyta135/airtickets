// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import FlightSearch from "@/src/app/components/flight-search";
import { useTranslations } from "next-intl";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Home')

  return (
    <div className="relative">
      {/* Hero section with background image */}
      <div className="relative -z-1 h-[500px] bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            {t("title")}
          </h1>
          <p className="mb-8 max-w-2xl text-lg">
            {t("description")}
          </p>
        </div>
      </div>
   

      {/* Search box overlapping the hero section */}
      <div className="container mx-auto px-4">
        <Card className="mx-auto -mt-32 max-w-4xl shadow-lg">
          <CardContent className="p-6">
           
            <FlightSearch></FlightSearch>
              
           
          </CardContent>
        </Card>
      </div>

    </div>
  );
}