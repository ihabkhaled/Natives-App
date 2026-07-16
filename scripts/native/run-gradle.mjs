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

const command = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const result = spawnSync(command, [task], {
  cwd: 'android',
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
