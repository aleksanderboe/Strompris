<script setup>
import { onMounted } from "vue";

import PowerPrice from "./components/PowerPrice.vue";

import { usePowerStore } from "./stores/power-store";

const store = usePowerStore();

onMounted(() => {
  store.fetchPrices();
});
</script>

<template>
  <div class="container">
    <PowerPrice></PowerPrice>
  </div>
</template>

<style scoped></style>
