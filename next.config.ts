import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: { remotePatterns: [
            { protocol: 'https', hostname: 'covers.openlibrary.org' },
            { protocol: 'https', hostname: 'cqpngeypffxrgk3k.public.blob.vercel-storage.com' },
    ]}
  /* config options here */
};

export default nextConfig;
