# 🎯 Buzz Quiz — Roadmap & Feature Proposals

> Voorstel voor het uitbreiden van de Buzz Quiz-module in de BuitenZijn App.
> Datum: maart 2026

---

## Inhoudsopgave

1. [Huidige staat](#1-huidige-staat)
2. [Nieuwe vraagtypes](#2-nieuwe-vraagtypes)
3. [Gameplay-concepten](#3-gameplay-concepten)
4. [Scoring & competitie](#4-scoring--competitie)
5. [Host-ervaring](#5-host-ervaring)
6. [Speler-ervaring](#6-speler-ervaring)
7. [Multimedia & content](#7-multimedia--content)
8. [Sociale functies](#8-sociale-functies)
9. [Statistieken & analytics](#9-statistieken--analytics)
10. [Technische verbeteringen](#10-technische-verbeteringen)
11. [Prioritering](#11-prioritering)

---

## 1. Huidige staat

### Wat we nu hebben

- **Vraagtypes**: meerkeuze (tekst), meerkeuze met afbeeldingen, open vragen
- **Live sessies**: lobby → vragen → onthulling → volgende → resultaten
- **Scoring**: vlak / lineair (snelheidsbonus) / schijven (tijdsbrackets)
- **Reactietijdmeting**: ms-nauwkeurig, weergave op mobiel
- **Platforms**: web (admin + host) en mobiel (speler)
- **Join via code**: 6-teken alfanumerieke code

---

## 2. Nieuwe vraagtypes

### 2.1 Schatting / Dichtstbij wint

- Spelers voeren een getal in (bijv. "Hoeveel inwoners heeft België?")
- Antwoord het dichtst bij het correcte getal wint
- Scoring: punten gebaseerd op hoe dicht je erbij zit (procentueel of absoluut)
- Optionele "exacte match bonus"

### 2.2 Rangschik / Sorteer

- Spelers moeten 4-6 items in de juiste volgorde zetten (drag & drop)
- Bijv. "Rangschik deze landen van klein naar groot"
- Scoring: punten per item op de juiste positie, bonus voor volledig correct

### 2.3 Waar of onwaar

- Vereenvoudigde variant van meerkeuze met slechts twee opties
- Snelle gameplay, ideaal als tussenvragen
- Leent zich goed voor snelheidsronden

### 2.4 Audio-vraag

- Een audiofragment wordt afgespeeld (liedje, geluid, quote)
- "Welk liedje is dit?" of "Wie zei dit?"
- Combineerbaar met meerkeuze of open antwoord

### 2.5 Video-vraag

- Een kort videofragment (YouTube-embed of directe URL)
- "Wat gebeurt er na dit fragment?" of "Uit welke film komt dit?"

### 2.6 Kaart/locatie-vraag

- Toon een kaart, speler moet een locatie aantikken
- "Waar ligt Machu Picchu?"
- Scoring gebaseerd op afstand tot het correcte punt

### 2.7 Woordpuzzel / Anagram

- Letters worden getoond, speler moet het woord vormen
- Tikken op letters in de juiste volgorde
- Timer maakt het spannend

### 2.8 Afbeelding onthullen

- Een afbeelding wordt stapsgewijs onthuld (pixelated → scherp)
- Hoe sneller je het raadt, hoe meer punten
- Spelers kunnen op elk moment hun antwoord indienen

### 2.9 Emoji-raadsel

- Een concept wordt voorgesteld met emoji's
- Bijv. 🏔️⛷️🇨🇭 → "Zwitserland"
- Open of meerkeuze antwoord

### 2.10 Koppelvraag (Matching)

- Twee kolommen met items die gekoppeld moeten worden
- Bijv. landen → hoofdsteden, uitvinders → uitvindingen
- Scoring per correcte koppeling

---

## 3. Gameplay-concepten

### 3.1 Rondesysteem

- Quiz opdelen in rondes met een thema per ronde
- Elke ronde kan een ander vraagtype of scoringsysteem hebben
- Tussenstand tonen na elke ronde
- **Schema-uitbreiding**: `quiz_rounds` tabel met `quizId`, `title`, `roundType`, `order`

### 3.2 Streak & combo-systeem

- Opeenvolgende correcte antwoorden → streak-bonus
- Bijv. 3x correct = 1.5× punten, 5x = 2× punten
- Visuele streak-indicator op het scherm van de speler
- Streak breken = terug naar 1×

### 3.3 Power-ups

- Spelers verdienen of kopen power-ups:
  - **Dubbele punten**: volgende vraag telt dubbel
  - **50/50**: twee foute antwoorden verdwijnen
  - **Tijdbonus**: +5 seconden extra
  - **Stelen**: steel punten van de leider
- Max 1 power-up per vraag, beperkt aantal per quiz

### 3.4 Team-modus

- Spelers worden ingedeeld in teams (2-6 teams)
- Teamscore = som van individuele scores
- Teamchat tijdens de lobby
- **Schema**: `quiz_teams` tabel, `teamId` op participant

### 3.5 Eliminatie-modus

- Na elke X vragen valt de laagste speler af
- Spanning bouwt op naarmate er minder spelers zijn
- Finale: 1-op-1 duel

### 3.6 Sudden Death

- Eén fout antwoord en je bent uit
- Laatste speler die overblijft wint
- Perfect voor korte, intensieve games

### 3.7 Wagering / Inzet-ronde

- Spelers zetten een deel van hun punten in vóór de vraag
- Correct = verdubbeling, fout = verlies van inzet
- Strategie-element toevoegen

### 3.8 Mystery-vraag

- De categorie en het vraagtype zijn onbekend tot de vraag verschijnt
- Hogere puntwaarde als compensatie voor het verrassingseffect

### 3.9 Dagelijkse Quiz

- Automatisch gegenereerde dagelijkse quiz (bijv. 5 vragen)
- Asynchrone modus: spelers hoeven niet tegelijk online te zijn
- Dagelijks leaderboard, maandelijkse ranking

---

## 4. Scoring & competitie

### 4.1 ELO / Rating-systeem

- Spelers krijgen een permanente rating
- Winst tegen sterkere spelers = meer rating-winst
- Matchmaking op basis van rating

### 4.2 Seizoenen & trofeeën

- Maandelijkse of kwartaalcompetitie
- Top 3 krijgt virtuele trofeeën op hun profiel
- Seizoensleaderboard in de app

### 4.3 Achievements / Badges

- "Eerste quiz gewonnen" 🏆
- "10 quizzen gespeeld" 🎯
- "5 vragen op rij correct" 🔥
- "Snelste antwoord ooit" ⚡
- Weergave op profielpagina

### 4.4 XP & levels

- XP verdienen door deelname (ongeacht resultaat)
- Levels ontgrendelen nieuwe avatar-opties of titels
- Motiveert herhaald spelen

### 4.5 Uitgebreid puntenverdeling-scherm

- Na elke vraag: animatie van puntenverdeling
- Toon reactietijd, basispunten, streakbonus, power-up effect
- "Jij was de snelste!" highlight

---

## 5. Host-ervaring

### 5.1 Presentatiemodus

- Volledig scherm scorebord voor op een groot scherm / beamer
- Animaties bij het tonen van vragen en antwoorden
- Geluidseffecten (countdown, correct, fout, applaus)
- Automatische modus: vragen wisselen automatisch na timer

### 5.2 Vraagvolgorde aanpassen

- Randomize-optie: vragen willekeurig tonen
- Drag & drop herschikken in admin
- Categoriefilter: alleen vragen uit bepaalde rondes

### 5.3 Live statussen

- Real-time zien wie al geantwoord heeft (zonder antwoord te tonen)
- Progressiebalk: "12/15 spelers hebben geantwoord"
- Pauzeren: quiz tijdelijk stilleggen

### 5.4 Moderatie-tools

- Speler verwijderen uit sessie
- Handmatige puntenaanpassing
- Vraag overslaan
- Antwoord van open vraag handmatig goed- of afkeuren

### 5.5 Quiz templates

- Vooraf gemaakte quiz-templates (algemene kennis, sport, muziek, etc.)
- Importeer vragen uit een CSV of JSON bestand
- Kopieer een bestaande quiz als basis voor een nieuwe

### 5.6 AI-gegenereerde vragen

- Integratie met een LLM om vragen te genereren op basis van een thema
- Host kiest thema + moeilijkheidsgraad → vragen worden gegenereerd
- Host kan gegenereerde vragen bewerken/verwijderen voor de quiz start

---

## 6. Speler-ervaring

### 6.1 Avatars & profielpersonalisatie

- Kies een avatar of upload een foto
- Avatar verschijnt op het scorebord en in de lobby
- Kleurthema kiezen

### 6.2 Reactie-emoji's

- Tijdens het wachten op de volgende vraag: stuur emoji-reacties
- Zichtbaar op het host-scherm (confetti, duim omhoog, lachen)
- Kort zichtbaar, niet afleidend

### 6.3 Haptic feedback

- Trillen bij timer-alarm (laatste 5 seconden)
- Lichte tril bij correct antwoord, sterker bij fout
- Optioneel aan/uit in instellingen

### 6.4 Spectator-modus

- Meekijken zonder deel te nemen
- Ziet vragen en scorebord
- Kan live chatten / emoji's sturen

### 6.5 Hulplijn / hint

- Optioneel: 1 hint per quiz (beschrijving verschijnt bij de vraag)
- Kost de helft van de punten voor die vraag
- Of: hint gratis maar -2 seconden van je timer

### 6.6 Resultaten delen

- "Deel je score" knop na afloop
- Genereer een afbeelding met score, rang, en hoogtepunten
- Delen via WhatsApp, Instagram Stories, etc.

---

## 7. Multimedia & content

### 7.1 Achtergrondmuziek

- Instelbare achtergrondmuziek tijdens de quiz
- Spanning-opbouw muziek bij timer
- Fanfare bij correct antwoord

### 7.2 Thema's & branding

- Visuele thema's voor de quiz (kerst, halloween, sport, BuitenZijn)
- Custom achtergrondkleur of afbeelding per quiz
- Logo van de quiz op het host-scherm

### 7.3 Vraag-media

- Ondersteuning voor afbeelding bij élke vraag (niet alleen picture-MC)
- Markdown-ondersteuning in vraagteksten (vet, cursief, links)
- Code-blokken voor technische quizzen

### 7.4 Vragenbank

- Centrale database van vragen, herbruikbaar over quizzen
- Tags: categorie, moeilijkheidsgraad, taal
- Zoeken en filteren bij het samenstellen van een quiz
- Community-bijdragen: leden kunnen vragen indienen

---

## 8. Sociale functies

### 8.1 Uitdaging sturen

- Daag een specifiek lid uit voor een 1-op-1 quiz
- Push-notificatie naar de uitgedaagde
- Asynchroon: beide spelen wanneer het hen uitkomt

### 8.2 Quizhistorie

- Overzicht van alle gespeelde quizzen per gebruiker
- Score, rang, en antwoorden terugkijken
- "Mijn beste quizzen" highlight

### 8.3 Live chat

- Chat in de lobby vóór de quiz start
- Optioneel: chat tussen vragen door
- Host kan chat aan/uit zetten

### 8.4 Vrienden-leaderboard

- Filter het leaderboard op alleen je vrienden/familie
- Vergelijk stats over meerdere quizzen

---

## 9. Statistieken & analytics

### 9.1 Per-speler statistieken

- Gemiddelde reactietijd
- Nauwkeurigheid (% correct)
- Sterkste categorie
- Langste streak
- Totaal aantal quizzen en vragen beantwoord

### 9.2 Per-quiz statistieken (admin)

- Moeilijkste vraag (laagste % correct)
- Makkelijkste vraag
- Gemiddelde reactietijd per vraag
- Verdeling van antwoorden per vraag (staafdiagram)
- Aantal deelnemers over tijd

### 9.3 Export

- Exporteer sessieresultaten als CSV
- Exporteer vragen als JSON (voor backup of delen)

### 9.4 Dashboard

- Admin-dashboard met overzicht van alle quizzen
- Grafiek: aantal sessies per week/maand
- Populairste quizzen

---

## 10. Technische verbeteringen

### 10.1 Offline-ondersteuning (mobiel)

- Cache de huidige quiz lokaal
- Bij verbindingsverlies: bewaar antwoorden en sync later
- Visuele indicator bij slechte verbinding

### 10.2 WebSocket-optimalisatie

- Convex real-time subscriptions zijn al goed, maar:
  - Batch-updates voor leaderboard (niet na elk antwoord)
  - Debounce participant-lijst updates in lobby

### 10.3 Afbeelding-opslag

- Convex file storage gebruiken i.p.v. externe URLs
- Upload-functie in de admin voor vraag-afbeeldingen
- Automatische resize en compressie

### 10.4 Rate limiting

- Max 1 antwoord per vraag per speler (al geïmplementeerd)
- Max aantal sessies per uur per gebruiker
- Spam-bescherming op join-codes

### 10.5 Toegankelijkheid

- Screen reader-ondersteuning voor vragen en opties
- Hoog-contrast modus
- Grotere tekst-optie
- Toetsenbordnavigatie op web

### 10.6 Notificaties

- Push-notificatie wanneer een quiz live gaat
- "De quiz begint over 5 minuten" herinnering
- Resultaat-notificatie na afloop

---

## 11. Prioritering

### 🔴 Hoog (volgende sprint)

| Feature                    | Impact                        | Moeite |
| -------------------------- | ----------------------------- | ------ |
| Schatting-vraagtype        | Hoog — nieuw gameplay-element | Middel |
| Waar/onwaar-vraagtype      | Hoog — snel toe te voegen     | Laag   |
| Streaksysteem              | Hoog — engagement             | Middel |
| Presentatiemodus (host)    | Hoog — groepservaring         | Middel |
| Vraag-media bij alle types | Hoog — visuele kwaliteit      | Laag   |

### 🟡 Middel (Q2 2026)

| Feature                 | Impact | Moeite |
| ----------------------- | ------ | ------ |
| Audio-vraagtype         | Middel | Middel |
| Team-modus              | Hoog   | Hoog   |
| Rondesysteem            | Hoog   | Middel |
| Quiz templates & import | Middel | Middel |
| Per-speler statistieken | Middel | Middel |
| Spectator-modus         | Middel | Laag   |
| Moderatie-tools         | Middel | Middel |

### 🟢 Laag (toekomst)

| Feature                 | Impact | Moeite |
| ----------------------- | ------ | ------ |
| ELO-rating              | Middel | Hoog   |
| Seizoenen & trofeeën    | Middel | Middel |
| AI-gegenereerde vragen  | Hoog   | Hoog   |
| Kaart/locatie-vraagtype | Middel | Hoog   |
| Dagelijkse quiz         | Middel | Hoog   |
| Power-ups               | Middel | Hoog   |
| Uitdaging sturen        | Laag   | Middel |
| Offline-ondersteuning   | Laag   | Hoog   |

---

_Dit document wordt bijgewerkt naarmate features worden geïmplementeerd of prioriteiten verschuiven._
