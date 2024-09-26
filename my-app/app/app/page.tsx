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
import { generateEstimateLoan, generateGetLoan } from "../manifests";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";
import { Footer } from "@/components/ui/footer";

const componentAddress = "component_tdx_2_1cpa35yv2mq98wq3zge7es24ekt8h77svgas9yfulgrh2caslhhc8zn";
const nftBadge_Resource = "resource_tdx_2_1nfym4crpx56kzvntgc6czk2a539kkp0d4xj25erlsp9zlp2d8u3dj3";
const dAppDefinitionAddress = "account_tdx_2_12y47w6wsqelpnucy8zjduqdzdq2vq3m56nsudnf73v6yf7h2n237zw";
const RSH_Resource = "resource_tdx_2_1th63vvjmc6hd7fjrj94zw6h7uqcx9mx6fy57hnsh3z29gdt2kx2um4";

// Collateral assets - addresses
const XDR_Resource = "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc";
const HUG_Resource = "";
const USDT_Resource = "";

// Collateral assets - tickets
const asset1 = "XDR"
const asset2 = "HUG"
const asset3 = "USDT"


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
    )?.vaults.items[0] ?? 0;
  console.log("!!!!!", getNFTBalance)
  if (getNFTBalance != 0 || getNFTBalance != null) {
    return true;
  } else {
    return false;
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
    field1: "XRD",
    field2: "RAD",
    field3: "HUD",
  });

  const [visibleFields, setVisibleFields] = useState(1); // Control the number of visible asset input fields
  const [radishAmountReturned, setRadishAmountReturned] = useState(0);
  const [userHasLoan, setUserHasLoan] = useState(false); // To check if the user has an active loan
  const [estimatedValueWithdraw, setEstimatedValueWithdraw] = useState(0);
  const [radishAmount, setRadishAmount] = useState(0); // Amount to deposit
  const [debtValue, setDebtValue] = useState(0);
  const [assetsStats, setAssetsStats] = useState([
    { amount: 0.123, assetName: asset1 },
    { amount: 23, assetName: asset2 },
    { amount: 23, assetName: asset3 }
  ]);


  useEffect(() => {
    const checkBadge = async () => {
      if (account) {
        const hasNFTBadge = await hasBadge(account);
        console.log("!!!!!", hasNFTBadge)
        if (hasNFTBadge) {
          setUserHasLoan(true);
        } else {
          setUserHasLoan(false);
        }
      }
    };

    checkBadge();
  }, []);

  async function onEstimateLoan(values: z.infer<typeof formSchema>) {
    const mapCoins = new Map<string, number>([
      [XDR_Resource, values.amount1 ?? 0], // XRD
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
      [XDR_Resource, values.amount1 ?? 0], // XRD
    ]);
    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: generateGetLoan(account.address, componentAddress, mapCoins),
    });


    if (result.isErr()) throw result.error;

    const committedDetailsJson = await gatewayApi.transaction.getCommittedDetails(
      result.value.transactionIntentHash
    );
    console.log("Committed: ", committedDetailsJson);
  }


  // Function to add an additional asset selection field
  const handleAddAsset = () => {
    if (visibleFields < 3) {
      setVisibleFields(visibleFields + 1);
    }
  };

  // Function to collapse an asset selection field
  const handleRemoveAsset = () => {
    if (visibleFields > 1) {
      setVisibleFields(visibleFields - 1);
    }
  };

  // Function to simulate the withdrawal estimate
  const handleEstimateWithdraw = () => {
    const estimate = radishAmount * 1.2;
    setEstimatedValueWithdraw(estimate);
  };

  // Function to handle withdrawal
  const handleWithdraw = () => {
    alert("Withdraw initiated!");
  };

  if (userHasLoan) {
    // Render the withdrawal functionality card if the user has a loan
    return (
      <div style={{ backgroundColor: "#fcfff7", color: "#070707" }}>
        <Navbar />
        <main className="p-4">
          <div className="h-[40rem] flex justify-center items-center px-4">
            <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
              <Card>
                <CardHeader>
                  <CardTitle>Your Loan</CardTitle>
                  <CardDescription>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p style={{
                    color: "#070707",
                  }} className="text-lg">
                    <p className="font-semibold">Debt:</p>
                    <span className="text-primary ml-6"> {debtValue} Radish</span>
                  </p>
                  <p
                    style={{
                      color: "#070707",
                    }}
                    className="text-lg font-semibold"
                  >
                    Collateral:
                  </p>
                  <ul style={{
                      color: "#070707",
                    }}
                    className="text-lg list-disc ml-10">
                    {assetsStats.map((asset, index) => (
                      <li key={index}>
                        {asset.amount} {asset.assetName}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Collateral</CardTitle>
                  <CardDescription>
                    Input the amount of Radish you want to deposit, estimate the
                    amount of each asset that you will get back, and withdraw
                    the assets.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form className="space-y-8">
                      <FormItem>
                        <FormLabel>Radish Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter Radish amount"
                            value={radishAmount}
                            onChange={(e) =>
                              setRadishAmount(parseFloat(e.target.value) || 0)
                            }
                            className="w-[200px]"
                          />
                        </FormControl>
                      </FormItem>

                      <Button
                        style={{
                          backgroundColor: "#fb3640",
                          color: "#fcfff7",
                        }}
                        onClick={handleEstimateWithdraw}
                      >
                        Estimate
                      </Button>

                      {estimatedValueWithdraw > 0 && (
                        <Card>
                          <CardContent>
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-sm">
                              <p style={{
                                color: "#070707",
                              }} className="text-lg font-semibold">
                                Estimated Value:
                                <span className="text-primary font-bold"> {estimatedValueWithdraw} Radish</span>
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="mt-4">
                        <Button
                          style={{
                            backgroundColor: "#fb3640",
                            color: "#fcfff7",
                          }}
                          onClick={handleWithdraw}
                        >
                          Withdraw
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render the deposit functionality card if the user doesn't have a loan
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
                            Add Asset
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
                            Remove Asset
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
