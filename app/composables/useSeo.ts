export interface SeoOptions {
    title?: string
    description?: string
    keywords?: string[]
    image?: string
    type?: 'website' | 'article'
    author?: string
    publishedTime?: string
    modifiedTime?: string
    section?: string
}

export function useSeo(options: SeoOptions = {}) {
    const config = useRuntimeConfig()
    const route = useRoute()

    const defaults = {
        siteName: config.public.siteName || '工艺管理软件开发文档',
        siteUrl: config.public.siteUrl || 'https://process-card-docs.example.com',
        author: config.public.author || 'MVIT 侯阳洋',
        defaultImage: `${config.public.siteUrl || 'https://process-card-docs.example.com'}/images/og-default.png`
    }

    const imageUrl = computed(() => {
        if (!options.image) return defaults.defaultImage
        if (options.image.startsWith('http')) return options.image
        return `${defaults.siteUrl}${options.image}`
    })

    const pageUrl = computed(() => `${defaults.siteUrl}${route.path}`)

    const fullTitle = computed(() => {
        return options.title
            ? `${options.title} - ${defaults.siteName}`
            : defaults.siteName
    })

    useSeoMeta({
        title: fullTitle.value,
        description: options.description,
        keywords: options.keywords?.join(','),

        ogTitle: options.title || defaults.siteName,
        ogDescription: options.description,
        ogImage: imageUrl.value,
        ogImageAlt: options.title || defaults.siteName,
        ogUrl: pageUrl.value,
        ogType: options.type || 'website',
        ogSiteName: defaults.siteName,
        ogLocale: 'zh_CN',

        twitterCard: 'summary_large_image',
        twitterTitle: options.title || defaults.siteName,
        twitterDescription: options.description,
        twitterImage: imageUrl.value,
        twitterImageAlt: options.title || defaults.siteName,

        ...(options.type === 'article' && {
            articlePublishedTime: options.publishedTime,
            articleModifiedTime: options.modifiedTime,
            articleAuthor: options.author ? [options.author] : [defaults.author],
            articleSection: options.section
        })
    })

    useHead({
        link: [
            {
                rel: 'canonical',
                href: pageUrl.value
            }
        ],
        htmlAttrs: {
            lang: 'zh-CN'
        }
    })
}
