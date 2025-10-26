const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./app/globals.css",
  experimental: { useLightningCss: false }, // keep false
  unstable_disablePackageManagerCheck: true, // prevents some native warnings
});
