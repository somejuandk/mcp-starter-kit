# Brief: min MCP-server

Udfyld felterne og sig til din kodeagent: "Læs BRIEF.md og byg serveren." Skriv som du ville forklare det til en kollega. Du behøver ikke kunne kode.

## 1. Hvilket værktøj handler det om?

<!-- Navnet på værktøjet, og hvad I bruger det til. -->

## 2. Hvor er dokumentationen?

<!-- Link til værktøjets API-dokumentation. Ved du ikke om der er et API, så skriv det, og bed agenten finde ud af det. -->

## 3. Tre spørgsmål jeg vil kunne stille

<!-- Skriv dem præcis som du ville stille dem til Claude. Det er dem, agenten bygger tools ud fra. -->

1.
2.
3.

## 4. Hvordan logger serveren ind?

<!-- Ingen login, en API-nøgle, eller noget andet. Skriv ALDRIG selve nøglen her. Den skal i filen .env. -->

## 5. Hvad må serveren aldrig gøre?

<!-- Første version læser kun. Skriv også hvis der er data den ikke må røre, fx kundenavne eller e-mails. -->

- Den må ikke ændre, oprette eller slette noget.
-

## 6. Hvem skal bruge den?

<!-- Kun mig på min egen maskine er det, kittet er bygget til. Skal kolleger bruge den, så skriv det, så agenten kan sige hvad det kræver. -->

Kun mig, på min egen maskine.

---

## Eksempel på en udfyldt brief

**1. Værktøj:** RSS-feedet fra en blog, vi følger.

**2. Dokumentation:** Der er ikke et API. Feedet ligger på `https://eksempel.dk/feed.xml`.

**3. Tre spørgsmål:**

1. Hvad har de udgivet siden sidste mandag?
2. Hvor mange indlæg har de udgivet om måneden i år?
3. Har de skrevet noget om server-side tracking?

**4. Login:** Ingen. Feedet er offentligt.

**5. Må aldrig:** Ændre noget. Hente andre adresser end de feeds, jeg selv har skrevet i `.env`.

**6. Hvem:** Kun mig, på min egen maskine.
