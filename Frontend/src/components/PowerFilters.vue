<script setup>
import { ref } from "vue";
import { usePowerStore } from "../stores/power-store";
import axios from "axios";

const props = defineProps({
  selectedRegion: String,
  selectedDate: String,
  minDate: String,
  maxDate: String,
});

const emit = defineEmits(["update:selectedRegion", "update:selectedDate"]);

const store = usePowerStore();

const regions = [
  { value: "NO1", label: "Øst-Norge" },
  { value: "NO2", label: "Sør-Norge" },
  { value: "NO3", label: "Midt-Norge" },
  { value: "NO4", label: "Nord-Norge" },
  { value: "NO5", label: "Vest-Norge" },
];

const showingAddForm = ref(false);
const newComparison = ref({
  region: "NO1",
  date: props.selectedDate,
});

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

function getComparisonLabel(region, date) {
  const regionLabel = getRegionLabel(region);
  const formattedDate = getFormattedDate(date);
  return `${regionLabel} - ${formattedDate}`;
}

function showAddForm() {
  newComparison.value = {
    region: "NO1",
    date: props.selectedDate,
  };
  showingAddForm.value = true;
}

async function addComparison() {
  const label = getComparisonLabel(
    newComparison.value.region,
    newComparison.value.date
  );
  await store.addComparison(
    new Date(newComparison.value.date),
    newComparison.value.region,
    label
  );

  showingAddForm.value = false;
}

function cancelAdd() {
  showingAddForm.value = false;
}

async function updateComparison(id, field, value) {
  const comparison = store.comparisons.find((c) => c.id === id);
  if (!comparison) return;

  comparison[field] = value;

  const label = getComparisonLabel(comparison.region, comparison.date);
  comparison.label = label;

  try {
    const year = comparison.date.getFullYear();
    const month = String(comparison.date.getMonth() + 1).padStart(2, "0");
    const day = String(comparison.date.getDate()).padStart(2, "0");

    const url = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${comparison.region}.json`;

    const response = await axios.get(url);

    comparison.prices = response.data.map((price) => ({
      ...price,
      time_start: new Date(price.time_start),
      time_end: new Date(price.time_end),
    }));
  } catch (e) {
    console.error("Failed to update comparison data:", e);
  }
}

function removeComparison(id) {
  store.removeComparison(id);
}
</script>

<template>
  <div class="mb-3">
    <div class="d-flex gap-2 pt-2 mb-2">
      <select
        :value="selectedRegion"
        @input="$emit('update:selectedRegion', $event.target.value)"
        class="form-select"
      >
        <option
          v-for="region in regions"
          :key="region.value"
          :value="region.value"
        >
          {{ region.label }}
        </option>
      </select>

      <input
        type="date"
        :value="selectedDate"
        @input="$emit('update:selectedDate', $event.target.value)"
        :max="maxDate"
        :min="minDate"
        class="form-select"
      />

      <button
        v-if="!store.comparisons.length && !showingAddForm"
        @click="showAddForm"
        class="btn btn-outline-primary"
        type="button"
      >
        +
      </button>
    </div>

    <div
      v-for="(comparison, index) in store.comparisons"
      :key="comparison.id"
      class="d-flex gap-2 mb-2"
    >
      <select
        :value="comparison.region"
        @change="updateComparison(comparison.id, 'region', $event.target.value)"
        class="form-select"
      >
        <option
          v-for="region in regions"
          :key="region.value"
          :value="region.value"
        >
          {{ region.label }}
        </option>
      </select>

      <input
        type="date"
        :value="comparison.date.toISOString().split('T')[0]"
        @change="
          updateComparison(comparison.id, 'date', new Date($event.target.value))
        "
        :max="maxDate"
        :min="minDate"
        class="form-select"
      />

      <button
        @click="removeComparison(comparison.id)"
        class="btn btn-outline-danger"
        type="button"
      >
        ✕
      </button>

      <!-- Plus button on the last comparison row -->
      <button
        v-if="index === store.comparisons.length - 1 && !showingAddForm"
        @click="showAddForm"
        class="btn btn-outline-primary"
        type="button"
      >
        +
      </button>
    </div>

    <!-- Add comparison form (when active) -->
    <div v-if="showingAddForm" class="d-flex gap-2 mb-2">
      <select v-model="newComparison.region" class="form-select">
        <option
          v-for="region in regions"
          :key="region.value"
          :value="region.value"
        >
          {{ region.label }}
        </option>
      </select>

      <input
        v-model="newComparison.date"
        type="date"
        :max="maxDate"
        :min="minDate"
        class="form-select"
      />

      <button @click="addComparison" class="btn btn-success" type="button">
        ✓
      </button>

      <button
        @click="cancelAdd"
        class="btn btn-outline-secondary"
        type="button"
      >
        ✕
      </button>
    </div>
  </div>
</template>
