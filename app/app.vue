<style>
@import "~/assets/css/main.css";
</style>

<template>
    <UApp>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>

<script setup lang="ts">

const config = useRuntimeConfig()

import { useSeo } from './composables/useSeo'
import { useJsonLd } from './composables/useJsonLd'

useSeo({
    title: config.public.siteName as string,
    description: config.public.siteDescription as string,
    type: 'website'
})

useJsonLd('website', {
    name: config.public.siteName,
    description: config.public.siteDescription,
    url: config.public.siteUrl
})
</script>
