import Image from "next/image";
import Navbar from "@/components/ui/navbar";
import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

export default function Home() {
  const ending = ["Radish", "Radix"];
  const words = ["This is", "Built on"]

  return (
    <div>
      <Navbar />
      <main className="p-4">
        <div className="h-[40rem] flex justify-center items-center px-4">
          <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
            <FlipWords words={words} /> <br />
            <FlipWords words={ending} /> <br />
            <Link href="/app">
              <Button>Lauch App</Button>
            </Link>
          </div>
        </div>
        {/* <ShootingStars />
        <StarsBackground /> */}
      </main>
    </div>
  );
}
