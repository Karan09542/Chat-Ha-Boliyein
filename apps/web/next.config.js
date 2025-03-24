/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    // if (!isServer) {
    //   config.externals = [...config.externals, "webpack"];
    // } else {
    config.module.rules.push({
      test: /\.svg$/i,
      // include: /src\/assets\/.*\.svg$/, // this allows icon.svg in app dir to work. All SVGs to be handled by SVGR are in src/assets || disable label
      use: ["@svgr/webpack"],
    });
    // }

    return config;
  },

  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  }, // || disable label

  // in production disable, disable label
};

export default nextConfig;
