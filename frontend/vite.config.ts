import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
      manifest: {
        id: '/',                // Garante identidade consistente
        name: 'Gestão Obra',
        short_name: 'GObra',
        theme_color: '#f59e0b',
        background_color: '#030712',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'      // Essencial para ser reconhecido como ícone válido
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          // Opcional: ícone maskable para Android (recorte adaptável)
          // Você pode gerar um ícone com margens seguras usando ferramentas como o Maskable.app
          // {
          //   src: '/icon-maskable.png',
          //   sizes: '512x512',
          //   type: 'image/png',
          //   purpose: 'maskable'
          // }
        ],
        // Screenshots são opcionais, mas se quiser a UI aprimorada, adicione:
        // screenshots: [
        //   {
        //     src: '/screenshot-desktop.png',
        //     sizes: '1280x720',
        //     type: 'image/png',
        //     form_factor: 'wide'
        //   },
        //   {
        //     src: '/screenshot-mobile.png',
        //     sizes: '750x1334',
        //     type: 'image/png',
        //     form_factor: 'narrow'
        //   }
        // ]
      }
    })
  ]
})