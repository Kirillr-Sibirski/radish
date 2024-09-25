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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import {
  DataRequestBuilder,
  RadixDappToolkit,
  RadixNetwork,
  Logger,
} from "@radixdlt/radix-dapp-toolkit";
import { generateEstimateLoan } from "../manifests";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

// Zod schema for four independent "amount" fields
const formSchema = z.object({
  amount1: z.number().optional(), // Validation for first amount
  amount2: z.number().optional(), // Validation for second amount
  amount3: z.number().optional(), // Validation for third amount
  amount4: z.number().optional(), // Optional amount for fourth field
});

export default function App() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount1: 0,
      amount2: 0,
      amount3: 0,
      amount4: 0, // Default value for the fourth field
    },
  });

  const [selectedAssets, setSelectedAssets] = useState({
    field1: "XRD",
    field2: "RAD",
    field3: "HUD",
    field4: "None", // Initial value for the fourth field
  });

  const [radishAmountReturned, setRadishAmountReturned] = useState(0);
  const [userHasLoan, setUserHasLoan] = useState(false);
  const [estimatedValueWithdraw, setEstimatedValueWithdraw] = useState(0);
  const [radishAmount, setRadishAmount] = useState(0); // Amount to deposit

  const componentAddress = "component_tdx_2_1crxwj8t0y54sk4kyfl6xlxhzff7tfjecqetexeqhc29xp5vydtcj3u";
  const rdt = RadixDappToolkit({
    dAppDefinitionAddress: "account_tdx_2_128zw2yyy9t9966h2eakq8rhedwfwaylfaz53v84fpaq2jeq8y2eaj8", // invalid address
    networkId: RadixNetwork.Stokenet,
    applicationName: "Radish",
    applicationVersion: "1.0.0",
    logger: Logger(1),
  }); 
  const gatewayApi = GatewayApiClient.initialize(rdt.gatewayApi.clientConfig);

  useEffect(() => {
    // Does the user own any
  }, []);

  // Function to handle form submission
  async function onEstimateLoan(values: z.infer<typeof formSchema>) {
    const mapCoins = new Map<string, number>([
      ["resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc", values.amount1 ?? 0], //XRD
    ]);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!", generateEstimateLoan(componentAddress, mapCoins));
    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: generateEstimateLoan(componentAddress, mapCoins),
    });
    if(result.isErr()) throw result.error;
    const committedDetails = await gatewayApi.transaction.getCommittedDetails(
      result.value.transactionIntentHash
    );
    console.log("Instantiate committed details:", committedDetails);
    console.log("result: ", result);
    setRadishAmount(0); // Set the amount of Radish returned by the contract
  }

  // Function to handle Deposit Assets
  async function onDepositAssets(values: z.infer<typeof formSchema>) {
    const mapCoins = new Map<string, number>([
      ["address1", values.amount1 ?? 0], //XRD
    ]);
    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: "", // Call on deposit function
    });
    console.log("result: ", result);
    alert(`Successful collateral deposit.`);
  }

  const handleEstimateWithdraw = () => {
    const estimate = radishAmount * 1.2;
    setEstimatedValueWithdraw(estimate);
  };

  const handleWithdraw = () => {
    alert("Withdraw initiated!");
  };

  if (userHasLoan) {
    return (
      <div style={{ backgroundColor: "#fcfff7", color: "#070707" }}>
        <Navbar />
        <main className="p-4">
          <div className="h-[40rem] flex justify-center items-center px-4">
            <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
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
                        <div className="mt-4">
                          <p>Estimated value: {estimatedValueWithdraw} Radish</p>
                        </div>
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

  return (
    <div style={{ backgroundColor: "#fcfff7", color: "#070707" }}>
      <Navbar />
      <main className="p-4">
        <div className="h-[40rem] flex justify-center items-center px-4">
          <div className="text-4xl mx-auto font-normal">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Collateral</CardTitle>
                <CardDescription>
                  Choose max 3 assets of your choice, estimate loan in Radish,
                  and deposit collateral in the assets of your choice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onEstimateLoan)}
                    className="space-y-8"
                  >
                    {/* First Input Field */}
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
                                <SelectItem value="XRD">XRD</SelectItem>
                                <SelectItem value="RAD">RAD</SelectItem>
                                <SelectItem value="HUD">HUD</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="amount"
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

                    {/* Second Input Field */}
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
                                <SelectItem value="XRD">XRD</SelectItem>
                                <SelectItem value="RAD">RAD</SelectItem>
                                <SelectItem value="HUD">HUD</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="amount"
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

                    {/* Third Input Field */}
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
                                <SelectItem value="XRD">XRD</SelectItem>
                                <SelectItem value="RAD">RAD</SelectItem>
                                <SelectItem value="HUD">HUD</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="amount"
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
                      <div className="mt-4">
                        <p>Estimated value: {radishAmountReturned} Radish</p>
                      </div>
                    )}

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
  );
}
