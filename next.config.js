/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: [
      'fxtxegzuubiunsanfzbb.supabase.co',
      'lkcdxmxwemaszikttxwz.supabase.co',
      // add any other domains you use for images
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Optimize bundle
  swcMinify: true,
  // Optimize fonts
  optimizeFonts: true,
  // Enable modern JavaScript features
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig