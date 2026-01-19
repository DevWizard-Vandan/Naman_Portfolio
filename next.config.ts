import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Transpile three.js packages for better compatibility
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier'],
};

export default nextConfig;
