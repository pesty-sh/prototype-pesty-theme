import { execSync } from 'node:child_process'
import pkg from '../package.json'

function revision() {
  const fromHost = process.env.VERCEL_GIT_COMMIT_SHA
  if (fromHost) return fromHost.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'unknown'
  }
}

/** `package.json` version, plus the commit, so a deploy can be checked in the page source. */
export const release = `${pkg.version}+${revision()}`
