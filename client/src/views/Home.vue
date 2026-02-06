<template>
  <div class="home">
    <Hero />
    <Features />
    <HowItWorks />
    <Templates />
    <Pricing />
    <Testimonials />
  </div>
</template>

<script setup>
import Hero from '@/components/home/Hero.vue'
import Features from '@/components/home/Features.vue'
import HowItWorks from '@/components/home/HowItWorks.vue'
import Templates from '@/components/home/Templates.vue'
import Pricing from '@/components/home/Pricing.vue'
import Testimonials from '@/components/home/Testimonials.vue'
</script>

<style scoped>
.home {
  width: 100%;
}
</style>