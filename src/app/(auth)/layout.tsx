import { ReactNode } from "react";
import { Header, Footer } from "@/components/layout";

/**
 * Auth Layout
 *
 * Shared layout for all authentication pages (login, register, etc.)
 */

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-beige-200 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
