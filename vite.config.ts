import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("cmdk") || id.includes("vaul") || id.includes("sonner")) {
            return "ui";
          }
          if (id.includes("@tanstack")) return "query";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("react-router")) return "router";
          if (id.includes("react-helmet")) return "helmet";
          if (id.includes("react") || id.includes("scheduler")) return "vendor";
          return "vendor";
        },
      },
    },
  },
}));
