<script setup>
import { ref, watch } from "vue";

import { usePowerStore } from "../stores/power-store";

const store = usePowerStore();

import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

const chartData = ref({});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Electricity Prices (NOK per kWh)",
      font: {
        size: 30,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => value.toFixed(2) + " kr",
      },
    },
  },
};

watch(
  () => store.prices,
  (newPrices) => {
    if (newPrices.length) {
      updateChartData(newPrices);
    }
  },
  { immediate: true }
);

function updateChartData(prices) {
  chartData.value = {
    labels: prices.map((price) =>
      new Date(price.time_start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    ),
    datasets: [
      {
        label: "NOK per kWh",
        data: prices.map((price) => price.NOK_per_kWh),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };
}
</script>

<template>
  <Line v-if="store.prices.length" :data="chartData" :options="chartOptions" />
  <div v-else-if="store.loading">Loading...</div>
  <div v-else-if="store.error">Error: {{ store.error }}</div>
</template>

<style scoped></style>
