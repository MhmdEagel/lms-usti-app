type UserDetail = Omit<
  User,
  "updatedAt" | "createdAt" | "email" | "emailVerified" | "password" | "role"
>;

export type {UserDetail}