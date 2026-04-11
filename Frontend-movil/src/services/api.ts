import axios from "axios";

const api = axios.create({
  baseURL: "https://tu-api.com",
});

export default api;