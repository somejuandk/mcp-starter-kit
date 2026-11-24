import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

// ---------------------------------------------------------------------------
// EKSEMPEL-TOOL. Skift det ud med dine egne tools (se BRIEF.md og AGENTS.md).
//
// Eksemplet læser en CSV-fil med annonceforbrug fra mappen data/ og lægger
// tallene sammen pr. kanal. Tallene i data/forbrug.csv er opdigtede.
// ---------------------------------------------------------------------------

// Serveren må kun læse i denne ene mappe. Modellen kan ikke vælge en anden sti.
const DATA_MAPPE = resolve(process.env.DATA_MAPPE ?? 'data');
const FORBRUG_FIL = join(DATA_MAPPE, 'forbrug.csv');

type Raekke = { dato: string; kanal: string; forbrug: number; konverteringer: number };

// Ren logik uden MCP. Den kan testes uden en AI.
async function laesForbrug(): Promise<Raekke[]> {
  const tekst = await readFile(FORBRUG_FIL, 'utf8').catch(() => {
    // En fejl skal kunne forstås af et menneske og må ikke afsløre stier eller nøgler.
    throw new Error('Kan ikke finde forbrug.csv i datamappen. Har serveren fået adgang til mappen?');
  });
  const [, ...linjer] = tekst.trim().split('\n');
  return linjer.map(linje => {
    const [dato, kanal, forbrug, konverteringer] = linje.split(',').map(felt => felt.trim());
    return { dato, kanal, forbrug: Number(forbrug), konverteringer: Number(konverteringer) };
  });
}

const DATO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Brug formatet ÅÅÅÅ-MM-DD')
  .optional();

// Bygger en frisk server med alle tools og resources.
export function lavServer(): McpServer {
  const server = new McpServer({ name: 'mcp-starter-kit', version: '0.1.0' });

  server.registerTool(
    'forbrug_pr_kanal',
    {
      // Titlen er til mennesker.
      title: 'Annonceforbrug pr. kanal',
      // Beskrivelsen er til modellen. Den afgør HVORNÅR toolet bliver brugt.
      description:
        'Brug dette tool når brugeren spørger til annonceforbrug, konverteringer eller pris pr. konvertering ' +
        'fordelt på kanaler. Returnerer summer pr. kanal for den valgte periode. ' +
        'Tallene er eksempeldata og skal omtales som det. Ændrer ingenting.',
      inputSchema: z.object({
        fra: DATO.describe('Første dato der tæller med, fx 2026-10-01. Udelad for at tage alt med.'),
        til: DATO.describe('Sidste dato der tæller med, fx 2026-10-31. Udelad for at tage alt med.')
      }),
      outputSchema: z.object({
        periode: z.object({ fra: z.string(), til: z.string() }),
        raekker: z.number(),
        kanaler: z.array(
          z.object({
            kanal: z.string(),
            forbrug_dkk: z.number(),
            konverteringer: z.number(),
            // Valgfri i stedet for null: et felt der kan være null, afvises af nogle klienter.
            pris_pr_konvertering_dkk: z.number().optional()
          })
        )
      }),
      // Hints til klienten. De er ikke en sikkerhedsmekanisme: toolet kan ikke skrive, fordi koden ikke gør det.
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ fra, til }) => {
      const alle = await laesForbrug();
      const valgte = alle.filter(r => (!fra || r.dato >= fra) && (!til || r.dato <= til));

      const summer = new Map<string, { forbrug: number; konverteringer: number }>();
      for (const r of valgte) {
        const sum = summer.get(r.kanal) ?? { forbrug: 0, konverteringer: 0 };
        sum.forbrug += r.forbrug;
        sum.konverteringer += r.konverteringer;
        summer.set(r.kanal, sum);
      }

      const datoer = valgte.map(r => r.dato).sort();
      const resultat = {
        periode: { fra: datoer[0] ?? '', til: datoer.at(-1) ?? '' },
        raekker: valgte.length,
        kanaler: [...summer].map(([kanal, sum]) => ({
          kanal,
          forbrug_dkk: sum.forbrug,
          konverteringer: sum.konverteringer,
          ...(sum.konverteringer > 0 ? { pris_pr_konvertering_dkk: Math.round(sum.forbrug / sum.konverteringer) } : {})
        }))
      };

      // content er tekst til modellen. structuredContent er de samme data som objekt.
      // Når der er et outputSchema, skal begge med.
      return { content: [{ type: 'text', text: JSON.stringify(resultat) }], structuredContent: resultat };
    }
  );

  // En resource er data, som klienten kan slå op på en adresse.
  server.registerResource(
    'kolonner',
    'data://forbrug/kolonner',
    {
      title: 'Kolonner i forbrugsdata',
      description: 'Forklarer kolonnerne i forbrugsdata',
      mimeType: 'text/plain'
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          text:
            'dato: ugens første dag (ÅÅÅÅ-MM-DD). kanal: annoncekanalen. ' +
            'forbrug_dkk: forbrug i danske kroner uden moms. konverteringer: antal køb. Tallene er eksempeldata.'
        }
      ]
    })
  );

  return server;
}
