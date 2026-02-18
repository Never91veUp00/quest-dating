import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Опции компилятора Vue
          isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }
    })
  ],

  // Алиасы путей
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
      '@store': resolve(__dirname, 'src/store'),
      '@composables': resolve(__dirname, 'src/composables')
    }
  },

  // Настройки сервера разработки
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Настройки сборки
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделение vendor библиотек
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'utils': [
            './src/utils/formatters.js',
            './src/utils/validators.js',
            './src/utils/helpers.js'
          ]
        },
        // Именование чанков
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Увеличиваем лимит размера чанка
    chunkSizeWarningLimit: 1000
  },

  // Оптимизации
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  },

  // CSS настройки
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.css";`
      }
    }
  },

  // Define глобальные константы
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // Preview настройки (для prod preview)
  preview: {
    port: 4173,
    host: true,
    open: true
  }
})