# Teknikken bag kittet

Det her er opslagsværket. Du behøver ikke læse det for at komme i gang. Din kodeagent læser det, når den har brug for det, og du kan slå op her, hvis du vil forstå hvad der sker.

## Se hvad der blev sagt

Bed agenten vise trafikken. Den kører denne kommando i kittets mappe:

```bash
npm run trafik
```

```text
13.15.19  KLIENT ->  server/discover
13.15.20  SERVER <-  svar: det kan jeg  tools, resources
13.15.20  KLIENT ->  subscriptions/listen  {"toolsListChanged":true,"resourcesListChanged":true}
13.15.20  SERVER <-  notifications/subscriptions/acknowledged
13.15.20  KLIENT ->  server/discover
13.15.20  SERVER <-  svar: det kan jeg  tools, resources
13.15.20  KLIENT ->  resources/list
13.15.20  KLIENT ->  tools/list
13.15.20  SERVER <-  svar: resources  data://forbrug/kolonner
13.15.20  SERVER <-  svar: tools  forbrug_pr_kanal
13.15.23  KLIENT ->  tools/call  forbrug_pr_kanal {"fra":"2026-10-01","til":"2026-10-31"}
13.15.23  SERVER <-  svar: resultat  {"periode":{"fra":"2026-10-05","til":"2026-10-26"},"raekker":12, ...
```

Det er hele forløbet, når du forbinder en MCP-server:

1. **`server/discover`**: klienten spørger hvem serveren er, og hvad den kan. Claude Code spørger to gange.
2. **`subscriptions/listen`**: klienten beder om besked, hvis listen af tools eller resources ændrer sig.
3. **`tools/list`**: klienten henter alle tools med navn, beskrivelse og hvilke input de tager. Det er den liste, modellen vælger ud fra.
4. **`tools/call`**: modellen har besluttet at bruge et tool og sender argumenterne. Læg mærke til at den selv har oversat "oktober 2026" til to datoer.

Vil du se hele beskederne, så kør `npm run trafik -- --alt`. Prøv at finde toolets beskrivelse i svaret på `tools/list`. Det er den tekst, der afgør hvornår toolet bliver brugt.

Aflytningen gemmer alt i `trafik.log`, også svarene. Brug den til at lære og fejlsøge, ikke i daglig drift. Uden aflytning skal `.mcp.json` pege på `dist/index.js` i stedet for `tools/aflyt.mjs`.

## Kør serveren i Docker

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

## Forbind en klient i hånden

Normalt gør agenten det. Vil du selv, er det sådan her.

**Claude Code** læser `.mcp.json` i projektmappen af sig selv. Åbn Claude Code i mappen, og sig ja til serveren `starter-kit`.

**Claude Desktop** læser en opsætningsfil. På en Mac ligger den i `~/Library/Application Support/Claude/claude_desktop_config.json`. Tilføj serveren under `mcpServers` med fulde stier, luk appen helt med Cmd+Q, og åbn den igen. Serveren står så under Plugins som "Local MCP server".

```json
"starter-kit": {
  "command": "/usr/local/bin/node",
  "args": ["/Users/DITNAVN/mcp-starter-kit/tools/aflyt.mjs"]
}
```

Bed agenten finde stien til `node`, eller kør `which node`.

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
| `TEKNIK.md` | Den fil, du læser nu. |

## Hvis noget driller

| Det du ser | Årsag | Løsning |
| --- | --- | --- |
| Serveren dukker ikke op i klienten | Klienten læser sin opsætning ved opstart, eller serveren er ikke godkendt | Luk klienten helt og åbn den igen, og sig ja til serveren. Bed agenten tjekke med `claude mcp list`. |
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
- Claude Code 2.1.330 inde i Claude-appen: serveren blev godkendt fra `.mcp.json` og brugt i en almindelig samtale
- En agent, der kun fik repoets adresse, hentede kittet, installerede og testede det
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
