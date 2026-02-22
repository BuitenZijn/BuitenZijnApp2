import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ year: string }>;
};

const quizData: Record<string, { title: string; content: React.ReactNode }> = {
  "2023": {
    title: "Quiz 2023 - BuitenZijn",
    content: <Quiz2023 />,
  },
  "2024": {
    title: "Quiz 2024 - BuitenZijn",
    content: <Quiz2024 />,
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: quizData[year]?.title ?? `Quiz ${year} - BuitenZijn`,
    description: `BuitenZijn Quiz ${year}`,
  };
}

export default async function QuizYearPage({ params }: Props) {
  const { year } = await params;

  if (year === "2023") {
    return <Quiz2023 />;
  }

  if (year === "2024") {
    return <Quiz2024 />;
  }

  // Placeholder for other years
  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <Link
          href="/activiteiten/quiz"
          className="text-green-600 hover:text-green-700 font-medium mb-8 inline-flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Terug naar overzicht
        </Link>
        <h1 className="text-4xl font-extrabold text-navy-800 mt-6 mb-4">
          Quiz {year}
        </h1>
        <p className="text-gray-600 text-lg">
          De inhoud voor deze quiz-editie wordt binnenkort toegevoegd.
        </p>
      </div>
    </div>
  );
}

function Quiz2023() {
  const images = [
    {
      src: "/quiz_2023/poster.jpg",
      alt: "Quiz 2023 Poster",
      caption: "De affiche",
    },
    { src: "/quiz_2023/jury.jpg", alt: "De jury", caption: "Onze jury" },
    {
      src: "/quiz_2023/eindstand.jpg",
      alt: "Eindstand",
      caption: "De eindstand",
    },
    {
      src: "/quiz_2023/einde.jpg",
      alt: "Einde van de avond",
      caption: "Wat een avond!",
    },
    {
      src: "/quiz_2023/tshirt.jpg",
      alt: "BuitenZijn T-shirt",
      caption: "Het BuitenZijn T-shirt",
    },
    {
      src: "/quiz_2023/quizboom.jpg",
      alt: "Quiz Boom 2023",
      caption: "De BuitenZijn Quiz Boom 2023",
    },
  ];

  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/activiteiten/quiz"
          className="text-green-600 hover:text-green-700 font-medium mb-8 inline-flex items-center gap-1 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Terug naar overzicht
        </Link>

        {/* Header */}
        <div className="mt-6 mb-10">
          <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
            Editie 2023
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy-800 mb-4">
            BuitenZijn Quiz 2023
          </h1>
          <p className="text-lg text-gray-500">
            De allereerste editie van onze quiz — en wat een avond!
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-12">
          <img
            src="/quiz_2023/poster.jpg"
            alt="Quiz 2023 Poster"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none mb-16">
          <p className="text-gray-700 leading-relaxed text-lg">
            Zo… het zit er jammer genoeg al op. De eerste BuitenZijn quiz was
            een groot succes.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Een dikke merci aan alle deelnemers en alle vrijwilligers om er
            samen een geweldige avond van te maken!
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            De lat is gelegd en we nemen jullie feedback mee om volgende editie
            nóg beter uit de hoek te komen..
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Iedereen heeft ongetwijfeld iets opgestoken deze avond en er waren
            dus alleen winnaars maar toch nog een dikke proficiat aan de 3
            allergrootste winnaars van de avond:{" "}
            <strong className="text-navy-800">Wie Niet Drinkt Sterft</strong>,{" "}
            <strong className="text-navy-800">Dis Que Tais Te</strong> &{" "}
            <strong className="text-navy-800">Binnen blijven</strong>! Zeer
            straffe resultaten in een moeilijke quiz!
          </p>
        </article>

        {/* Photo gallery */}
        <h2 className="text-2xl font-bold text-navy-800 mb-6">
          Foto&apos;s van de avond
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {images.map((img) => (
            <div
              key={img.src}
              className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-700">
                  {img.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Boom section */}
        <div className="bg-emerald-50 rounded-2xl p-8 md:p-10 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-emerald-800 mb-3">
                🌳 De BuitenZijn Quiz Boom 2023
              </h3>
              <p className="text-emerald-700 leading-relaxed">
                Er was trouwens heel wat interesse voor het adopteren van de
                BuitenZijn Quiz Boom 2023 ter compensatie van het papiergebruik
                tijdens onze quiz. We zijn verheugd te melden dat deze
                ondertussen een mooie plek kreeg in de Spoorwegstraat te
                Waasmunster. In overleg met zijn nieuwe eigenaars is het een
                prachtige Japanse kerselaar geworden!
              </p>
            </div>
            <div className="w-full md:w-64 flex-shrink-0">
              <img
                src="/quiz_2023/quizboom.jpg"
                alt="BuitenZijn Quiz Boom 2023"
                className="rounded-xl shadow-md w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Back to overview */}
        <div className="text-center">
          <Link
            href="/activiteiten/quiz"
            className="inline-block px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Terug naar alle quizzen
          </Link>
        </div>
      </div>
    </div>
  );
}

function Quiz2024() {
  const images = [
    {
      src: "/quiz_2024/poster.png",
      alt: "Quiz 2024 Poster",
      caption: "De affiche",
    },
    {
      src: "/quiz_2024/luigi_sinterklaas.jpg",
      alt: "Luigi & Sinterklaas",
      caption: "Luigi & Sinterklaas",
    },
    {
      src: "/quiz_2024/eindstand1.png",
      alt: "Eindstand deel 1",
      caption: "Eindstand (1/3)",
    },
    {
      src: "/quiz_2024/eindstand2.png",
      alt: "Eindstand deel 2",
      caption: "Eindstand (2/3)",
    },
    {
      src: "/quiz_2024/eindstand3.png",
      alt: "Eindstand deel 3",
      caption: "Eindstand (3/3)",
    },
    {
      src: "/quiz_2024/winnaar.jpg",
      alt: "De winnaar",
      caption: "Tempeltations 2 — de winnaars!",
    },
  ];

  return (
    <div className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/activiteiten/quiz"
          className="text-blue-600 hover:text-blue-700 font-medium mb-8 inline-flex items-center gap-1 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Terug naar overzicht
        </Link>

        {/* Header */}
        <div className="mt-6 mb-10">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            Editie 2024
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy-800 mb-4">
            BuitenZijn Quiz 2024
          </h1>
          <p className="text-lg text-gray-500">
            32 ploegen, 1 winnaar — razend spannend tot het absolute slot!
          </p>
        </div>

        {/* Hero image */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-12">
          <img
            src="/quiz_2024/poster.png"
            alt="Quiz 2024 Poster"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Content */}
        <article className="prose prose-lg max-w-none mb-16">
          <p className="text-gray-700 leading-relaxed text-lg">
            Met de polyvalente zaal van VTC de Meermin als strijdtoneel, streden
            op zaterdag 7 december, 32 enthousiaste ploegen om de felbegeerde
            prijzen tijdens de jaarlijkse BuitenZijn Quiz.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Met een perfecte mix van competitie en entertainmentgehalte bleef de
            quiz tot in het absolute slot razend spannend.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Tijdens de bliksemvragen kroonden{" "}
            <strong className="text-navy-800">
              &ldquo;Vele Dikke Vrienden&rdquo;
            </strong>
            , <strong className="text-navy-800">&ldquo;Vandallas&rdquo;</strong>{" "}
            en{" "}
            <strong className="text-navy-800">
              &ldquo;Per Consumptie Wijzer&rdquo;
            </strong>{" "}
            zich als de snelheidskampioenen van de avond.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            <strong className="text-navy-800">&ldquo;Archimedes&rdquo;</strong>,
            die lange tijd aan kop stond, werd pas in de allerlaatste ronde
            ingehaald door{" "}
            <strong className="text-navy-800">
              &ldquo;Tempeltations 2&rdquo;
            </strong>{" "}
            en de{" "}
            <strong className="text-navy-800">
              &ldquo;Wandelende Weetjes&rdquo;
            </strong>
            . Uiteindelijk eindigde &ldquo;Archimedes&rdquo; op een
            verdienstelijke derde plaats. De BuitenZijn ronde moest de doorslag
            geven over wie van de 2 uitgeroepen zou worden tot de winnaar:{" "}
            <strong className="text-navy-800">Tempeltations 2!</strong>
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Dikke proficiat aan{" "}
            <strong className="text-navy-800">Tempeltations 2</strong>, de{" "}
            <strong className="text-navy-800">Wandelende Weetjes</strong> en{" "}
            <strong className="text-navy-800">Archimedes</strong> voor hun
            respectievelijke eerste, tweede en derde plaats!
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            De strijd voor plaatsen 12 en 22 werd gewonnen door{" "}
            <strong className="text-navy-800">JDV &amp; Co</strong> en de{" "}
            <strong className="text-navy-800">BuitenWijven</strong>. Goed
            gespeeld.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg">
            Het was alvast een avond om niet snel te vergeten. Wij hebben ons
            goed geamuseerd en hopelijk jullie ook.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg font-semibold">
            Tot volgend jaar!
          </p>
        </article>

        {/* After Movie */}
        <h2 className="text-2xl font-bold text-navy-800 mb-6">After Movie</h2>
        <div className="rounded-2xl overflow-hidden shadow-lg mb-16">
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/7kMZv42DO_I?rel=0"
              title="BuitenZijn Quiz 2024 - After Movie"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Photo gallery */}
        <h2 className="text-2xl font-bold text-navy-800 mb-6">
          Foto&apos;s van de avond
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {images.map((img) => (
            <div
              key={img.src}
              className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-700">
                  {img.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Back to overview */}
        <div className="text-center">
          <Link
            href="/activiteiten/quiz"
            className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Terug naar alle quizzen
          </Link>
        </div>
      </div>
    </div>
  );
}
