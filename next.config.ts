import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      }
      // qua aggiungieremo i protocolli reali es:
      // {
      //    protocol: "https",
      //    hostname: "images.example.com
      // }
    ]
  }
};

export default withIntl(nextConfig);
