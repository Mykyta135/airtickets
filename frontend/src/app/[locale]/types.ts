export interface Booking {
  data: Flight[];
  meta: Meta;
}
export interface Flight {
  id:                 string;
  flightNumber:       string;
  departureTime:      Date;
  arrivalTime:        Date;
  baseFare:           string;
  createdAt:          Date;
  updatedAt:          Date;
  airlineId:          string;
  departureAirportId: string;
  arrivalAirportId:   string;
  airline:            Airline;
  departureAirport:   Airport;
  arrivalAirport:     Airport;
  flightSeats:        FlightSeat[];
}

export interface Airline {
  id:        string;
  name:      string;
  code:      string;
  country:   string;
  logoUrl?:  string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Airport {
  id:        string;
  name:      string;
  code:      string;
  city:     string;
  country:   string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface FlightSeat {
  id: string;
  seatNumber: string;
  seatClass: string;
  price: string;
  isAvailable: boolean;
  flightId: string;
}

export interface User {
  id: string,
  email: string,
  token: string
}
type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};
export interface Passenger {
  id:             string;
  firstName:      string;
  lastName:       string;
  email:          string;
  phone:          null;
  passportNumber: string;
  dateOfBirth:    Date;
  nationality:    string;
  createdAt:      Date;
  updatedAt:      Date;
  userId:         null;
}
export interface Meta {
  totalCount: number;
  page:       number;
  limit:      number;
  totalPages: number;
}
export interface Booking {
  id:               string;
  bookingReference: string;
  bookingDate:      Date;
  status:           string;
  totalAmount:      string;
  createdAt:        Date;
  updatedAt:        Date;
  userId:           string;
  flightId:         string;
  reservedSeatIds:  string[];
  flight:           Flight;
  tickets:          Ticket[];
  payments:         Payment[];
}
export interface Ticket {
  id:           string;
  ticketNumber: string;
  issueDate:    Date;
  status:       string;
  boardingPass: null;
  createdAt:    Date;
  updatedAt:    Date;
  bookingId:    string;
  passengerId:  string;
  // flightSeatId: string;
}

export interface Payment {
  id:            string;
  amount:        string;
  paymentMethod: string;
  paymentDate:   Date;
  transactionId: string;
  status:        string;
  bookingId:     string;
}


export interface Refund {
  id: string;
  amount: number;
  reason?: string;
  status: RefundStatus;
  requestDate: string;
  processedDate?: string;
  ticketId: string;
  ticket?: Ticket;
}
export enum RefundStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PROCESSED = "PROCESSED",
  REJECTED = "REJECTED"
}