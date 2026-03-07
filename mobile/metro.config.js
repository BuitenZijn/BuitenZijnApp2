const fs = require("fs");
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the shared convex/ directory from the parent (monorepo layout)
const convexDir = path.resolve(workspaceRoot, "convex");
if (fs.existsSync(convexDir)) {
  config.watchFolders = [convexDir];
}

// Allow Metro to resolve from both mobile/node_modules and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Make sure the convex directory files are resolved
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
};

module.exports = config;
