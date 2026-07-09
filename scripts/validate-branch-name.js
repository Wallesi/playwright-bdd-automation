#!/usr/bin/env node
const { execSync } = require('child_process');

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];
const BRANCH_REGEX = new RegExp(`^(${VALID_TYPES.join('|')})\\/[a-z0-9]+(?:-[a-z0-9]+)*$`);
const EXEMPT_BRANCHES = ['main', 'master', 'develop', 'dev', 'staging'];

function getCurrentBranch() {
  try {
    return execSync('git symbolic-ref --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const branch = getCurrentBranch();

if (!branch || EXEMPT_BRANCHES.includes(branch)) {
  process.exit(0);
}

if (!BRANCH_REGEX.test(branch)) {
  console.error(`\nInvalid branch name: "${branch}"`);
  console.error(`   Expected pattern: <type>/<kebab-case-description>`);
  console.error(`   Valid types: ${VALID_TYPES.join(', ')}`);
  console.error(`   Example: feat/login-page, fix/navbar-overlap\n`);
  process.exit(1);
}

process.exit(0);
