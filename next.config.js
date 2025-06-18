/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    // referenceとtmpフォルダを除外
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /(refarence|tmp|backup-.*)/,
    });
    
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.next/**',
          '**/refarence/**',
          '**/tmp/**',
          '**/backup-*/**'
        ]
      }
    }
    return config;
  },
  // 開発サーバーの設定
  onDemandEntries: {
    // ページをメモリに保持する時間
    maxInactiveAge: 25 * 1000,
    // 同時にメモリに保持するページ数
    pagesBufferLength: 2,
  },
  // メモリ使用量の制限
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material']
  }
}

module.exports = nextConfig 