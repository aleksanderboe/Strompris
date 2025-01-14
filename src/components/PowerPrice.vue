<script setup>
defineProps({
  avgPrice: {},
  highestPrice: {},
});
</script>

<template>
  <div>
    <h1>Average price: {{ avgPrice.toFixed(2) }}kr</h1>
    <h1>Highest price: {{ highestPrice.toFixed(2) }}kr</h1>
  </div>
</template>

<style scoped></style>
