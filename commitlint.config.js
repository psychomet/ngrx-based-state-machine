const { execSync } = require('child_process');

function getNxScopes() {
  try {
    return execSync('npx --no-install nx show projects', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((name) => (name.startsWith('@') ? name.split('/')[1] : name));
  } catch {
    return [];
  }
}

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', getNxScopes()],
  },
};
