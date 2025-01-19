<script setup>
const props = defineProps({
  selectedRegion: String,
  selectedDate: String,
  minDate: String,
  maxDate: String,
});

const emit = defineEmits(["update:selectedRegion", "update:selectedDate"]);

const regions = [
  { value: "NO1", label: "Øst-Norge" },
  { value: "NO2", label: "Sør-Norge" },
  { value: "NO3", label: "Midt-Norge" },
  { value: "NO4", label: "Nord-Norge" },
  { value: "NO5", label: "Vest-Norge" },
];
</script>

<template>
  <div class="d-flex gap-3 pt-2">
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
  </div>
</template>
