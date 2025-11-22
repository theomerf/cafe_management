import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      pfx: fs.readFileSync('cert/localhost.pfx'),
      passphrase: 'dev123',
    },
    host: 'localhost',
    port: 3000,
  },
});
