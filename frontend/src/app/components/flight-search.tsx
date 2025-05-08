import { useState, useEffect, Suspense, lazy } from "react";
import { format, intervalToDuration } from "date-fns";
import { Calendar as CalendarIcon, Search, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import { Calendar } from "@/src/app/components/ui/calendar";
import { Button } from "@/src/app/components/ui/button";
import { Label } from "@/src/app/components/ui/label";
import { Slider } from "@/src/app/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/app/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/app/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/app/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/src/app/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/app/components/ui/pagination";
import { AirLineAPI, AirportAPI, FlightAPI } from "@/lib/api-client";
import { Airline, Airport, Flight } from "@/src/app/[locale]/types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";


// Loading fallback components
const LoadingCard = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="p-8 rounded-lg bg-gray-100 flex items-center justify-center"
  >
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </motion.div>
);

const ShimmerCard = () => (
  <motion.div 
    className="overflow-hidden rounded-lg bg-gray-100"
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      <div className="md:col-span-2 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded w-full md:w-1/2 mt-4"></div>
      </div>
    </div>
  </motion.div>
);

interface FlightSearchParams {
  departureDate?: string;
  departureDateStart?: string;
  departureDateEnd?: string;
  departureAirportCode?: string;
  arrivalAirportCode?: string;
  minPrice?: number;
  maxPrice?: number;
  airlineCode?: string;
  page?: number;
  limit?: number;
}

interface FlightSearchResponse {
  items: Flight[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

// Component
export default function FlightSearch() {
  const t = useTranslations("flightSearch");
  const router = useRouter();
  
  // State
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [departureQuery, setDepartureQuery] = useState("");
  const [arrivalQuery, setArrivalQuery] = useState("");
  const [departureAirportOptions, setDepartureAirportOptions] = useState<Airport[]>([]);
  const [arrivalAirportOptions, setArrivalAirportOptions] = useState<Airport[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [airlineCode, setAirlineCode] = useState<string>("");
  const [flights, setFlights] = useState<[]>([]);
  const [airlines, setAirlines] = useState<[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;
  const [openDeparturePopover, setOpenDeparturePopover] = useState(false);
  const [openArrivalPopover, setOpenArrivalPopover] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren", 
        staggerChildren: 0.1 
      }
    },
    exit: { 
      opacity: 0,
      transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  };

  // Effects for airport search
  useEffect(() => {
    const fetchDepartureAirports = async () => {
      if (departureQuery.length >= 2) {
        const airports = await AirportAPI.searchAirports(departureQuery);
        setDepartureAirportOptions(airports);
      }
    };

    fetchDepartureAirports();
  }, [departureQuery]);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        setInitialLoad(true);
        const airlines = await AirLineAPI.getAll();
        setAirlines(airlines);
      } catch (err) {
        setError("Failed to load airlines. Please try again later.");
      } finally {
        setInitialLoad(false);
      }
    };

    fetchAirlines();
  }, []);

  useEffect(() => {
    const fetchArrivalAirports = async () => {
      if (arrivalQuery.length >= 2) {
        const airports = await AirportAPI.searchAirports(arrivalQuery);
        setArrivalAirportOptions(airports);
      }
    };

    fetchArrivalAirports();
  }, [arrivalQuery]);

  // Search flights function
  const handleSearch = async (pageNumber = 1) => {
    setLoading(true);
    setSearching(true);
    setError(null);

    try {
      const params: FlightSearchParams = {
        departureAirportCode: departureAirport?.code,
        arrivalAirportCode: arrivalAirport?.code,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        airlineCode: airlineCode || undefined,
        page: pageNumber,
        limit,
      };

      if (departureDate) {
        params.departureDate = departureDate.toISOString();
      }

      const response = await FlightAPI.searchFlights(params);
      setFlights(response.data);
      setCurrentPage(response.meta.page);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalCount);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching flights"
      );
    } finally {
      setLoading(false);
      // Add a small delay to show loading state for better UX
      setTimeout(() => setSearching(false), 500);
    }
  };

  const handleFlightSelection = (flightId: string) => {
    // Add animation effect before navigation
    router.push(`/flights/${flightId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <motion.h1 
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t("title")}
      </motion.h1>

      {/* Search Form */}
      <Suspense fallback={<LoadingCard />}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("cardTitle")}</CardTitle>
              <CardDescription>{t("cardDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Departure Airport */}
                <div className="space-y-2">
                  <Label htmlFor="departureAirport">{t("departureAirportLabel")}</Label>
                  <Popover
                    open={openDeparturePopover}
                    onOpenChange={setOpenDeparturePopover}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {departureAirport
                          ? `${departureAirport.city} (${departureAirport.code})`
                          : t("selectDepartureAirport")}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search airports..."
                          value={departureQuery}
                          onValueChange={setDepartureQuery}
                        />
                        <CommandEmpty>No airports found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {departureAirportOptions.map((airport) => (
                            <CommandItem
                              key={airport.id}
                              value={`${airport.city} ${airport.name} ${airport.code}`}
                              onSelect={() => {
                                setDepartureAirport(airport);
                                setOpenDeparturePopover(false);
                              }}
                            >
                              {airport.city} ({airport.code}) - {airport.name}
                            </CommandItem>
                          ))}
                          <CommandItem
                            value="clear"
                            onSelect={() => {
                              setDepartureAirport(null);
                              setDepartureQuery("");
                              setOpenDeparturePopover(false);
                            }}
                            className="text-red-500"
                          >
                            Clear selection
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Arrival Airport */}
                <div className="space-y-2">
                  <Label htmlFor="arrivalAirport">{t("arrivalAirportLabel")}</Label>
                  <Popover
                    open={openArrivalPopover}
                    onOpenChange={setOpenArrivalPopover}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {arrivalAirport
                          ? `${arrivalAirport.city} (${arrivalAirport.code})`
                          : t("selectArrivalAirport")}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder={t("searchAirportsPlaceholder")}
                          value={arrivalQuery}
                          onValueChange={setArrivalQuery}
                        />
                        <CommandEmpty>{t("noAirportsFound")}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {arrivalAirportOptions.map((airport) => (
                            <CommandItem
                              key={airport.id}
                              value={`${airport.city} ${airport.name} ${airport.code}`}
                              onSelect={() => {
                                setArrivalAirport(airport);
                                setOpenArrivalPopover(false);
                              }}
                            >
                              {airport.city} ({airport.code}) - {airport.name}
                            </CommandItem>
                          ))}
                          <CommandItem
                            value="clear"
                            onSelect={() => {
                              setArrivalAirport(null);
                              setArrivalQuery("");
                              setOpenArrivalPopover(false);
                            }}
                            className="text-red-500"
                          >
                            {t("clearSelection")}
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date Selector */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="dateToggle">{t("dateSelectionLabel")}</Label>
                  </div>

                  <div className="grid gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {departureDate ? (
                            format(departureDate, "PPP")
                          ) : (
                            <span>{t("selectDate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          key="single"
                          mode="single"
                          selected={departureDate}
                          onSelect={setDepartureDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                  <Label>
                    {t("priceRange")} ${priceRange[0]} - ${priceRange[1]}
                  </Label>
                  <Slider
                    defaultValue={[0, 2000]}
                    min={0}
                    max={2000}
                    step={50}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="pt-4"
                  />
                </div>

                {/* Airline */}
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="airline">{t("airlineLabel")}</Label>
                  <Select value={airlineCode} onValueChange={setAirlineCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("anyAirline")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Airline</SelectItem>
                      {airlines.map((airline: Airline) => (
                        <SelectItem key={airline.code} value={airline.code}>
                          {airline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <motion.div 
                className="w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleSearch(1)}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("searching")}
                    </span>
                  ) : (
                    t("searchButton")
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </Suspense>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searching ? (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="loading"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div key={`shimmer-${index}`} variants={itemVariants}>
                <ShimmerCard />
              </motion.div>
            ))}
          </motion.div>
        ) : flights.length > 0 ? (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            key="results"
          >
            <motion.div 
              className="flex justify-between items-center"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold">
                {t("searchResults", { count: totalItems })}
              </h2>
            </motion.div>

            {/* Flight Cards */}
            <div className="space-y-4">
              <Suspense fallback={<ShimmerCard />}>
                <AnimatePresence>
                  {flights.map((flight: Flight, index) => (
                    <motion.div
                      key={flight.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.05 }}
                      layoutId={`flight-${flight.id}`}
                    >
                      <Card className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <CardHeader className="md:col-span-2">
                            <div className="flex justify-between">
                              <CardTitle className="flex items-center text-lg">
                                {flight.departureAirport.code} →{" "}
                                {flight.arrivalAirport.code}
                              </CardTitle>
                              <div className="text-lg font-bold">
                                ${flight.baseFare}
                              </div>
                            </div>
                            <CardDescription>
                              {format(new Date(flight.departureTime), "PPP p")} -{" "}
                              {format(new Date(flight.arrivalTime), "PPP p")}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-col justify-center md:items-end p-6">
                            <div className="text-sm">
                              <span className="font-medium">{flight.airline.name}</span>{" "}
                              ({flight.airline.code})
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("duration")}:{" "}
                              {
                                intervalToDuration({
                                  start: new Date(flight.departureTime),
                                  end: new Date(flight.arrivalTime),
                                }).hours
                              }
                              h{" "}
                              {
                                intervalToDuration({
                                  start: new Date(flight.departureTime),
                                  end: new Date(flight.arrivalTime),
                                }).minutes
                              }
                              m
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-4 w-full md:w-auto"
                            >
                              <Button
                                className="w-full"
                                onClick={() => handleFlightSelection(flight.id)}
                              >
                                {t("selectFlight")}
                              </Button>
                            </motion.div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Suspense>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                variants={itemVariants}
                className="mt-6"
              >
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handleSearch(Math.max(1, currentPage - 1))}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pagination numbers around current page
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                      }

                      return (
                        <PaginationItem key={i}>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <PaginationLink
                              onClick={() => handleSearch(pageNum)}
                              isActive={pageNum === currentPage}
                            >
                              {pageNum}
                            </PaginationLink>
                          </motion.div>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <PaginationLink onClick={() => handleSearch(totalPages)}>
                              {totalPages}
                            </PaginationLink>
                          </motion.div>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handleSearch(Math.min(totalPages, currentPage + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </motion.div>
            )}
          </motion.div>
        ) : (
          !loading && !initialLoad && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="empty"
            >
              <Card className="p-6 text-center">
                <p>
                  {totalItems === 0 && Array.isArray(flights) && flights.length === 0
                    ? ''
                    : t("noFlightsFound")}
                </p>
              </Card>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}