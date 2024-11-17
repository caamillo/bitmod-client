/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
              source: '/api/:path*',
              destination: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/:path*`, // API server on HTTP
            },
        ]
    }
};

export default nextConfig;
