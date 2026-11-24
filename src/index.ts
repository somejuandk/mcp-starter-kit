import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

// Indlæs .env fra projektmappen, hvis filen findes. Klienten starter serveren fra et
// andet sted, så stien regnes ud fra denne fil og ikke fra den mappe, man står i.
// I Docker findes .env ikke. Der gives indstillingerne med --env-file.
const envFil = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (existsSync(envFil)) process.loadEnvFile(envFil);

// Importeres først nu, så indstillingerne fra .env er på plads, når serveren læser dem.
const { lavServer } = await import('./server.js');

// stdio: klienten (fx Claude) starter dette program og taler med det via tekst ind og ud.
// stdout er reserveret til protokollen. Skriv derfor ALDRIG console.log her, kun console.error.
serveStdio(lavServer, {
  onerror: fejl => console.error('mcp-starter-kit fejl:', fejl.message)
});

console.error('mcp-starter-kit kører (stdio)');
