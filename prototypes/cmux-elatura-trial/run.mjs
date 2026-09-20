#!/usr/bin/env node
// Reproduce contract evidence without launching or attaching to a browser.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { platform, arch, totalmem, cpus, release } from 'node:os';
const here = fileURLToPath(new URL('.', import.meta.url));
const project = resolve(here, '../..');
const sources = JSON.parse(readFileSync(join(here, 'sources.json')));
function command(binary, args, options = {}) {
  return execFileSync(binary, args, { encoding: 'utf8', timeout: 120000,
    maxBuffer: 4 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], ...options });
}
function root(name) {
  if (!process.env[name]) throw new Error(`Set ${name}; see README.md`);
  return resolve(process.env[name]);
}
function pin(path, revision, paths = []) {
  if (command('git', ['-C', path, 'rev-parse', 'HEAD']).trim() !== revision) throw new Error('source-revision-mismatch');
  command('git', ['-C', path, 'diff', '--exit-code', revision, '--', ...paths]);
}
let scratch;
try {
  const elatura = root('ELATURA_ROOT'), browser = root('BROWSER_ROOT'), identity = root('IDENTITY_ROOT');
  pin(elatura, sources.elatura.revision, sources.elatura.paths);
  pin(browser, sources.browser.revision, sources.browser.paths);
  if (!sources.identity.revision) throw new Error('identity-owner-revision-not-yet-pinned');
  pin(identity, sources.identity.revision, [sources.identity.path]);
  process.stdout.write('Pinned owners verified. Running synthetic/contract checks.\n');
  mkdirSync(join(project, '.local'), { recursive: true });
  scratch = mkdtempSync(join(project, '.local/trial87-'));
  writeFileSync(join(scratch, 'package.json'), '{"type":"module"}\n');
  // Only disposable outputs in this task; no canonical checkout build mutation.
  const core = join(scratch, 'core');
  command(join(elatura, 'node_modules/.bin/tsc'), ['--project', 'packages/core', '--outDir', core,
    '--tsBuildInfoFile', join(scratch, 'core.tsbuildinfo'), '--pretty', 'false'], { cwd: elatura });
  const adapterOutput = command(process.execPath, ['--test', '--test-reporter=tap', join(here, 'adapter.test.mjs')],
    {env: {...process.env, ELATURA_CORE_DIST: core}});
  const testFiles = ['application-lane-runtime', 'application-lane-client', 'application-lane-lifecycle',
    'application-lane-interaction', 'application-lane-interaction-clock'].map(name => `packages/core/test/${name}.test.ts`);
  const ownerOutput = command('npm', ['test', '--', ...testFiles], { cwd: elatura });
  for (const [name, path] of [['cmux', root('CMUX_ROOT')], ['cmux-browser', browser], ['elatura', elatura]]) symlinkSync(path, join(scratch, name));
  process.stdout.write('Adapter and Elatura checks passed. Running the #81 owner suite.\n');
  const identityOutput = command('python3', [join(identity, sources.identity.path, 'run.py'), '--sources-root', scratch]);
  const receipt = {
    evidence: 'synthetic-contract', recordedAt: new Date().toISOString(),
    pins: {elatura: sources.elatura.revision, browser: sources.browser.revision, identity: sources.identity.revision},
    machine: {os: platform(), osRelease: release(), architecture: arch(), memoryBytes: totalmem(), logicalCpuCount: cpus().length, node: process.version},
    adapter: {tests: Number(adapterOutput.match(/^# tests (\d+)$/m)?.[1]), passed: Number(adapterOutput.match(/^# pass (\d+)$/m)?.[1])},
    elatura: {passed: true, files: testFiles, summary: ownerOutput.replace(/\x1b\[[0-9;]*m/g, '').match(/Tests\s+\d+ passed[^\n]*/)?.[0] ?? 'owner tests passed'},
    identity: {passed: true, productionOwnerOutputPresent: identityOutput.includes('passed')},
    live: {status: 'not-run', approvedBuildAvailable: null, exactHostPortImplemented: false},
    untested: ['real daemon restart', 'real renderer transition', 'genuine page jump', 'authenticated application fidelity', 'whole-browser resources', 'switch/recovery latency'],
    limitations: sources.browser.missingExternalCapabilities,
    comparison: {status: 'prepared-not-run', measuredValues: null, promotionAllowed: false}
  };
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
} catch (error) {
  // Never print environment/host content. Tool output here is synthetic compiler/test output only.
  process.stderr.write(`Trial failed: ${error.message.split('\n')[0]}\n`);
  if (error.stdout) process.stderr.write(String(error.stdout).slice(-5000));
  if (error.stderr) process.stderr.write(String(error.stderr).slice(-2000));
  process.exitCode = 1;
} finally {
  if (scratch) rmSync(scratch, {recursive: true, force: true});
}
