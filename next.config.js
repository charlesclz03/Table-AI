/** @type {import('next').NextConfig} */

let canonicalSiteOrigin
try {
  canonicalSiteOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : undefined
} catch {
  canonicalSiteOrigin = undefined
}

const DEFAULT_CANONICAL_ORIGIN = 'https://example.com'
const canonicalOrigin = canonicalSiteOrigin || DEFAULT_CANONICAL_ORIGIN
const canonicalHost = new URL(canonicalOrigin).hostname

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=()',
  },
]

const knownHosts = (process.env.NEXT_PUBLIC_KNOWN_HOSTS || '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)
  .filter((host) => host !== canonicalHost)

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return knownHosts.map((host) => ({
      source: '/:path((?!api).*)',
      has: [{ type: 'host', value: host }],
      destination: `${canonicalOrigin}/:path`,
      permanent: true,
    }))
  },
}

module.exports = nextConfig
