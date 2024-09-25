import Link from "next/link";
import { Button } from "@/components/ui/button"; // You can style this button based on your theme

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-100 py-10 mt-16">
      <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
        <div className="flex space-x-6">
          <a href="https://github.com/Kirillr-Sibirski/radish" target="_blank" className="hover:text-gray-300">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
