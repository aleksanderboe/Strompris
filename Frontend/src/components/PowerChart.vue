<script setup>
import { ref, watch, computed } from "vue";

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

const props = defineProps({
  selectedRegion: String,
  selectedDate: String,
});

const chartData = ref({});

const chartOptions = {
  responsive: true,
  interaction: {
    intersect: false,
    mode: "index",
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        font: {
          size: 12,
          weight: "500",
        },
      },
    },
    title: {
      display: true,
      text: "Electricity Prices (NOK per kWh)",
      font: {
        size: 24,
        weight: "bold",
      },
      padding: {
        bottom: 30,
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.parsed.y.toFixed(
            3
          )} kr/kWh`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
        drawBorder: false,
      },
      ticks: {
        color: "rgba(0, 0, 0, 0.7)",
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
        drawBorder: false,
      },
      ticks: {
        color: "rgba(0, 0, 0, 0.7)",
        font: {
          size: 11,
        },
        callback: (value) => value.toFixed(2) + " kr",
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 6,
      hoverBorderWidth: 2,
    },
    line: {
      borderWidth: 3,
      tension: 0.4,
    },
  },
};

const colors = [
  { border: "#FF6B35", background: "rgba(255, 107, 53, 0.15)" }, // Vibrant Orange
  { border: "#2E86AB", background: "rgba(46, 134, 171, 0.15)" }, // Professional Blue
  { border: "#A23B72", background: "rgba(162, 59, 114, 0.15)" }, // Deep Pink
  { border: "#F18F01", background: "rgba(241, 143, 1, 0.15)" }, // Golden Orange
  { border: "#C73E1D", background: "rgba(199, 62, 29, 0.15)" }, // Rich Red
  { border: "#592E83", background: "rgba(89, 46, 131, 0.15)" }, // Royal Purple
  { border: "#1B998B", background: "rgba(27, 153, 139, 0.15)" }, // Teal
  { border: "#7209B7", background: "rgba(114, 9, 183, 0.15)" }, // Electric Purple
];

const regions = [
  { value: "NO1", label: "Øst-Norge" },
  { value: "NO2", label: "Sør-Norge" },
  { value: "NO3", label: "Midt-Norge" },
  { value: "NO4", label: "Nord-Norge" },
  { value: "NO5", label: "Vest-Norge" },
];

function getRegionLabel(regionValue) {
  return regions.find((r) => r.value === regionValue)?.label || regionValue;
}

function getFormattedDate(date) {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const mainLabel = computed(() => {
  if (!props.selectedRegion || !props.selectedDate) return "Main Selection";
  const regionLabel = getRegionLabel(props.selectedRegion);
  const formattedDate = getFormattedDate(props.selectedDate);
  return `${regionLabel} - ${formattedDate}`;
});

watch(
  () => [store.prices, store.comparisons],
  ([newPrices, newComparisons]) => {
    updateChartData(newPrices, newComparisons);
  },
  { immediate: true, deep: true }
);

function updateChartData(prices, comparisons) {
  if (!prices.length && !comparisons.length) {
    chartData.value = {};
    return;
  }

  const datasets = [];

  if (prices.length) {
    datasets.push({
      label: mainLabel.value,
      data: prices.map((price) => price.NOK_per_kWh),
      borderColor: colors[0].border,
      backgroundColor: colors[0].background,
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2,
      pointHoverBackgroundColor: colors[0].border,
      pointHoverBorderColor: "#ffffff",
    });
  }

  comparisons.forEach((comparison, index) => {
    const colorIndex = (index + 1) % colors.length;
    datasets.push({
      label: comparison.label,
      data: comparison.prices.map((price) => price.NOK_per_kWh),
      borderColor: colors[colorIndex].border,
      backgroundColor: colors[colorIndex].background,
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2,
      pointHoverBackgroundColor: colors[colorIndex].border,
      pointHoverBorderColor: "#ffffff",
    });
  });

  const labelsSource = prices.length ? prices : comparisons[0]?.prices || [];

  chartData.value = {
    labels: labelsSource.map((price) =>
      new Date(price.time_start).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    ),
    datasets,
  };
}
</script>

<template>
  <Line
    v-if="Object.keys(chartData).length"
    :data="chartData"
    :options="chartOptions"
  />
  <div v-else-if="store.loading">Loading...</div>
  <div v-else-if="store.error">Error: {{ store.error }}</div>
  <div v-else class="text-center text-muted py-4">
    <p>
      No data to display. Select a date and region to view electricity prices.
    </p>
  </div>
</template>

<style scoped></style>
