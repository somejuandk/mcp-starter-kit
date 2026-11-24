// Smoke-test: starter serveren over stdio, som en klient ville gøre, og tjekker svarene.
// Kør med: npm test
// Når du skifter eksempel-toolet ud, skal testen skrives om til dine egne tools.
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

async function koer(protokol) {
  const client = new Client(
    { name: 'smoke-test', version: '0.0.1' },
    protokol ? { versionNegotiation: { mode: { pin: protokol } } } : undefined
  );
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ['dist/index.js'], stderr: 'ignore' }));

  const { tools } = await client.listTools();
  assert.deepEqual(tools.map(t => t.name), ['forbrug_pr_kanal']);
  assert.equal(tools[0].annotations?.readOnlyHint, true, 'toolet skal være markeret read-only');

  const alt = await client.callTool({ name: 'forbrug_pr_kanal', arguments: {} });
  assert.equal(alt.structuredContent.raekker, 18);
  const meta = alt.structuredContent.kanaler.find(k => k.kanal === 'Meta');
  assert.equal(meta.forbrug_dkk, 29500);
  assert.equal(meta.konverteringer, 214);

  const oktober = await client.callTool({ name: 'forbrug_pr_kanal', arguments: { fra: '2026-10-01', til: '2026-10-31' } });
  assert.equal(oktober.structuredContent.raekker, 12);

  // Ugyldigt input skal afvises, ikke gættes på.
  const forkert = await client.callTool({ name: 'forbrug_pr_kanal', arguments: { fra: 'i går' } }).catch(fejl => ({ isError: true, fejl }));
  assert.equal(forkert.isError, true, 'en ugyldig dato skal give en fejl');

  const { resources } = await client.listResources();
  assert.deepEqual(resources.map(r => r.uri), ['data://forbrug/kolonner']);

  await client.close();
}

await koer(); // ældre klienter (spec 2025-11-25)
await koer('2026-07-28'); // nye klienter
console.log('Alle smoke-tests bestået');
