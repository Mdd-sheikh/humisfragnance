import axios from "axios";

// Base URL — per docs, must NOT have a trailing slash or it causes CORS issues
const SHIPMOZO_BASE_URL = "https://shipping-api.com/app/api/v1";

const shipmozo = axios.create({
  baseURL: SHIPMOZO_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "public-key": process.env.mozo_public_key,
    "private-key": process.env.mozo_private_key,
  },
});

export default shipmozo;