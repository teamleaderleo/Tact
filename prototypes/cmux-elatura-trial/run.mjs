#!/usr/bin/env node
// Reproduce contract evidence without launching or attaching to a browser.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, symlinkSync, rmSync, existsSync } from 'node:fs';
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
function options(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (['--help', '--preflight'].includes(args[i])) result[args[i]] = true;
    else if (['--sources-root', '--report'].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) result[args[i]] = resolve(args[++i]);
    else throw new Error(`Unknown or incomplete option: ${args[i]}`);
  }
  return result;
}
function materialize(repo, revision, paths, destination) {
  mkdirSync(destination, {recursive: true});
  const archive = command('git', ['-C', repo, 'archive', '--format=tar', revision, ...paths], {encoding: null});
  execFileSync('tar', ['-xf', '-', '-C', destination], {input: archive, timeout: 30000, stdio: ['pipe', 'pipe', 'pipe']});
}
let scratch;
try {
  const opts = options(process.argv.slice(2));
  if (opts['--help']) {
    console.log('Usage: node run.mjs --sources-root /path/to/Projects [--preflight] [--report result.json]\nUses pinned Git objects, not checkout HEAD. No browser or build fleet needed for contract checks.\nELATURA_ROOT, BROWSER_ROOT, CMUX_ROOT and IDENTITY_ROOT override individual repositories.');
    process.exit(0);
  }
  const sourceRoot = opts['--sources-root'];
  function repo(env, names) {
    if (process.env[env]) return resolve(process.env[env]);
    if (!sourceRoot) throw new Error(`Set --sources-root or ${env}`);
    return names.map(name => join(sourceRoot, name)).find(existsSync) ?? join(sourceRoot, names[0]);
  }
  const elaturaRepo = repo('ELATURA_ROOT', ['elatura']);
  const browser = repo('BROWSER_ROOT', ['cmux-browser', 'private-browser-runtime']);
  const cmux = repo('CMUX_ROOT', ['cmux']);
  // #81's immutable commit is in this repository's object store: no second worktree needed.
  const identityRepo = process.env.IDENTITY_ROOT ? resolve(process.env.IDENTITY_ROOT) : project;
  const checks = [];
  function check(name, operation) {
    try { operation(); checks.push({name, ready: true}); }
    catch { checks.push({name, ready: false}); }
  }
  for (const [name, directory, revision, path] of [
    ['elatura-source', elaturaRepo, sources.elatura.revision, 'packages/core/src/application-lane-runtime.ts'],
    ['browser-source', browser, sources.browser.revision, 'overlay/chrome/browser/cmux_term/window_model.h'],
    ['identity-source', identityRepo, sources.identity.revision, `${sources.identity.path}/sources.json`]
  ]) check(name, () => command('git', ['-C', directory, 'cat-file', '-e', `${revision}:${path}`]));
  const compiler = join(elaturaRepo, 'node_modules/.bin/tsc');
  check('typescript', () => command(compiler, ['--version']));
  for (const tool of ['python3', 'clang++', 'swiftc', 'tar']) check(tool, () => command(tool, ['--version']));
  check('vitest', () => {
    if (!existsSync(join(elaturaRepo, 'node_modules/.bin/vitest'))) throw new Error('missing');
  });
  check('identity-owner-sources', () => {
    const manifest = JSON.parse(command('git', ['-C', identityRepo, 'show', `${sources.identity.revision}:${sources.identity.path}/sources.json`]));
    for (const [name, source] of Object.entries(manifest.repositories)) {
      const directory = {'cmux': cmux, 'cmux-browser': browser, 'elatura': elaturaRepo}[name];
      for (const path of Object.keys(source.files)) command('git', ['-C', directory, 'cat-file', '-e', `${source.revision}:${path}`]);
    }
  });
  const readiness = {contractReady: checks.every(check => check.ready), checks,
    live: {status: 'separate-validation-gate', requires: ['approved CMUX Browser build and dedicated profile', ...sources.browser.missingExternalCapabilities]},
    nativeCmux: {host: 'WKWebView', substitutesForChromiumEvidence: false}};
  function report(value) {
    const json = `${JSON.stringify(value, null, 2)}\n`;
    if (opts['--report']) writeFileSync(opts['--report'], json);
    process.stdout.write(json);
  }
  if (opts['--preflight'] || !readiness.contractReady) {
    report(readiness);
    process.exitCode = readiness.contractReady ? 0 : 1;
  } else {
    process.stderr.write('Pinned objects available. Running synthetic/contract checks.\n');
    mkdirSync(join(project, '.local'), { recursive: true });
    scratch = mkdtempSync(join(project, '.local/trial87-'));
    writeFileSync(join(scratch, 'package.json'), '{"type":"module"}\n');
    const elatura = join(scratch, 'elatura-source'), identity = join(scratch, 'identity-source');
    materialize(elaturaRepo, sources.elatura.revision, ['packages/core', 'package.json', 'package-lock.json'], elatura);
    materialize(identityRepo, sources.identity.revision, [sources.identity.path], identity);
    symlinkSync(join(elaturaRepo, 'node_modules'), join(elatura, 'node_modules'));
    // Only disposable outputs in this task; no canonical checkout build mutation.
    const core = join(scratch, 'core');
    command(compiler, ['--project', 'packages/core', '--outDir', core,
      '--tsBuildInfoFile', join(scratch, 'core.tsbuildinfo'), '--pretty', 'false'], { cwd: elatura });
    const adapterOutput = command(process.execPath, ['--test', '--test-reporter=tap', join(here, 'adapter.test.mjs')],
      {env: {...process.env, ELATURA_ROOT: elatura, ELATURA_CORE_DIST: core, IDENTITY_ROOT: identity}});
    const testFiles = ['application-lane-runtime', 'application-lane-client', 'application-lane-lifecycle',
      'application-lane-interaction', 'application-lane-interaction-clock'].map(name => `packages/core/test/${name}.test.ts`);
    const ownerOutput = command('npm', ['test', '--', ...testFiles], { cwd: elatura });
    for (const [name, path] of [['cmux', cmux], ['cmux-browser', browser], ['elatura', elaturaRepo]]) symlinkSync(path, join(scratch, name));
    process.stderr.write('Adapter and Elatura checks passed. Running the #81 owner suite.\n');
    const identityOutput = command('python3', [join(identity, sources.identity.path, 'run.py'), '--sources-root', scratch, '--typescript', compiler]);
    const receipt = {
      evidence: 'synthetic-contract', recordedAt: new Date().toISOString(),
      sourceMode: 'immutable-git-objects', readiness,
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
    report(receipt);
  }
} catch (error) {
  // Never print environment/host content. Tool output here is synthetic compiler/test output only.
  process.stderr.write(`Trial failed: ${error.message.split('\n')[0]}\n`);
  if (error.stdout) process.stderr.write(String(error.stdout).slice(-5000));
  if (error.stderr) process.stderr.write(String(error.stderr).slice(-2000));
  process.exitCode = 1;
} finally {
  if (scratch) rmSync(scratch, {recursive: true, force: true});
}
