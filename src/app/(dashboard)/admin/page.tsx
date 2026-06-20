import { Metadata } from "next";
import Link from "next/link";
import {
  UserGroupIcon,
  MusicalNoteIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  ShoppingBagIcon,
  TicketIcon,
  CreditCardIcon,
  QrCodeIcon,
  CalculatorIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Admin - BuitenZijn",
  description: "BuitenZijn beheerpaneel",
};

const sections = [
  {
    title: "Gebruikers",
    description: "Leden en rollen beheren",
    href: "/admin/users",
    icon: UserGroupIcon,
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
  },
  {
    title: "ðŸ’ƒ Lijndans",
    description: "Danskrediet en sessies",
    href: "/admin/linedance/credits",
    icon: CreditCardIcon,
    color: "bg-green-500",
    bgLight: "bg-green-50",
    links: [
      {
        label: "Danskrediet",
        href: "/admin/linedance/credits",
        icon: CreditCardIcon,
      },
      {
        label: "Sessies",
        href: "/admin/linedance/sessions",
        icon: QrCodeIcon,
      },
    ],
  },
  {
    title: "ðŸŽ€ ELLA",
    description: "Knutselen, rekenen, dino's, planeten & memory",
    href: "/admin/ella",
    icon: TicketIcon,
    color: "bg-pink-500",
    bgLight: "bg-pink-50",
    links: [
      { label: "Knutselen", href: "/admin/ella", icon: TicketIcon },
      {
        label: "Rekenen",
        href: "/admin/ella/rekenen",
        icon: CalculatorIcon,
      },
      {
        label: "Dinosaurussen",
        href: "/admin/ella/dinosaurussen",
        icon: GlobeAltIcon,
      },
      {
        label: "Planeten",
        href: "/admin/ella/planeten",
        icon: GlobeAltIcon,
      },
      {
        label: "Memory",
        href: "/admin/ella/memory",
        icon: PuzzlePieceIcon,
      },
    ],
  },
  {
    title: "ðŸŽ¯ Buzz Quiz",
    description: "Quizzen beheren",
    href: "/admin/quizzen",
    icon: PuzzlePieceIcon,
    color: "bg-purple-500",
    bgLight: "bg-purple-50",
  },
  {
    title: "âš½ Prono",
    description: "Pronostiek beheren",
    href: "/admin/prono",
    icon: TrophyIcon,
    color: "bg-emerald-500",
    bgLight: "bg-emerald-50",
  },
  {
    title: "ðŸ›ï¸ Shop",
    description: "Producten en bestellingen",
    href: "/admin/shop",
    icon: ShoppingBagIcon,
    color: "bg-amber-500",
    bgLight: "bg-amber-50",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Beheerpaneel</h1>
        <p className="text-gray-600">
          Navigeer snel naar de verschillende secties.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`${section.bgLight} rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow`}
          >
            <Link href={section.href} className="flex items-center gap-4 p-5">
              <div
                className={`${section.color} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}
              >
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-navy-800 text-lg">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </Link>
            {section.links && (
              <div className="border-t border-gray-200 px-5 py-3 flex flex-wrap gap-2">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

