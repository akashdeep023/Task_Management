#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const current = process.cwd();
const scope = JSON.parse(fs.readFileSync('coverage-critical.json', 'utf8'));
const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const project = path.relative(repository, current);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'taskmanagement-baseline-'));
const archived = path.join(temp, project);
try {
  const archive = execFileSync('git', ['archive', scope.baselineCommit, project], { cwd: repository, maxBuffer: 32 * 1024 * 1024 });
  execFileSync('tar', ['-xf', '-', '-C', temp], { input: archive });
  fs.symlinkSync(path.join(current, 'node_modules'), path.join(archived, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  fs.mkdirSync(path.join(archived, 'tests'), { recursive: true });
  fs.cpSync('tests/baseline', path.join(archived, 'tests/baseline'), { recursive: true });
  const backend = fs.existsSync('jest.config.cjs');
  for (const file of backend ? ['jest.config.cjs', 'jest.baseline.config.cjs', 'tests/setup.cjs'] : ['vitest.config.js', 'vitest.baseline.config.js', 'tests/setup.js']) {
    fs.copyFileSync(file, path.join(archived, file));
  }
  const runner = path.join(current, 'node_modules', backend ? 'jest/bin/jest.js' : 'vitest/vitest.mjs');
  const args = backend ? ['--runInBand', '--coverage', '--config', 'jest.baseline.config.cjs'] : ['run', '--coverage', '--config', 'vitest.baseline.config.js'];
  execFileSync(process.execPath, [runner, ...args], { cwd: archived, stdio: 'inherit', env: { ...process.env, TZ: 'UTC' } });
  fs.mkdirSync('coverage', { recursive: true });
  fs.rmSync('coverage/baseline', { force: true, recursive: true });
  fs.cpSync(path.join(archived, 'coverage/baseline'), 'coverage/baseline', { recursive: true });
  const files = [...new Set(Object.values(scope.modules).flat())].sort();
  const hashes = Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(archived, file))).digest('hex')]));
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/baseline-source-hashes.json', JSON.stringify({ baselineCommit: scope.baselineCommit, files: hashes }, null, 2) + '\n');
  console.log('Baseline measured from pinned Git commit ' + scope.baselineCommit + ' (0 original tests).');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

