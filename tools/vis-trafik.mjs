// Viser trafik.log i en læsbar form: hvem sagde hvad, i rækkefølge.
// Brug: npm run trafik          (kort)
//       npm run trafik -- --alt (hele beskeden)
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const logFil = join(dirname(fileURLToPath(import.meta.url)), '..', 'trafik.log');
const visAlt = process.argv.includes('--alt');

if (!existsSync(logFil)) {
  console.log('Ingen trafik.log endnu. Peg din klient på tools/aflyt.mjs og stil et spørgsmål.');
  process.exit(0);
}

function kort(besked) {
  if (besked.method) {
    const p = besked.params ?? {};
    if (besked.method === 'tools/call') return 'tools/call  ' + p.name + ' ' + JSON.stringify(p.arguments ?? {});
    if (besked.method === 'subscriptions/listen') return 'subscriptions/listen  ' + JSON.stringify(p.notifications ?? {});
    if (besked.method === 'resources/read') return 'resources/read  ' + p.uri;
    return besked.method;
  }
  if (besked.error) return 'FEJL  ' + besked.error.message;
  const r = besked.result ?? {};
  if (r.isError) return 'svar: FEJL fra tool  ' + (r.content?.[0]?.text ?? '').slice(0, 200);
  if (r.tools) return 'svar: tools  ' + r.tools.map(t => t.name).join(', ');
  if (r.resources) return 'svar: resources  ' + r.resources.map(x => x.uri).join(', ');
  if (r.structuredContent) return 'svar: resultat  ' + JSON.stringify(r.structuredContent).slice(0, 160);
  if (r.capabilities) return 'svar: det kan jeg  ' + Object.keys(r.capabilities).join(', ');
  return 'svar';
}

for (const linje of readFileSync(logFil, 'utf8').split('\n').filter(Boolean)) {
  const { tid, retning, besked } = JSON.parse(linje);
  const pil = retning === 'klient' ? 'KLIENT ->' : 'SERVER <-';
  let tekst;
  try {
    tekst = visAlt ? JSON.stringify(JSON.parse(besked), null, 2) : kort(JSON.parse(besked));
  } catch {
    tekst = besked;
  }
  console.log(new Date(tid).toLocaleTimeString('da-DK') + '  ' + pil + '  ' + tekst);
}
