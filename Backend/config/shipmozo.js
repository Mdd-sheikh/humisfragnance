import axios from "axios";

const SHIPMOZO_BASE_URL = "https://shipping-api.com/app/api/v1";

if (!process.env.SHIPMOZO_PUBLIC_KEY || !process.env.SHIPMOZO_PRIVATE_KEY) {
    console.error("Missing SHIPMOZO_PUBLIC_KEY or SHIPMOZO_PRIVATE_KEY in .env");
}

const shipmozo = axios.create({
    baseURL: SHIPMOZO_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "public-key": process.env.SHIPMOZO_PUBLIC_KEY,
        "private-key": process.env.SHIPMOZO_PRIVATE_KEY,
    },
});

export default shipmozo;