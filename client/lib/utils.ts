/* ------------------ Imports ----------------- */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* ----------------- Constants ---------------- */
// Radix Addresses
export const componentAddress: string = process.env.NEXT_PUBLIC_COMPONENT_ADDR || "";
export const definitionAddress: string = process.env.NEXT_PUBLIC_DAPP_DEFINITION_ADDR || "";
export const borrowerBadge_Resource: string = process.env.NEXT_PUBLIC_BORROWER_BADGE_ADDR || "";

export const XRD_Resource: string = process.env.NEXT_PUBLIC_XRD_ADDR || "";
export const RSH_Resource: string = process.env.NEXT_PUBLIC_RSH_ADDR || "";
export const HUG_Resource: string = process.env.NEXT_PUBLIC_HUG_ADDR || "";
export const USDT_Resource: string = process.env.NEXT_PUBLIC_USDT_ADDR || "";

// Asset Data
export const Assets = ["XRD", "HUG", "USDT", "IDFK"] as const;
export type Asset = (typeof Assets)[number];

export const assetRecord: Record<Asset, string> = {
  XRD: XRD_Resource,
  HUG: HUG_Resource,
  USDT: USDT_Resource,
  IDFK: "resource_idfk",
};

/* ----------------- Functions ---------------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
