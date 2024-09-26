"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusIcon, MinusIcon } from "@radix-ui/react-icons";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import {
  DataRequestBuilder,
  RadixDappToolkit,
  RadixNetwork,
  Logger,
} from "@radixdlt/radix-dapp-toolkit";
import { generateEstimateLoan, generateEstimateRepay, generateGetLoan } from "../manifests";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { Footer } from "@/components/ui/footer";
import CollateralPieChart from "@/components/ui/pie-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const componentAddress = "component_tdx_2_1cpzmxq2xema0pysqcr40rjt4w5z4pl7j40ymvya4nyjxc28wlrrd7d";
const nftBadge_Resource = "resource_tdx_2_1ngc2l83rggax8y2rkrpwxj23c0pqyw2n90wqdmpxuv8znvs5twvgcn";
const dAppDefinitionAddress = "account_tdx_2_12y47w6wsqelpnucy8zjduqdzdq2vq3m56nsudnf73v6yf7h2n237zw";
const RSH_Resource = "resource_tdx_2_1tknwdst2xtz0p03jf5tfask3j0c444hqlvjfw8esrrh5kravmd09vt";

// Collateral assets - addresses
const XRD_Resource = "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc";
const HUG_Resource = "resource_tdx_2_1tkuj2rqsa63f8ygkzezgt27trj50srht5e666jaz28j5ss8fasg5kl";
const USDT_Resource = "resource_tdx_2_1t57e50rm28cyqwn26jn336qyhu8nkt8cknacq8rnsn5kul2l3zvjut";

// Collateral assets - tickets
const asset1 = "XRD"
const asset2 = "HUG"
const asset3 = "USDT"

const collateralAssets: Record<string, string> = {
  "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc": asset1, // XRD Resource Address
  "resource_tdx_2_1tkuj2rqsa63f8ygkzezgt27trj50srht5e666jaz28j5ss8fasg5kl": asset2,  // Add HUG Resource Address
  "resource_tdx_2_1t57e50rm28cyqwn26jn336qyhu8nkt8cknacq8rnsn5kul2l3zvjut": asset3, // Add USDT Resource Address
};



// Zod schema for validating the form
const formSchema = z.object({
  amount1: z.number().optional(),
  amount2: z.number().optional(),
  amount3: z.number().optional(),
});

const rdt = RadixDappToolkit({
  dAppDefinitionAddress: dAppDefinitionAddress,
  networkId: RadixNetwork.Stokenet,
  applicationName: "Radish",
  applicationVersion: "1.0.0",
  logger: Logger(1),
});

let account: any;
rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
// Subscribe to updates to the user's shared wallet data, then display the account name and address.
rdt.walletApi.walletData$.subscribe(async (walletData) => {
  console.log("connected wallet data: ", walletData);
  // Set the account variable to the first and only connected account from the wallet
  account = walletData.accounts[0];
  console.log("Account: ", account);
});

const gatewayApi = GatewayApiClient.initialize(rdt.gatewayApi.clientConfig);

async function hasBadge(_account: any) {
  if (!_account) return;

  const accountState = await gatewayApi.state.getEntityDetailsVaultAggregated(
    _account.address
  );

  const getNFTBalance =
    accountState.non_fungible_resources.items.find(
      (fr) => fr.resource_address === nftBadge_Resource
    )?.vaults.items[0];

  if (!getNFTBalance) {
    return { assets: [], badgeValue: 0 };
  }

  const metadata = await gatewayApi.state.getNonFungibleData(
    JSON.parse(JSON.stringify(nftBadge_Resource)), [
    JSON.parse(JSON.stringify(getNFTBalance)).items[0]
  ]);

  try {
    const assetsResponse = JSON.parse(JSON.stringify(metadata))[0].data.programmatic_json.fields[0].entries;

    // Map the assets
    const mappedAssets = assetsResponse.map((entry: any) => ({
      assetName: entry.key.value, // Resource address (e.g., resource_tdx...)
      amount: parseFloat(entry.value.value), // Asset amount
    }));

    console.log("Mapped Assets: ", mappedAssets);

    // Return the mapped assets along with the badge value (if needed)
    const badgeValue = JSON.parse(JSON.stringify(metadata))[0].data.programmatic_json.fields[1].value;

    return { assets: mappedAssets, badgeValue };

  } catch (e) {
    console.error("Error parsing assets metadata: ", e);
    return { assets: [], badgeValue: 0 }; // Return empty assets and badgeValue in case of an error
  }
}

export default function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount1: 0,
      amount2: 0,
      amount3: 0,
    },
  });

  const [selectedAssets, setSelectedAssets] = useState({
    field1: `${asset1}`,
    field2: `${asset2}`,
    field3: `${asset3}`,
  });


  const [visibleFields, setVisibleFields] = useState(1); // Control the number of visible asset input fields
  const [radishAmountReturned, setRadishAmountReturned] = useState(0.0);
  const [userHasLoan, setUserHasLoan] = useState(false); // To check if the user has an active loan
  const [estimatedWithdrawShow, setEstimatedWithdrawShow] = useState(false);
  const [radishAmount, setRadishAmount] = useState(0.0); // Amount of debt when deposit, fuck knows what this shit is for
  const [radishAmountBack, setRadishAmountBack] = useState(0.0); // Estimate withdraw function
  const [debtValue, setDebtValue] = useState(0.0); // Loaded from badge NFT
  const [interestRate, setInterestRate] = useState(10); // Dummy interest rate
  interface AssetStat {
    amount: number;
    assetName: string;
  }
  const [assetsStats, setAssetsStats] = useState<AssetStat[]>([
    { amount: 0.0, assetName: "" },
    { amount: 0.0, assetName: "" },
    { amount: 0.0, assetName: "" }
  ]);

  const [estimatedAssetsStats, setEstimatedAssetsStats] = useState<AssetStat[]>([
    { amount: 0.0, assetName: "" },
    { amount: 0.0, assetName: "" },
    { amount: 0.0, assetName: "" }
  ]);

  useEffect(() => {
    const checkBadge = async () => {
      if (account) {
        const result = await hasBadge(account);

        // Ensure result is defined and destructure properly
        if (result) {
          const { assets: mappedAssets, badgeValue } = result;

          console.log("Mapped Assets: ", mappedAssets); // Log the mapped assets

          if (badgeValue > 0) {
            setUserHasLoan(true);
            setDebtValue(badgeValue);

            // Update the assetsStats state with mapped assets
            const updatedAssets = mappedAssets.map((asset: any, index: number) => {
              console.log("AssetName: ", collateralAssets[asset.assetName]);
              return {
                amount: asset.amount,
                assetName: collateralAssets[asset.assetName] || `unknown${index + 1}`, // Fallback in case assetName is missing
              };
            });

            setAssetsStats(updatedAssets); // Update assetsStats with the new mapped assets
          } else {
            setUserHasLoan(false);
          }
        }
      }
    };

    checkBadge();
  }, [account]);

  async function onEstimateLoan(values: z.infer<typeof formSchema>) {
    const mapCoins = new Map<string, number>([
      [XRD_Resource, values.amount1 ?? 0], // XRD
    ]);
    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: generateEstimateLoan(componentAddress, mapCoins),
    });

    if (result.isErr()) throw result.error;

    const committedDetailsJson = await gatewayApi.transaction.getCommittedDetails(
      result.value.transactionIntentHash
    );

    const committedDetails = JSON.parse(JSON.stringify(committedDetailsJson));
    const events = committedDetails.transaction?.receipt?.events || [];

    const estimateLoanEvent = events.find(
      (event: any) => event.name === "EstimateLoanEvent"
    );

    if (estimateLoanEvent) {
      const data = estimateLoanEvent?.data || [];

      if (Array.isArray(data.fields)) {
        const valueField = data.fields.find(
          (field: any) => field.field_name === "value"
        );

        const loanValue = valueField ? valueField.value : null;
        console.log("Loan Estimated Value: ", loanValue);
        setRadishAmountReturned(loanValue);
      } else {
        console.error("No fields found in the data");
      }
    } else {
      console.error("EstimateLoanEvent not found");
    }
  }

  async function onDepositAssets(values: z.infer<typeof formSchema>) {
    const mapCoins = new Map<string, number>([
      [XRD_Resource, values.amount1 ?? 0], // XRD
    ]);
    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: generateGetLoan(account.address, componentAddress, mapCoins),
    });


    if (result.isErr()) throw result.error;

    const committedDetailsJson = await gatewayApi.transaction.getCommittedDetails(
      result.value.transactionIntentHash
    );
    console.log("Committed: ", committedDetailsJson);
    alert("Collateral successfully deposited.")
  }


  const handleAddAsset = () => {
    if (visibleFields < 3) {
      setVisibleFields(visibleFields + 1);
    }
  };

  const handleRemoveAsset = () => {
    if (visibleFields > 1) {
      setVisibleFields(visibleFields - 1);
    }
  };

  async function handleEstimateWithdraw(e: any) {
    e.preventDefault(); // prevent page reload
    if (radishAmountBack > 0) {
      const accountState = await gatewayApi.state.getEntityDetailsVaultAggregated(
        account.address
      );

      const nftID = accountState.non_fungible_resources.items.find(
        (fr) => fr.resource_address === nftBadge_Resource
      )?.vaults.items[0];

      const nftItem = nftID?.items?.length ? nftID.items[0] : ''; // Fallback to an empty string

      const result = await rdt.walletApi.sendTransaction({
        transactionManifest: generateEstimateRepay(account.address, componentAddress, nftBadge_Resource, nftItem, radishAmountBack), //generateEstimateLoan(componentAddress, radishAmountBack),   // !!!!!!!!
      });

      if (result.isErr()) throw result.error;

      console.log("RESUKT: ", result);
      const committedDetailsJson = await gatewayApi.transaction.getCommittedDetails(
        result.value.transactionIntentHash
      );

      const committedDetails = JSON.parse(JSON.stringify(committedDetailsJson));
      const events = committedDetails.transaction?.receipt?.events || [];

      const estimateLoanEvent = events.find(
        (event: any) => event.name === "EstimateRepayEvent"
      );

      if (estimateLoanEvent) {
        const data = estimateLoanEvent?.data || [];
        const entries = data.fields[0].entries;

        const updatedAssets = entries.map((entry: any) => ({
          assetName: collateralAssets[entry.key.value],  // Token name
          amount: parseFloat(entry.value.value).toFixed(2),  // Token amount
        }));
        setEstimatedAssetsStats(updatedAssets);
        console.log(updatedAssets);
        setEstimatedWithdrawShow(true);

      } else {
        console.error("EstimateRepayEvent not found");
      }
    }
  };

  async function handleWithdraw() {
    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: "",//generateGetLoan(account.address, componentAddress, radishAmountBack), // !!!!!!!!
    });

    if (result.isErr()) throw result.error;

    const committedDetailsJson = await gatewayApi.transaction.getCommittedDetails(
      result.value.transactionIntentHash
    );
    console.log("Committed: ", committedDetailsJson);
    alert("Loan successfully repaid.")
  }

  if (userHasLoan) {
    // HAS A LOAN
    return (
      <div>
        <div style={{ backgroundColor: "#fcfff7", color: "#070707" }} className="min-h-screen">
          <Navbar />
          <main className="p-4">
            <div className="pt-20 flex justify-center items-center px-4">
              <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Loan</CardTitle>
                    <CardDescription></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex"> {/* Flex container to position text and chart side by side */}
                      {/* Left side: Text content */}
                      <div className="flex-1"> {/* This makes the text take available space */}
                        <p style={{ color: "#070707" }} className="text-lg">
                          <p className="font-semibold">Debt:</p>
                          <span className="text-primary ml-6">{debtValue} Radish</span>
                        </p>
                        <p style={{ color: "#070707" }} className="text-lg font-semibold">Collateral:</p>
                        <ul style={{ color: "#070707" }} className="text-lg list-disc ml-10">
                          {assetsStats.map((asset, index) => (
                            <li key={index}>
                              {asset.amount} {asset.assetName}
                            </li>
                          ))}
                        </ul>
                        <p style={{ color: "#070707" }} className="text-lg">
                          <p className="font-semibold">Interest Rate:</p>
                          <span className="text-primary ml-6">{interestRate}%</span>
                        </p>
                      </div>

                      {/* Right side: Pie chart */}
                      <div className="flex-shrink-0 ml-10"> {/* This keeps the pie chart to the right */}
                        <CollateralPieChart assetsStats={assetsStats} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Withdraw Collateral</CardTitle>
                    <CardDescription>
                      Input the amount of Radish you want to deposit, estimate the amount of each asset that you will get back, and withdraw the assets.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form className="space-y-8">
                        <FormItem>
                          <FormLabel>Radish Amount</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Radish amount"
                              step="0.01"
                              value={radishAmountBack}
                              onChange={
                                (e) => setRadishAmountBack(parseFloat(e.target.value))
                              }
                              className="w-[200px]"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            onClick={() => setRadishAmountBack(debtValue)} // Set the value to debtValue when clicked
                            style={{
                              backgroundColor: "#070707",
                              color: "#fcfff7",
                            }}
                          >
                            Max
                          </Button>
                        </FormItem>

                        <Button
                          style={{ backgroundColor: "#fb3640", color: "#fcfff7" }}
                          onClick={handleEstimateWithdraw}
                        >
                          Estimate Collateral
                        </Button>

                        {estimatedWithdrawShow && (
                          <div className="mt-4 p-4 rounded-lg shadow-sm">
                            <p style={{ color: "#070707" }} className="text-lg">
                              <p className="font-semibold">Returned collateral:</p>
                              <ul style={{ color: "#070707" }} className="text-lg list-disc ml-10">
                                {estimatedAssetsStats.map((asset, index) => (
                                  <li key={index}>
                                    {asset.amount} {asset.assetName}
                                  </li>
                                ))}
                              </ul>
                            </p>
                            <div className="mt-4">
                              <Button
                                type="button"
                                style={{ backgroundColor: "#fb3640", color: "#fcfff7" }}
                                onClick={handleWithdraw}
                              >
                                Withdraw
                              </Button>
                            </div>
                          </div>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
          <div className="absolute inset-0 pointer-events-none z-0">
            <ShootingStars />
            <StarsBackground />
          </div>
        </div>
        <Footer />
      </div>

    );
  }

  // NO LOAN
  return (
    <div>
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#fcfff7", color: "#070707" }}>
        <Navbar />
        <main className="p-4">
          <div className="pt-20 flex justify-center items-center px-4">
            <div className="text-4xl mx-auto font-normal">
              <Card>
                <CardHeader>
                  <CardTitle>Deposit Collateral</CardTitle>
                  <CardDescription>
                    Choose assets of your choice, estimate the loan in Radish, and
                    deposit collateral in the assets of your choice.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onEstimateLoan)}
                      className="space-y-8"
                    >
                      {/* First Asset Input */}
                      <FormField
                        control={form.control}
                        name="amount1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deposit Asset 1</FormLabel>
                            <div className="flex items-center space-x-4">
                              <Select
                                onValueChange={(value) =>
                                  setSelectedAssets((prev) => ({
                                    ...prev,
                                    field1: value,
                                  }))
                                }
                                defaultValue={selectedAssets.field1}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Select asset" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={asset1}>{asset1}</SelectItem>
                                  <SelectItem value={asset2}>{asset2}</SelectItem>
                                  <SelectItem value={asset3}>{asset3}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Second Asset Input */}
                      {visibleFields >= 2 && (
                        <FormField
                          control={form.control}
                          name="amount2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deposit Asset 2</FormLabel>
                              <div className="flex items-center space-x-4">
                                <Select
                                  onValueChange={(value) =>
                                    setSelectedAssets((prev) => ({
                                      ...prev,
                                      field2: value,
                                    }))
                                  }
                                  defaultValue={selectedAssets.field2}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select asset" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={asset1}>{asset1}</SelectItem>
                                    <SelectItem value={asset2}>{asset2}</SelectItem>
                                    <SelectItem value={asset3}>{asset3}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* Third Asset Input */}
                      {visibleFields >= 3 && (
                        <FormField
                          control={form.control}
                          name="amount3"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deposit Asset 3</FormLabel>
                              <div className="flex items-center space-x-4">
                                <Select
                                  onValueChange={(value) =>
                                    setSelectedAssets((prev) => ({
                                      ...prev,
                                      field3: value,
                                    }))
                                  }
                                  defaultValue={selectedAssets.field3}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select asset" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={asset1}>{asset1}</SelectItem>
                                    <SelectItem value={asset2}>{asset2}</SelectItem>
                                    <SelectItem value={asset3}>{asset3}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Amount"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* "+" Button to Add More Assets */}
                      <div className="flex justify-center space-x-4">
                        {visibleFields < 3 && (
                          <Button
                            type="button"
                            onClick={handleAddAsset}
                            style={{
                              backgroundColor: "#070707",
                              color: "#fcfff7",
                            }}
                          >
                            <PlusIcon className="mr-2" />
                          </Button>
                        )}

                        {visibleFields > 1 && (
                          <Button
                            type="button"
                            onClick={handleRemoveAsset}
                            style={{
                              backgroundColor: "#070707",
                              color: "#fcfff7",
                            }}
                          >
                            <MinusIcon className="mr-2" />
                          </Button>
                        )}
                      </div>

                      <Button
                        type="submit"
                        style={{
                          backgroundColor: "#fb3640",
                          color: "#fcfff7",
                        }}
                      >
                        Estimate Loan
                      </Button>

                      {radishAmountReturned > 0 && (
                        <div className="mt-4 p-4 rounded-lg shadow-sm">
                          <p style={{
                            color: "#070707",
                          }} className="text-lg font-semibold">
                            Estimated Value:
                            <span className="text-primary font-bold"> {radishAmountReturned} Radish</span>
                          </p>
                          <div className="mt-4">
                            <Button
                              type="button"
                              onClick={() => onDepositAssets(form.getValues())}
                              style={{
                                backgroundColor: "#fb3640",
                                color: "#fcfff7",
                              }}
                            >
                              Deposit Assets
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <div className="absolute inset-0 pointer-events-none z-0">
          <ShootingStars />
          <StarsBackground />
        </div>
      </div>
      <Footer />
    </div>
  );
}
