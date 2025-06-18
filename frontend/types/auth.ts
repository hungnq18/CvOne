export interface User {
  _id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface AuthResponse {
  token: string
  user: User
}
