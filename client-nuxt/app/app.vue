<template>
  <div>
    <NuxtRouteAnnouncer />
    <template v-if="!isFullscreen">
      <Header />
      <main><NuxtPage /></main>
      <Footer />
    </template>
    <template v-else>
      <NuxtPage />
    </template>
    <Toast />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()

const isFullscreen = computed(() =>
  route.path.startsWith('/quest/') || route.path.startsWith('/admin')
)
</script>