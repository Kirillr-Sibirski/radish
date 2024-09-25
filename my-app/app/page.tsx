import Image from "next/image";
import Navbar from "@/components/ui/navbar";
import { FlipWords } from "@/components/ui/flip-words";


export default function Home() {
  const ending = ["x", "sh"];
  const words = ["Built on", "This is"]

  return (
    <div>
      <Navbar />
      <main className="p-4">
        <div className="h-[40rem] flex justify-center items-center px-4">
          <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
            <FlipWords words={words} /> <br />
            Radi
            <FlipWords words={ending} /> <br />
          </div>
        </div>
      </main>
    </div>
  );
}
