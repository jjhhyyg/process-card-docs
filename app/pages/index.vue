<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

import { useSeo } from '~/composables/useSeo'

useSeo({
    title: '开发文档',
    description: '工艺管理软件的完整开发文档，包含后端、前端、数据库等全方位指南',
    keywords: ['工艺管理', '开发文档', 'Java', 'Spring Boot', 'Vue', 'TypeScript'],
    type: 'website'
})

// 获取 index.md 的内容
const { data: page } = await useAsyncData('index-page', () =>
    queryCollection('content').path('/').first()
)
</script>

<template>
    <UPage>
        <template #left>
            <UPageAside :ui="{
                root: 'border-r border-default dark:border-default'
            }">
                <UContentNavigation :navigation="navigation" highlight />
            </UPageAside>
        </template>
        <UPageBody>
            <div class="prose dark:prose-invert max-w-none">
                <ContentRenderer v-if="page" :value="page" />
            </div>
        </UPageBody>
    </UPage>
</template>
