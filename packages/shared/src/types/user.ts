/**
 * User entity type
 * Shared between backend (database) and frontend (API responses)
 */
export interface User {
  user_id: number;
  email: string;
}

/**
 * DTO for user login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  access_token: string;
}
