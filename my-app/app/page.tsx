import Image from "next/image";
import Navbar from "@/components/ui/navbar";
import { FlipWords } from "@/components/ui/flip-words";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  const words = ["This is Radish", "Built on Radix"];
  const description =
    "Multi-collateralized Lending DApp. Diversify your collateral and mint stablecoins for your financial needs.";

  return (
    <div style={{ backgroundColor: "#fcfff7", color: "#070707" }}>
      <Navbar />
      <main className="p-4 h-screen">
        <div className="h-full flex justify-center items-center px-4">
          <div className="text-center text-8xl font-normal" style={{ color: "#070707" }}>
            <FlipWords words={words} /> <br />

            {/* Description with limited width */}
            <p className="text-xl mt-4 max-w-xl mx-auto" style={{ color: "#070707" }}>
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
        </div>
      </main>

      <div className="absolute inset-0 pointer-events-none z-0">
        <ShootingStars />
        <StarsBackground />
      </div>
      <Footer />
    </div>
  );
}
