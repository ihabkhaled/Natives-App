/**
 * Cross-platform Gradle runner for the committed Android project.
 * Fails with an actionable message when the environment cannot build.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const task = process.argv[2];
if (task === undefined) {
  console.error('Usage: node scripts/native/run-gradle.mjs <gradle-task>');
  process.exit(1);
}

if (!existsSync('android/gradlew')) {
  console.error('android/ project not found. Run "npx cap add android" first.');
  process.exit(1);
}

const javaProbe = spawnSync('java', ['-version'], { encoding: 'utf8' });
if (javaProbe.error !== undefined) {
  console.error(
    `Android verification requires a JDK (17+) on PATH; "java -version" failed. ` +
      `Install a JDK and set JAVA_HOME. Task "${task}" was NOT executed.`,
  );
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const command = isWindows ? 'gradlew.bat' : './gradlew';
const result = spawnSync(command, [task], {
  cwd: 'android',
  stdio: 'inherit',
  shell: isWindows,
});

// spawnSync reports a failure to START the process through `error`, leaving
// status null. Without this branch the runner exits 1 printing nothing, which
// is indistinguishable from a Gradle task failure and impossible to debug from
// a CI log. The usual cause is android/gradlew missing its executable bit.
if (result.error !== undefined) {
  console.error(`Failed to start "${command} ${task}": ${result.error.message}`);
  if (!isWindows) {
    console.error(
      'If this is EACCES, android/gradlew is not executable. Fix it in git with:\n' +
        '  git update-index --chmod=+x android/gradlew',
    );
  }
  process.exit(1);
}

if (result.status === null) {
  console.error(`"${command} ${task}" was terminated by signal ${String(result.signal)}.`);
  process.exit(1);
}

process.exit(result.status);
