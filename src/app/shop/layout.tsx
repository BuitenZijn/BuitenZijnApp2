import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-beige-200 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="py-8 px-6 border-t border-beige-300 bg-white">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} VZW BuitenZijn. Alle rechten
            voorbehouden.
          </p>
        </div>
      </footer>
    </div>
  );
}
