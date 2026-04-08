"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/shared/button";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        void signOut({ callbackUrl: "/admin/login" });
      }}
    >
      Выйти
    </Button>
  );
}
