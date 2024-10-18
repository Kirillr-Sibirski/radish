"use client";
/* ------------------ Imports ----------------- */
import { RadixContext, RadixProvider } from "@/contexts/radix-context";
import { useContext } from "react";

/* ------------ Provider Functions ------------ */
export function useRadixContext() {
  return useContext(RadixContext);
}

/* ----------- Root Context Provider ---------- */
export function ContextProvider({ children }: { children: React.ReactNode }) {
  return <RadixProvider>{children}</RadixProvider>;
}
