import Image from "next/image";
import Navbar from "@/components/ui/navbar";


export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold">Welcome to My Project</h1>
        <p>This is the homepage content.</p>
      </main>
    </div>
  );
}
