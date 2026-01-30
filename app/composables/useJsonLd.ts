export type JsonLdType = 'website' | 'blogPosting' | 'article' | 'breadcrumb'

export interface WebSiteSchema {
  name: string
  description?: string
  url?: string
}

export interface BlogPostingSchema {
  headline: string
  description?: string
  datePublished?: string
  dateModified?: string
  author?: string
  image?: string
  url?: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function useJsonLd(type: JsonLdType, data: any) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const defaults = {
    siteUrl: config.public.siteUrl || 'https://process-card-docs.example.com',
    siteName: config.public.siteName || '工艺管理软件开发文档',
    author: config.public.author || 'MVIT 侯阳洋'
  }

  let schema: any = {}

  switch (type) {
    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': data.name || defaults.siteName,
        'description': data.description,
        'url': data.url || defaults.siteUrl,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${defaults.siteUrl}/?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }
      break

    case 'blogPosting':
      const imageUrl = data.image
        ? (data.image.startsWith('http') ? data.image : `${defaults.siteUrl}${data.image}`)
        : `${defaults.siteUrl}/images/og-default.png`

      schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': data.headline,
        'description': data.description,
        'image': imageUrl,
        'datePublished': data.datePublished,
        'dateModified': data.dateModified || data.datePublished,
        'author': {
          '@type': 'Person',
          'name': data.author || defaults.author
        },
        'publisher': {
          '@type': 'Organization',
          'name': defaults.siteName,
          'logo': {
            '@type': 'ImageObject',
            'url': `${defaults.siteUrl}/favicon.ico`
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': data.url || `${defaults.siteUrl}${route.path}`
        }
      }
      break

    case 'breadcrumb':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': data.items.map((item: BreadcrumbItem, index: number) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name,
          'item': item.url
        }))
      }
      break
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema)
      }
    ]
  })
}
