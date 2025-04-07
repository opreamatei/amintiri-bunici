/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*",
            }
        ]
    },
    devIndicators: {
        appIsrStatus: true,
        buildActivity: true,
        buildActivityPosition: "bottom-right",
    },
    experimental: {
        after: true,
        ppr: 'incremental',
    }
};

export default nextConfig;
