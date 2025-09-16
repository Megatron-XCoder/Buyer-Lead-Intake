/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  outputFileTracingRoot: require('path').join(__dirname),
  webpack: (config, { isServer }) => {
    // Ignore optional dependencies that aren't needed
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'drizzle-orm': false,
    };
    
    // Ignore modules that aren't needed
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('drizzle-orm');
    }
    
    return config;
  },
}

module.exports = nextConfig