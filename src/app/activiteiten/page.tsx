"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { useAuth } from "@/app/providers";

const activities = [
  {
    name: "Lijndansen",
    slug: "lijndansen",
    description: "Dansen voor (jong-)senioren.",
  },
  {
    name: "Quiz",
    slug: "quiz",
    description: "Gezellige quizavonden.",
  },
  {
    name: "Opruimacties",
    slug: "opruimacties",
    description: "Samen de natuur schoonmaken.",
  },
  {
    name: "Other",
    slug: "other",
    description: "Andere leuke activiteiten.",
  },
];

export default function ActiviteitenPage() {
  const { user } = useAuth();

  const showElla =
    user?.roles?.includes("admin") || user?.roles?.includes("ella");

  return (
    <div className="min-h-screen bg-beige-200 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-navy-800">Activiteiten</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <Link key={activity.slug} href={`/activiteiten/${activity.slug}`}>
              <div className="cursor-pointer">
                <Card>
                  <h2 className="text-xl font-semibold mb-2">
                    {activity.name}
                  </h2>
                  <p className="text-gray-600">{activity.description}</p>
                </Card>
              </div>
            </Link>
          ))}

          {showElla && (
            <Link href="/activiteiten/ella">
              <div className="cursor-pointer">
                <div className="bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 rounded-xl shadow-md p-6 hover:shadow-lg hover:scale-[1.02] transition-all border border-pink-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎀</span>
                    <h2 className="text-xl font-semibold text-pink-700">
                      ELLA
                    </h2>
                  </div>
                  <p className="text-pink-600/80">
                    Knutselen, rekenen en meer voor ELLA!
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
