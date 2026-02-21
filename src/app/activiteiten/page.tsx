import Link from "next/link";
import { Card } from "@/components/ui";

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
        </div>
      </div>
    </div>
  );
}
