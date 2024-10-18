"use client";
/* ------------------ Imports ----------------- */

/* ----------------- Component ---------------- */
export function Wallet() {
  return (
    <div className="flex flex-row gap-2">
      <div dangerouslySetInnerHTML={{ __html: "<radix-connect-button />" }} />
    </div>
  );
}
