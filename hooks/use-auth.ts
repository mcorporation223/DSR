"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  return useNextAuthSession();
}

export { signIn, signOut } from "next-auth/react";
