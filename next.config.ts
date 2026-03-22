import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress webpack cache serialization warnings
    if (config.ignoreWarnings) {
      config.ignoreWarnings.push(
        {
          module: /./,
          message: /Serializing big strings/,
        },
        /Serializing big strings/
      );
    } else {
      config.ignoreWarnings = [
        {
          module: /./,
          message: /Serializing big strings/,
        },
        /Serializing big strings/,
      ];
    }
    
    // Suppress warnings in console
    if (config.infrastructureLogging) {
      config.infrastructureLogging.level = 'error';
    } else {
      config.infrastructureLogging = { level: 'error' };
    }
    
    return config;
  },
  // Suppress webpack warnings in build output
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
