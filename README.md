# MCP starter kit

**Byg din egen MCP-server uden at skrive kode.**

Kittet er til dig, der bruger Claude, Cursor eller ChatGPT i dit arbejde og mangler en MCP-server til et værktøj, hvor der ikke findes en. Du skriver en brief med de spørgsmål, du vil kunne stille. Din kodeagent bygger serveren. Kittet sørger for, at den bygger den sikkert, og at du kan se, hvad den gør.

**Serveren læser kun.** Første version kan ikke oprette, ændre, slette eller sende noget. Det står i reglerne til agenten, og tjeklisten får dig til at kontrollere det.

## Kom i gang

Send den her besked til din kodeagent, fx Claude Code.

```text
Sæt https://github.com/somejuandk/mcp-starter-kit op for mig.
```

Agenten henter kittet, installerer det og kører en test. Den spørger, hvor du vil bruge serveren, og viser dig hver ændring på din maskine, før den laver den. Du skal ikke selv rette i nogen filer.

Til sidst beder den dig starte en ny samtale: enten en ny Claude Code i kittets mappe, eller Claude-appen efter en genstart. Det er der, serveren er forbundet. Så spørg:

- *"Hvad brugte vi på Meta i oktober 2026, og hvad kostede en konvertering?"*
- *"Hvilken kanal har den laveste pris pr. konvertering?"*
- *"Vis mig, hvad der blev sagt mellem dig og serveren."*

Tallene er opdigtede. Eksemplet er der, så du kan se en MCP-server virke, før du bygger din egen.

## Sådan virker det

1. **Forbind.** Din klient spørger serveren, hvem den er, og hvad den kan.
2. **Liste.** Klienten henter serverens tools. Hvert tool har et navn, en beskrivelse og nogle felter.
3. **Valg.** Du stiller et spørgsmål. Modellen læser beskrivelserne og vurderer selv, om et tool passer.
4. **Kald.** Modellen kalder toolet, får data tilbage og svarer dig.

Beskrivelsen er altså det, der afgør, hvornår et tool bliver brugt. Kittet har en aflytning, der viser dig hver besked i de fire trin, fra din egen klient.

## Byg din egen

1. **Skriv briefen.** Bed agenten: *"Hjælp mig med at udfylde BRIEF.md."* Den spørger dig om værktøjet, om de tre spørgsmål du vil kunne stille, og om hvad serveren aldrig må gøre.
2. **Få den bygget.** *"Læs BRIEF.md og byg serveren."* Agenten undersøger værktøjets API, foreslår tools og bygger først, når du har sagt ja.
3. **Kontrollér den.** Gå `TJEKLISTE.md` igennem. Du kan bede agenten vise dig svaret på hvert punkt.

Skal serveren bruge en nøgle, lægger du den i filen `.env`. Skriv den aldrig i chatten med agenten.

Mangler du en idé, så se hvad andre har bygget til deres egen hverdag: [handle-mcp](https://github.com/NJohansen/handle-mcp) til dagligvarer og [aula-mcp](https://github.com/Casperjuel/aula-mcp) til skolens beskeder.

## Hvad serveren rører ved

- **Den læser én mappe.** Eksemplet læser filen `data/forbrug.csv` og intet andet. Modellen kan ikke bede den om en anden sti.
- **Den går ikke på nettet.** Eksemplet har ikke brug for det. I Docker er nettet helt lukket.
- **Den bruger ingen nøgler.** Din egen server gør nok. Så ligger nøglen i `.env`, som aldrig kommer med i git.
- **Den skriver ikke.** Ingen tools kan ændre noget.
- **Svarene ender hos din AI-klient.** Serveren kører på din maskine, men det, et tool svarer, bliver sendt til den model, du taler med. Tænk over det, før du lader en server læse noget fortroligt.

## Tools i eksemplet

| Tool | Hvad det gør | Skriver det? |
| --- | --- | --- |
| `forbrug_pr_kanal` | Lægger forbrug og konverteringer sammen pr. kanal for en periode | Nej |

## Det skal du have

- En kodeagent. Kittet er testet med Claude Code, som også findes inde i Claude-appen, så du behøver ikke en terminal. Codex og Cursor bør kunne det samme, men er ikke prøvet.
- [Node.js](https://nodejs.org) 20.12 eller nyere. Agenten tjekker det for dig.
- Docker Desktop, hvis du vil køre serveren i en container. Det er valgfrit.

## Til kodeagenten

Har du fået adressen til dette repo og besked på at sætte det op, så gør sådan her:

1. Spørg, hvor kittet skal ligge. Foreslå `~/mcp-starter-kit`. Hent det med `git clone https://github.com/somejuandk/mcp-starter-kit.git`.
2. Læs `AGENTS.md` i mappen, og følg afsnittet "Når personen beder dig sætte kittet op".
3. Slå op i `TEKNIK.md`, når du skal bruge detaljer om Docker, klienter eller fejlfinding.

Personen er typisk ikke udvikler. Forklar hvad du gør i almindeligt sprog, vis hver ændring uden for mappen, før du laver den, og bed aldrig om at få en nøgle skrevet i chatten.

## Mere

- [`TEKNIK.md`](TEKNIK.md): trafikken forklaret, Docker, fejlfinding, filerne, versioner og hvad der er testet.
- [`AGENTS.md`](AGENTS.md): reglerne din kodeagent følger.
- [`BRIEF.md`](BRIEF.md) og [`TJEKLISTE.md`](TJEKLISTE.md): din brief og din kontrol.

## Det kittet ikke dækker

Serveren kører på din egen maskine og kan kun bruges af dig. Skal kolleger bruge den, skal den hostes med login, logs og overvågning. Det er et større projekt, og det er ikke med her.

## Licens

MIT. Brug det, ret i det, og byg videre.
