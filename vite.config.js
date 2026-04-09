import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,   // bind 0.0.0.0 — เข้าถึงได้จาก IP ภายใน
    port: 5173,
  },
})
