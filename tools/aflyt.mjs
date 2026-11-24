// Aflytning: starter serveren og gemmer hver besked ind og ud i trafik.log.
// Peg din klient på denne fil i stedet for dist/index.js, når du vil se hvad der bliver sagt.
// Se trafikken bagefter med: npm run trafik
import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rod = join(dirname(fileURLToPath(import.meta.url)), '..');
const logFil = join(rod, 'trafik.log');

// Data kommer i bidder, og en lang besked kan være delt over flere. Saml derfor til hele linjer.
function linjeSamler(retning) {
  let rest = '';
  return data => {
    const dele = (rest + data).split('\n');
    rest = dele.pop() ?? '';
    for (const linje of dele.filter(Boolean)) {
      appendFileSync(logFil, JSON.stringify({ tid: new Date().toISOString(), retning, besked: linje }) + '\n');
    }
  };
}
const gemKlient = linjeSamler('klient');
const gemServer = linjeSamler('server');

const server = spawn(process.execPath, [join(rod, 'dist/index.js')], {
  cwd: rod,
  env: process.env,
  stdio: ['pipe', 'pipe', 'inherit']
});

process.stdin.on('data', data => {
  gemKlient(data);
  server.stdin.write(data);
});
process.stdin.on('end', () => server.stdin.end());
server.stdout.on('data', data => {
  gemServer(data);
  process.stdout.write(data);
});
server.on('exit', kode => process.exit(kode ?? 0));
