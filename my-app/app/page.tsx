import Image from "next/image";
import Navbar from "@/components/ui/navbar";
import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function Home() {
  const words = ["This is Radish", "Built on Radix"];
  const description =
    "Radish is an innovative lending platform built on the Radix blockchain, leveraging asset-oriented programming to offer multi-token collateral support. Diversify your collateral and mint stablecoins for your financial needs.";

  return (
    <div style={{ backgroundColor: "#fcfff7", color: "#070707" }}>
      <Navbar />
      <main className="p-4 h-screen flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="text-8xl font-normal mb-6" style={{ color: "#070707" }}>
            <FlipWords words={words} />
          </div>

          {/* Description */}
          <p className="text-xl max-w-2xl mx-auto mb-12" style={{ color: "#070707" }}>
            {description}
          </p>

          {/* Button */}
          <Link href="/app">
            <Button
              className="px-10 py-8 text-lg" // Larger padding and font size
              style={{ backgroundColor: "#fb3640", color: "#fcfff7" }}
            >
              Launch App
            </Button>
          </Link>
        </div>
      </main>

      <div className="absolute inset-0 pointer-events-none z-0">
        <ShootingStars />
        <StarsBackground />
      </div>
    </div>
  );
}
