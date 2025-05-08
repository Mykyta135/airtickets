import { SeatClass } from "@prisma/client";


export function generateFlightSeats(flightId: string) {
  const seats: any = [];
  
  // Seat configuration based on class
  const seatConfigs = {
    [SeatClass.ECONOMY]: {
      rows: 20,
      seatsPerRow: 6,
      basePriceMultiplier: 1.0,
      prefix: 'E',
    },
    [SeatClass.PREMIUM_ECONOMY]: {
      rows: 5,
      seatsPerRow: 4,
      basePriceMultiplier: 1.5,
      prefix: 'P',
    },
    [SeatClass.BUSINESS]: {
      rows: 8,
      seatsPerRow: 4,
      basePriceMultiplier: 2.5,
      prefix: 'B',
    },
    [SeatClass.FIRST]: {
      rows: 3,
      seatsPerRow: 2,
      basePriceMultiplier: 4.0,
      prefix: 'F',
    },
  };
  
  // Generate each seat
  Object.entries(seatConfigs).forEach(([seatClass, config]) => {
    const { rows, seatsPerRow, basePriceMultiplier, prefix } = config;
    
    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        // Generate seat number (e.g., 1A, 12B, etc.)
        const seatLetter = String.fromCharCode(64 + seat); // A, B, C, ...
        const seatNumber = `${prefix}${row}${seatLetter}`;
        
        // Calculate price (base price * multiplier + some randomness)
        let basePrice = 100 * basePriceMultiplier;
        // Add slight randomness to price
        const priceVariation = (Math.random() * 20) - 10; // -10 to +10
        const price = Math.round((basePrice + priceVariation) * 100) / 100;
        
        // Random availability (most seats are available)
        const isAvailable = Math.random() > 0.1; // 90% are available
        
        seats.push({
          flightId,
          seatNumber,
          seatClass: seatClass as SeatClass,
          price,
          isAvailable,
        });
      }
    }
  });
  
  return seats;
}