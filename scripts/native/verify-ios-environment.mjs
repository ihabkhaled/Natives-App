/**
 * Honest iOS verification. On macOS with Xcode it runs a real build check;
 * anywhere else it reports UNVERIFIED explicitly (exit 0: skipping is the
 * honest outcome, never a fake pass — CI treats macOS separately).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

if (!existsSync('ios/App/App.xcodeproj') && !existsSync('ios/App/App.xcworkspace')) {
  console.error('ios/ project not found. Run "npx cap add ios" first.');
  process.exit(1);
}

if (process.platform !== 'darwin') {
  console.log(
    `iOS build verification UNVERIFIED on this platform (${process.platform}). ` +
      'Compiling the iOS project requires macOS with Xcode. The committed ios/ ' +
      'project passed structural checks only.',
  );
  process.exit(0);
}

const xcodeProbe = spawnSync('xcodebuild', ['-version'], { encoding: 'utf8' });
if (xcodeProbe.error !== undefined) {
  console.error('macOS detected but xcodebuild is unavailable. Install Xcode command line tools.');
  process.exit(1);
}

const workspace = existsSync('ios/App/App.xcworkspace')
  ? ['-workspace', 'App.xcworkspace']
  : ['-project', 'App.xcodeproj'];
const result = spawnSync(
  'xcodebuild',
  [...workspace, '-scheme', 'App', '-destination', 'generic/platform=iOS Simulator', 'build'],
  { cwd: 'ios/App', stdio: 'inherit' },
);
process.exit(result.status ?? 1);
