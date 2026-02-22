import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Auth Layout
 *
 * Shared layout for all authentication pages (login, register, etc.)
 */

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-beige-200 flex flex-col">
      {/* Shared Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-beige-300">
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
