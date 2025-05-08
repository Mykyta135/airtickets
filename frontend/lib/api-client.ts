// lib/api-client.ts
import { format } from "date-fns";
import { getAuthHeader } from "./auth-utils";
import {
  Booking,
  Flight,
  FlightSeat,
  Passenger,
  Ticket,
  User,
} from "../src/app/[locale]/types";

const BASE_URL = "http://localhost:5005/api";

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `API Error: ${response.status}`);
  }
  console.log(response);
  return response.json();
}

// Helper function to make API requests
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

// Authentication functions
export const AuthAPI = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await request<User>("auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Store token and user data in localStorage
      if (response && response.token) {
        localStorage.setItem("token", response.token);

        // Store user data - we need to extract the user object from the response
        const userData = {
          id: response.id,
          email: response.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));

        console.log("Stored user data:", userData);
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<User> => {
    try {
      const response = await request<User>("auth/register", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      // Store token and user data in localStorage
      if (response && response.token) {
        localStorage.setItem("token", response.token);

        // Store user data
        const userData = {
          id: response.id,
          email: response.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));

        console.log("Stored user data:", userData);
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  getUser: async () => {
    return request<{ user: any }>("users/me");
  },
};

export const FlightAPI = {
  searchFlights(params: any): Promise<any> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (
          key === "departureDate" ||
          key === "departureDateStart" ||
          key === "departureDateEnd"
        ) {
          queryParams.append(
            key,
            format(new Date(value as string), "yyyy-MM-dd")
          );
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return request<any>(`flights?${queryParams.toString()}`);
  },

  searchFlightsById(flightId: string): Promise<Flight> {
    return request<any>(`flights/${flightId}`);
  },
};
export const BookingAPI = {
  getMyBookings(): Promise<Booking[]> {
    return request<Booking[]>("purchase/my-bookings");
  },
  getBookingById(bookingId: string): Promise<Booking> {
    return request<Booking>(`purchase/booking/${bookingId}`);
  },
};
export const ProfileAPI = {
  getMyProfile(): Promise<any> {
    return request<any>(`myprofile`);
  },
  async updateMyProfile(data: any) {
    try {
      console.log(data);
      const response = await request<any>("myprofile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
};
export const AirportAPI = {
  getAll(): Promise<any> {
    return request<any>(`flights/airports/search`);
  },
  searchAirports(query: string): Promise<any> {
    if (!query || query.length < 2) return [] as any;
    return request<any>(
      `flights/airports/search?q=${encodeURIComponent(query)}`
    );
  },
  searchAirportById(id: string): Promise<any> {
    return request<any>(`flights/airports/${id}`);
  },
};

export const AirLineAPI = {
  getAll(): Promise<any> {
    return request<any>(`flights/airlines/search`);
  },
  getById(airlineId: string): Promise<any> {
    return request<any>(`flights/airline/search?q=${airlineId}`);
  },
};

export const PurchaseAPI = {
  getAvailableSeats(flightId: any): Promise<FlightSeat[]> {
    return request<any>(`purchase/available-seats/${flightId}`);
  },
  getBookingById(bookingId: any): Promise<Booking> {
    return request<any>(`purchase/booking/${bookingId}`);
  },
  reserveSeats(flightId: string, seatIds: string[]): Promise<any> {
    return request<any>(`purchase/reserve`, {
      method: "POST",
      body: JSON.stringify({ flightId, seatIds }),
    });
  },

  submitPassengers(
    bookingId: string,
    passengersData: Passenger[]
  ): Promise<void> {
    return request<void>(`purchase/${bookingId}/passengers`, {
      method: "POST",
      body: JSON.stringify({ passengers: passengersData }),
    });
  },

  confirmBooking(booking: string): Promise<Booking> {
    return request<Booking>(`purchase/${booking}/confirm`, {
      method: "POST",
      body: JSON.stringify({ agreeToTerms: true }),
    });
  },

  pay(booking: string, paymentData: any): Promise<void> {
    return request<void>(`purchase/${booking}/pay`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },
};
export const TicketAPI = {
  getTicketByBookingId(bookingId: any): Promise<Ticket[]> {
    return request<Ticket[]>(`ticket/${bookingId}`);
  },
};

export const RefundAPI = {
  // Request a refund for a ticket
  requestRefund: async (ticketId: string, amount: number, reason: string): Promise<any> => {
    return request<any>('refunds', {
      method: 'POST',
      body: JSON.stringify({ ticketId, amount, reason }),
    });
  },

  // Get all refund requests
  getRefunds: async (filters?: { status?: string; ticketId?: string }): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters?.ticketId) {
      queryParams.append('ticketId', filters.ticketId);
    }
    
    return request<any>(`refunds?${queryParams.toString()}`);
  },

  // Get a specific refund by ID
  getRefundById: async (refundId: string): Promise<any> => {
    return request<any>(`refunds/${refundId}`);
  },

  // Get refund by ticket ID
  getRefundByTicketId: async (ticketId: string): Promise<any> => {
    return request<any>(`refunds/ticket/${ticketId}`);
  },

  // Update refund status
  updateRefund: async (refundId: string, data: { status?: string; reason?: string }): Promise<any> => {
    return request<any>(`refunds/${refundId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete a refund request (only pending refunds)
  deleteRefund: async (refundId: string): Promise<any> => {
    return request<any>(`refunds/${refundId}`, {
      method: 'DELETE',
    });
  },
};
