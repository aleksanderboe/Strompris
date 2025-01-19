<script setup>
import { sendRequest } from "../services/openai";

import { ref } from "vue";

const message = ref("");
const messages = ref([]);
const isLoading = ref(false);

function formatTimestamp(date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

async function handleSubmit() {
  if (!message.value.trim() || isLoading.value) return;

  try {
    isLoading.value = true;
    messages.value.push({
      type: "user",
      text: message.value,
      timestamp: formatTimestamp(new Date()),
    });

    const response = await sendRequest(message.value);
    messages.value.push({
      type: "bot",
      text: response,
      timestamp: formatTimestamp(new Date()),
    });

    message.value = "";
  } catch (error) {
    messages.value.push({
      type: "bot",
      text: "Sorry, there was an error processing your request.",
      timestamp: formatTimestamp(new Date()),
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="mt-4">
    <div class="input-group">
      <input
        type="text"
        class="form-control"
        v-model="message"
        placeholder="Ask about electricity prices..."
        @keyup.enter="handleSubmit"
      />
      <button
        class="btn btn-primary"
        @click="handleSubmit"
        :disabled="!message.trim() || isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-1"
        ></span>
        Send
      </button>
    </div>

    <div class="overflow-auto mt-3">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="alert mb-2 py-2 px-3"
        :class="msg.type === 'user' ? 'alert-secondary' : 'alert-primary'"
      >
        <div class="d-flex justify-content-between align-items-top">
          <div>{{ msg.text }}</div>
          <small class="text-muted ms-2">{{ msg.timestamp }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
