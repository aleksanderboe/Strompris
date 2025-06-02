import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const usePowerStore = defineStore("power", () => {
  const prices = ref([]);
  const comparisons = ref([]);
  const todaysPrices = ref([]);
  const rawPrices = ref();
  const loading = ref(false);
  const error = ref(null);

  const averagePrice = computed(() => {
    if (!prices.value.length) return 0;
    const sum = prices.value.reduce((acc, curr) => acc + curr.NOK_per_kWh, 0);
    return sum / prices.value.length;
  });

  const highestPrice = computed(() => {
    if (!prices.value.length) return 0;
    return Math.max(...prices.value.map((p) => p.NOK_per_kWh));
  });

  const currentPrice = computed(() => {
    if (!todaysPrices.value.length) return null;

    const now = new Date();
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);

    const currentPriceData = todaysPrices.value.find((price) => {
      const priceStart = new Date(price.time_start);
      priceStart.setMinutes(0, 0, 0);
      return priceStart.getTime() === currentHour.getTime();
    });

    return currentPriceData || null;
  });

  async function fetchTodaysPrices(region = "NO1") {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${region}.json`;

      const response = await axios.get(url);

      todaysPrices.value = response.data.map((price) => ({
        ...price,
        time_start: new Date(price.time_start),
        time_end: new Date(price.time_end),
      }));
    } catch (e) {
      todaysPrices.value = [];
    }
  }

  async function fetchPrices(date = new Date(), region = "NO1") {
    loading.value = true;
    error.value = null;
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${region}.json`;

      const response = await axios.get(url);

      rawPrices.value = response.data;

      prices.value = response.data.map((price) => ({
        ...price,
        time_start: new Date(price.time_start),
        time_end: new Date(price.time_end),
      }));

      await fetchTodaysPrices(region);
    } catch (e) {
      prices.value = [];
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function addComparison(date, region, label) {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${region}.json`;

      const response = await axios.get(url);

      const comparisonData = {
        id: Date.now(),
        region,
        date: new Date(date),
        label,
        prices: response.data.map((price) => ({
          ...price,
          time_start: new Date(price.time_start),
          time_end: new Date(price.time_end),
        })),
      };

      comparisons.value.push(comparisonData);
      return comparisonData.id;
    } catch (e) {
      console.error("Failed to fetch comparison data:", e);
      return null;
    }
  }

  function removeComparison(id) {
    const index = comparisons.value.findIndex((comp) => comp.id === id);
    if (index > -1) {
      comparisons.value.splice(index, 1);
    }
  }

  function clearComparisons() {
    comparisons.value = [];
  }

  return {
    rawPrices,
    prices,
    comparisons,
    todaysPrices,
    loading,
    error,
    averagePrice,
    highestPrice,
    currentPrice,
    fetchPrices,
    fetchTodaysPrices,
    addComparison,
    removeComparison,
    clearComparisons,
  };
});
