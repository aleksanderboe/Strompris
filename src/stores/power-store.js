import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const usePowerStore = defineStore("power", () => {
  const prices = ref([]);
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

  async function fetchPrices(date = new Date()) {
    loading.value = true;
    error.value = null;

    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const priceArea = "NO1";

      const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${priceArea}.json`;

      const response = await axios.get(url);
      prices.value = response.data.map((price) => ({
        ...price,
        time_start: new Date(price.time_start),
        time_end: new Date(price.time_end),
      }));
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }

    console.log(prices);
  }

  return {
    prices,
    loading,
    error,
    averagePrice,
    highestPrice,
    fetchPrices,
  };
});
