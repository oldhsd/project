import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

test('application source remains valid UTF-8 without encoding-corruption markers', async () => {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const corruption = /\u00c2[\u0080-\u00bf]|\u00c3[\u0080-\u00bf]|\u00e2\u20ac|\ufffd/;
  async function inspect(directory: string): Promise<void> {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) await inspect(file);
      else if (/\.(ts|tsx|css)$/.test(item.name)) {
        const content = decoder.decode(await readFile(file));
        assert.equal(corruption.test(content), false, `Unexpected encoding corruption in ${file}`);
      }
    }
  }
  for (const directory of ['app', 'components', 'lib', 'models']) await inspect(directory);
});
