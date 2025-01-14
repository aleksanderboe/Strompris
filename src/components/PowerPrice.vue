<script setup>
import { ref, watch, onMounted } from "vue";
import { usePowerStore } from "../stores/power-store";
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

const store = usePowerStore();

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: "NOK per kWh",
      data: [],
      borderColor: "rgba(75, 192, 192, 1)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Electricity Prices (NOK per kWh)",
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
      })
    ),
    datasets: [
      {
        label: "NOK per kWh",
        data: prices.map((price) => price.NOK_per_kWh),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };
}
</script>

<template>
  <div>
    <Line
      v-if="store.prices.length"
      :data="chartData"
      :options="chartOptions"
    />
    <div v-else-if="store.loading">Loading...</div>
    <div v-else-if="store.error">Error: {{ store.error }}</div>
  </div>
</template>

<style scoped></style>
