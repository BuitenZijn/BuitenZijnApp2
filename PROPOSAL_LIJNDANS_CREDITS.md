# Voorstel: Digitaal Beurtenkaartsysteem Lijndansen

## Samenvatting

Digitalisering van het fysieke beurtenkaartje (5 sessies voor €25) naar een in-app credit systeem.
Gebruikers kopen credits via de app en checken in bij een les door een QR-code te scannen.

---

## Huidige Situatie

| Optie          | Prijs | Hoe                                  |
| -------------- | ----- | ------------------------------------ |
| Losse beurt    | €6    | Cash/betaling ter plaatse            |
| 5-beurtenkaart | €25   | Fysiek kaartje, afgestempeld per les |

**Beschikbare betaalsystemen:** SumUp (terminal ter plaatse), Stripe (online)

---

## Open Vragen & Uitdagingen

### 💰 Betalingen

1. **Stripe vs SumUp — welke voor in-app?**
   - Stripe is de logische keuze voor in-app betalingen (Stripe SDK bestaat voor React Native). SumUp is eerder bedoeld voor fysieke terminals.
   - **Vraag:** Willen jullie SumUp enkel behouden voor ter plaatse (cash/kaart aan de deur) en Stripe voor de app? Of moet er ook een SumUp in-app flow zijn?
     Stripe voor in de app.

2. **Mix betaalmethoden — wat met wie ter plaatse betaalt?**
   - Niet iedereen zal de app gebruiken. Sommige deelnemers betalen cash of via SumUp aan de deur.
   - **Vraag:** Moet de lesgever ook manueel credits kunnen toekennen aan een account (bv. iemand betaalt cash maar wil toch digitaal aftekenen)? Of blijft het fysieke kaartje bestaan naast het digitale?
     Voorlopig blijft het fysieke kaartje bestaan.

3. **Facturen/bonnetjes?**
   - **Vraag:** Moet er een aankoopbewijs of e-mail bevestiging gestuurd worden na aankoop? Is er een boekhoudkundige verplichting (VZW)?
     Neen.

4. **Terugbetalingsbeleid?**
   - **Vraag:** Wat als iemand credits koopt maar wil terugbetalen? Verloopt een credit ooit? Wat als het seizoen afloopt en iemand nog 3 credits over heeft?
     Credits verlopen nooit.

### 📱 QR Check-in

5. **Wie genereert de QR-code?**
   - Optie A: De **lesgever** toont een QR-code op hun telefoon/tablet → deelnemers scannen
   - Optie B: De **deelnemer** toont een QR-code → lesgever scant
   - Optie C: Er hangt een **geprint QR-poster** aan de deur → deelnemers scannen bij binnenkomst
   - **Mijn suggestie:** Optie A of C. De deelnemer scant, zodat er geen wachtrij ontstaat bij 1 device. Een poster-QR met een rolling token (elke les uniek) is het minst frictie.
   - **Vraag:** Welke flow voelt het meest natuurlijk voor jullie context?
     Optie C.

6. **Offline scenario?**
   - **Vraag:** Is er altijd WiFi/4G op de leslocatie? Wat als iemands telefoon geen bereik heeft? Moet er een fallback zijn?
     Er is altijd wifi als fallback hebben we cash of sumup.

7. **Dubbel scannen / fraude**
   - De QR moet sessie-gebonden zijn (datum + tijdslot) zodat je dezelfde QR niet twee keer kunt scannen of voor een andere les gebruiken.
   - **Vraag:** Is er altijd maar 1 les tegelijk? Of zijn er parallelle groepen?
     Er is altijd maar 1 les.

### 👥 Gebruikersbeheer

8. **Wie mag credits kopen?**
   - Moet iemand actief lid zijn (`role: "lijndans"` of `"member"`) om credits te kopen? Of kan een `"guest"` ook credits kopen (en daarmee lid worden)?
   - **Vraag:** Is het kopen van credits gelijk aan inschrijven voor de cursus?
     Iemand moet lijndans rol hebben om credits te kunnen kopen.

9. **Gezinskaarten / duo-accounts?**
   - **Vraag:** Komt het voor dat 1 persoon betaalt voor meerdere deelnemers (partner, kind)? Zo ja, moet er een "credits overzetten" functie zijn of koopt iemand gewoon meerdere kaarten?
     Neen, enkel kopen voor jouw account.

10. **Admin dashboard**
    - **Vraag:** Wat moet de lesgever/admin zien? Denk aan:
      - Wie was aanwezig bij les X?
      - Hoeveel credits heeft persoon Y?
      - Aanwezigheidsoverzicht per seizoen?
      - Omzet rapportage?
        Aantal aanwezigen per les.
        Aantal credits per persoon.
        Omzet rapportage.

### 📦 Pakketten

11. **Pricing flexibiliteit**
    - **Vraag:** Is het altijd €6/beurt en €25/5? Of willen jullie in de toekomst andere pakketten kunnen aanbieden (bv. 10 beurten, seizoenskaart, proefles gratis)?
    - **Mijn suggestie:** Maak pakketten configureerbaar vanuit een admin panel in plaats van hard-coded.
      Ok, dat volg ik, hou de deur open voor andere pakketten.

12. **Proefles / gratis credit**
    - **Vraag:** Bieden jullie een gratis proefles aan? Moet de admin een gratis credit kunnen toekennen?
      We hebben een gratis proefles. Maar dat moet niet noodzakelijk via credits te lopen voorlopig.

---

## Voorgestelde Architectuur

### Hoog niveau flow

```
┌─────────────┐     Stripe Checkout      ┌───────────────┐
│  Gebruiker  │ ──────────────────────── │  Stripe API   │
│  (App)      │                          └───────┬───────┘
└──────┬──────┘                                  │
       │                                    Webhook
       │ Scan QR                                 │
       │                                  ┌──────▼──────┐
       │         Convex Mutation          │   Convex    │
       └─────────────────────────────────│  Backend    │
                                          │             │
                                          │ • credits   │
                                          │ • purchases │
                                          │ • checkins  │
                                          └─────────────┘
```

### Nieuwe Convex Tabellen

```typescript
// Credits per gebruiker
dance_credits: {
  userId: Id<"users">,
  balance: number,          // huidig saldo
  updatedAt: number,
}

// Aankooppakketten (admin-configureerbaar)
credit_packages: {
  name: string,             // "5-beurtenkaart", "Losse beurt"
  credits: number,          // 5, 1
  priceInCents: number,     // 2500, 600
  isActive: boolean,
  createdAt: number,
}

// Aankoophistoriek
credit_purchases: {
  userId: Id<"users">,
  packageId: Id<"credit_packages">,
  credits: number,
  amountPaid: number,       // in cents
  paymentMethod: "stripe" | "cash" | "manual",
  stripePaymentId?: string,
  createdAt: number,
}

// Les-sessies (door admin aangemaakt)
dance_sessions: {
  date: string,             // "2026-03-05"
  startTime: string,        // "15:00"
  endTime: string,          // "16:00"
  location: string,
  qrToken: string,          // uniek per sessie, roteert
  qrExpiresAt: number,
  createdAt: number,
}

// Check-in registratie
dance_checkins: {
  userId: Id<"users">,
  sessionId: Id<"dance_sessions">,
  creditsDeducted: number,  // normaal 1
  checkedInAt: number,
}
```

### App Schermen (Mobiel)

| Scherm                    | Beschrijving                                          |
| ------------------------- | ----------------------------------------------------- |
| **Credits Overzicht**     | Saldo tonen, aankoophistoriek, "Koop credits" knop    |
| **Koop Credits**          | Pakketkeuze → Stripe Checkout → bevestiging           |
| **QR Scanner**            | Camera opent, scant QR, bevestigt check-in, -1 credit |
| **Check-in Bevestiging**  | ✅ animatie, nieuw saldo, les-info                    |
| **Admin: QR Tonen**       | Genereert sessie-QR die lesgever kan tonen            |
| **Admin: Aanwezigheid**   | Lijst van wie ingecheckt heeft voor een sessie        |
| **Admin: Credits Beheer** | Manueel credits toekennen/verwijderen per gebruiker   |

### Betaalflow (Stripe)

1. Gebruiker kiest pakket in de app
2. App maakt via Convex action een Stripe Checkout Session
3. Gebruiker betaalt via Stripe (kaart, Bancontact, iDEAL)
4. Stripe stuurt webhook naar Convex HTTP endpoint
5. Convex valideert webhook signature → schrijft credits bij
6. App refresht saldo via reactieve Convex query

**Waarom Stripe en niet SumUp voor in-app?**

- Stripe heeft een mature React Native SDK + webhooks
- SumUp SDK is gefocust op Card Present (fysieke terminal)
- SumUp blijft bruikbaar aan de deur voor wie cash/kaart betaalt → admin kent manueel credits toe

### QR Check-in Flow

1. Admin maakt een sessie aan (of sessies worden automatisch aangemaakt op basis van het vaste lesrooster)
2. Bij de les toont de admin/lesgever de sessie-QR (of er hangt een poster)
3. QR bevat: `{ sessionId, token, expiresAt }` → geëncodeerd
4. Deelnemer scant QR in de app
5. App stuurt mutation: `checkIn({ userId, sessionId, token })`
6. Backend valideert: token klopt, sessie exists, user heeft ≥1 credit, niet al ingecheckt
7. Credit -1, check-in geregistreerd
8. ✅ bevestigingsscherm

### Beveiliging

- QR token roteert per sessie (uniek + expiry)
- Server-side validatie: geen client-side credit aftrek
- Stripe webhook signature verificatie
- Rate limiting op check-in endpoint
- Dubbele check-in preventie (unique constraint user+session)

---

## Gefaseerde Aanpak

### Fase 1 — MVP (2-3 weken)

- [ ] Database tabellen (credits, purchases, sessions, checkins)
- [ ] Credit saldo op profiel
- [ ] Stripe integratie (checkout + webhook)
- [ ] Koop credits flow in app
- [ ] QR scanner scherm
- [ ] Admin: QR tonen per sessie
- [ ] Admin: manueel credits toekennen

### Fase 2 — Polish (1-2 weken)

- [ ] Aanwezigheidsoverzicht (admin)
- [ ] Push notificatie bij succesvolle aankoop
- [ ] Aankoophistoriek scherm
- [ ] Automatische sessie-aanmaak (recurring schedule)
- [ ] Bancontact/iDEAL als betaalmethode via Stripe

### Fase 3 — Nice to have

- [ ] Seizoenskaart / onbeperkt pakket
- [ ] Credits cadeau geven / overdragen
- [ ] Statistieken dashboard (aanwezigheid trends)
- [ ] Automatische herinnering ("Je hebt nog 1 credit, koop bij!")
- [ ] Wachtlijst als een les vol zit

---

## Kostenraming (Stripe)

| Item                        | Kost                                   |
| --------------------------- | -------------------------------------- |
| Stripe transactie           | 1.5% + €0.25 per betaling (EU kaarten) |
| Bancontact via Stripe       | 1.4% + €0.25                           |
| Op een 5-beurtenkaart (€25) | ~€0.63 Stripe fee                      |
| Op een losse beurt (€6)     | ~€0.34 Stripe fee                      |

**Vraag:** Zijn deze fees acceptabel of moeten ze doorgerekend worden aan de klant?

---

## Alternatieven Overwogen

| Optie                               | Pro                                  | Contra                             |
| ----------------------------------- | ------------------------------------ | ---------------------------------- |
| Stripe in-app                       | Mature SDK, webhooks, Bancontact     | Transactiekosten                   |
| SumUp in-app                        | Al een account                       | Geen goede RN SDK, focust op POS   |
| Mollie                              | Populair in BE/NL, Bancontact native | Extra account nodig                |
| Geen online betaling, enkel manueel | Simpelst                             | Geen self-service, meer admin werk |

---

## Beslissingen Nodig

Vat de kernkeuzes samen vóór we beginnen bouwen:

1. **Stripe voor in-app, SumUp blijft ter plaatse?** → Ja / Nee / Anders
2. **Wie genereert de QR?** → Admin toont / Poster / Deelnemer toont
3. **Verlopen credits?** → Nooit / Einde seizoen / Na X maanden
4. **Manueel credits toekennen (cash betalingen)?** → Ja / Nee
5. **Pakketten configureerbaar via admin panel?** → Ja / Hard-coded is ok
6. **Bevestigingsmail bij aankoop?** → Ja / Nee
7. **Gratis proefles credit?** → Ja / Nee
8. **Meerdere deelnemers per account?** → Ja / Nee
9. **Stripe fees absorberen of doorrekenen?** → Absorberen / Doorrekenen
10. **Minimale betaalmethodes?** → Kaart only / + Bancontact / + iDEAL

---

_Dit document is een levend voorstel. Beantwoord de open vragen en we verfijnen het plan voordat we beginnen bouwen._

Zorg ook dat we in de website - de admins een user overview hebben met zicht op credits, waar we ook credits kunnen toevoegen of afnemen per user.
Zorg dat alle transacties gelogd worden in convex.
