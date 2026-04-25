/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep heavy native / Node.js-only packages out of the Edge runtime
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  // MUI needs to be transpiled for Next.js App Router SSR
  transpilePackages: [
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
  ],
};

export default nextConfig;
