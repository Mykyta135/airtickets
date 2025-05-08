type Airport = {
    code: string;
    timezone: string;
  };
  
  type Airline = {
    code: string;
  };
  
  export async function generateFlights(airlines: Airline[], airports: Airport[]) {
    const flights: any = [];
    const now = new Date();
    const days = 90; // Generate flights for the next 90 days
    
    // Popular routes (departure -> arrival)
    const routes = [
      { from: 'JFK', to: 'LAX' },
      { from: 'LAX', to: 'JFK' },
      { from: 'JFK', to: 'LHR' },
      { from: 'LHR', to: 'JFK' },
      { from: 'LAX', to: 'SFO' },
      { from: 'SFO', to: 'LAX' },
      { from: 'ORD', to: 'MIA' },
      { from: 'MIA', to: 'ORD' },
      { from: 'LHR', to: 'CDG' },
      { from: 'CDG', to: 'LHR' },
      { from: 'FRA', to: 'AMS' },
      { from: 'AMS', to: 'FRA' },
      { from: 'JFK', to: 'DXB' },
      { from: 'DXB', to: 'JFK' },
      { from: 'SIN', to: 'HND' },
      { from: 'HND', to: 'SIN' },
      { from: 'SYD', to: 'LAX' },
      { from: 'LAX', to: 'SYD' },
      { from: 'ATL', to: 'MIA' },
      { from: 'MIA', to: 'ATL' },
    ];
    
    // Flight durations in hours for each route
    const flightDurations = {
      'JFK-LAX': 6, // 6 hours
      'LAX-JFK': 5.5, // East-bound flights are slightly faster
      'JFK-LHR': 7,
      'LHR-JFK': 8,
      'LAX-SFO': 1.5,
      'SFO-LAX': 1.5,
      'ORD-MIA': 3,
      'MIA-ORD': 3,
      'LHR-CDG': 1.5,
      'CDG-LHR': 1.5,
      'FRA-AMS': 1.5,
      'AMS-FRA': 1.5,
      'JFK-DXB': 12,
      'DXB-JFK': 14,
      'SIN-HND': 7,
      'HND-SIN': 7,
      'SYD-LAX': 14,
      'LAX-SYD': 15,
      'ATL-MIA': 2,
      'MIA-ATL': 2,
    };
    
    // Departure times for each day
    const departureTimes = [
      '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00',
    ];
    
    // Generate flights
    for (let day = 0; day < days; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      for (const route of routes) {
        const departureAirport = airports.find(a => a.code === route.from);
        const arrivalAirport = airports.find(a => a.code === route.to);
        
        if (!departureAirport || !arrivalAirport) continue;
        
        const routeKey = `${route.from}-${route.to}`;
        const flightDuration = flightDurations[routeKey] || 3; // Default to 3 hours if not specified
        
        for (const airline of airlines) {
          // Not every airline flies every route
          if (Math.random() < 0.3) continue;
          
          // Generate 1-3 flights per airline per route per day
          const flightsPerDay = 1 + Math.floor(Math.random() * 3);
          
          for (let i = 0; i < flightsPerDay; i++) {
            // Pick a random departure time
            const departureTime = new Date(date);
            const [hours, minutes] = departureTimes[Math.floor(Math.random() * departureTimes.length)].split(':');
            departureTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            
            // Calculate arrival time
            const arrivalTime = new Date(departureTime);
            arrivalTime.setHours(arrivalTime.getHours() + Math.floor(flightDuration));
            arrivalTime.setMinutes(arrivalTime.getMinutes() + Math.round((flightDuration % 1) * 60));
            
            // Generate base fare (varies by route length and randomization)
            const baseFare = Math.round(100 + (flightDuration * 50) + (Math.random() * 100));
            
            // Generate flight number (e.g., AA123)
            const flightNumber = `${airline.code}${100 + Math.floor(Math.random() * 900)}`;
            
            flights.push({
              flightNumber,
              departureTime,
              arrivalTime,
              baseFare,
              airlineCode: airline.code,
              departureAirportCode: departureAirport.code,
              arrivalAirportCode: arrivalAirport.code,
            });
          }
        }
      }
    }
    
    // Ensure we have at least 1000 flights
    if (flights.length < 1000) {
      console.log(`Generated ${flights.length} flights, which is less than 1000. Adding more...`);
      // Add more flights by duplicating existing ones with different dates
      const additionalFlights: any = [];
      let i = 0;
      
      while (flights.length + additionalFlights.length < 1000) {
        const originalFlight = flights[i % flights.length];
        
        // Create a copy with a different date (add 100+ days)
        const departureTime = new Date(originalFlight.departureTime);
        departureTime.setDate(departureTime.getDate() + 100 + Math.floor(Math.random() * 30));
        
        const arrivalTime = new Date(departureTime);
        const flightDuration = (originalFlight.arrivalTime.getTime() - originalFlight.departureTime.getTime()) / (1000 * 60 * 60);
        arrivalTime.setHours(arrivalTime.getHours() + Math.floor(flightDuration));
        arrivalTime.setMinutes(arrivalTime.getMinutes() + Math.round((flightDuration % 1) * 60));
        
        additionalFlights.push({
          ...originalFlight,
          departureTime,
          arrivalTime,
          flightNumber: `${originalFlight.airlineCode}${100 + Math.floor(Math.random() * 900)}`,
          baseFare: originalFlight.baseFare + Math.floor(Math.random() * 50) - 25, // Slightly vary the price
        });
        
        i++;
      }
      
      flights.push(...additionalFlights);
      console.log(`Added ${additionalFlights.length} more flights. Total: ${flights.length}`);
    }
    
    return flights;
  }