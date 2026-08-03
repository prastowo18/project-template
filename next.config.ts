import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const outputMode = process.env.NEXT_OUTPUT_MODE?.trim();

if (outputMode && outputMode !== "standalone") {
  throw new Error('NEXT_OUTPUT_MODE hanya mendukung nilai "standalone".');
}

const contentSecurityPolicy = [
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  {
    key: "X-XSS-Protection",
    value: "0",
  },
  {
    key: "Permissions-Policy",
    value: ["camera=()", "geolocation=()", "microphone=()", "payment=()", "usb=()"].join(", "),
  },

  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  ...(outputMode === "standalone"
    ? {
        output: "standalone" as const,
      }
    : {}),

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
