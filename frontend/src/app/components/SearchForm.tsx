// SearchForm.tsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Search, Loader2 } from "lucide-react";
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
import { AirLineAPI, AirportAPI } from "@/lib/api-client";
import { Airline, Airport } from "@/src/app/[locale]/types";
import { useTranslations } from "next-intl";

interface SearchFormProps {
  onSearch: (page?: number) => Promise<void>;
  loading: boolean;
}

// Animation variants
const formFieldVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: custom * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const t = useTranslations("flightSearch");

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
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [openDeparturePopover, setOpenDeparturePopover] = useState(false);
  const [openArrivalPopover, setOpenArrivalPopover] = useState(false);
  const [loadingAirlines, setLoadingAirlines] = useState(false);

  // Load airlines on component mount
  useEffect(() => {
    const fetchAirlines = async () => {
      setLoadingAirlines(true);
      try {
        const data = await AirLineAPI.getAll();
        setAirlines(data);
      } catch (error) {
        console.error("Failed to load airlines:", error);
      } finally {
        setLoadingAirlines(false);
      }
    };

    fetchAirlines();
  }, []);

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
    const fetchArrivalAirports = async () => {
      if (arrivalQuery.length >= 2) {
        const airports = await AirportAPI.searchAirports(arrivalQuery);
        setArrivalAirportOptions(airports);
      }
    };

    fetchArrivalAirports();
  }, [arrivalQuery]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CardTitle>{t("cardTitle")}</CardTitle>
          <CardDescription>{t("cardDescription")}</CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Departure Airport */}
          <motion.div 
            className="space-y-2"
            variants={formFieldVariants}
            initial="initial"
            animate="animate"
            custom={0}
          >
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
                    placeholder={t("searchAirportsPlaceholder")}
                    value={departureQuery}
                    onValueChange={setDepartureQuery}
                  />
                  <CommandEmpty>{t("noAirportsFound")}</CommandEmpty>
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
                      {t("clearSelection")}
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Arrival Airport */}
          <motion.div 
            className="space-y-2"
            variants={formFieldVariants}
            initial="initial"
            animate="animate"
            custom={1}
          >
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
          </motion.div>

          {/* Date Selector */}
          <motion.div 
            className="space-y-2"
            variants={formFieldVariants}
            initial="initial"
            animate="animate"
            custom={2}
          >
            <Label htmlFor="dateToggle">{t("dateSelectionLabel")}</Label>
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
          </motion.div>

          {/* Price Range */}
          <motion.div 
            className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1"
            variants={formFieldVariants}
            initial="initial"
            animate="animate"
            custom={3}
          >
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
          </motion.div>

          {/* Airline */}
          <motion.div 
            className="space-y-2 col-span-1"
            variants={formFieldVariants}
            initial="initial"
            animate="animate"
            custom={4}
          >
            <Label htmlFor="airline">{t("airlineLabel")}</Label>
            <Select value={airlineCode} onValueChange={setAirlineCode}>
              <SelectTrigger>
                <SelectValue placeholder={loadingAirlines ? "Loading..." : t("anyAirline")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("anyAirline")}</SelectItem>
                {airlines.map((airline) => (
                  <SelectItem key={airline.code} value={airline.code}>
                    {airline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </CardContent>
      <CardFooter>
        <motion.div 
          className="w-full" 
          variants={formFieldVariants}
          initial="initial"
          animate="animate"
          custom={5}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => onSearch(1)} 
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
  );
}