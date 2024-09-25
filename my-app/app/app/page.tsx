"use client";

import { useState } from "react";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button"
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  username: z.number().min(2).max(50),
})

export default function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  const [selectedAssets, setSelectedAssets] = useState({
    field1: "RND",
    field2: "RAD",
    field3: "HUD",
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    alert("Submitted")
  }

  return (
    <div>
      <Navbar />
      <main className="p-4">
        <div className="h-[40rem] flex justify-center items-center px-4">
          <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Assets of Your Choice</FormLabel>
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
                          </SelectContent>
                        </Select>
                        <FormControl>
                          <Input placeholder="amount" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Estimate your loan before taking one out
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Estimate Loan</Button>
                {/* <Button type="submit">Deposit Collateral & Take Out a Loan</Button> */}
              </form>
            </Form>
          </div>
        </div>
      </main>
      {/* <ShootingStars />
      <StarsBackground /> */}
    </div>
  );
}
