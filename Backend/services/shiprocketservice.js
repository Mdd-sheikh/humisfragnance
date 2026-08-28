import shiprocket from "../config/shiprocket.js";

// ---------------- Create order (adhoc) ----------------
// Docs: POST /orders/create/adhoc
// Returns Shiprocket's order_id + shipment_id on success (status_code 1)
export const pushOrder = async (payload) => {
    const { data } = await shiprocket.post("/orders/create/adhoc", payload);
    return data;
};

// ---------------- Assign AWB / courier to a shipment ----------------
// Docs: POST /courier/assign/awb
// Pass courier_id to force a specific courier, or omit/0 to let Shiprocket
// auto-pick the recommended courier (closest thing to Shipmozo's autoAssign).
export const assignAWB = async (shipmentId, courierId = 0) => {
    const { data } = await shiprocket.post("/courier/assign/awb", {
        shipment_id: shipmentId,
        courier_id: courierId,
    });
    return data;
};

// ---------------- Request pickup ----------------
// Docs: POST /courier/generate/pickup
export const generatePickup = async (shipmentId) => {
    const { data } = await shiprocket.post("/courier/generate/pickup", {
        shipment_id: [shipmentId],
    });
    return data;
};

// ---------------- Track shipment by AWB ----------------
// Docs: GET /courier/track/awb/{awb_code}
export const trackOrder = async (awbCode) => {
    const { data } = await shiprocket.get(`/courier/track/awb/${awbCode}`);
    return data; 
}; 