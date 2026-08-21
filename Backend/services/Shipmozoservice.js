import shipmozo from "../config/shipmozo.js";

// ---------------- Push order to Shipmozo ----------------
// Call this after payment is verified (or immediately for COD orders)
export const pushOrder = async (orderPayload) => {
    const { data } = await shipmozo.post("/push-order", orderPayload);
    return data;
};

// ---------------- Get all warehouses ----------------
// Use this once to find your warehouse_id (needed in every push-order call)
export const getWarehouses = async () => {
    const { data } = await shipmozo.get("/get-warehouses");
    return data;
};

// ---------------- Create a warehouse ----------------
export const createWarehouse = async (warehousePayload) => {
    const { data } = await shipmozo.post("/create-warehouse", warehousePayload);
    return data;
};

// ---------------- Rate calculator ----------------
export const calculateRates = async (ratePayload) => {
    const { data } = await shipmozo.post("/rate-calculator", ratePayload);
    return data;
};

// ---------------- Assign a specific courier ----------------
export const assignCourier = async (orderId, courierId) => {
    const { data } = await shipmozo.post("/assign-courier", {
        order_id: orderId,
        courier_id: courierId,
    });
    return data;
};

// ---------------- Auto-assign courier ----------------
// Requires Auto Assign to be configured in Shipmozo panel (Settings > Auto assign)
export const autoAssignOrder = async (orderId) => {
    const { data } = await shipmozo.post("/auto-assign-order", {
        order_id: orderId,
    });
    return data;
};

// ---------------- Schedule pickup (manual, when not auto-scheduled) ----------------
export const schedulePickup = async (orderId) => {
    const { data } = await shipmozo.post("/schedule-pickup", {
        order_id: orderId,
    });
    return data;
};

// ---------------- Track an order by AWB ----------------
export const trackOrder = async (awbNumber) => {
    const { data } = await shipmozo.get("/track-order", {
        params: { awb_number: awbNumber },
    });
    return data;
};

// ---------------- Cancel an order ----------------
export const cancelOrder = async (orderId, awbNumber) => {
    const { data } = await shipmozo.post("/cancel-order", {
        order_id: orderId,
        awb_number: awbNumber,
    });
    return data;
};

// ---------------- Get shipping label ----------------
export const getOrderLabel = async (awbNumber) => {
    const { data } = await shipmozo.get(`/get-order-label/${awbNumber}`);
    return data;
};

// ---------------- Check pincode serviceability ----------------
export const checkServiceability = async (pickupPincode, deliveryPincode) => {
    const { data } = await shipmozo.post("/pincode-serviceability", {
        pickup_pincode: pickupPincode,
        delivery_pincode: deliveryPincode,
    });
    return data;
};