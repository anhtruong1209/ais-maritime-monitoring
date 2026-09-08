import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project — otherwise Turbopack warns
  // about (and may mis-resolve against) a package-lock.json one level up
  // in the parent CODE/ folder, which isn't part of this repo.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
