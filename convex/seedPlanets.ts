import { mutation } from "./_generated/server";

/**
 * Seed the ella_planets table with 9 planets.
 * Run via: npx convex run seedPlanets:seed
 */

const PLANETS = [
  {
    nummer: 1,
    nederlandseNaam: "Mercurius",
    wetenschappelijkeNaam: "Mercurius",
    korteBeschrijving: "De kleinste planeet en het dichtst bij de zon.",
    leukWeetje:
      "Hoewel hij het dichtst bij de zon staat, is hij niet de warmste planeet (dat is Venus).",
  },
  {
    nummer: 2,
    nederlandseNaam: "Venus",
    wetenschappelijkeNaam: "Venus",
    korteBeschrijving: "Een planeet met een extreem dikke, giftige atmosfeer.",
    leukWeetje:
      "Op Venus regent het zwavelzuur, maar het is er zo heet dat de regen verdampt voordat het de grond raakt.",
  },
  {
    nummer: 3,
    nederlandseNaam: "Aarde",
    wetenschappelijkeNaam: "Terra",
    korteBeschrijving: "Onze thuisbasis en de enige bekende planeet met leven.",
    leukWeetje:
      "De Aarde is de enige planeet die niet vernoemd is naar een Griekse of Romeinse god.",
  },
  {
    nummer: 4,
    nederlandseNaam: "Mars",
    wetenschappelijkeNaam: "Mars",
    korteBeschrijving: 'De "Rode Planeet", bekend om zijn ijzeroxide-stof.',
    leukWeetje:
      "Mars heeft de hoogste berg van het zonnestelsel, Olympus Mons, die drie keer zo hoog is als de Mount Everest.",
  },
  {
    nummer: 5,
    nederlandseNaam: "Jupiter",
    wetenschappelijkeNaam: "Iuppiter",
    korteBeschrijving:
      "De grootste planeet, een gasreus met meer dan 90 manen.",
    leukWeetje:
      'De "Grote Rode Vlek" op Jupiter is een storm die al minstens 350 jaar onafgebroken raast.',
  },
  {
    nummer: 6,
    nederlandseNaam: "Saturnus",
    wetenschappelijkeNaam: "Saturnus",
    korteBeschrijving: "Een gasreus met het meest uitgebreide ringsysteem.",
    leukWeetje:
      "Saturnus heeft een zo lage dichtheid dat de planeet zou blijven drijven als je een badkuip had die groot genoeg was.",
  },
  {
    nummer: 7,
    nederlandseNaam: "Uranus",
    wetenschappelijkeNaam: "Uranus",
    korteBeschrijving: "Een ijsreus die op zijn kant om de zon rolt.",
    leukWeetje:
      "Uranus is de koudste planeet in ons zonnestelsel, met temperaturen tot wel -224°C.",
  },
  {
    nummer: 8,
    nederlandseNaam: "Neptunus",
    wetenschappelijkeNaam: "Neptunus",
    korteBeschrijving: "De verste planeet, bekend om zijn felle blauwe kleur.",
    leukWeetje:
      "Op Neptunus waaien de krachtigste winden van het zonnestelsel, met snelheden tot 2.100 km/u.",
  },
  {
    nummer: 9,
    nederlandseNaam: "Pluto (Dwergplaneet)",
    wetenschappelijkeNaam: "Pluto",
    korteBeschrijving: "Een ijzige wereld in de Kuipergordel.",
    leukWeetje:
      "Sinds 2006 wordt Pluto niet meer als een volwaardige planeet gezien, maar als een dwergplaneet.",
  },
];

export const seed = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("ella_planets").first();

    if (existing) {
      console.log("ella_planets table already has data, skipping seed.");
      return { inserted: 0, message: "Already seeded" };
    }

    for (const planet of PLANETS) {
      await ctx.db.insert("ella_planets", {
        ...planet,
        createdAt: Date.now(),
      });
    }

    console.log(`Seeded ${PLANETS.length} planets.`);
    return { inserted: PLANETS.length, message: "Seeded successfully" };
  },
});
