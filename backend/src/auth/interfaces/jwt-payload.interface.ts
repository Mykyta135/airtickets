export interface JwtPayload {
    sub: string; // User ID
    email: string;
    iat?: number; // Issued at (timestamp)
    exp?: number; // Expiration time (timestamp)
  }