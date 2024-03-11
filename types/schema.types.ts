export type RoleType = "teller" | "encoder";

export interface User {
  name: string;
  email: string;
  username: string;
  password: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProtectedUser {
  name: string;
  email: string;
  username: string;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithToken extends ProtectedUser {
  token: string;
}
