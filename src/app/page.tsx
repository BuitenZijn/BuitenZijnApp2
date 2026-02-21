import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "BuitenZijn - Samen buiten zijn",
  description: "VZW BuitenZijn - Ontdek de natuur samen met ons",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-beige-200">
      {/* Header */}
      <header className="py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-navy-800">BuitenZijn</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Inloggen</Button>
            </Link>
            <Link href="/register">
              <Button>Registreren</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-navy-800 mb-6">
            Samen <span className="text-green-500">buiten</span> zijn
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ontdek de natuur samen met onze VZW. Word lid en neem deel aan
            wandelingen, fietstochten en andere buitenactiviteiten in je buurt.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Word lid</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Al lid? Log in
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Gemeenschap card clickable */}
          <Link href="#" className="block">
            <div className="bg-white rounded-xl p-6 shadow-md text-center cursor-pointer hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gemeenschap
              </h3>
              <p className="text-gray-600">
                Maak deel uit van een actieve gemeenschap van natuurliefhebbers.
              </p>
            </div>
          </Link>

          {/* Activiteiten card clickable and links to activiteiten page */}
          <Link href="/activiteiten" className="block">
            <div className="bg-white rounded-xl p-6 shadow-md text-center cursor-pointer hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Activiteiten
              </h3>
              <p className="text-gray-600">
                Regelmatige wandelingen, fietstochten en andere
                buitenactiviteiten.
              </p>
            </div>
          </Link>

          {/* Natuur card clickable */}
          <Link href="#" className="block">
            <div className="bg-white rounded-xl p-6 shadow-md text-center cursor-pointer hover:shadow-lg transition">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Natuur
              </h3>
              <p className="text-gray-600">
                Ontdek de mooiste plekjes in de natuur met ervaren gidsen.
              </p>
            </div>
          </Link>
        </div>
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
