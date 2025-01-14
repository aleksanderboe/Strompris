<script setup>
import { onMounted } from "vue";

import PowerPrice from "./components/PowerPrice.vue";

import { usePowerStore } from "./stores/power-store";

const store = usePowerStore();

onMounted(() => {
  console.log("mounted");
  store.fetchPrices();
});
</script>

<template>
  <PowerPrice></PowerPrice>
</template>

<style scoped></style>
