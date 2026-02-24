import { mutation } from "./_generated/server";

/**
 * Seed the ella_dinosaurs table with 21 dinosaurs.
 * Run via Convex dashboard: npx convex run seedDinosaurs:seed
 */

const DINOSAURS = [
  {
    nummer: 1,
    nederlandseNaam: "Tyrannosaurus Rex",
    wetenschappelijkeNaam: "Tyrannosaurus rex",
    korteBeschrijving:
      "De T-Rex was een van de grootste vleeseters die ooit op aarde heeft geleefd. Hij had enorme kaken met scherpe tanden zo groot als bananen!",
    leukWeetje:
      "De armpjes van de T-Rex waren zo kort dat hij niet eens bij zijn eigen mond kon!",
  },
  {
    nummer: 2,
    nederlandseNaam: "Triceratops",
    wetenschappelijkeNaam: "Triceratops horridus",
    korteBeschrijving:
      "De Triceratops had drie hoorns op zijn kop en een groot nekschild. Hij was een plantenetende dinosaurus zo groot als een vrachtwagen.",
    leukWeetje:
      "Triceratops betekent 'gezicht met drie hoorns'. Zijn nekschild was gemaakt van massief bot!",
  },
  {
    nummer: 3,
    nederlandseNaam: "Stegosaurus",
    wetenschappelijkeNaam: "Stegosaurus stenops",
    korteBeschrijving:
      "De Stegosaurus had grote driehoekige platen op zijn rug en stekels aan zijn staart. Hij at planten en was zo groot als een bus.",
    leukWeetje:
      "De hersenen van de Stegosaurus waren zo groot als een walnoot, terwijl hij zo groot was als een bus!",
  },
  {
    nummer: 4,
    nederlandseNaam: "Brachiosaurus",
    wetenschappelijkeNaam: "Brachiosaurus altithorax",
    korteBeschrijving:
      "De Brachiosaurus was een reusachtige plantenetende dinosaurus met een superlaaaaange nek. Hij kon bladeren eten uit de hoogste boomtoppen.",
    leukWeetje:
      "Een Brachiosaurus woog evenveel als 10 olifanten bij elkaar! Dat is meer dan 50.000 kilo.",
  },
  {
    nummer: 5,
    nederlandseNaam: "Velociraptor",
    wetenschappelijkeNaam: "Velociraptor mongoliensis",
    korteBeschrijving:
      "De Velociraptor was een kleine maar slimme vleeseter. Hij jaagde in groepen en had een scherpe klauw op elke voet.",
    leukWeetje:
      "In het echt was de Velociraptor maar zo groot als een kalkoen, veel kleiner dan in de films!",
  },
  {
    nummer: 6,
    nederlandseNaam: "Diplodocus",
    wetenschappelijkeNaam: "Diplodocus carnegii",
    korteBeschrijving:
      "De Diplodocus was een van de langste dinosaurussen ooit, met een staart als een zweep en een nek als een hijskraan.",
    leukWeetje:
      "De staart van de Diplodocus kon zo snel zwaaien dat hij een knal maakte als een zweep. Boem!",
  },
  {
    nummer: 7,
    nederlandseNaam: "Spinosaurus",
    wetenschappelijkeNaam: "Spinosaurus aegyptiacus",
    korteBeschrijving:
      "De Spinosaurus was de grootste vleeseter ooit, nog groter dan de T-Rex! Hij had een grote zeil op zijn rug en at graag vis.",
    leukWeetje:
      "De Spinosaurus is de enige bekende dinosaurus die kon zwemmen en in het water leefde, net als een krokodil!",
  },
  {
    nummer: 8,
    nederlandseNaam: "Ankylosaurus",
    wetenschappelijkeNaam: "Ankylosaurus magniventris",
    korteBeschrijving:
      "De Ankylosaurus was een levende tank! Hij had een pantser van botten op zijn rug en een zware knots aan zijn staart.",
    leukWeetje:
      "De staartknots van de Ankylosaurus was zo sterk dat hij de botten van een T-Rex kon breken!",
  },
  {
    nummer: 9,
    nederlandseNaam: "Parasaurolophus",
    wetenschappelijkeNaam: "Parasaurolophus walkeri",
    korteBeschrijving:
      "De Parasaurolophus had een lange, holle kam op zijn hoofd. Hij at planten en liep op twee of vier poten.",
    leukWeetje:
      "De kam op zijn hoofd werkte als een trompet waarmee hij geluiden kon maken om met andere dino's te praten!",
  },
  {
    nummer: 10,
    nederlandseNaam: "Allosaurus",
    wetenschappelijkeNaam: "Allosaurus fragilis",
    korteBeschrijving:
      "De Allosaurus was een grote vleeseter die leefde vóór de T-Rex. Hij had sterke armen en scherpe klauwen.",
    leukWeetje:
      "De Allosaurus kon zijn bek superwijd openen, bijna als een slang, om grote happen vlees te nemen!",
  },
  {
    nummer: 11,
    nederlandseNaam: "Iguanodon",
    wetenschappelijkeNaam: "Iguanodon bernissartensis",
    korteBeschrijving:
      "De Iguanodon was een van de eerste dinosaurussen die ooit ontdekt werd. Hij had een speciale duimstekel op elke hand.",
    leukWeetje:
      "Er zijn heel veel Iguanodon-skeletten gevonden in België, in een kolenmijn in Bernissart!",
  },
  {
    nummer: 12,
    nederlandseNaam: "Pachycephalosaurus",
    wetenschappelijkeNaam: "Pachycephalosaurus wyomingensis",
    korteBeschrijving:
      "De Pachycephalosaurus had een superverdikt schedeldak. Wetenschappers denken dat hij hiermee kopstoten gaf!",
    leukWeetje:
      "Zijn schedel was 25 centimeter dik! Dat is dikker dan een baksteen.",
  },
  {
    nummer: 13,
    nederlandseNaam: "Compsognathus",
    wetenschappelijkeNaam: "Compsognathus longipes",
    korteBeschrijving:
      "De Compsognathus was een van de kleinste dinosaurussen. Hij was zo groot als een kip en at insecten en hagedissen.",
    leukWeetje:
      "De Compsognathus was zo klein en snel dat hij waarschijnlijk op insecten jaagde, net als een kip!",
  },
  {
    nummer: 14,
    nederlandseNaam: "Carnotaurus",
    wetenschappelijkeNaam: "Carnotaurus sastrei",
    korteBeschrijving:
      "De Carnotaurus had twee hoorns boven zijn ogen en was een snelle jager. Zijn armpjes waren nog kleiner dan die van de T-Rex!",
    leukWeetje:
      "Carnotaurus betekent 'vleesetende stier' vanwege zijn twee stierachtige hoorns!",
  },
  {
    nummer: 15,
    nederlandseNaam: "Archaeopteryx",
    wetenschappelijkeNaam: "Archaeopteryx lithographica",
    korteBeschrijving:
      "De Archaeopteryx was half dinosaurus, half vogel. Hij had veren en vleugels maar ook tanden en een staart met botten.",
    leukWeetje:
      "De Archaeopteryx is het bewijs dat vogels eigenlijk dinosaurussen zijn! Jouw parkiet is dus een mini-dino.",
  },
  {
    nummer: 16,
    nederlandseNaam: "Dilophosaurus",
    wetenschappelijkeNaam: "Dilophosaurus wetherilli",
    korteBeschrijving:
      "De Dilophosaurus had twee kammen op zijn hoofd en was een van de eerste grote vleeseters.",
    leukWeetje:
      "In de film Jurassic Park spuugt de Dilophosaurus gif, maar dat is verzonnen! In het echt deed hij dat niet.",
  },
  {
    nummer: 17,
    nederlandseNaam: "Apatosaurus",
    wetenschappelijkeNaam: "Apatosaurus ajax",
    korteBeschrijving:
      "De Apatosaurus was een enorme plantenetende dinosaurus met een lange nek en staart. Hij leek veel op de Brachiosaurus.",
    leukWeetje:
      "De Apatosaurus werd vroeger 'Brontosaurus' genoemd. Wetenschappers ontdekten later dat het dezelfde dino was!",
  },
  {
    nummer: 18,
    nederlandseNaam: "Baryonyx",
    wetenschappelijkeNaam: "Baryonyx walkeri",
    korteBeschrijving:
      "De Baryonyx was een viseter met een lange krokodillensnuit en een grote klauw aan elke hand.",
    leukWeetje:
      "In de buik van een Baryonyx-fossiel vonden wetenschappers resten van vis én een kleine dinosaurus!",
  },
  {
    nummer: 19,
    nederlandseNaam: "Maiasaura",
    wetenschappelijkeNaam: "Maiasaura peeblesorum",
    korteBeschrijving:
      "De Maiasaura was een zorgzame dinosaurusmoeder die nesten bouwde en voor haar baby's zorgde.",
    leukWeetje:
      "Maiasaura betekent 'goede moederhagedis'. Ze is een van de weinige dino's waarvan we weten dat ze voor hun kleintjes zorgden!",
  },
  {
    nummer: 20,
    nederlandseNaam: "Argentinosaurus",
    wetenschappelijkeNaam: "Argentinosaurus huinculensis",
    korteBeschrijving:
      "De Argentinosaurus was misschien wel het zwaarste landdier ooit. Hij woog wel 70.000 kilo!",
    leukWeetje:
      "Eén wervel (ruggengraatbot) van de Argentinosaurus is groter dan een volwassen mens!",
  },
  {
    nummer: 21,
    nederlandseNaam: "Pterodactylus",
    wetenschappelijkeNaam: "Pterodactylus antiquus",
    korteBeschrijving:
      "De Pterodactylus was eigenlijk geen dinosaurus maar een vliegend reptiel! Hij had vleugels van huid en at vis en insecten.",
    leukWeetje:
      "Pterodactylus was het eerste vliegende reptiel dat ooit ontdekt werd, al in 1784!",
  },
];

export const seed = mutation({
  handler: async (ctx) => {
    // Check if data already exists
    const existing = await ctx.db.query("ella_dinosaurs").first();

    if (existing) {
      console.log("ella_dinosaurs table already has data, skipping seed.");
      return { inserted: 0, message: "Already seeded" };
    }

    for (const dino of DINOSAURS) {
      await ctx.db.insert("ella_dinosaurs", {
        ...dino,
        createdAt: Date.now(),
      });
    }

    console.log(`Seeded ${DINOSAURS.length} dinosaurs.`);
    return { inserted: DINOSAURS.length, message: "Seeded successfully" };
  },
});
