import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { allowedScriptHashesOf, cspProblemsOf } from './check-csp.ts'

const MAC_SCRIPT = 'document.documentElement.classList.toggle("mac",true)'
const MAC_HASH = `sha256-${createHash('sha256').update(MAC_SCRIPT).digest('base64')}`

const vercelJson = (scriptSource: string): unknown => ({
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: `default-src 'self'; ${scriptSource}; object-src 'none'` },
      ],
    },
  ],
})

describe('[scripts] CSP - allowedScriptHashesOf and cspProblemsOf', () => {
  it('should read the script hashes from the policy in vercel.json', () => {
    // Act
    const hashes = allowedScriptHashesOf(vercelJson(`script-src 'self' '${MAC_HASH}'`))

    // Assert
    expect(hashes).toStrictEqual([MAC_HASH])
  })

  it('should pass pages whose inline scripts the policy allows, ignoring scripts loaded by src', () => {
    // Arrange
    const html = `<script id="check-mac-os">${MAC_SCRIPT}</script><script type="module" src="/assets/app.js"></script>`

    // Act
    const problems = cspProblemsOf([MAC_HASH], new Map([['index.html', html]]))

    // Assert
    expect(problems).toStrictEqual([])
  })

  it('should fail an inline script the policy does not allow and a hash no page uses', () => {
    // Arrange
    const html = '<script>window.__VP_HASH_MAP__={}</script>'
    const stale = 'sha256-AAAA'

    // Act
    const problems = cspProblemsOf([stale], new Map([['index.html', html]]))

    // Assert
    expect(problems).toStrictEqual([
      `index.html has an inline script whose hash sha256-${createHash('sha256').update('window.__VP_HASH_MAP__={}').digest('base64')} the CSP does not allow`,
      'The CSP allows sha256-AAAA, which no page uses',
    ])
  })
})
