import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";

// Custom plugin to serve theme files and provide API
function themeApiPlugin() {
  return {
    name: 'theme-api',
    configureServer(server) {
      // Serve static files from user-configs directory
      server.middlewares.use('/user-configs', (req, res, next) => {
        const filePath = path.join(process.cwd(), 'public', 'user-configs', req.url);
        
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const content = fs.readFileSync(filePath, 'utf-8');
          res.setHeader('Content-Type', 'text/plain');
          res.end(content);
        } else {
          next();
        }
      });

      // API endpoint to list available theme files
      server.middlewares.use('/api/themes', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        
        try {
          const userConfigsDir = path.join(process.cwd(), 'public', 'user-configs');
          
          if (!fs.existsSync(userConfigsDir)) {
            res.end(JSON.stringify({ themes: [] }));
            return;
          }
          
          const files = fs.readdirSync(userConfigsDir);
          const themeFiles = files.filter(file => {
            const singleThemePattern = /^[a-zA-Z0-9_-]+-jportal-theme\.config$/;
            const multiThemePattern = /^[a-zA-Z0-9_-]+-jportal-themes\.config$/;
            return singleThemePattern.test(file) || multiThemePattern.test(file);
          });
          
          const themes = themeFiles.map(filename => {
            const author = filename.match(/^([a-zA-Z0-9_-]+)-jportal-(theme|themes)\.config$/)?.[1] || 'Unknown';
            const isMultiTheme = filename.includes('-themes.config');
            
            return {
              filename,
              author,
              isMultiTheme,
              url: `/user-configs/${filename}`
            };
          });
          
          res.end(JSON.stringify({ themes }));
        } catch (error) {
          console.error('Error reading theme files:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to read theme files' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/jportal/",
  plugins: [
    react(),
    themeApiPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 ** 2, // 30MB
        globPatterns: ["**/*.{js,css,html,ico,png,svg,whl}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/pyodide\/v0\.23\.4\/full\/pyodide\.js$/,
            handler: "CacheFirst",
            options: {
              cacheName: "pyodide-cache",
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 1000, // 1000 days
              },
            },
          },
        ],
        additionalManifestEntries: [
          { url: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js", revision: null },
          { url: "/jportal/artifact/jiit_marks-0.2.0-py3-none-any.whl", revision: null },
          { url: "/jportal/artifact/PyMuPDF-1.24.12-cp311-abi3-emscripten_3_1_32_wasm32.whl", revision: null },
        ],
      },
      manifest: {
        name: "JPortal",
        short_name: "JPortal",
        description: "A web portal for students to view attendance and grades.",
        start_url: "/jportal/",
        display: "standalone",
        background_color: "#191c20",
        theme_color: "#191c20",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-icons/circle.ico",
            sizes: "48x48",
          },
          {
            src: "pwa-icons/circle.svg",
            sizes: "72x72 96x96",
            purpose: "maskable",
          },
          {
            src: "pwa-icons/tire.svg",
            sizes: "128x128 256x256",
          },
          {
            src: "pwa-icons/wheel.svg",
            sizes: "512x512",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    https: {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost.pem'),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
