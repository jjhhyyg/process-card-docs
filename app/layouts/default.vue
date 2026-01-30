<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { mapContentNavigationItem } from '@nuxt/ui/runtime/utils/content.js'

const route = useRoute()

const navItems = computed<NavigationMenuItem[]>(() => [{
    label: '首页',
    to: '/',
    icon: 'i-lucide-home',
    active: route.path === '/'
}])

const footerLinks = computed<NavigationMenuItem[]>(() => [
    {
        key: 1,
        label: 'GitHub',
        to: 'https://github.com',
        icon: 'i-lucide-github'
    }
])

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('content'))

const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('content'), {
    server: false
})

import type { ContentNavigationItem } from '@nuxt/content'
const navigationProvided = computed<ContentNavigationItem[]>(() => navigation?.value ?? [])
provide<Ref<ContentNavigationItem[]>>('navigation', navigationProvided)

const searchTerm = ref("")
</script>

<template>
    <UHeader title="工艺管理软件开发文档" to="/" :ui="{
        root: 'w-full'
    }">

        <UNavigationMenu :items="navItems" orientation="horizontal" />
        <template #right>
            <UContentSearchButton variant="ghost" />
            <UColorModeButton size="sm" variant="ghost" as="button" />
            <UButton icon="i-lucide-github" aria-label="Github Home Page" to="https://github.com/jjhhyyg/"
                target="_blank" size="sm" variant="ghost" />
            <ClientOnly>
                <LazyUContentSearch v-model:search-term="searchTerm" shortcut="meta_k" :files="files"
                    :navigation="navigation" :fuse="{ resultLimit: 42 }" />
            </ClientOnly>
        </template>

        <template #body>
            <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5 mb-4" />
            <UContentNavigation :navigation="navigation" highlight />
        </template>
    </UHeader>

    <UContainer>
        <slot />
    </UContainer>

    <UFooter :ui="{
        root: 'border-t border-default dark:border-default'
    }">
        <div class="flex items-center gap-3">
            <span>© 2025 Process-Card Team. All rights reserved.</span>
        </div>
        <template #right>
            <UButton v-for="link in footerLinks" :key="link.key" :to="link.to" target="_blank" :icon="link.icon"
                variant="ghost" size="sm">
                {{ link.label }}
            </UButton>
        </template>
    </UFooter>
</template>
