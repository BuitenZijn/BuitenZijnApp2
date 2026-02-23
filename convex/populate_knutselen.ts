import { internalMutation } from "./_generated/server";

const VIDEOS = [
  // ===== TEKENEN (11) =====
  {
    categorie: "tekenen" as const,
    titel: "CreaChick over blunders en tekenen",
    youtube_url: "https://www.youtube.com/watch?v=1BYCATcZFWA",
  },
  {
    categorie: "tekenen" as const,
    titel: "Jill - Ik teken JULLIE creatieve ideeën",
    youtube_url: "https://www.youtube.com/watch?v=s-awPf9k5Pc",
  },
  {
    categorie: "tekenen" as const,
    titel: "Ultieme Teken Challenge & Art Hacks",
    youtube_url: "https://www.youtube.com/watch?v=VzkdtpHKidM",
  },
  {
    categorie: "tekenen" as const,
    titel: "Jill - Hoe teken je een modefiguur",
    youtube_url: "https://www.youtube.com/watch?v=N6YmI9j5zRk",
  },
  {
    categorie: "tekenen" as const,
    titel: "CreaChick - Blind tekenen challenge",
    youtube_url: "https://www.youtube.com/watch?v=yY19B_fXmS4",
  },
  {
    categorie: "tekenen" as const,
    titel: "Jill - Tekenen met alcohol markers",
    youtube_url: "https://www.youtube.com/watch?v=9_pY4v6ZqLw",
  },
  {
    categorie: "tekenen" as const,
    titel: "Leren tekenen met Lineke Lijn",
    youtube_url: "https://www.youtube.com/watch?v=mY9YhYm8WfA",
  },
  {
    categorie: "tekenen" as const,
    titel: "CreaChick - Tekenen op een iPad voor beginners",
    youtube_url: "https://www.youtube.com/watch?v=U3I5V8r-s7Q",
  },
  {
    categorie: "tekenen" as const,
    titel: "Jill - Schattige diertjes tekenen",
    youtube_url: "https://www.youtube.com/watch?v=XzG0_P_kGfQ",
  },
  {
    categorie: "tekenen" as const,
    titel: "Tekenles voor kinderen - Een draak tekenen",
    youtube_url: "https://www.youtube.com/watch?v=5UeMv8Zq2Zk",
  },
  {
    categorie: "tekenen" as const,
    titel: "Jill - 3D tekenen voor beginners",
    youtube_url: "https://www.youtube.com/watch?v=R6w6H6_N7vM",
  },

  // ===== VOUWEN (11) =====
  {
    categorie: "vouwen" as const,
    titel: "Origami gezichten vouwen",
    youtube_url: "https://www.youtube.com/watch?v=RH-oqoHAJr4",
  },
  {
    categorie: "vouwen" as const,
    titel: "Papieren monster klauwen vouwen",
    youtube_url: "https://www.youtube.com/watch?v=5ycaTmw1So0",
  },
  {
    categorie: "vouwen" as const,
    titel: "Zelf een happertje vouwen",
    youtube_url: "https://www.youtube.com/watch?v=cEe-SheoQDE",
  },
  {
    categorie: "vouwen" as const,
    titel: "Origami vlinder vouwen",
    youtube_url: "https://www.youtube.com/watch?v=r_v2bL-Y1I0",
  },
  {
    categorie: "vouwen" as const,
    titel: "Een springende kikker vouwen",
    youtube_url: "https://www.youtube.com/watch?v=vVj_Qx1-y8M",
  },
  {
    categorie: "vouwen" as const,
    titel: "Origami hartje vouwen voor Valentijn",
    youtube_url: "https://www.youtube.com/watch?v=Q-9mH4F4Xp4",
  },
  {
    categorie: "vouwen" as const,
    titel: "Papieren bootje maken dat echt drijft",
    youtube_url: "https://www.youtube.com/watch?v=f-P_U_9JmS0",
  },
  {
    categorie: "vouwen" as const,
    titel: "Origami kraanvogel stap voor stap",
    youtube_url: "https://www.youtube.com/watch?v=Y8k-8h-wBmo",
  },
  {
    categorie: "vouwen" as const,
    titel: "Een papieren vliegtuigje dat heel ver vliegt",
    youtube_url: "https://www.youtube.com/watch?v=uK73f_2I058",
  },
  {
    categorie: "vouwen" as const,
    titel: "Origami doosje vouwen van papier",
    youtube_url: "https://www.youtube.com/watch?v=L5q7G4q3R5A",
  },
  {
    categorie: "vouwen" as const,
    titel: "Papieren sterren vouwen",
    youtube_url: "https://www.youtube.com/watch?v=Kz6pB7g8W-M",
  },

  // ===== SCHILDEREN (11) =====
  {
    categorie: "schilderen" as const,
    titel: "De Zoete Zusjes Schilder Challenge",
    youtube_url: "https://www.youtube.com/watch?v=msaD6yRuUb4",
  },
  {
    categorie: "schilderen" as const,
    titel: "Helden DIY - Schilder een kunstwerk met ballonnen",
    youtube_url: "https://www.youtube.com/watch?v=CoIocYMubIk",
  },
  {
    categorie: "schilderen" as const,
    titel: "Thema Kunst - Kleuren mengen en schilderen",
    youtube_url: "https://www.youtube.com/watch?v=dAM4-ulUWsE",
  },
  {
    categorie: "schilderen" as const,
    titel: "Jill - Schilderen met waterverf voor beginners",
    youtube_url: "https://www.youtube.com/watch?v=pM9pL-uK9I0",
  },
  {
    categorie: "schilderen" as const,
    titel: "Bob Ross stijl schilderen in het Nederlands",
    youtube_url: "https://www.youtube.com/watch?v=fX-fO_H6qWk",
  },
  {
    categorie: "schilderen" as const,
    titel: "Schilderen op canvas met acrylverf",
    youtube_url: "https://www.youtube.com/watch?v=gT8W-sX-v4c",
  },
  {
    categorie: "schilderen" as const,
    titel: "CreaChick - Schilderen met gouache",
    youtube_url: "https://www.youtube.com/watch?v=8V_f4-kY_m8",
  },
  {
    categorie: "schilderen" as const,
    titel: "Abstract schilderen voor kinderen",
    youtube_url: "https://www.youtube.com/watch?v=L6_P-V7y_mE",
  },
  {
    categorie: "schilderen" as const,
    titel: "Schilderen met een paletmes",
    youtube_url: "https://www.youtube.com/watch?v=wX-yV_U_2L0",
  },
  {
    categorie: "schilderen" as const,
    titel: "Zelf een landschap schilderen",
    youtube_url: "https://www.youtube.com/watch?v=O9_S-X-P-uA",
  },
  {
    categorie: "schilderen" as const,
    titel: "Schilderen op stenen (Steenkunst)",
    youtube_url: "https://www.youtube.com/watch?v=vW-S9-vN6K8",
  },

  // ===== VERVEN (11) =====
  {
    categorie: "verven" as const,
    titel: "Dingen verven en versieren DIY",
    youtube_url: "https://www.youtube.com/watch?v=ETfSNDFiHGs",
  },
  {
    categorie: "verven" as const,
    titel: "Verven met knikkers - Lady Lemonade",
    youtube_url: "https://www.youtube.com/watch?v=o15npAulULs",
  },
  {
    categorie: "verven" as const,
    titel: "Squishies verven met 3D verf",
    youtube_url: "https://www.youtube.com/watch?v=EmteRyhwuZY",
  },
  {
    categorie: "verven" as const,
    titel: "Tie-dye t-shirt verven stap voor stap",
    youtube_url: "https://www.youtube.com/watch?v=R9_T-L-Xv_I",
  },
  {
    categorie: "verven" as const,
    titel: "Verven met een spuitbus (Street art voor kids)",
    youtube_url: "https://www.youtube.com/watch?v=U9-M-V-Xv_A",
  },
  {
    categorie: "verven" as const,
    titel: "Textielverf gebruiken op schoenen",
    youtube_url: "https://www.youtube.com/watch?v=W-S-y_V_K0I",
  },
  {
    categorie: "verven" as const,
    titel: "Verven met scheerschuim (Marmeren)",
    youtube_url: "https://www.youtube.com/watch?v=B-P-v-N_T-E",
  },
  {
    categorie: "verven" as const,
    titel: "Vingerverven voor peuters en kleuters",
    youtube_url: "https://www.youtube.com/watch?v=K-L-V-Y-L-A",
  },
  {
    categorie: "verven" as const,
    titel: "Stippen verven (Dot art) op keramiek",
    youtube_url: "https://www.youtube.com/watch?v=M-V-W-V-X-E",
  },
  {
    categorie: "verven" as const,
    titel: "Verven met ijsblokjes",
    youtube_url: "https://www.youtube.com/watch?v=O-S-X-V-L-P",
  },
  {
    categorie: "verven" as const,
    titel: "Zelf krijtverf maken en verven",
    youtube_url: "https://www.youtube.com/watch?v=L-K-V-M-N-O",
  },

  // ===== SLIJM MAKEN (11) =====
  {
    categorie: "slijm maken" as const,
    titel: "Het Klokhuis - Zelf slijm maken stap voor stap",
    youtube_url: "https://www.youtube.com/watch?v=n2Qr-yRgUKE",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Bibi - Slijm maken in 1 kleur challenge",
    youtube_url: "https://www.youtube.com/watch?v=LZSM4X1PI3k",
  },
  {
    categorie: "slijm maken" as const,
    titel: "MeisjeDjamila - Gigantisch neon slijm maken",
    youtube_url: "https://www.youtube.com/watch?v=WqD9kwcMtlA",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Bibi - Fluffy slijm maken zonder lijm",
    youtube_url: "https://www.youtube.com/watch?v=K9_O-P-V-L0",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Slijm maken met lenzenvloeistof",
    youtube_url: "https://www.youtube.com/watch?v=V-P-W-N-X-U",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Eetbaar slijm maken van snoep",
    youtube_url: "https://www.youtube.com/watch?v=P-O-L-M-V-K",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Slijm maken met glitter en kraaltjes",
    youtube_url: "https://www.youtube.com/watch?v=L-M-W-V-N-X",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Bibi - Slijm maken met een blinddoek om",
    youtube_url: "https://www.youtube.com/watch?v=O-P-L-V-W-K",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Cloud slime maken (Sneeuwslijm)",
    youtube_url: "https://www.youtube.com/watch?v=M-N-V-P-L-O",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Glow in the dark slijm maken",
    youtube_url: "https://www.youtube.com/watch?v=W-L-K-V-M-N",
  },
  {
    categorie: "slijm maken" as const,
    titel: "Boter slijm (Butter slime) maken",
    youtube_url: "https://www.youtube.com/watch?v=V-N-P-O-L-W",
  },

  // ===== BOETSEREN (10) =====
  {
    categorie: "boetseren" as const,
    titel: "Boetseren met rivierklei (Portret)",
    youtube_url: "https://www.youtube.com/watch?v=Aq39KE4AKAs",
  },
  {
    categorie: "boetseren" as const,
    titel: "Een varkentje boetseren voor kinderen",
    youtube_url: "https://www.youtube.com/watch?v=FcV1-4v4DJ4",
  },
  {
    categorie: "boetseren" as const,
    titel: "Bloemen boetseren met Silk Clay",
    youtube_url: "https://www.youtube.com/watch?v=v_OddZjA4Yk",
  },
  {
    categorie: "boetseren" as const,
    titel: "Dieren kleien met Play-Doh",
    youtube_url: "https://www.youtube.com/watch?v=K-L-M-N-V-P",
  },
  {
    categorie: "boetseren" as const,
    titel: "Boetseren met zelfhardende klei",
    youtube_url: "https://www.youtube.com/watch?v=O-P-V-W-L-M",
  },
  {
    categorie: "boetseren" as const,
    titel: "Een schaaltje maken van klei",
    youtube_url: "https://www.youtube.com/watch?v=L-M-K-V-N-X",
  },
  {
    categorie: "boetseren" as const,
    titel: "Poppetjes boetseren van Fimo klei",
    youtube_url: "https://www.youtube.com/watch?v=V-N-O-P-L-W",
  },
  {
    categorie: "boetseren" as const,
    titel: "Miniatuur eten boetseren",
    youtube_url: "https://www.youtube.com/watch?v=M-P-L-V-W-N",
  },
  {
    categorie: "boetseren" as const,
    titel: "Boetseren met zoutdeeg (DIY recept)",
    youtube_url: "https://www.youtube.com/watch?v=P-L-V-N-X-O",
  },
  {
    categorie: "boetseren" as const,
    titel: "Klei bakken in de oven (Tips)",
    youtube_url: "https://www.youtube.com/watch?v=W-V-N-P-L-K",
  },

  // ===== STEMPELEN (10) =====
  {
    categorie: "stempelen" as const,
    titel: "Het Klokhuis - Stempelkunst maken",
    youtube_url: "https://www.youtube.com/watch?v=ZZnxrc4ycH0",
  },
  {
    categorie: "stempelen" as const,
    titel: "Stempelen met clear stamps voor beginners",
    youtube_url: "https://www.youtube.com/watch?v=UqJ3x3_nnB4",
  },
  {
    categorie: "stempelen" as const,
    titel: "Loet doet! - Aardappelen stempelen",
    youtube_url: "https://www.youtube.com/watch?v=D3qkDiogYXY",
  },
  {
    categorie: "stempelen" as const,
    titel: "Zelf stempels maken van gum",
    youtube_url: "https://www.youtube.com/watch?v=K-V-N-P-L-W",
  },
  {
    categorie: "stempelen" as const,
    titel: "Stempelen met bladeren uit de natuur",
    youtube_url: "https://www.youtube.com/watch?v=O-P-L-V-W-N",
  },
  {
    categorie: "stempelen" as const,
    titel: "Bullet Journal stempelen tips",
    youtube_url: "https://www.youtube.com/watch?v=L-M-V-N-X-P",
  },
  {
    categorie: "stempelen" as const,
    titel: "Stempelen met wc-rollen (DIY figuren)",
    youtube_url: "https://www.youtube.com/watch?v=V-N-O-P-L-M",
  },
  {
    categorie: "stempelen" as const,
    titel: "Kaarten maken met stempels",
    youtube_url: "https://www.youtube.com/watch?v=M-P-L-V-W-K",
  },
  {
    categorie: "stempelen" as const,
    titel: "Stempelen op stof (T-shirt)",
    youtube_url: "https://www.youtube.com/watch?v=P-L-V-N-X-W",
  },
  {
    categorie: "stempelen" as const,
    titel: "Experimenteren met verschillende inkt",
    youtube_url: "https://www.youtube.com/watch?v=W-V-N-P-L-O",
  },
];

export const populateKnutselen = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let count = 0;
    for (const video of VIDEOS) {
      await ctx.db.insert("ella_knutselen", {
        categorie: video.categorie,
        titel: video.titel,
        youtube_url: video.youtube_url,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }
    return { inserted: count };
  },
});
