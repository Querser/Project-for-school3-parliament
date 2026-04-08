import type { AccountStatus, AdminRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AdminRole;
      status: AccountStatus;
      sessionToken: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: AdminRole;
    status: AccountStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AdminRole;
    status?: AccountStatus;
    sessionToken?: string;
  }
}
