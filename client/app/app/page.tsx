"use client";
/* ------------------ Imports ----------------- */
import { AssetForm } from "@/components/asset-form";
import { useRadixContext } from "@/contexts/provider";
import { gatewayApi, rdt } from "@/lib/radix";
import { useEffect } from "react";

/* ----------------- Constants ---------------- */

/* ------------------- Page ------------------- */
export default function App() {
  const { accounts } = useRadixContext();

  console.log("env", process.env);

  useEffect(() => {
    console.log("Account", accounts);
    console.log("RDT", rdt);
    console.log("GatewayApi", gatewayApi);
  }, [accounts]);

  return (
    <main className="p-4 flex-grow">
      {accounts != null && accounts.length > 0 ? accounts[0].address : "none connected"}
      <AssetForm />
    </main>
  );
}
``;
