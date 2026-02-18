import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@chromatic-com/storybook",
  ],
  framework: "@storybook/react-vite",
  viteFinal: async (config) => {
    config.plugins = (config.plugins || []).filter((plugin) => {
      if (!plugin) {
        return true;
      }

      const pluginName = "name" in plugin ? plugin.name : "";
      return pluginName !== "vite-plugin-pwa";
    });

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": resolve(__dirname, "../src"),
      "@/types": resolve(__dirname, "../src/types"),
      "@/lib": resolve(__dirname, "../src/lib"),
      "@/api": resolve(__dirname, "../src/api"),
      "@/services": resolve(__dirname, "../src/services"),
      "@/store": resolve(__dirname, "../src/store"),
      "@/hooks": resolve(__dirname, "../src/hooks"),
      "@/queries": resolve(__dirname, "../src/queries"),
      "@/components": resolve(__dirname, "../src/components"),
      "@/pages": resolve(__dirname, "../src/pages"),
      "@/router": resolve(__dirname, "../src/router"),
      "@/assets": resolve(__dirname, "../src/assets"),
      "@assets": resolve(__dirname, "../src/assets"),
      "@public": resolve(__dirname, "../public"),
    };
    return config;
  },
};

export default config;
