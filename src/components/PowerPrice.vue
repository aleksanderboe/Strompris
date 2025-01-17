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
      borderColor: "rgba(255, 206, 86, 1)",
      backgroundColor: "rgba(255, 206, 86, 0.2)",
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

const today = new Date().toISOString().split("T")[0];
const minDate = "2021-12-01"; // api first record

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
    <div class="d-flex gap-3 pt-2">
      <select v-model="selectedRegion" class="form-select">
        <option value="NO1">Øst-Norge</option>
        <option value="NO2">Sør-Norge</option>
        <option value="NO3">Midt-Norge</option>
        <option value="NO4">Nord-Norge</option>
        <option value="NO5">Vest-Norge</option>
      </select>

      <input
        type="date"
        v-model="selectedDate"
        :max="today"
        :min="minDate"
        class="form-select"
      />
    </div>

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
