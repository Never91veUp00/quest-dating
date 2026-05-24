<template>
  <div>
    <NuxtRouteAnnouncer />
    <template v-if="!isFullscreen">
      <Header />
      <main class="page-main"><NuxtPage /></main>
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

useHead({
  script: [{
    innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js?id=108293057","ym");ym(108293057,"init",{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});`,
    type: 'text/javascript',
  }]
})

const isFullscreen = computed(() =>
  route.path.startsWith('/quest/') || route.path.startsWith('/admin')
)
</script>

<style>
/* Компенсация фиксированного хедера (height: 80px) */
.page-main {
  padding-top: 80px;
}
</style>