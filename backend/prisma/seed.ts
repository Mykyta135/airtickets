
import { PrismaClient } from '@prisma/client';
import { airlines } from './seed-data/airlines';
import { airports } from './seed-data/airports';
import { generateFlightSeats } from './seed-data/flight-seats';
import { generateFlights } from './seed-data/flights';


const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Seed airlines
  console.log('Seeding airlines...');
  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { code: airline.code },
      update: {},
      create: airline,
    });
  }
  console.log('Airlines seeded successfully.');

  // Seed airports
  console.log('Seeding airports...');
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { code: airport.code },
      update: {},
      create: airport,
    });
  }
  console.log('Airports seeded successfully.');

  // Generate and seed flights (1000+ records)
  console.log('Generating flights...');
  const flights = await generateFlights(airlines, airports);

  console.log('Seeding flights...');
  let flightCounter = 0;
  for (const flight of flights) {
    const createdFlight = await prisma.flight.create({
      data: {
        flightNumber: flight.flightNumber,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        baseFare: flight.baseFare,
        airline: {
          connect: {
            code: flight.airlineCode,
          },
        },
        departureAirport: {
          connect: {
            code: flight.departureAirportCode,
          },
        },
        arrivalAirport: {
          connect: {
            code: flight.arrivalAirportCode,
          },
        },
      },
    });

    // Generate and seed flight seats
    const seats = generateFlightSeats(createdFlight.id);
    await prisma.flightSeat.createMany({
      data: seats,
    });

    flightCounter++;
    if (flightCounter % 100 === 0) {
      console.log(`${flightCounter} flights seeded...`);
    }
  }

  console.log(`Seeded ${flightCounter} flights successfully.`);
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    return 1
  })
  .finally(async () => {
    await prisma.$disconnect();
  });