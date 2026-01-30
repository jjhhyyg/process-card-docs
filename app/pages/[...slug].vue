<script setup lang="ts">
const route = useRoute()

const normalizedPath = computed(() => 
    route.path.endsWith('/') && route.path !== '/'
        ? route.path.slice(0, -1)
        : route.path
)

const { data: page } = await useAsyncData(
    `content-${route.path}`,
    () => queryCollection('content').path(normalizedPath.value).first(),
    {
        watch: [() => route.path]
    }
)

if (!page.value) {
    throw createError({
        statusCode: 404,
        message: `页面不存在: ${route.path}`
    })
}

import { useSeo } from '~/composables/useSeo'
import { useJsonLd } from '~/composables/useJsonLd'

useSeo({
    title: page.value?.title,
    description: page.value?.description,
    keywords: page.value?.keywords || [],
    image: page.value?.image,
    type: 'article',
    author: page.value?.author,
    publishedTime: page.value?.date,
    modifiedTime: page.value?.updatedDate || page.value?.date,
    section: page.value?.category
})

useJsonLd('blogPosting', {
    headline: page.value?.title,
    description: page.value?.description,
    datePublished: page.value?.date,
    dateModified: page.value?.updatedDate || page.value?.date,
    author: page.value?.author,
    image: page.value?.image
})
</script>

<template>
    <UPage>
        <UPageHeader title="" description="">
            <template v-if="page?.date" #headline>
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <UIcon name="i-lucide-calendar" class="size-4" />
                    <time :datetime="page.date">{{ page.date }}</time>
                </div>
            </template>
            <template v-if="page?.title">
                <h1
                    class="text-3xl font-bold leading-tight tracking-tight md:text-4xl text-cyan-600 dark:text-cyan-400">
                    {{ page.title }}
                </h1>
            </template>
        </UPageHeader>

        <UPageBody>
            <div class="prose dark:prose-invert max-w-none">
                <ContentRenderer v-if="page" :value="page" />
            </div>

            <USeparator class="my-8" />

            <div class="flex justify-end items-center">
                <UButton v-if="page?.stem"
                    :to="`https://github.com/jjhhyyg/process-card-docs/edit/main/content${page.path}.md`" target="_blank"
                    variant="ghost" color="neutral" trailing-icon="i-lucide-external-link"
                    label="欢迎纠错" />
            </div>
        </UPageBody>

        <template v-if="page?.body?.toc?.links" #right>
            <UContentToc :links="page.body.toc.links" highlight highlight-color="primary"
                title="目录" :ui="{
                    root: 'sticky top-(--ui-header-height) z-10 overflow-y-auto border-l border-default dark:border-default',
                }" />
        </template>
    </UPage>
</template>
