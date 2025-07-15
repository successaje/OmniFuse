/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_OMNIVAULT_ADDRESS: process.env.NEXT_PUBLIC_OMNIVAULT_ADDRESS,
    NEXT_PUBLIC_ZETA_RPC_URL: process.env.NEXT_PUBLIC_ZETA_RPC_URL,
    NEXT_PUBLIC_BASE_RPC_URL: process.env.NEXT_PUBLIC_BASE_RPC_URL,
    NEXT_PUBLIC_ETHEREUM_RPC_URL: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL,
    NEXT_PUBLIC_BNB_RPC_URL: process.env.NEXT_PUBLIC_BNB_RPC_URL,
  },
}

module.exports = nextConfig 