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
} from "@/components/ui/card"
import {
  DataRequestBuilder,
  RadixDappToolkit,
  RadixNetwork,
  Logger,
} from "@radixdlt/radix-dapp-toolkit";

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
    field1: "RND",
    field2: "RAD",
    field3: "HUD",
    field4: "None", // Initial value for the fourth field
  });

  const [radishAmountReturned, setRadishAmountReturned] = useState(0);
  const [userHasLoan, setUserHasLoan] = useState(false);
  const [estimatedValueWithdraw, setEstimatedValueWithdraw] = useState(0);
  const [radishAmount, setRadishAmount] = useState(0); // Amount to deposit

  const componentAddress = "_RADISH_COMPONENT_ADDRESS_"; // Radiswap component address on Stokenet
  const rdt = RadixDappToolkit({
    dAppDefinitionAddress:
      '',
    networkId: RadixNetwork.Stokenet,
    applicationName: 'Radix Web3 dApp',
    applicationVersion: '1.0.0',
    logger: Logger(1)
  })

  useEffect(() => {
    // check if the user has loan NFT
  }, []);

  // Function to handle form submission
  async function onEstimateLoan(values: z.infer<typeof formSchema>) {
    console.log(values.amount1);
    const result = await rdt.walletApi.sendTransaction({
      transactionManifest: `
    CALL_METHOD
      Address("component_sim1cptxxxxxxxxxfaucetxxxxxxxxx000527798379xxxxxxxxxhkrefh")
      "lock_fee"
      Decimal("5000");
    CALL_METHOD
      Address("component_sim1cpwu4wc6rg0am8l9prnh2lzqkk6hue6stzqhdx48rzvek2mmm5vp0p")
      "estimate_loan"
      Map<Address, Decimal>(
        Address("resource_sim1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxakj8n3") => Decimal("96")
      )
;
    `,
    })
    console.log("result: ", result)
    setRadishAmount(0) //set the amount of radish returned by the contract
  }

  // Function to handle Deposit Assets
  function onDepositAssets(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert(`Deposited assets. You get Radish.`);
  }

  const handleEstimateWithdraw = () => {
    // Simulate an estimate calculation (e.g., Radish * 1.2 for example)
    const estimate = radishAmount * 1.2;
    setEstimatedValueWithdraw(estimate);
  };

  // Function to handle withdrawal (dummy function)
  const handleWithdraw = () => {
    alert("Withdraw initiated!");
  };

  if (userHasLoan) {
    return (
      <div>
        <Navbar />
        <main className="p-4">
          <div className="h-[40rem] flex justify-center items-center px-4">
            <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
              <Card>
                <CardHeader>
                  <CardTitle>Withdraw Collateral</CardTitle>
                  <CardDescription>Input the amount of Radish you want to deposit, estimate the amount of each asset that you will get back, and withdraw the assets.</CardDescription>
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
                            onChange={(e) => setRadishAmount(parseFloat(e.target.value) || 0)}
                            className="w-[200px]"
                          />
                        </FormControl>
                      </FormItem>

                      {/* Estimate button */}
                      <Button onClick={handleEstimateWithdraw}>Estimate</Button>

                      {/* Output for the estimated value */}
                      {estimatedValueWithdraw > 0 && (
                        <div className="mt-4">
                          <p>Estimated value: {estimatedValueWithdraw} Radish</p>
                        </div>
                      )}

                      {/* Withdraw button */}
                      <div className="mt-4">
                        <Button onClick={handleWithdraw}>Withdraw</Button>
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

  // Original content when the userHasLoan is false
  return (
    <div>
      <Navbar />
      {/* <radix-connect-button /> */}
      <main className="p-4">
        <div className="h-[40rem] flex justify-center items-center px-4">
          <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
            <Card>
              <CardHeader>
                <CardTitle>Deposit Collateral</CardTitle>
                <CardDescription>Choose max 3 assets of your choice, estimate loan in Radish, and deposit collateral in the assets of your choice.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onEstimateLoan)} className="space-y-8">

                    {/* First Input Field */}
                    <FormField
                      control={form.control}
                      name="amount1" // Field for first amount
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
                                <SelectItem value="RND">RND</SelectItem>
                                <SelectItem value="RAD">RAD</SelectItem>
                                <SelectItem value="HUD">HUD</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="amount"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} // Parsing string input to number
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
                      name="amount2" // Field for second amount
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
                                <SelectItem value="RND">RND</SelectItem>
                                <SelectItem value="RAD">RAD</SelectItem>
                                <SelectItem value="HUD">HUD</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="amount"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} // Parsing string input to number
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
                      name="amount3" // Field for third amount
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
                                <SelectItem value="RND">RND</SelectItem>
                                <SelectItem value="RAD">RAD</SelectItem>
                                <SelectItem value="HUD">HUD</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="amount"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} // Parsing string input to number
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Estimate Loan</Button>

                    {radishAmountReturned > 0 && (
                      <div className="mt-4">
                        <p>Estimated value: {radishAmountReturned} Radish</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <Button type="button" onClick={() => onDepositAssets(form.getValues())}>
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
    </div>
  );
}
