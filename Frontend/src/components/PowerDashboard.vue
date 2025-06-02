<script setup>
import { ref, watch, onMounted } from "vue";
import { usePowerStore } from "../stores/power-store";
import PowerChart from "./PowerChart.vue";
import PowerFilters from "./PowerFilters.vue";

const store = usePowerStore();

const today = new Date().toISOString().split("T")[0];
const minDate = "2021-12-01";

const selectedRegion = ref("NO1");
const selectedDate = ref(today);

watch([selectedRegion, selectedDate], async ([newRegion, newDate]) => {
  await store.fetchPrices(new Date(newDate), newRegion);
});

onMounted(() => {
  store.fetchPrices(new Date(), selectedRegion.value);
});
</script>

<template>
  <div>
    <PowerFilters
      v-model:selectedRegion="selectedRegion"
      v-model:selectedDate="selectedDate"
      :min-date="minDate"
      :max-date="today"
    />

    <PowerChart
      :selected-region="selectedRegion"
      :selected-date="selectedDate"
    />
  </div>
</template>
