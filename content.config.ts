import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
    collections: {
        content: defineCollection({
            type: 'page',
            source: {
                include: '**/*.{md,yml}'
            },
            schema: z.object({
                date: z.string().optional(),
                keywords: z.array(z.string()).optional(),
                image: z.string().optional(),
                author: z.string().optional(),
                updatedDate: z.string().optional(),
                category: z.string().optional(),
                config: z.record(z.unknown()).optional()
            })
        })
    }
})
