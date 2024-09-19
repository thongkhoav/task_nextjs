/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/rooms",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
