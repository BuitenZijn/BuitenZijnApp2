import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";

export const metadata: Metadata = {
  title: "BuitenZijn - Samen buiten zijn",
  description: "VZW BuitenZijn - Ontdek de natuur samen met ons",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-beige-200">
      {/* Navbar */}
      <Navbar />

      {/* Hero: Welcome message over video */}
      <section className="relative aspect-video w-full overflow-hidden bg-black">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/buitenzijn_banner.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center drop-shadow-lg leading-tight max-w-4xl">
            Welkom op de website van{" "}
            <span className="text-green-400">VZW BuitenZijn</span>
          </h1>
        </div>
      </section>

      <main>
        {/* Onze Missie */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 text-center mb-12">
              Onze Missie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Missie card 1 */}
              <div className="bg-beige-100 rounded-2xl overflow-hidden shadow-md">
                <div className="relative h-48">
                  <Image
                    src="/natuur_card.jpg"
                    alt="Behoud en promotie lokale natuur"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-800 mb-2">
                    Behoud en Promotie Lokale Natuur
                  </h3>
                  <p className="text-gray-600">
                    VZW BuitenZijn zet zich in voor het behoud en promotie van
                    de lokale natuur.
                  </p>
                </div>
              </div>

              {/* Missie card 2 */}
              <div className="bg-beige-100 rounded-2xl overflow-hidden shadow-md">
                <div className="relative h-48">
                  <Image
                    src="/welzijn_card.jpg"
                    alt="Welzijn lokale bevolking"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-800 mb-2">
                    Welzijn Lokale Bevolking
                  </h3>
                  <p className="text-gray-600">
                    VZW BuitenZijn zet zich in voor het fysieke en mentale
                    welzijn van de lokale bevolking door het organiseren van
                    sportieve en leuke activiteiten.
                  </p>
                </div>
              </div>

              {/* Missie card 3 */}
              <div className="bg-beige-100 rounded-2xl overflow-hidden shadow-md">
                <div className="relative h-48">
                  <Image
                    src="/cultuur_card.png"
                    alt="Stimuleren lokale cultuur"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-800 mb-2">
                    Stimuleren Lokale Cultuur
                  </h3>
                  <p className="text-gray-600">
                    VZW BuitenZijn zet zich in voor het stimuleren van de lokale
                    cultuur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="max-w-4xl mx-auto px-6">
          <hr className="border-beige-300" />
        </div>

        {/* Activiteiten — Upcoming Events */}
        <section className="py-20 px-6 bg-beige-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 text-center mb-4">
              Activiteiten
            </h2>
            <p className="text-gray-600 text-center mb-10">
              Bekijk onze aankomende evenementen
            </p>

            <UpcomingEvents />

            <div className="mt-10 text-center">
              <Link
                href="/activiteiten"
                className="inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Alle activiteiten bekijken
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-beige-300 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <img
            src="/buitenzijn_logo_color.png"
            alt="BuitenZijn"
            className="h-12 w-auto"
          />
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} VZW BuitenZijn. Alle rechten
            voorbehouden.
          </p>
        </div>
      </footer>
    </div>
  );
}
