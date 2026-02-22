import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quiz - BuitenZijn",
  description: "Doe mee met de BuitenZijn quiz!",
};

const quizEditions = [
  {
    year: 2023,
    color: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    description:
      "De allereerste editie van onze quiz. Kijk terug naar de vragen en antwoorden!",
  },
  {
    year: 2024,
    color: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    description:
      "De tweede editie met nog meer uitdagende vragen over natuur, cultuur en sport.",
  },
  {
    year: 2025,
    color: "from-purple-500 to-pink-600",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    description: "De nieuwste editie! Test je kennis en daag je vrienden uit.",
  },
];

export default function QuizPage() {
  return (
    <div className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy-800 mb-4">
            BuitenZijn Quiz
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Elk jaar organiseren we een leuke quiz. Bekijk hier de verschillende
            edities!
          </p>
        </div>

        {/* Quiz cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quizEditions.map((quiz) => (
            <Link
              key={quiz.year}
              href={`/activiteiten/quiz/${quiz.year}`}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                {/* Gradient header */}
                <div
                  className={`h-40 bg-gradient-to-br ${quiz.color} flex items-center justify-center relative`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="relative text-center">
                    <div className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">
                      Quiz
                    </div>
                    <div className="text-6xl font-extrabold text-white drop-shadow-lg">
                      {quiz.year}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 ${quiz.iconBg} rounded-lg flex items-center justify-center`}
                    >
                      <svg
                        className={`w-5 h-5 ${quiz.iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-navy-800">
                      Quiz {quiz.year}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {quiz.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-navy-700 group-hover:text-navy-900 flex items-center gap-1 transition-colors">
                    Bekijk quiz
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
