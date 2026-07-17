/**
 * Capacitor sync drift gate:
 * - android/ and ios/ projects exist
 * - the native appId matches the canonical identity
 * - the tracked native tree is clean after "cap sync" (CI runs sync first)
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const problems = [];

if (!existsSync('android/app/build.gradle')) {
  problems.push('android project missing (npx cap add android)');
}
if (!existsSync('ios/App/App/Info.plist')) {
  problems.push('ios project missing (npx cap add ios)');
}

const identitySource = readFileSync('src/shared/config/app-identity.constants.ts', 'utf8');
const appId = /appId:\s*'([^']+)'/u.exec(identitySource)?.[1] ?? null;
if (appId === null) {
  problems.push('could not read appId from app-identity.constants.ts');
}

if (appId !== null && existsSync('android/app/build.gradle')) {
  const gradle = readFileSync('android/app/build.gradle', 'utf8');
  if (!gradle.includes(`applicationId "${appId}"`)) {
    problems.push(`android applicationId does not match canonical appId ${appId}`);
  }
}

if (appId !== null && existsSync('ios/App/App.xcodeproj/project.pbxproj')) {
  const pbxproj = readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8');
  if (!pbxproj.includes(appId)) {
    problems.push(`ios bundle identifier does not match canonical appId ${appId}`);
  }
}

// A Windows-generated Package.swift carries backslash paths, which are not
// separators on macOS and are string escapes in Swift. Catch it by name rather
// than only as drift, so the failure says what is actually wrong.
const spmManifest = 'ios/App/CapApp-SPM/Package.swift';
if (existsSync(spmManifest)) {
  const manifest = readFileSync(spmManifest, 'utf8');
  if (/path:\s*"[^"]*\\/u.test(manifest)) {
    problems.push(
      `${spmManifest} contains Windows path separators. Run "npm run cap:sync" ` +
        '(which normalizes them) and commit the result.',
    );
  }
}

const nativeDiff = execSync('git status --porcelain -- android ios', { encoding: 'utf8' }).trim();
if (nativeDiff !== '') {
  problems.push(`native tree drifted after sync:\n${nativeDiff}`);
}

if (problems.length > 0) {
  console.error(`Capacitor sync gate FAILED (${String(problems.length)}):`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log('Capacitor sync gate passed.');
