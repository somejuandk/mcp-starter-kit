# MCP starter kit

Et udgangspunkt for din egen MCP-server, bygget sammen med en kodeagent. Kittet er til dig, der bruger MCP-servere i Claude eller Cursor og gerne vil forstå hvad du forbinder til, eller mangler en til et værktøj, hvor der ikke findes en færdig.

Du behøver ikke kunne kode. Du skal kunne åbne en terminal og have en kodeagent som Claude Code, Codex eller Cursor.

Kittet indeholder:

- **En lille server der virker med det samme.** Den har ét tool, som læser en fil med opdigtet annonceforbrug og lægger tallene sammen pr. kanal.
- **En aflytning**, så du kan se hver besked mellem din klient og serveren.
- **Instruktioner til din kodeagent** (`AGENTS.md`), så den bygger en server der kun læser og ikke lækker nøgler.
- **En brief** (`BRIEF.md`) du udfylder, og **en tjekliste** (`TJEKLISTE.md`) til at kontrollere resultatet.

## Det skal du have

- Node.js 20.12 eller nyere (`node -v`)
- En kodeagent. Eksemplerne bruger Claude Code.
- Docker Desktop, hvis du vil køre serveren i en container (trin 4). Det er valgfrit.

## 1. Lad din agent sætte det op

Hent kittet ned på din maskine. Har du git, er det én kommando:

```bash
git clone https://github.com/somejuandk/mcp-starter-kit.git
```

Ellers tryk på den grønne knap Code her på GitHub, vælg Download ZIP, og pak filen ud.

Åbn Claude Code i mappen og skriv:

> Sæt kittet op.

Beder appen dig vælge en mappe, så tryk Cmd+Shift+G på en Mac, indsæt stien til mappen, og tryk Enter.

Agenten installerer, bygger og kører testen. Du skal ikke selv rette i nogen opsætningsfiler. Serveren står allerede i filen `.mcp.json`, som Claude Code læser af sig selv.

Luk Claude Code og åbn den igen i samme mappe. Den spørger, om du vil godkende serveren `starter-kit`. Sig ja. Spørger den allerede første gang du åbner mappen, så sig også ja der. Serveren virker først, når agenten har sat kittet op, og du har åbnet Claude Code igen.

Bruger du en anden klient, fx Claude Desktop eller Cursor, så skriv i stedet: "Sæt kittet op og forbind det til Claude Desktop." Agenten viser dig ændringen, før den laver den.

## 2. Stil et spørgsmål

> Hvad brugte vi på Meta i oktober 2026, og hvad kostede en konvertering?

Claude finder selv toolet `forbrug_pr_kanal` og bruger det. Du har ikke fortalt den at det findes. Den har læst toolets beskrivelse og vurderet at det passer til spørgsmålet.

## 3. Se hvad der blev sagt

```bash
npm run trafik
```

```text
11:28:05  KLIENT ->  server/discover
11:28:05  SERVER <-  svar: det kan jeg  tools, resources
11:28:05  KLIENT ->  subscriptions/listen  {"toolsListChanged":true,"resourcesListChanged":true}
11:28:05  SERVER <-  notifications/subscriptions/acknowledged
11:28:05  KLIENT ->  resources/list
11:28:05  KLIENT ->  tools/list
11:28:05  SERVER <-  svar: resources  data://forbrug/kolonner
11:28:05  SERVER <-  svar: tools  forbrug_pr_kanal
11:28:07  KLIENT ->  tools/call  forbrug_pr_kanal {"fra":"2026-10-01","til":"2026-10-31"}
11:28:08  SERVER <-  svar: resultat  {"periode":{"fra":"2026-10-05","til":"2026-10-26"},"raekker":12, ...
```

Det er hele forløbet, når du forbinder en MCP-server:

1. **`server/discover`**: klienten spørger hvem serveren er, og hvad den kan.
2. **`subscriptions/listen`**: klienten beder om besked, hvis listen af tools eller resources ændrer sig.
3. **`tools/list`**: klienten henter alle tools med navn, beskrivelse og hvilke input de tager. Det er den liste, modellen vælger ud fra.
4. **`tools/call`**: modellen har besluttet at bruge et tool og sender argumenterne. Læg mærke til at den selv har oversat "oktober 2026" til to datoer.

Vil du se hele beskederne, så kør `npm run trafik -- --alt`. Prøv at finde toolets beskrivelse i svaret på `tools/list`. Det er den tekst, der afgør hvornår toolet bliver brugt.

Aflytningen gemmer alt i `trafik.log`, også svarene. Brug den til at lære og fejlsøge, ikke i daglig drift. Uden aflytning skal `.mcp.json` pege på `dist/index.js` i stedet for `tools/aflyt.mjs`.

## 4. Kør den i Docker

En server der kører direkte med `node`, har samme adgang til din maskine som du selv har. I en container ser den kun det, du giver den.

Bed din agent om det: "Kør serveren i Docker i stedet." Det den gør, er at bygge et image og skifte kommandoen i `.mcp.json` ud med denne:

```bash
docker build -t mcp-starter-kit .
docker run -i --rm --network none -v "$PWD/data:/data:ro" mcp-starter-kit
```

| Del af kommandoen | Betyder |
| --- | --- |
| `-i` | Hold tekst ind og ud åben. Uden den kan klienten ikke tale med serveren. |
| `--rm` | Slet containeren, når klienten lukker den. |
| `--network none` | Ingen netadgang. Eksemplet har ikke brug for nettet. |
| `-v "$PWD/data:/data:ro"` | Giv containeren mappen `data`, og kun til læsning (`ro`). |

Resten af din maskine findes ikke inde i containeren. Skal din egen server hente noget fra et API, fjerner du `--network none`.

## 5. Byg din egen

1. Udfyld `BRIEF.md`: hvilket værktøj, hvor dokumentationen er, og tre spørgsmål du vil kunne stille.
2. Åbn din kodeagent i projektmappen og skriv: **"Læs BRIEF.md og byg serveren."**
3. Agenten læser `AGENTS.md`, undersøger API'et og foreslår tools. Den bygger først, når du har sagt ja.
4. Når den er færdig, går du `TJEKLISTE.md` igennem.

Skal serveren bruge en nøgle eller andre indstillinger, så kopiér `.env.example` til `.env` og læg dem der. Serveren læser selv filen, når den starter. Skriv aldrig nøglen i chatten med agenten.

I Docker er `.env` ikke med i imaget. Du giver indstillingerne, når containeren starter, med `--env-file .env` i `docker run`-kommandoen.

## Tools i serveren

| Navn | Hvad det gør | Input | Skriver det noget? |
| --- | --- | --- | --- |
| `forbrug_pr_kanal` | Lægger forbrug og konverteringer sammen pr. kanal ud fra `data/forbrug.csv` | `fra`, `til` (valgfrie datoer, ÅÅÅÅ-MM-DD) | Nej |

Opdatér tabellen, når du skifter eksemplet ud.

## Filerne

| Fil | Indhold |
| --- | --- |
| `src/server.ts` | Tools og resources. Det er her, din egen server bliver til. |
| `src/index.ts` | Starter serveren over stdio. |
| `data/forbrug.csv` | Opdigtede tal til eksemplet. |
| `tools/aflyt.mjs` | Aflytningen. Gemmer trafikken i `trafik.log`. |
| `tools/vis-trafik.mjs` | Viser `trafik.log` læsbart. |
| `test/smoke.mjs` | Testen bag `npm test`. |
| `Dockerfile` | Opskriften på containeren. |
| `.mcp.json` | Fortæller Claude Code hvilken server der hører til projektet. |
| `AGENTS.md`, `CLAUDE.md` | Instruktioner til kodeagenten. |
| `BRIEF.md`, `TJEKLISTE.md` | Din brief og din kontrol. |

## Hvis noget driller

| Det du ser | Årsag | Løsning |
| --- | --- | --- |
| Serveren dukker ikke op i klienten | Klienten læser sin opsætning ved opstart, eller serveren er ikke godkendt | Luk klienten helt og åbn den igen, og sig ja til serveren. Tjek med `claude mcp list`. |
| `Cannot find module ... dist/index.js` | Koden er ikke bygget | Kør `npm run build` |
| Klienten mister forbindelsen | Noget i serveren skriver med `console.log` | Brug `console.error` |
| Docker: forbindelsen lukker med det samme | `-i` mangler | Tilføj `-i` |
| Docker: "Kan ikke finde forbrug.csv" | Mappen er ikke givet til containeren | Tilføj `-v "$PWD/data:/data:ro"` |
| Dine ændringer slår ikke igennem i Docker | Det gamle image kører stadig | Kør `docker build` igen |
| `npm run trafik` er tom | Klienten peger på `dist/index.js` | Peg den på `tools/aflyt.mjs` |
| Docker: serveren mangler sine indstillinger | `.env` er ikke med i imaget | Tilføj `--env-file .env` til `docker run` |

## Hvad er testet

Testet 24. november 2026 på en Mac med Apple-chip:

- `npm install`, `npm run build` og `npm test` med Node 22.11
- Claude Code 2.1.331 over stdio, med serveren hentet fra `.mcp.json`: toolet blev fundet og kaldt
- Claude Desktop (protokol 2025-11-25): en agent tilføjede serveren til appens opsætningsfil, og toolet blev kaldt i en almindelig chat
- Docker 28.3: build, kørsel med `-i`, kun læseadgang til `data`, ingen netadgang, bruger `node` og ikke root

Ikke testet: Cursor, Codex, Windows og Linux.

## Versioner

| Pakke | Version |
| --- | --- |
| MCP-spec | 2026-07-28 (serveren svarer også klienter på 2025-11-25) |
| `@modelcontextprotocol/server` | 2.4.0 |
| `zod` | 4.6.7 |
| `typescript` | 7.0.2 |
| Docker-image | `node:22-slim` |

MCP udvikler sig hurtigt, og der kommer flere versioner af specifikationen om året. Versionerne er låst, så kittet bliver ved med at virke som testet. Er datoen ovenfor gammel, så bed din agent tjekke om der er kommet en ny version af SDK'et, før du bygger videre.

## Licens

MIT. Brug det, ret i det, og byg videre.

## Det kittet ikke dækker

Serveren kører på din egen maskine og kan kun bruges af dig. Skal kolleger bruge den, skal den hostes med login, logs og overvågning. Det er et større projekt, og det er ikke med her.
