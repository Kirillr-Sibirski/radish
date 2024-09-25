"use client";

import { useState } from "react";
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

// Updated Zod schema for four independent "amount" fields
const formSchema = z.object({
  amount1: z.number().min(2).max(50), // Validation for first amount
  amount2: z.number().min(2).max(50), // Validation for second amount
  amount3: z.number().min(2).max(50), // Validation for third amount
  amount4: z.number().min(0).max(50).optional(), // Optional amount for fourth field
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert("Submitted");
  }

  return (
    <div>
      <Navbar />
      <main className="p-4">
        <div className="h-[40rem] flex justify-center items-center px-4">
          <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
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
                            {...field}
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
                            {...field}
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
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Estimate Loan</Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
