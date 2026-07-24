import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
        // During local dev, run `vercel dev` to serve /api functions.
        // This proxy is a no-op placeholder if you use `vite` directly with a separate api server.
        },
    },
});
