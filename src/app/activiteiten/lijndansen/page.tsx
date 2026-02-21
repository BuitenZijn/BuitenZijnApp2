import {
  UserGroupIcon,
  HeartIcon,
  StarIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function LijndansenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-100 to-green-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <AcademicCapIcon className="w-10 h-10 text-green-600" />
          <h1 className="text-4xl font-extrabold text-navy-800">
            Lijndansen voor (jong-)senioren
          </h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            <Link
              href="/activiteiten/lijndansen/beheer"
              className="underline hover:text-green-900"
            >
              Ga naar het lesmateriaal
            </Link>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <CalendarDaysIcon className="w-5 h-5" />
            <span>Elke donderdag (behalve tijdens schoolvakanties)</span>
          </div>
        </div>
        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-2">
            Op zoek naar een leuke activiteit voor zowel lichaam als geest?
          </p>
          <p className="text-gray-600 mb-2">
            Dan is onze cursus lijndansen iets voor jou! Lijndansen is een
            dansstijl waarbij je individueel in lijnen danst. Geen partner
            nodig, alleen jij en de muziek!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
            <HeartIcon className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Blijf bewegen</h3>
            <p className="text-gray-600 text-sm">
              We leren verschillende dansen. Laat je meeslepen door de
              opzwepende melodieën. Goed voor lichaam én geest.
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
            <UserGroupIcon className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Gezelligheid</h3>
            <p className="text-gray-600 text-sm">
              Dans in een groep, ontmoet andere senioren en blijf achteraf
              gezellig plakken.
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
            <StarIcon className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="font-semibold text-lg mb-1">Ervaren begeleiding</h3>
            <p className="text-gray-600 text-sm">
              Onze ervaren instructeurs zorgen ervoor dat je de pasjes onder de
              knie krijgt. Iedereen is welkom!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-2 bg-white border rounded-lg p-4 shadow-sm">
            <CalendarDaysIcon className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-semibold">Uur</div>
              <div className="text-gray-700">14u00-15u00</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border rounded-lg p-4 shadow-sm">
            <MapPinIcon className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-semibold">Locatie</div>
              <div className="text-gray-700">Sporthal Meermin, Waasmunster</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border rounded-lg p-4 shadow-sm">
            <CurrencyEuroIcon className="w-6 h-6 text-yellow-600" />
            <div>
              <div className="font-semibold">Prijs</div>
              <div className="text-gray-700">
                6 euro per les
                <br />
                25 euro voor een vijfbeurtenkaart
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-100 rounded-xl p-4 text-center mb-4">
          <p className="font-semibold text-green-900">
            We verwelkomen je graag op de dansvloer!
          </p>
          <p className="text-green-800">
            Nieuwkomers mogen hun eerste les gratis proberen
          </p>
        </div>
      </div>
    </div>
  );
}
