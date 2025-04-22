/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx'],
  // Configuración para TypeScript
  typescript: {
    ignoreBuildErrors: true,
  }
}

export default nextConfig
