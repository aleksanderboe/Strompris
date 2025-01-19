import axios from "axios";
import { usePowerStore } from "../stores/power-store";

const API_BASE_URL = "http://127.0.0.1:5000/api/openai";

export async function sendRequest(message) {
  const store = usePowerStore();

  try {
    const requestData = {
      message,
      prices: store.rawPrices,
    };

    const response = await axios.post(API_BASE_URL, requestData);
    return response.data.reply;
  } catch (error) {
    console.error("Error communicating with the backend:", error);
    throw error;
  }
}
