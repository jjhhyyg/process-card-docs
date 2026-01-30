// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/content', '@barzhsieh/nuxt-content-mermaid'],
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  icon: {
    localApiEndpoint: '/nuxt-icon'
  },
  ssr: false,
  devServer: {
    port: 3000
  },
  vite: {
    build: {
      sourcemap: false
    },
    optimizeDeps: {
      include: ['dayjs']
    }
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    storageKey: 'nuxt-color-mode',
    storage: 'localStorage'
  },
  app: {
    baseURL: '/',
    buildAssetsDir: 'assets',
    head: {
      htmlAttrs: {
        lang: 'zh-CN'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#0ea5e9' }
      ]
    }
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          },
          langs: [
            'java',
            'typescript',
            'javascript',
            'vue',
            'html',
            'css',
            'bash',
            'json',
            'sql',
            'yaml',
            'xml',
            'markdown'
          ]
        },
        toc: {
          depth: 5,
          searchDepth: 6
        }
      }
    },
    renderer: {
      anchorLinks: {
        h2: true,
        h3: true,
        h4: true,
        h5: true,
        h6: true
      }
    }
  },
  contentMermaid: {
    enabled: true,
    loader: {
      init: {
        securityLevel: 'loose',
        theme: 'default',
        fontFamily: 'inherit',
        flowchart: { 
          htmlLabels: true, 
          useMaxWidth: true 
        }
      },
      lazy: true
    },
    theme: {
      light: 'default',
      dark: 'dark'
    },
    toolbar: {
      title: '架构图',
      fontSize: '14px',
      buttons: {
        copy: true,
        fullscreen: true,
        expand: true
      }
    },
    expand: {
      enabled: true,
      margin: 0,
      invokeOpenOn: {
        diagramClick: true
      },
      invokeCloseOn: {
        esc: true,
        wheel: true,
        swipe: true,
        overlayClick: true,
        closeButtonClick: true
      }
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: 'https://process-card-docs.example.com',
      siteName: '工艺管理软件开发文档 ',
      siteDescription: '工艺管理软件开发文档，包含后端、前端开发指南及系统架构说明',
      author: 'MVIT 侯阳洋'
    }
  }
})