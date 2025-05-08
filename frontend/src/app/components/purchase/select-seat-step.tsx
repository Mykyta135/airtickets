// Determine which section a seat letter belongs to (left, middle, right)
const getSeatSection = (letter: string, allLetters: string[]) => {
  const totalColumns = allLetters.length;
  const leftSection = allLetters.slice(0, Math.floor(totalColumns / 3));
  const rightSection = allLetters.slice(Math.ceil((totalColumns * 2) / 3));

  if (leftSection.includes(letter)) return "left";
  if (rightSection.includes(letter)) return "right";
  return "middle";
}; // components/purchase/select-seats-step.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { Badge } from "@/src/app/components/ui/badge";
import { ScrollArea } from "@/src/app/components/ui/scroll-area";
import { FlightSeat } from "@/src/app/[locale]/types";
import { useTranslations } from "next-intl";

interface SelectSeatsStepProps {
  availableSeats: FlightSeat[];
  selectedSeats: FlightSeat[];
  onSeatSelect: (seat: FlightSeat) => void;
  loading: boolean;
}

export default function SelectSeatsStep({
  availableSeats,
  selectedSeats,
  onSeatSelect,
  loading,
}: SelectSeatsStepProps) {
  // Group seats by class for better display
  const seatsByClass = availableSeats.reduce((acc, seat) => {
    if (!acc[seat.seatClass]) {
      acc[seat.seatClass] = [];
    }
    acc[seat.seatClass].push(seat);
    return acc;
  }, {} as Record<string, FlightSeat[]>);

  // Calculate total price
  const totalPrice = selectedSeats
    .reduce((sum, seat) => sum + parseFloat(seat.price), 0)
    .toFixed(2);

  // Process seats into airplane layout format with proper types
  const processSeatsForLayout = (seats: FlightSeat[]) => {
    // We need to extend FlightSeat with row and letter properties for UI display
    interface ExtendedFlightSeat extends FlightSeat {
      row: number;
      letter: string;
    }

    // Extract row numbers and seat letters
    const processedSeats = seats.map((seat) => {
      // Parse seatNumber (format like "12A", "23F", etc.)
      const match = seat.seatNumber.match(/(\d+)([A-Z])/);

      const extendedSeat: ExtendedFlightSeat = {
        ...seat,
        row: match ? parseInt(match[1]) : 0,
        letter: match ? match[2] : "X",
      };

      return extendedSeat;
    });

    // Get all unique rows
    const rows = [...new Set(processedSeats.map((seat) => seat.row))].sort(
      (a, b) => a - b
    );

    // Get all unique seat letters
    const letters = [
      ...new Set(processedSeats.map((seat) => seat.letter)),
    ].sort();

    return { processedSeats, rows, letters };
  };

  // Display class information with count and price range
  const getClassSummary = (seatClass: string, seats: FlightSeat[]) => {
    const classSeats = seats.filter((seat) => seat.seatClass === seatClass);
    const availableSeats = classSeats.filter((seat) => seat.isAvailable);

    // Get price range
    const prices = availableSeats.map((seat) => parseFloat(seat.price));
    const minPrice = Math.min(...prices).toFixed(2);
    const maxPrice = Math.max(...prices).toFixed(2);

    const priceRange =
      minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`;

    return {
      available: availableSeats.length,
      total: classSeats.length,
      priceRange,
    };
  };
  const t = useTranslations('SeatSelection');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">
          {t('subtitle')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">{t('totalPrice')}</div>
          <div className="text-xl font-bold">${totalPrice}</div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-md">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-primary/20 border border-primary rounded mr-2"></div>
            <span className="text-sm">{t('available')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-primary border border-primary rounded mr-2"></div>
            <span className="text-sm">{t('selected')}</span>
          </div>
          
        </div>
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        {Object.entries(seatsByClass).map(([seatClass, seats]) => {
          const { processedSeats, rows, letters } =
            processSeatsForLayout(seats);

          return (
            <div key={seatClass} className="p-6 border-b last:border-b-0">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-md font-semibold">{t('classTitle', { class: seatClass })}</h4>
                  <p className="text-sm text-muted-foreground">
                    {getClassSummary(seatClass, seats).available} of{" "}
                    {getClassSummary(seatClass, seats).total} seats available
                  </p>
                </div>
                <div className="text-sm text-black bg-cyan-100 px-3 py-1 rounded">
                {t('priceRange', { range: getClassSummary(seatClass, seats).priceRange })}
                </div>
              </div>

              {/* Airplane visual header with cockpit */}
              <div className="relative w-full mb-8">
                <div className="w-full h-24 bg-slate-100 rounded-t-full flex items-center justify-center relative">
                  <div className="text-slate-500 font-medium">
                  {t('front')}
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-slate-300 rounded-t-lg border-t border-l border-r border-slate-400 flex items-center justify-center">
                    <span className="text-xs text-slate-600">{t('cockpit')}</span>
                  </div>
                </div>
              </div>

              {/* Display seat letter headers */}
              <div className="flex mb-2 px-6">
                {letters.map((letter) => {
                  const section = getSeatSection(letter, letters);
                  return (
                    <div
                      key={letter}
                      className={`text-center font-medium text-sm flex-1 ${
                        section === "middle" ? "mx-2" : ""
                      }`}
                      style={{
                        marginLeft:
                          section === "middle" &&
                          letter ===
                            letters.find(
                              (l) => getSeatSection(l, letters) === "middle"
                            )
                            ? "16px"
                            : "",
                        marginRight:
                          section === "middle" &&
                          letter ===
                            letters
                              .filter(
                                (l) => getSeatSection(l, letters) === "middle"
                              )
                              .pop()
                            ? "16px"
                            : "",
                      }}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>

              {/* Display rows */}
              {rows.map((rowNum, rowIndex) => {
                // Add emergency exits at specific rows (customize as needed)
                const isEmergencyExitRow =
                  rowNum === rows[Math.floor(rows.length * 0.3)] ||
                  rowNum === rows[Math.floor(rows.length * 0.7)];

                // Add galley/lavatory indicators
                const hasGalley =
                  rowNum === rows[Math.floor(rows.length * 0.5)];

                return (
                  <div key={rowNum}>
                    {/* Emergency exit or galley indicators */}
                    {(isEmergencyExitRow || hasGalley) && (
                      <div className="flex items-center justify-between mb-1 px-10">
                        {isEmergencyExitRow && (
                          <div className="bg-yellow-100 border border-yellow-400 text-xs text-black px-2 py-1 rounded flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            {t('emergencyExit')}
                          </div>
                        )}
                        {hasGalley && (
                          <div className="ml-auto bg-blue-100 border border-blue-400 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            {t('lavatory')}/{t('galley')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Seats row */}
                    <div className="flex items-center mb-3">
                      <div className="font-medium text-sm text-muted-foreground w-8 text-right mr-2">
                        {rowNum}
                      </div>
                      <div
                        className={`flex flex-1 ${
                          isEmergencyExitRow ? "pt-2 pb-2 " : ""
                        }`}
                      >
                        {letters.map((letter) => {
                          const seat = processedSeats.find(
                            (s) => s.row === rowNum && s.letter === letter
                          );
                          const isSelected =
                            seat && selectedSeats.some((s) => s.id === seat.id);
                          const section = getSeatSection(letter, letters);

                          // Add exit indicators
                          const isExitSeat =
                            isEmergencyExitRow &&
                            (letter === letters[0] ||
                              letter === letters[letters.length - 1]);

                          return (
                            <div
                              key={letter}
                              className={`flex-1 ${
                                section === "middle" ? "mx-2" : ""
                              } ${isExitSeat ? "relative" : ""}`}
                              style={{
                                marginLeft:
                                  section === "middle" &&
                                  letter ===
                                    letters.find(
                                      (l) =>
                                        getSeatSection(l, letters) === "middle"
                                    )
                                    ? "16px"
                                    : "",
                                marginRight:
                                  section === "middle" &&
                                  letter ===
                                    letters
                                      .filter(
                                        (l) =>
                                          getSeatSection(l, letters) ===
                                          "middle"
                                      )
                                      .pop()
                                    ? "16px"
                                    : "",
                              }}
                            >
                              {isExitSeat && (
                                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 -translate-x-full">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-yellow-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                  </svg>
                                </div>
                              )}

                              {seat ? (
                                <button
                                  onClick={() => onSeatSelect(seat)}
                                  disabled={!seat.isAvailable || loading}
                                  className={`w-full p-2 rounded-md border text-center transition-colors ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : seat.isAvailable
                                      ? "bg-primary/20 hover:bg-primary/30 border-primary"
                                      : "bg-muted-foreground/20 border-muted-foreground cursor-not-allowed"
                                  } ${
                                    isEmergencyExitRow
                                      ? "border-yellow-400"
                                      : ""
                                  }`}
                                  title={
                                    isEmergencyExitRow
                                      ? "Emergency Exit Row - Extra legroom"
                                      : ""
                                  }
                                >
                                  <div className="font-medium">
                                    {seat.seatNumber}
                                  </div>
                                  <div className="text-xs mt-1">
                                    ${parseFloat(seat.price).toFixed(2)}
                                  </div>
                                </button>
                              ) : (
                                <div className="w-full p-2 opacity-0">-</div>
                              )}

                              {isExitSeat &&
                                letter === letters[letters.length - 1] && (
                                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 translate-x-full">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-yellow-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                      />
                                    </svg>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="font-medium text-sm text-muted-foreground w-8 ml-2">
                        {rowNum}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Airplane visual footer with galleys */}
              <div className="relative w-full mt-8">
                <div className="w-full h-16 bg-slate-100 rounded-b-full flex items-center justify-center relative">
                  <div className="text-slate-500 font-medium">
                  {t('rear')}
                  </div>
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-6 bg-slate-300 border border-slate-400 rounded flex items-center justify-center">
                    <span className="text-xs text-slate-600">{t('galley')}</span>
                  </div>
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-6 bg-slate-300 border border-slate-400 rounded flex items-center justify-center">
                    <span className="text-xs text-slate-600">{t('galley')}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </ScrollArea>

      {selectedSeats.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('selectedSeats.title')}</CardTitle>
            <CardDescription>{t('selectedSeats.description', { count: selectedSeats.length })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <Badge key={seat.id} variant="outline" className="py-1.5">
                  {seat.seatNumber} - {seat.seatClass} ($
                  {parseFloat(seat.price).toFixed(2)})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
