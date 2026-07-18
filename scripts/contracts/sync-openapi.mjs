import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import process from 'node:process';

const SOURCE_ARTIFACT = '../Natives-Backend/contracts/openapi.json';
const SOURCE_CHECKSUM = '../Natives-Backend/contracts/openapi.sha256';
const TARGET_DIRECTORY = 'contracts';
const TARGET_ARTIFACT = 'contracts/openapi.json';
const TARGET_CHECKSUM = 'contracts/openapi.sha256';
const CHECK_FLAG = '--check';

function hashArtifact(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function readChecksum(path) {
  return readFileSync(path, 'utf8').trim();
}

function assertPair(artifactPath, checksumPath, label) {
  if (!existsSync(artifactPath) || !existsSync(checksumPath)) {
    throw new Error(`${label} OpenAPI artifact/checksum is missing.`);
  }
  const expected = readChecksum(checksumPath);
  const actual = hashArtifact(artifactPath);
  if (actual !== expected) {
    throw new Error(`${label} OpenAPI checksum mismatch.`);
  }
  return actual;
}

function assertSiblingMatches(checksum) {
  if (!existsSync(SOURCE_ARTIFACT) || !existsSync(SOURCE_CHECKSUM)) {
    return;
  }
  const sourceChecksum = assertPair(SOURCE_ARTIFACT, SOURCE_CHECKSUM, 'Backend');
  if (sourceChecksum !== checksum) {
    throw new Error(
      'Frontend contract differs from the sibling backend artifact. Run npm run contract:sync.',
    );
  }
}

function check() {
  const checksum = assertPair(TARGET_ARTIFACT, TARGET_CHECKSUM, 'Frontend');
  assertSiblingMatches(checksum);
  console.log(`OpenAPI contract verified (sha256 ${checksum}).`);
}

function sync() {
  const checksum = assertPair(SOURCE_ARTIFACT, SOURCE_CHECKSUM, 'Backend');
  mkdirSync(TARGET_DIRECTORY, { recursive: true });
  copyFileSync(SOURCE_ARTIFACT, TARGET_ARTIFACT);
  copyFileSync(SOURCE_CHECKSUM, TARGET_CHECKSUM);
  console.log(`OpenAPI contract synchronized (sha256 ${checksum}).`);
}

if (process.argv.includes(CHECK_FLAG)) {
  check();
} else {
  sync();
}
