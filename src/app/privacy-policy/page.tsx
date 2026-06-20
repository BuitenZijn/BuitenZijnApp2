import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacybeleid - BuitenZijn",
  description:
    "Privacybeleid van VZW BuitenZijn — hoe wij uw persoonsgegevens verwerken en beschermen.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
          Privacybeleid
        </h1>
        <p className="text-sm text-gray-500">Laatste update: 19 juni 2026</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            1. Wie zijn wij?
          </h2>
          <p>
            VZW BuitenZijn (hierna &ldquo;BuitenZijn&rdquo;, &ldquo;wij&rdquo;
            of &ldquo;ons&rdquo;) is de verwerkingsverantwoordelijke van uw
            persoonsgegevens. U kunt ons bereiken via:
          </p>
          <address className="not-italic mt-3 bg-gray-50 rounded-lg p-4 text-sm">
            <strong>VZW BuitenZijn</strong>
            <br />
            E-mail:{" "}
            <a
              href="mailto:info@buitenzijnvzw.be"
              className="text-green-700 underline"
            >
              info@buitenzijnvzw.be
            </a>
          </address>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            2. Welke gegevens verzamelen wij?
          </h2>
          <p>Wij verzamelen de volgende categorieën persoonsgegevens:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Accountgegevens:</strong> voornaam, achternaam,
              e-mailadres, wachtwoord (versleuteld met bcrypt).
            </li>
            <li>
              <strong>Contactgegevens:</strong> telefoonnummer (optioneel).
            </li>
            <li>
              <strong>Activiteitsgegevens:</strong> deelname aan lijndanslessen
              (datum, tijdstip), danskrediet-saldo en -transacties.
            </li>
            <li>
              <strong>Spelresultaten:</strong> quiz-antwoorden, prono-inzetten,
              ELLA-scores — uitsluitend voor het functioneren van de
              activiteiten binnen de app.
            </li>
            <li>
              <strong>Technische gegevens:</strong> sessietokens, inlogtijdstip
              (voor beveiliging en fraudepreventie).
            </li>
            <li>
              <strong>Betalingsgegevens:</strong> betaaltransacties via Stripe.
              Wij slaan geen volledige betaalkaartgegevens op; deze worden
              verwerkt door Stripe (zie{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                stripe.com/privacy
              </a>
              ).
            </li>
            <li>
              <strong>Contactformulierberichten:</strong> naam, e-mailadres en
              het bericht dat u ons stuurt.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            3. Waarvoor gebruiken wij uw gegevens?
          </h2>
          <table className="w-full text-sm border-collapse mt-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border border-gray-200 font-semibold">
                  Doel
                </th>
                <th className="text-left p-3 border border-gray-200 font-semibold">
                  Rechtsgrondslag
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Aanmaken en beheren van uw account",
                  "Uitvoering van de overeenkomst",
                ],
                [
                  "Inschrijven voor en deelnemen aan activiteiten (lijndansen, quiz, …)",
                  "Uitvoering van de overeenkomst",
                ],
                [
                  "Verwerken van betalingen voor danskrediet",
                  "Uitvoering van de overeenkomst",
                ],
                [
                  "Sturen van e-mailverificatie en wachtwoord-reset",
                  "Uitvoering van de overeenkomst / gerechtvaardigd belang",
                ],
                ["Beantwoorden van uw contactvraag", "Gerechtvaardigd belang"],
                ["Beveiliging en fraudepreventie", "Gerechtvaardigd belang"],
                [
                  "Voldoen aan wettelijke verplichtingen",
                  "Wettelijke verplichting",
                ],
              ].map(([doel, grond]) => (
                <tr key={doel} className="even:bg-gray-50">
                  <td className="p-3 border border-gray-200">{doel}</td>
                  <td className="p-3 border border-gray-200">{grond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            4. Met wie delen wij uw gegevens?
          </h2>
          <p>
            Wij verkopen uw persoonsgegevens nooit. We kunnen uw gegevens
            doorgeven aan:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Convex Inc.</strong> — onze cloudprovider voor
              databaseopslag (zie{" "}
              <a
                href="https://www.convex.dev/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                convex.dev/legal/privacy
              </a>
              ).
            </li>
            <li>
              <strong>Stripe Inc.</strong> — betalingsverwerking (zie{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline"
              >
                stripe.com/privacy
              </a>
              ).
            </li>
            <li>
              <strong>SMTP e-mailprovider</strong> — voor het verzenden van
              transactionele e-mails (verificatie, wachtwoord-reset).
            </li>
          </ul>
          <p className="mt-3">
            Alle verwerkers zijn contractueel gehouden om uw gegevens te
            beschermen conform de AVG/GDPR.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            5. Hoe lang bewaren wij uw gegevens?
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Accountgegevens:</strong> zolang uw account actief is, of
              tot u verwijdering aanvraagt.
            </li>
            <li>
              <strong>Activiteits- en transactiegegevens:</strong> maximaal 7
              jaar (wettelijke bewaarplicht voor boekhouding).
            </li>
            <li>
              <strong>Contactberichten:</strong> maximaal 2 jaar.
            </li>
            <li>
              <strong>Sessietokens:</strong> maximaal 30 dagen, of tot
              uitloggen.
            </li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            6. Uw rechten
          </h2>
          <p>
            Conform de Algemene Verordening Gegevensbescherming (AVG/GDPR) hebt
            u de volgende rechten:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Recht op inzage</strong> — u kunt opvragen welke gegevens
              wij over u bewaren.
            </li>
            <li>
              <strong>Recht op rectificatie</strong> — u kunt onjuiste gegevens
              laten corrigeren.
            </li>
            <li>
              <strong>
                Recht op wissing (&ldquo;recht om vergeten te worden&rdquo;)
              </strong>{" "}
              — u kunt uw account en persoonlijke gegevens laten verwijderen via
              de app (Profiel → Account verwijderen) of door ons te e-mailen.
            </li>
            <li>
              <strong>Recht op beperking van de verwerking</strong> — u kunt
              verzoeken de verwerking tijdelijk te beperken.
            </li>
            <li>
              <strong>Recht op gegevensoverdraagbaarheid</strong> — u kunt een
              kopie van uw gegevens in een gangbaar formaat aanvragen.
            </li>
            <li>
              <strong>Recht van bezwaar</strong> — u kunt bezwaar maken tegen
              verwerking op basis van gerechtvaardigd belang.
            </li>
          </ul>
          <p className="mt-3">
            Om een van deze rechten uit te oefenen, stuurt u een e-mail naar{" "}
            <a
              href="mailto:info@buitenzijnvzw.be"
              className="text-green-700 underline"
            >
              info@buitenzijnvzw.be
            </a>
            . Wij reageren binnen 30 dagen.
          </p>
          <p className="mt-3">
            U hebt ook het recht een klacht in te dienen bij de Belgische
            Gegevensbeschermingsautoriteit:{" "}
            <a
              href="https://www.gegevensbeschermingsautoriteit.be"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline"
            >
              gegevensbeschermingsautoriteit.be
            </a>
            .
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            7. Beveiliging
          </h2>
          <p>
            Wij nemen passende technische en organisatorische maatregelen om uw
            persoonsgegevens te beschermen, waaronder:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              Wachtwoorden worden opgeslagen als een{" "}
              <strong>bcrypt-hash</strong> — nooit in leesbare tekst.
            </li>
            <li>
              Alle communicatie verloopt via <strong>HTTPS/TLS</strong>.
            </li>
            <li>
              Sessietokens worden gegenereerd met een{" "}
              <strong>cryptografisch veilige</strong> willekeurige generator.
            </li>
            <li>
              Toegang tot beheerfuncties is beperkt tot gebruikers met de
              admin-rol.
            </li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            8. Cookies
          </h2>
          <p>
            De BuitenZijn-website gebruikt geen tracking- of advertentiecookies.
            Er worden uitsluitend functionele gegevens (sessietoken) opgeslagen
            in de lokale opslag van uw browser om u ingelogd te houden.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            9. Wijzigingen aan dit beleid
          </h2>
          <p>
            Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. De
            recentste versie is altijd beschikbaar op deze pagina. Bij
            ingrijpende wijzigingen informeren wij u per e-mail.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            10. Contact
          </h2>
          <p>
            Vragen over dit privacybeleid? Neem contact op via{" "}
            <a
              href="mailto:info@buitenzijnvzw.be"
              className="text-green-700 underline"
            >
              info@buitenzijnvzw.be
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
